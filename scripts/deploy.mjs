#!/usr/bin/env node

/**
 * ============================================
 * Rosydawn 博客部署脚本 (Node.js 版本)
 * ============================================
 * 
 * 基础命令:
 *   node scripts/deploy.mjs build         - 构建并部署到 Nginx 目录
 *   node scripts/deploy.mjs ssl           - 配置 HTTPS
 *   node scripts/deploy.mjs status        - 显示部署状态
 *   node scripts/deploy.mjs help          - 显示帮助信息
 * 
 * 自动部署命令 (Cron):
 *   node scripts/deploy.mjs cron          - 单次检查更新（供 cron 调用）
 *   node scripts/deploy.mjs cron:install  - 安装 cron 定时任务
 *   node scripts/deploy.mjs cron:remove   - 移除 cron 定时任务
 *   node scripts/deploy.mjs cron:status   - 查看任务状态
 * 
 * npm 脚本:
 *   npm run deploy              # 构建并部署
 *   npm run deploy:ssl          # 配置 HTTPS
 *   npm run deploy:status       # 查看状态
 *   npm run deploy:cron:install # 安装自动部署
 *   npm run deploy:cron:status  # 查看任务状态
 * ============================================
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, cpSync } from 'fs';
import { join, dirname } from 'path';

// ==================== 环境修复 ====================

/**
 * 修复 Cron 环境的 PATH 问题
 * 确保使用当前 Node.js 的 bin 目录，而不是系统默认的
 */
function fixCronEnvironment() {
  // 获取当前 Node.js 可执行文件的目录
  const nodeBinDir = dirname(process.execPath);
  const currentPath = process.env.PATH || '';
  
  // 如果当前 Node 的 bin 目录不在 PATH 最前面，则添加
  if (!currentPath.startsWith(nodeBinDir)) {
    process.env.PATH = `${nodeBinDir}:${currentPath}`;
  }
}

// 在导入其他模块之前先修复环境
fixCronEnvironment();

// 导入模块
import {
  CONFIG,
  PROJECT_ROOT,
  logger,
  colorize,
  execStream,
  commandExists,
  checkEnvironment,
  countFiles,
  getDirSize,
  formatSize,
  getUserGroup,
  setupNginx,
  showNginxStatus,
  showSSLStatusInNginx,
  obtainSSLCertificate,
  renewSSLCertificate,
  setupAutoRenewal,
  checkSSLCertificate,
  // Cron 自动部署
  runCronCheck,
  installCronJob,
  removeCronJob,
  showCronStatus,
} from './lib/index.mjs';

// ==================== 构建部署 ====================

/**
 * 构建并部署网站
 */
async function buildAndDeploy() {
  console.log('');
  console.log(colorize('bold', '🚀 Rosydawn 博客部署'));
  console.log('');

  // 检查环境
  checkEnvironment();

  // 执行 Astro 构建
  console.log('');
  logger.info('执行 Astro 构建...');
  console.log('');

  try {
    await execStream('npm', ['run', 'build'], { cwd: PROJECT_ROOT });
    logger.success('构建完成');
  } catch (err) {
    throw new Error('Astro 构建失败');
  }

  // 检查构建产物
  const distDir = join(PROJECT_ROOT, CONFIG.buildOutput);
  if (!existsSync(distDir)) {
    throw new Error(`构建输出目录不存在: ${distDir}`);
  }

  // 复制到 Nginx 目录
  console.log('');
  logger.info(`复制文件到 ${CONFIG.webRoot}...`);

  try {
    // 确保目标目录存在
    if (!existsSync(CONFIG.webRoot)) {
      execSync(`sudo mkdir -p ${CONFIG.webRoot}`, { stdio: 'inherit' });
    }

    // 清空目标目录（保留目录本身）
    if (existsSync(CONFIG.webRoot)) {
      execSync(`sudo rm -rf ${CONFIG.webRoot}/*`, { stdio: 'pipe' });
    }

    // 复制文件
    execSync(`sudo cp -r ${distDir}/* ${CONFIG.webRoot}/`, { stdio: 'inherit' });

    // 设置权限
    const user = process.env.USER;
    const group = getUserGroup();
    execSync(`sudo chown -R ${user}:${group} ${CONFIG.webRoot}`, { stdio: 'inherit' });
    execSync(`sudo chmod -R 755 ${CONFIG.webRoot}`, { stdio: 'inherit' });

    logger.success('文件复制完成');
  } catch (err) {
    throw new Error(`复制文件失败: ${err.message}`);
  }

  // 配置 Nginx
  setupNginx();

  // 统计信息
  const fileCount = countFiles(CONFIG.webRoot);
  const totalSize = getDirSize(CONFIG.webRoot);

  console.log('');
  console.log('─'.repeat(50));
  console.log('');
  logger.success('🎉 部署完成！');
  console.log('');
  console.log(`  ${colorize('gray', '文件数量:')} ${fileCount} 个`);
  console.log(`  ${colorize('gray', '总大小:')}   ${formatSize(totalSize)}`);
  console.log(`  ${colorize('gray', '部署目录:')} ${CONFIG.webRoot}`);
  console.log('');
}

// ==================== SSL 配置 ====================

/**
 * 配置 SSL/HTTPS
 */
async function setupSSL() {
  console.log('');
  console.log(colorize('bold', '🔒 配置 HTTPS (Let\'s Encrypt)'));
  console.log('');

  // 检查 Nginx
  if (!commandExists('nginx')) {
    logger.error('请先安装 Nginx');
    process.exit(1);
  }

  // 申请证书
  const success = await obtainSSLCertificate();
  if (!success) {
    process.exit(1);
  }

  // 更新 Nginx 配置（启用 HTTPS）
  CONFIG.ssl.enabled = true;
  setupNginx();

  // 设置自动续期
  setupAutoRenewal();

  console.log('');
  console.log('─'.repeat(50));
  console.log('');
  logger.success('🎉 HTTPS 配置完成！');
  console.log('');
  console.log(`  ${colorize('green', '立即访问:')} ${colorize('cyan', `https://${CONFIG.domain}`)}`);
  console.log('');
}

// ==================== 状态显示 ====================

/**
 * 显示部署状态
 */
function showStatus() {
  console.log('');
  console.log(colorize('bold', '📊 Rosydawn 部署状态'));
  console.log('');

  // 基本信息
  console.log(colorize('cyan', '基本配置:'));
  console.log(`  域名:     ${CONFIG.domain}`);
  console.log(`  网站目录: ${CONFIG.webRoot}`);
  console.log(`  构建目录: ${CONFIG.buildOutput}/`);

  // 网站目录状态
  console.log('');
  console.log(colorize('cyan', '网站目录:'));
  if (existsSync(CONFIG.webRoot)) {
    const fileCount = countFiles(CONFIG.webRoot);
    const totalSize = getDirSize(CONFIG.webRoot);
    console.log(`  状态:     ${colorize('green', '✓ 已部署')}`);
    console.log(`  文件数:   ${fileCount} 个`);
    console.log(`  总大小:   ${formatSize(totalSize)}`);
  } else {
    console.log(`  状态:     ${colorize('yellow', '○ 未部署')}`);
    console.log(`  ${colorize('gray', '运行 npm run deploy 进行部署')}`);
  }

  // Nginx 状态
  showNginxStatus();

  // SSL 状态
  showSSLStatusInNginx();

  console.log('');
}

// ==================== 帮助信息 ====================

/**
 * 显示帮助信息
 */
function showHelp() {
  const intervalMinutes = CONFIG.watch.interval / 1000 / 60;
  
  console.log(`
${colorize('bold', 'Rosydawn 博客部署脚本')}

${colorize('yellow', '用法:')}
  node scripts/deploy.mjs <命令>

${colorize('yellow', '基础命令:')}
  ${colorize('green', 'build')}          构建项目并部署到 Nginx
  ${colorize('green', 'ssl')}            申请 SSL 证书并配置 HTTPS
  ${colorize('green', 'renew')}          手动续期 SSL 证书
  ${colorize('green', 'status')}         显示当前部署状态
  ${colorize('green', 'help')}           显示此帮助信息

${colorize('yellow', '自动部署命令 (Cron):')}
  ${colorize('green', 'cron')}           单次检查 Git 更新并部署（供 cron 调用）
  ${colorize('green', 'cron:install')}   安装 cron 定时任务
  ${colorize('green', 'cron:remove')}    移除 cron 定时任务
  ${colorize('green', 'cron:status')}    查看 cron 任务状态

${colorize('yellow', 'npm 脚本:')}
  npm run deploy              # 构建并部署
  npm run deploy:ssl          # 配置 HTTPS
  npm run deploy:status       # 查看状态
  npm run deploy:cron:install # 安装自动部署
  npm run deploy:cron:status  # 查看自动部署状态
  npm run deploy:cron:remove  # 移除自动部署

${colorize('yellow', '部署配置:')}
  构建输出:   ${CONFIG.buildOutput}/
  网站目录:   ${CONFIG.webRoot}
  域名:       ${CONFIG.domain}

${colorize('yellow', '自动部署配置:')}
  检查间隔:   每 ${intervalMinutes} 分钟
  Git 分支:   ${CONFIG.watch.branch}
  日志文件:   ${CONFIG.watch.logFile}

${colorize('yellow', '环境变量:')}
  ${colorize('cyan', '基础配置:')}
  DOMAIN         覆盖配置中的域名设置
  SSL_EMAIL      SSL 证书邮箱（用于续期通知）
  ENABLE_SSL     设为 true 启用 HTTPS 配置
  
  ${colorize('cyan', '自动部署:')}
  WATCH_INTERVAL 检查间隔（分钟），默认 5
  GIT_BRANCH     Git 分支，默认 main
  
  ${colorize('cyan', '邮件通知 (SMTP):')}
  SMTP_HOST      SMTP 服务器地址
  SMTP_PORT      SMTP 端口
  SMTP_USER      发件人邮箱
  SMTP_PASS      邮箱授权码/密码
  NOTIFY_EMAIL   收件人邮箱

${colorize('yellow', '配置文件 (.env):')}
  推荐使用 .env 文件管理敏感配置（如授权码），避免泄露到 Git
  
  1. 复制配置模板:  cp .env.example .env
  2. 编辑配置文件:  nano .env
  3. 配置已被 .gitignore 忽略，不会提交到仓库

${colorize('yellow', '部署流程:')}
  ${colorize('cyan', '1. 手动部署:')}
     npm run deploy                               # 构建并部署
     SSL_EMAIL=you@example.com npm run deploy:ssl # 配置 HTTPS
  
  ${colorize('cyan', '2. 自动部署 (推荐):')}
     # 首次配置
     cp .env.example .env
     nano .env                                    # 配置 SMTP 信息
     
     # 安装 cron 定时任务
     npm run deploy:cron:install
     
     # 查看状态
     npm run deploy:cron:status
     
     # 查看实时日志
     tail -f ${CONFIG.watch.logFile}

${colorize('yellow', '示例:')}
  npm run deploy                # HTTP 部署
  npm run deploy:ssl            # 启用 HTTPS
  npm run deploy:cron:install   # 安装自动部署
  npm run deploy:cron:status    # 查看自动部署状态
`);
}

// ==================== 主程序 ====================

async function main() {
  const command = process.argv[2] || 'help';

  try {
    switch (command) {
      // 基础命令
      case 'build':
      case 'deploy':
        await buildAndDeploy();
        break;

      case 'ssl':
      case 'https':
        await setupSSL();
        break;

      case 'renew':
      case 'ssl-renew':
        await renewSSLCertificate();
        break;

      case 'status':
        showStatus();
        break;

      // Cron 自动部署命令
      case 'cron':
        await runCronCheck(buildAndDeploy);
        break;

      case 'cron:install':
        installCronJob();
        break;

      case 'cron:remove':
        removeCronJob();
        break;

      case 'cron:status':
        showCronStatus();
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