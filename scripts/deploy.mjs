#!/usr/bin/env node

/**
 * ============================================
 * Rosydawn 博客部署脚本 (Node.js 版本)
 * ============================================
 * 用法:
 *   node scripts/deploy.mjs init     - 首次部署（克隆项目并构建）
 *   node scripts/deploy.mjs update   - 检测更新并重新部署
 *   node scripts/deploy.mjs build    - 强制重新构建
 *   node scripts/deploy.mjs status   - 显示部署状态
 *   node scripts/deploy.mjs cron     - 安装定时任务
 * 
 * 或通过 npm 脚本:
 *   npm run deploy:init
 *   npm run deploy:update
 *   npm run deploy:build
 *   npm run deploy:status
 * ============================================
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, rmSync, cpSync, readdirSync, statSync, appendFileSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

// ==================== 配置区域 ====================

const CONFIG = {
  // GitHub 仓库地址
  repoUrl: 'https://github.com/YOUR_USERNAME/rosydawn.git',

  // 项目部署目录
  deployDir: '/var/www/rosydawn',

  // Astro 构建输出目录（相对于项目根目录）
  buildOutput: 'dist',

  // Nginx 网站根目录（Astro 构建产物会复制到这里）
  webRoot: '/var/www/html/rosydawn',

  // Node.js 版本要求
  nodeVersionRequired: 18,

  // 日志文件
  logFile: '/var/log/rosydawn-deploy.log',

  // 检测更新的间隔（分钟），用于 cron
  cronInterval: 5,

  // 主分支名称
  mainBranch: 'main',
};

// ==================== 颜色输出 ====================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(level, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const levelColors = {
    INFO: 'blue',
    SUCCESS: 'green',
    WARN: 'yellow',
    ERROR: 'red',
  };

  const coloredLevel = colorize(levelColors[level] || 'reset', `[${level}]`);
  console.log(`${coloredLevel} ${message}`);

  // 写入日志文件
  try {
    const logDir = dirname(CONFIG.logFile);
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    appendFileSync(CONFIG.logFile, `[${timestamp}] [${level}] ${message}\n`);
  } catch (err) {
    // 忽略日志写入错误
  }
}

const logger = {
  info: (msg) => log('INFO', msg),
  success: (msg) => log('SUCCESS', msg),
  warn: (msg) => log('WARN', msg),
  error: (msg) => log('ERROR', msg),
};

// ==================== 工具函数 ====================

/**
 * 执行命令并返回输出
 */
function exec(command, options = {}) {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd,
      ...options,
    });
  } catch (err) {
    if (options.ignoreError) {
      return err.stdout || '';
    }
    throw err;
  }
}

/**
 * 执行命令并实时输出
 */
function execStream(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      cwd: options.cwd,
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

/**
 * 检查命令是否存在
 */
function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取 Node.js 主版本号
 */
function getNodeMajorVersion() {
  const version = process.version.replace('v', '');
  return parseInt(version.split('.')[0], 10);
}

/**
 * 询问用户确认
 */
function askConfirm(question) {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${question} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * 递归计算目录文件数
 */
function countFiles(dir) {
  let count = 0;
  if (!existsSync(dir)) return 0;

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isFile()) {
      count++;
    } else if (stat.isDirectory()) {
      count += countFiles(fullPath);
    }
  }
  return count;
}

// ==================== 检查函数 ====================

/**
 * 检查部署环境
 */
function checkEnvironment() {
  logger.info('检查部署环境...');

  // 检查 git
  if (!commandExists('git')) {
    logger.error('git 未安装，请先安装 git');
    process.exit(1);
  }

  // 检查 Node.js 版本
  const nodeVersion = getNodeMajorVersion();
  if (nodeVersion < CONFIG.nodeVersionRequired) {
    logger.error(`Node.js 版本过低，需要 v${CONFIG.nodeVersionRequired}+，当前为 ${process.version}`);
    process.exit(1);
  }
  logger.info(`Node.js 版本: ${process.version}`);

  // 检查 npm
  if (!commandExists('npm')) {
    logger.error('npm 未安装');
    process.exit(1);
  }

  logger.success('环境检查通过');
}

// ==================== 部署函数 ====================

/**
 * 构建项目
 */
async function buildProject() {
  logger.info('安装依赖...');
  await execStream('npm', ['install'], { cwd: CONFIG.deployDir });

  logger.info('构建 Astro 项目...');
  await execStream('npm', ['run', 'build'], { cwd: CONFIG.deployDir });

  // 复制构建产物到网站目录
  logger.info('部署到网站目录...');
  const buildPath = join(CONFIG.deployDir, CONFIG.buildOutput);
  
  if (!existsSync(buildPath)) {
    logger.error(`构建输出目录不存在: ${buildPath}`);
    process.exit(1);
  }

  // 创建目标目录
  mkdirSync(CONFIG.webRoot, { recursive: true });

  // 清空目标目录
  const items = readdirSync(CONFIG.webRoot);
  for (const item of items) {
    rmSync(join(CONFIG.webRoot, item), { recursive: true, force: true });
  }

  // 复制文件
  cpSync(buildPath, CONFIG.webRoot, { recursive: true });

  logger.success('构建完成！');
}

/**
 * 首次部署
 */
async function initDeploy() {
  logger.info('开始首次部署...');

  checkEnvironment();

  // 检查部署目录
  if (existsSync(CONFIG.deployDir)) {
    logger.warn(`部署目录已存在: ${CONFIG.deployDir}`);
    const confirm = await askConfirm('是否删除并重新克隆？');
    
    if (confirm) {
      rmSync(CONFIG.deployDir, { recursive: true, force: true });
    } else {
      logger.info('跳过克隆，直接构建...');
      await buildProject();
      return;
    }
  }

  // 克隆项目
  logger.info(`克隆项目: ${CONFIG.repoUrl}`);
  mkdirSync(dirname(CONFIG.deployDir), { recursive: true });
  exec(`git clone ${CONFIG.repoUrl} ${CONFIG.deployDir}`);

  // 构建项目
  await buildProject();

  logger.success('首次部署完成！');
  logger.info(`网站目录: ${CONFIG.webRoot}`);
  logger.info('请配置 Nginx 指向该目录');
}

/**
 * 检测更新并部署
 */
async function updateDeploy() {
  logger.info('检测项目更新...');

  if (!existsSync(CONFIG.deployDir)) {
    logger.error(`项目目录不存在: ${CONFIG.deployDir}`);
    logger.info('请先执行: npm run deploy:init');
    process.exit(1);
  }

  // 获取远程更新
  exec('git fetch origin', { cwd: CONFIG.deployDir, silent: true });

  // 比较本地和远程
  const local = exec('git rev-parse HEAD', { cwd: CONFIG.deployDir, silent: true }).trim();
  
  let remote;
  try {
    remote = exec(`git rev-parse origin/${CONFIG.mainBranch}`, { cwd: CONFIG.deployDir, silent: true }).trim();
  } catch {
    remote = exec('git rev-parse origin/master', { cwd: CONFIG.deployDir, silent: true }).trim();
  }

  if (local === remote) {
    logger.info('没有检测到更新，当前已是最新版本');
    logger.info(`本地 commit: ${local.substring(0, 8)}`);
    return;
  }

  logger.info('检测到更新！');
  logger.info(`本地: ${local.substring(0, 8)} -> 远程: ${remote.substring(0, 8)}`);

  // 显示更新内容
  logger.info('更新内容:');
  const logs = exec(`git log --oneline ${local}..${remote}`, { cwd: CONFIG.deployDir, silent: true });
  console.log(colorize('gray', logs.split('\n').slice(0, 10).join('\n')));

  // 拉取更新
  logger.info('拉取更新...');
  try {
    exec(`git pull origin ${CONFIG.mainBranch}`, { cwd: CONFIG.deployDir });
  } catch {
    exec('git pull origin master', { cwd: CONFIG.deployDir });
  }

  // 重新构建
  await buildProject();

  logger.success('更新部署完成！');
}

/**
 * 强制重新构建
 */
async function forceBuild() {
  logger.info('强制重新构建...');

  if (!existsSync(CONFIG.deployDir)) {
    logger.error(`项目目录不存在: ${CONFIG.deployDir}`);
    process.exit(1);
  }

  await buildProject();

  logger.success('重新构建完成！');
}

/**
 * 安装定时任务
 */
async function installCron() {
  logger.info('安装定时任务...');

  const scriptPath = resolve(fileURLToPath(import.meta.url));
  const cronCmd = `*/${CONFIG.cronInterval} * * * * /usr/bin/node ${scriptPath} update >> ${CONFIG.logFile} 2>&1`;

  // 检查是否已存在
  let currentCron = '';
  try {
    currentCron = exec('crontab -l', { silent: true, ignoreError: true }) || '';
  } catch {
    currentCron = '';
  }

  if (currentCron.includes('rosydawn') && currentCron.includes('update')) {
    logger.warn('定时任务已存在');
    const confirm = await askConfirm('是否替换？');
    if (!confirm) {
      logger.info('取消安装');
      return;
    }
    // 移除旧的
    currentCron = currentCron.split('\n').filter(line => !line.includes('rosydawn') || !line.includes('update')).join('\n');
  }

  // 添加新的定时任务
  const newCron = currentCron.trim() + '\n' + cronCmd + '\n';
  exec(`echo "${newCron}" | crontab -`);

  logger.success('定时任务安装完成！');
  logger.info(`每 ${CONFIG.cronInterval} 分钟检测一次更新`);
  logger.info(`日志文件: ${CONFIG.logFile}`);

  console.log('');
  logger.info('当前定时任务:');
  console.log(colorize('gray', cronCmd));
}

/**
 * 显示状态
 */
function showStatus() {
  console.log('');
  console.log('==================== Rosydawn 部署状态 ====================');

  if (existsSync(CONFIG.deployDir)) {
    const branch = exec('git branch --show-current', { cwd: CONFIG.deployDir, silent: true }).trim();
    const commit = exec('git rev-parse --short HEAD', { cwd: CONFIG.deployDir, silent: true }).trim();
    const lastUpdate = exec('git log -1 --format="%ci"', { cwd: CONFIG.deployDir, silent: true }).trim();

    console.log(`项目目录: ${CONFIG.deployDir} ${colorize('green', '✓')}`);
    console.log(`当前分支: ${branch}`);
    console.log(`当前版本: ${commit}`);
    console.log(`最后更新: ${lastUpdate}`);
  } else {
    console.log(`项目目录: ${CONFIG.deployDir} ${colorize('red', '✗')} (未部署)`);
  }

  if (existsSync(CONFIG.webRoot)) {
    const fileCount = countFiles(CONFIG.webRoot);
    console.log(`网站目录: ${CONFIG.webRoot} ${colorize('green', '✓')}`);
    console.log(`文件数量: ${fileCount} 个文件`);
  } else {
    console.log(`网站目录: ${CONFIG.webRoot} ${colorize('red', '✗')} (未构建)`);
  }

  // 检查 cron
  try {
    const cron = exec('crontab -l', { silent: true, ignoreError: true }) || '';
    if (cron.includes('rosydawn') && cron.includes('update')) {
      console.log(`定时任务: ${colorize('green', '已启用 ✓')}`);
    } else {
      console.log('定时任务: 未启用');
    }
  } catch {
    console.log('定时任务: 未启用');
  }

  console.log('===========================================================');
  console.log('');
}

/**
 * 显示帮助
 */
function showHelp() {
  console.log(`
${colorize('cyan', 'Rosydawn 博客部署脚本')} (Node.js 版本)

${colorize('yellow', '用法:')} node scripts/deploy.mjs <command>
${colorize('yellow', '或者:')} npm run deploy:<command>

${colorize('yellow', '命令:')}
  ${colorize('green', 'init')}      首次部署（克隆项目、安装依赖、构建）
  ${colorize('green', 'update')}    检测更新并重新部署（用于定时任务）
  ${colorize('green', 'build')}     强制重新构建（不拉取更新）
  ${colorize('green', 'status')}    显示部署状态
  ${colorize('green', 'cron')}      安装定时任务（每 ${CONFIG.cronInterval} 分钟检测更新）
  ${colorize('green', 'help')}      显示此帮助信息

${colorize('yellow', '配置说明:')}
  请在脚本开头的 CONFIG 对象中修改以下配置:
  - repoUrl:    GitHub 仓库地址
  - deployDir:  项目部署目录
  - webRoot:    Nginx 网站根目录

${colorize('yellow', '部署流程:')}
  1. 修改脚本配置
  2. 执行 npm run deploy:init 完成首次部署
  3. 配置 Nginx 指向 ${CONFIG.webRoot}
  4. 执行 npm run deploy:cron 启用自动更新
`);
}

// ==================== 主程序 ====================

async function main() {
  const command = process.argv[2] || 'help';

  try {
    switch (command) {
      case 'init':
        await initDeploy();
        showStatus();
        break;

      case 'update':
        await updateDeploy();
        break;

      case 'build':
        await forceBuild();
        break;

      case 'status':
        showStatus();
        break;

      case 'cron':
        await installCron();
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        logger.error(`未知命令: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }
}

main();
