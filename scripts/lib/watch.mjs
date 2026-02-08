/**
 * ============================================
 * 自动部署模块 (Cron 模式)
 * ============================================
 * 设计为单次执行，适配 cron 定时任务调用
 * 
 * 用法:
 *   node scripts/deploy.mjs cron          - 单次检查并部署（供 cron 调用）
 *   node scripts/deploy.mjs cron:install  - 安装 cron 定时任务
 *   node scripts/deploy.mjs cron:remove   - 移除 cron 定时任务
 *   node scripts/deploy.mjs cron:status   - 查看 cron 任务状态
 */

import { execSync } from 'child_process';
import { existsSync, appendFileSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { homedir } from 'os';
import { CONFIG, PROJECT_ROOT } from './config.mjs';
import { logger, colorize } from './logger.mjs';
import { commandExists, countFiles } from './utils.mjs';
import { sendDeployNotification } from './mail.mjs';

// ==================== 常量 ====================

const CRON_MARKER = '# rosydawn-auto-deploy';

// ==================== SSH 配置 ====================

/**
 * 获取 SSH key 路径
 * 优先使用环境变量 SSH_KEY_PATH，否则尝试常见位置
 */
function getSSHKeyPath() {
  // 1. 环境变量指定
  if (process.env.SSH_KEY_PATH && existsSync(process.env.SSH_KEY_PATH)) {
    return process.env.SSH_KEY_PATH;
  }
  
  // 2. 常见 SSH key 位置
  const home = homedir();
  const candidates = [
    `${home}/.ssh/id_github`,      // GitHub 专用 key
    `${home}/.ssh/id_ed25519`,     // 现代默认
    `${home}/.ssh/id_rsa`,         // 传统默认
  ];
  
  for (const keyPath of candidates) {
    if (existsSync(keyPath)) {
      return keyPath;
    }
  }
  
  return null;
}

/**
 * 获取 Git 执行选项（包含 SSH 配置）
 */
function getGitExecOptions() {
  const sshKeyPath = getSSHKeyPath();
  const options = { encoding: 'utf-8' };
  
  if (sshKeyPath) {
    options.env = {
      ...process.env,
      GIT_SSH_COMMAND: `ssh -i ${sshKeyPath} -o StrictHostKeyChecking=no -o BatchMode=yes`,
    };
  }
  
  return options;
}

// ==================== 日志 ====================

// 日志保留行数上限
const MAX_LOG_LINES = 500;

/**
 * 写入日志文件
 * @param {string} message - 日志消息
 */
export function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  
  try {
    // 确保日志目录存在
    const logDir = dirname(CONFIG.watch.logFile);
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    
    appendFileSync(CONFIG.watch.logFile, logLine);
  } catch (err) {
    // 日志写入失败不影响主流程，但打印错误方便调试
    console.error(`日志写入失败: ${err.message}`);
  }
}

/**
 * 清理日志文件，只保留最近的 N 行
 * @param {number} maxLines - 保留的最大行数，默认 500
 */
export function trimLogFile(maxLines = MAX_LOG_LINES) {
  try {
    if (!existsSync(CONFIG.watch.logFile)) {
      return;
    }
    
    const content = readFileSync(CONFIG.watch.logFile, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length <= maxLines) {
      return; // 行数未超过限制，无需清理
    }
    
    // 只保留最后 maxLines 行
    const trimmedLines = lines.slice(-maxLines);
    writeFileSync(CONFIG.watch.logFile, trimmedLines.join('\n') + '\n');
    
    writeLog(`日志已清理，保留最近 ${maxLines} 行（清理了 ${lines.length - maxLines} 行）`);
  } catch (err) {
    console.error(`日志清理失败: ${err.message}`);
  }
}

// ==================== Git 操作 ====================

/**
 * 获取本地最新 commit hash
 */
export function getLocalCommitHash() {
  try {
    return execSync(`git -C ${PROJECT_ROOT} rev-parse HEAD`, { encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

/**
 * 获取远程最新 commit hash
 */
export function getRemoteCommitHash() {
  try {
    const options = getGitExecOptions();
    // 先 fetch 最新的远程信息（使用 SSH key）
    execSync(`git -C ${PROJECT_ROOT} fetch origin ${CONFIG.watch.branch}`, { 
      stdio: 'pipe',
      env: options.env,
    });
    return execSync(`git -C ${PROJECT_ROOT} rev-parse origin/${CONFIG.watch.branch}`, { encoding: 'utf-8' }).trim();
  } catch (err) {
    writeLog(`Git fetch 失败: ${err.message}`);
    return null;
  }
}

/**
 * 获取 commit 详细信息
 * @param {string} hash - commit hash
 */
export function getCommitInfo(hash) {
  try {
    const message = execSync(`git -C ${PROJECT_ROOT} log -1 --format=%s ${hash}`, { encoding: 'utf-8' }).trim();
    const author = execSync(`git -C ${PROJECT_ROOT} log -1 --format=%an ${hash}`, { encoding: 'utf-8' }).trim();
    return { message, author };
  } catch {
    return { message: '', author: '' };
  }
}

/**
 * 拉取最新代码
 */
export function pullLatestCode() {
  try {
    const options = getGitExecOptions();
    execSync(`git -C ${PROJECT_ROOT} pull origin ${CONFIG.watch.branch}`, { 
      stdio: 'inherit',
      env: options.env,
    });
    return true;
  } catch (err) {
    writeLog(`Git pull 失败: ${err.message}`);
    return false;
  }
}

// ==================== Cron 任务管理 ====================

/**
 * 生成 cron 任务命令
 */
function getCronCommand() {
  const nodeCmd = process.execPath;
  const scriptPath = `${PROJECT_ROOT}/scripts/deploy.mjs`;
  const logPath = CONFIG.watch.logFile;
  
  // 加载环境变量并执行
  return `cd ${PROJECT_ROOT} && ${nodeCmd} ${scriptPath} cron >> ${logPath} 2>&1`;
}

/**
 * 生成 cron 表达式
 * @param {number} intervalMinutes - 检查间隔（分钟）
 */
function getCronSchedule(intervalMinutes) {
  // 每 N 分钟执行一次
  if (intervalMinutes <= 0) intervalMinutes = 5;
  if (intervalMinutes >= 60) {
    // 每小时或更长
    const hours = Math.floor(intervalMinutes / 60);
    return `0 */${hours} * * *`;
  }
  return `*/${intervalMinutes} * * * *`;
}

/**
 * 获取当前 crontab 内容
 */
function getCurrentCrontab() {
  try {
    return execSync('crontab -l 2>/dev/null', { encoding: 'utf-8' });
  } catch {
    return '';
  }
}

/**
 * 检查是否已安装 cron 任务
 */
export function isCronInstalled() {
  const crontab = getCurrentCrontab();
  return crontab.includes(CRON_MARKER);
}

/**
 * 安装 cron 定时任务
 */
export function installCronJob() {
  console.log('');
  console.log(colorize('bold', '⏰ 安装自动部署定时任务'));
  console.log('');
  
  const intervalMinutes = CONFIG.watch.interval / 1000 / 60;
  const schedule = getCronSchedule(intervalMinutes);
  const command = getCronCommand();
  const cronLine = `${schedule} ${command} ${CRON_MARKER}`;
  
  // 检查是否已安装
  if (isCronInstalled()) {
    logger.warn('Cron 任务已存在，先移除旧任务...');
    removeCronJob(false);
  }
  
  // 获取现有 crontab
  let currentCrontab = getCurrentCrontab();
  
  // 添加新任务
  const newCrontab = currentCrontab.trim() + '\n' + cronLine + '\n';
  
  try {
    // 写入新的 crontab
    execSync(`echo '${newCrontab}' | crontab -`, { stdio: 'pipe' });
    
    logger.success('Cron 任务安装成功！');
    console.log('');
    console.log(`  ${colorize('gray', '执行间隔:')} 每 ${intervalMinutes} 分钟`);
    console.log(`  ${colorize('gray', 'Cron 表达式:')} ${schedule}`);
    console.log(`  ${colorize('gray', 'Git 分支:')} ${CONFIG.watch.branch}`);
    console.log(`  ${colorize('gray', '日志文件:')} ${CONFIG.watch.logFile}`);
    console.log('');
    console.log(colorize('cyan', '查看任务状态:'));
    console.log(`  ${colorize('gray', 'npm run deploy:cron:status')}`);
    console.log('');
    console.log(colorize('cyan', '查看实时日志:'));
    console.log(`  ${colorize('gray', `tail -f ${CONFIG.watch.logFile}`)}`);
    console.log('');
    
    return true;
  } catch (err) {
    logger.error(`安装 cron 任务失败: ${err.message}`);
    return false;
  }
}

/**
 * 移除 cron 定时任务
 * @param {boolean} showOutput - 是否显示输出
 */
export function removeCronJob(showOutput = true) {
  if (showOutput) {
    console.log('');
    console.log(colorize('bold', '🗑️  移除自动部署定时任务'));
    console.log('');
  }
  
  if (!isCronInstalled()) {
    if (showOutput) {
      logger.warn('未找到 rosydawn 自动部署任务');
    }
    return false;
  }
  
  // 获取现有 crontab 并移除我们的任务
  const currentCrontab = getCurrentCrontab();
  const lines = currentCrontab.split('\n').filter(line => !line.includes(CRON_MARKER));
  const newCrontab = lines.join('\n');
  
  try {
    if (newCrontab.trim()) {
      execSync(`echo '${newCrontab}' | crontab -`, { stdio: 'pipe' });
    } else {
      execSync('crontab -r 2>/dev/null || true', { stdio: 'pipe' });
    }
    
    if (showOutput) {
      logger.success('Cron 任务已移除');
      console.log('');
    }
    return true;
  } catch (err) {
    if (showOutput) {
      logger.error(`移除 cron 任务失败: ${err.message}`);
    }
    return false;
  }
}

/**
 * 显示 cron 任务状态
 */
export function showCronStatus() {
  console.log('');
  console.log(colorize('bold', '⏰ 自动部署任务状态'));
  console.log('');
  
  const intervalMinutes = CONFIG.watch.interval / 1000 / 60;
  
  console.log(colorize('cyan', '配置信息:'));
  console.log(`  ${colorize('gray', '检查间隔:')} 每 ${intervalMinutes} 分钟`);
  console.log(`  ${colorize('gray', 'Git 分支:')} ${CONFIG.watch.branch}`);
  console.log(`  ${colorize('gray', '日志文件:')} ${CONFIG.watch.logFile}`);
  console.log(`  ${colorize('gray', '邮件通知:')} ${CONFIG.mail.enabled && CONFIG.mail.smtp.auth.user ? '✓ 已启用' : '○ 未启用'}`);
  
  console.log('');
  console.log(colorize('cyan', 'Cron 任务:'));
  
  if (isCronInstalled()) {
    console.log(`  ${colorize('green', '✓ 已安装并运行中')}`);
    
    // 显示 cron 任务详情
    const crontab = getCurrentCrontab();
    const cronLine = crontab.split('\n').find(line => line.includes(CRON_MARKER));
    if (cronLine) {
      const schedule = cronLine.split(' ').slice(0, 5).join(' ');
      console.log(`  ${colorize('gray', 'Cron 表达式:')} ${schedule}`);
    }
  } else {
    console.log(`  ${colorize('yellow', '○ 未安装')}`);
    console.log(`  ${colorize('gray', '运行 npm run deploy:cron:install 安装')}`);
  }
  
  // 显示最近的日志
  console.log('');
  console.log(colorize('cyan', '最近日志:'));
  
  if (existsSync(CONFIG.watch.logFile)) {
    try {
      const logContent = readFileSync(CONFIG.watch.logFile, 'utf-8');
      const lines = logContent.trim().split('\n');
      const recentLines = lines.slice(-5);
      
      if (recentLines.length > 0) {
        recentLines.forEach(line => {
          console.log(`  ${colorize('gray', line)}`);
        });
      } else {
        console.log(`  ${colorize('gray', '(暂无日志)')}`);
      }
    } catch {
      console.log(`  ${colorize('gray', '(无法读取日志)')}`);
    }
  } else {
    console.log(`  ${colorize('gray', '(日志文件不存在)')}`);
  }
  
  console.log('');
}

// ==================== 自动部署 ====================

/**
 * 检查是否有更新并自动部署（单次执行，供 cron 调用）
 * @param {Function} buildAndDeploy - 构建部署函数
 */
export async function checkAndDeploy(buildAndDeploy) {
  writeLog('检查 Git 更新...');
  
  const localHash = getLocalCommitHash();
  const remoteHash = getRemoteCommitHash();
  
  if (!localHash || !remoteHash) {
    writeLog('无法获取 Git commit 信息');
    return false;
  }
  
  if (localHash === remoteHash) {
    writeLog(`无更新 (当前版本: ${localHash.substring(0, 7)})`);
    return false;
  }
  
  // 有更新，开始部署
  writeLog(`检测到新提交: ${remoteHash.substring(0, 7)}`);
  writeLog(`本地版本: ${localHash.substring(0, 7)} -> 远程版本: ${remoteHash.substring(0, 7)}`);
  
  const commitInfo = getCommitInfo(remoteHash);
  
  // 拉取代码
  if (!pullLatestCode()) {
    await sendDeployNotification(false, {
      commitHash: remoteHash,
      commitMessage: commitInfo.message,
      commitAuthor: commitInfo.author,
      error: 'Git pull 失败',
    });
    return false;
  }
  
  // 执行部署
  try {
    writeLog('开始自动部署...');
    await buildAndDeploy();
    
    const fileCount = countFiles(CONFIG.webRoot);
    writeLog(`部署成功！共 ${fileCount} 个文件`);
    
    // 部署完成后清理日志
    trimLogFile();
    
    await sendDeployNotification(true, {
      commitHash: remoteHash,
      commitMessage: commitInfo.message,
      commitAuthor: commitInfo.author,
      fileCount,
    });
    
    return true;
  } catch (err) {
    writeLog(`部署失败: ${err.message}`);
    
    await sendDeployNotification(false, {
      commitHash: remoteHash,
      commitMessage: commitInfo.message,
      commitAuthor: commitInfo.author,
      error: err.message,
    });
    
    return false;
  }
}

/**
 * 单次执行检查和部署（供 cron 调用）
 * @param {Function} buildAndDeploy - 构建部署函数
 */
export async function runCronCheck(buildAndDeploy) {
  // 检查邮件配置
  if (CONFIG.mail.enabled && (!CONFIG.mail.smtp.auth.user || !CONFIG.mail.smtp.auth.pass)) {
    writeLog('警告: 邮件配置不完整，部署通知将被禁用');
  }
  
  await checkAndDeploy(buildAndDeploy);
}

