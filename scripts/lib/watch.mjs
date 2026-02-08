/**
 * ============================================
 * 自动部署监控模块
 * ============================================
 */

import { execSync } from 'child_process';
import { existsSync, appendFileSync } from 'fs';
import { dirname } from 'path';
import { CONFIG, PROJECT_ROOT } from './config.mjs';
import { logger, colorize } from './logger.mjs';
import { commandExists, countFiles } from './utils.mjs';
import { sendDeployNotification } from './mail.mjs';

// ==================== 日志 ====================

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
      execSync(`sudo mkdir -p ${logDir}`, { stdio: 'pipe' });
      execSync(`sudo chmod 755 ${logDir}`, { stdio: 'pipe' });
    }
    
    // 尝试直接写入，如果权限不足则使用 sudo
    try {
      appendFileSync(CONFIG.watch.logFile, logLine);
    } catch {
      execSync(`echo '${logLine.replace(/'/g, "\\'")}' | sudo tee -a ${CONFIG.watch.logFile}`, { stdio: 'pipe' });
    }
  } catch {
    // 日志写入失败不影响主流程
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
    // 先 fetch 最新的远程信息
    execSync(`git -C ${PROJECT_ROOT} fetch origin ${CONFIG.watch.branch}`, { stdio: 'pipe' });
    return execSync(`git -C ${PROJECT_ROOT} rev-parse origin/${CONFIG.watch.branch}`, { encoding: 'utf-8' }).trim();
  } catch {
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
    execSync(`git -C ${PROJECT_ROOT} pull origin ${CONFIG.watch.branch}`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    writeLog(`Git pull 失败: ${err.message}`);
    return false;
  }
}

// ==================== 自动部署 ====================

/**
 * 检查是否有更新并自动部署
 * @param {Function} buildAndDeploy - 构建部署函数
 */
export async function checkAndDeploy(buildAndDeploy) {
  const localHash = getLocalCommitHash();
  const remoteHash = getRemoteCommitHash();
  
  if (!localHash || !remoteHash) {
    writeLog('无法获取 Git commit 信息');
    return false;
  }
  
  if (localHash === remoteHash) {
    // 没有更新
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
 * 启动自动部署监控
 * @param {Function} buildAndDeploy - 构建部署函数
 */
export async function startWatch(buildAndDeploy) {
  console.log('');
  console.log(colorize('bold', '👀 启动自动部署监控'));
  console.log('');
  
  // 检查 Git
  if (!commandExists('git')) {
    logger.error('Git 未安装');
    process.exit(1);
  }
  
  // 检查邮件配置
  if (CONFIG.mail.enabled && (!CONFIG.mail.smtp.auth.user || !CONFIG.mail.smtp.auth.pass)) {
    logger.warn('邮件配置不完整，部署通知将被禁用');
    console.log('');
    console.log(colorize('yellow', '请设置以下环境变量启用邮件通知:'));
    console.log(colorize('cyan', '  SMTP_USER=your@email.com'));
    console.log(colorize('cyan', '  SMTP_PASS=your_smtp_password'));
    console.log('');
  }
  
  const intervalMinutes = CONFIG.watch.interval / 1000 / 60;
  
  console.log(`  ${colorize('gray', '检查间隔:')} 每 ${intervalMinutes} 分钟`);
  console.log(`  ${colorize('gray', 'Git 分支:')} ${CONFIG.watch.branch}`);
  console.log(`  ${colorize('gray', '日志文件:')} ${CONFIG.watch.logFile}`);
  console.log(`  ${colorize('gray', '邮件通知:')} ${CONFIG.mail.enabled && CONFIG.mail.smtp.auth.user ? '✓ 已启用' : '○ 未启用'}`);
  console.log(`  ${colorize('gray', '通知邮箱:')} ${CONFIG.mail.to}`);
  console.log('');
  console.log('─'.repeat(50));
  console.log('');
  
  writeLog('自动部署监控已启动');
  writeLog(`检查间隔: ${intervalMinutes} 分钟, 分支: ${CONFIG.watch.branch}`);
  
  // 立即执行一次检查
  logger.info('执行首次检查...');
  await checkAndDeploy(buildAndDeploy);
  
  // 定时检查
  setInterval(async () => {
    const now = new Date().toLocaleString('zh-CN');
    writeLog(`[${now}] 检查更新...`);
    await checkAndDeploy(buildAndDeploy);
  }, CONFIG.watch.interval);
  
  console.log('');
  logger.success(`监控已启动，每 ${intervalMinutes} 分钟检查一次更新`);
  console.log(colorize('gray', '按 Ctrl+C 停止监控'));
  console.log('');
}
