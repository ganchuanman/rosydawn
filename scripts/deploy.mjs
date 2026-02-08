#!/usr/bin/env node

/**
 * ============================================
 * Rosydawn 博客部署脚本 (Node.js 版本)
 * ============================================
 * 用法:
 *   node scripts/deploy.mjs build    - 构建并部署到 Nginx 目录
 *   node scripts/deploy.mjs status   - 显示部署状态
 *   node scripts/deploy.mjs help     - 显示帮助信息
 * 
 * 或通过 npm 脚本:
 *   npm run deploy
 *   npm run deploy:status
 * ============================================
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, rmSync, cpSync, readdirSync, statSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// ==================== 配置区域 ====================

const CONFIG = {
  // Astro 构建输出目录（相对于项目根目录）
  buildOutput: 'dist',

  // Nginx 网站根目录（Astro 构建产物会复制到这里）
  webRoot: '/var/www/html/rosydawn',

  // Node.js 版本要求
  nodeVersionRequired: 18,
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
  bold: '\x1b[1m',
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(level, message) {
  const levelColors = {
    INFO: 'blue',
    SUCCESS: 'green',
    WARN: 'yellow',
    ERROR: 'red',
  };

  const coloredLevel = colorize(levelColors[level] || 'reset', `[${level}]`);
  console.log(`${coloredLevel} ${message}`);
}

const logger = {
  info: (msg) => log('INFO', msg),
  success: (msg) => log('SUCCESS', msg),
  warn: (msg) => log('WARN', msg),
  error: (msg) => log('ERROR', msg),
};

// ==================== 工具函数 ====================

/**
 * 获取项目根目录
 */
function getProjectDir() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return resolve(__dirname, '..');
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
        reject(new Error(`命令执行失败，退出码: ${code}`));
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

/**
 * 获取目录大小（MB）
 */
function getDirSize(dir) {
  let size = 0;
  if (!existsSync(dir)) return 0;

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isFile()) {
      size += stat.size;
    } else if (stat.isDirectory()) {
      size += getDirSize(fullPath);
    }
  }
  return size;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ==================== 检查函数 ====================

/**
 * 检查部署环境
 */
function checkEnvironment() {
  logger.info('检查部署环境...');

  // 检查 Node.js 版本
  const nodeVersion = getNodeMajorVersion();
  if (nodeVersion < CONFIG.nodeVersionRequired) {
    logger.error(`Node.js 版本过低，需要 v${CONFIG.nodeVersionRequired}+，当前为 ${process.version}`);
    process.exit(1);
  }

  // 检查 npm
  if (!commandExists('npm')) {
    logger.error('npm 未安装');
    process.exit(1);
  }

  // 检查 nginx
  if (!commandExists('nginx')) {
    console.log('');
    logger.warn('未检测到 Nginx，请先安装 Nginx：');
    console.log('');
    console.log(colorize('gray', '  # Ubuntu/Debian'));
    console.log(colorize('cyan', '  sudo apt update && sudo apt install nginx -y'));
    console.log('');
    console.log(colorize('gray', '  # CentOS/RHEL'));
    console.log(colorize('cyan', '  sudo yum install nginx -y'));
    console.log('');
    console.log(colorize('gray', '  # macOS'));
    console.log(colorize('cyan', '  brew install nginx'));
    console.log('');
    process.exit(1);
  }

  logger.success('环境检查通过');
}

// ==================== 部署函数 ====================

/**
 * 构建并部署项目
 */
async function buildAndDeploy() {
  console.log('');
  console.log(colorize('bold', '🚀 Rosydawn 博客部署'));
  console.log('');

  checkEnvironment();

  const projectDir = getProjectDir();
  const buildPath = join(projectDir, CONFIG.buildOutput);

  // 安装依赖
  logger.info('安装依赖...');
  await execStream('npm', ['install'], { cwd: projectDir });

  // 构建项目
  logger.info('构建 Astro 项目...');
  await execStream('npm', ['run', 'build'], { cwd: projectDir });

  // 验证构建产物
  if (!existsSync(buildPath)) {
    logger.error(`构建输出目录不存在: ${buildPath}`);
    process.exit(1);
  }

  const fileCount = countFiles(buildPath);
  const dirSize = formatSize(getDirSize(buildPath));
  logger.success(`构建完成！${fileCount} 个文件，共 ${dirSize}`);

  // 部署到 Nginx 目录
  logger.info(`部署到 ${CONFIG.webRoot}...`);

  // 创建目标目录（可能需要 sudo 权限）
  try {
    mkdirSync(CONFIG.webRoot, { recursive: true });
  } catch (err) {
    if (err.code === 'EACCES') {
      logger.warn('需要管理员权限创建目录，尝试使用 sudo...');
      execSync(`sudo mkdir -p ${CONFIG.webRoot}`, { stdio: 'inherit' });
      execSync(`sudo chown -R $USER:$USER ${CONFIG.webRoot}`, { stdio: 'inherit' });
    } else {
      throw err;
    }
  }

  // 清空目标目录
  try {
    const items = readdirSync(CONFIG.webRoot);
    for (const item of items) {
      rmSync(join(CONFIG.webRoot, item), { recursive: true, force: true });
    }
  } catch (err) {
    if (err.code === 'EACCES') {
      execSync(`sudo rm -rf ${CONFIG.webRoot}/*`, { stdio: 'inherit' });
    }
  }

  // 复制文件
  try {
    cpSync(buildPath, CONFIG.webRoot, { recursive: true });
  } catch (err) {
    if (err.code === 'EACCES') {
      execSync(`sudo cp -r ${buildPath}/* ${CONFIG.webRoot}/`, { stdio: 'inherit' });
    } else {
      throw err;
    }
  }

  // 完成
  console.log('');
  logger.success('🎉 部署完成！');
  console.log('');
  console.log(`  ${colorize('gray', '网站目录:')} ${CONFIG.webRoot}`);
  console.log(`  ${colorize('gray', '文件数量:')} ${fileCount} 个`);
  console.log(`  ${colorize('gray', '占用空间:')} ${dirSize}`);
  console.log('');

  // 提示 Nginx 配置
  console.log(colorize('yellow', '📝 Nginx 配置示例:'));
  console.log('');
  console.log(colorize('gray', `  server {
      listen 80;
      server_name your-domain.com;
      root ${CONFIG.webRoot};
      index index.html;

      location / {
          try_files $uri $uri/ =404;
      }
  }`));
  console.log('');
}

/**
 * 显示部署状态
 */
function showStatus() {
  console.log('');
  console.log(colorize('bold', '📊 Rosydawn 部署状态'));
  console.log('');
  console.log('─'.repeat(50));

  // 项目信息
  const projectDir = getProjectDir();
  const packagePath = join(projectDir, 'package.json');
  
  console.log('');
  console.log(colorize('cyan', '项目信息:'));
  
  if (existsSync(packagePath)) {
    const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
    console.log(`  名称:     ${pkg.name || 'rosydawn'}`);
    console.log(`  版本:     ${pkg.version || '-'}`);
  }
  console.log(`  目录:     ${projectDir}`);

  // 部署配置
  console.log('');
  console.log(colorize('cyan', '部署配置:'));
  console.log(`  构建目录: ${CONFIG.buildOutput}/`);
  console.log(`  网站目录: ${CONFIG.webRoot}`);

  // 部署状态
  console.log('');
  console.log(colorize('cyan', '部署状态:'));

  if (existsSync(CONFIG.webRoot)) {
    const fileCount = countFiles(CONFIG.webRoot);
    const dirSize = formatSize(getDirSize(CONFIG.webRoot));
    
    if (fileCount > 0) {
      console.log(`  状态:     ${colorize('green', '✓ 已部署')}`);
      console.log(`  文件数:   ${fileCount} 个`);
      console.log(`  占用:     ${dirSize}`);

      // 获取最后修改时间
      try {
        const stat = statSync(CONFIG.webRoot);
        console.log(`  更新时间: ${stat.mtime.toLocaleString('zh-CN')}`);
      } catch {}
    } else {
      console.log(`  状态:     ${colorize('yellow', '○ 目录为空')}`);
    }
  } else {
    console.log(`  状态:     ${colorize('red', '✗ 未部署')}`);
  }

  // 环境信息
  console.log('');
  console.log(colorize('cyan', '环境信息:'));
  console.log(`  Node.js:  ${process.version}`);
  console.log(`  Nginx:    ${commandExists('nginx') ? colorize('green', '已安装 ✓') : colorize('red', '未安装 ✗')}`);

  // 检查 Nginx 是否运行
  if (commandExists('nginx')) {
    try {
      execSync('pgrep nginx', { stdio: 'pipe' });
      console.log(`  运行状态: ${colorize('green', '运行中 ✓')}`);
    } catch {
      console.log(`  运行状态: ${colorize('yellow', '未运行')}`);
    }
  }

  console.log('');
  console.log('─'.repeat(50));
  console.log('');
}

/**
 * 显示帮助
 */
function showHelp() {
  console.log(`
${colorize('bold', 'Rosydawn 博客部署脚本')}

${colorize('yellow', '用法:')}
  node scripts/deploy.mjs <命令>
  npm run deploy            # 等同于 build
  npm run deploy:status     # 查看状态

${colorize('yellow', '命令:')}
  ${colorize('green', 'build')}     构建项目并部署到 Nginx 网站目录
  ${colorize('green', 'status')}    显示当前部署状态和配置信息
  ${colorize('green', 'help')}      显示此帮助信息

${colorize('yellow', '部署配置:')}
  构建输出:   ${CONFIG.buildOutput}/
  网站目录:   ${CONFIG.webRoot}

${colorize('yellow', '部署流程:')}
  1. 运行 ${colorize('cyan', 'npm run deploy')} 构建并部署
  2. 配置 Nginx 指向 ${CONFIG.webRoot}
  3. 重启 Nginx: ${colorize('cyan', 'sudo nginx -s reload')}

${colorize('yellow', '示例:')}
  npm run deploy            # 一键构建部署
  npm run deploy:status     # 查看部署状态
`);
}

// ==================== 主程序 ====================

async function main() {
  const command = process.argv[2] || 'help';

  try {
    switch (command) {
      case 'build':
      case 'deploy':
        await buildAndDeploy();
        break;

      case 'status':
        showStatus();
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        logger.error(`未知命令: ${command}`);
        console.log('');
        console.log(`运行 ${colorize('cyan', 'node scripts/deploy.mjs help')} 查看可用命令`);
        process.exit(1);
    }
  } catch (err) {
    console.log('');
    logger.error(err.message);
    process.exit(1);
  }
}

main();