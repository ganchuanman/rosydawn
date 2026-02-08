/**
 * ============================================
 * SSL/HTTPS 管理模块
 * ============================================
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { CONFIG } from './config.mjs';
import { logger, colorize } from './logger.mjs';
import { commandExists } from './utils.mjs';

// ==================== 证书检查 ====================

/**
 * 检查 SSL 证书是否存在
 * 注意：/etc/letsencrypt/live/ 需要 root 权限访问
 */
export function checkSSLCertificate() {
  const certDir = join(CONFIG.ssl.certPath, CONFIG.domain);
  const fullchain = join(certDir, 'fullchain.pem');
  const privkey = join(certDir, 'privkey.pem');
  
  // 先尝试直接检查（如果有权限）
  if (existsSync(fullchain) && existsSync(privkey)) {
    return true;
  }
  
  // 使用 sudo 检查（处理权限问题）
  try {
    execSync(`sudo test -f ${fullchain} && sudo test -f ${privkey}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取证书信息
 * 注意：/etc/letsencrypt/live/ 需要 root 权限访问
 */
export function getSSLCertificateInfo() {
  const certDir = join(CONFIG.ssl.certPath, CONFIG.domain);
  const fullchain = join(certDir, 'fullchain.pem');
  
  // 检查证书是否存在（需要先调用 checkSSLCertificate）
  if (!checkSSLCertificate()) {
    return null;
  }
  
  try {
    // 使用 sudo openssl 检查证书过期时间（处理权限问题）
    const result = execSync(`sudo openssl x509 -enddate -noout -in ${fullchain}`, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // 解析 notAfter=Dec 31 23:59:59 2024 GMT
    const match = result.match(/notAfter=(.+)/);
    if (match) {
      const expiryDate = new Date(match[1].trim());
      const now = new Date();
      const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
      
      return {
        expiryDate,
        daysRemaining,
        isExpired: daysRemaining <= 0,
        isExpiringSoon: daysRemaining <= 30,
      };
    }
  } catch {
    return null;
  }
  
  return null;
}

// ==================== Certbot ====================

/**
 * 检查 Certbot 是否安装
 */
export function checkCertbot() {
  return commandExists('certbot');
}

/**
 * 显示 Certbot 安装指南
 */
export function showCertbotInstallGuide() {
  console.log('');
  logger.warn('Certbot 未安装。请先安装 Certbot：');
  console.log('');
  console.log(colorize('gray', '  # Ubuntu/Debian'));
  console.log(colorize('cyan', '  sudo apt update'));
  console.log(colorize('cyan', '  sudo apt install certbot python3-certbot-nginx -y'));
  console.log('');
  console.log(colorize('gray', '  # CentOS/RHEL 8+'));
  console.log(colorize('cyan', '  sudo dnf install certbot python3-certbot-nginx -y'));
  console.log('');
  console.log(colorize('gray', '  # CentOS/RHEL 7'));
  console.log(colorize('cyan', '  sudo yum install epel-release -y'));
  console.log(colorize('cyan', '  sudo yum install certbot python2-certbot-nginx -y'));
  console.log('');
  console.log(colorize('gray', '  # macOS (仅用于测试)'));
  console.log(colorize('cyan', '  brew install certbot'));
  console.log('');
}

/**
 * 申请 SSL 证书
 */
export async function obtainSSLCertificate() {
  console.log('');
  console.log(colorize('bold', '🔐 申请 SSL 证书 (Let\'s Encrypt)'));
  console.log('');

  // 检查 Certbot
  if (!checkCertbot()) {
    showCertbotInstallGuide();
    return false;
  }

  // 检查是否已有证书
  if (checkSSLCertificate()) {
    const certInfo = getSSLCertificateInfo();
    if (certInfo && !certInfo.isExpired) {
      logger.info(`已存在有效证书，${certInfo.daysRemaining} 天后过期`);
      
      if (certInfo.isExpiringSoon) {
        logger.warn('证书即将过期，尝试续期...');
        return await renewSSLCertificate();
      }
      
      return true;
    }
  }

  // 检查邮箱配置
  if (!CONFIG.ssl.email) {
    logger.error('请配置 SSL 证书邮箱（用于续期通知）');
    console.log('');
    console.log(colorize('yellow', '设置方法：'));
    console.log(colorize('cyan', '  SSL_EMAIL=your@email.com npm run deploy:ssl'));
    console.log('');
    console.log(colorize('gray', '或在脚本中修改 CONFIG.ssl.email'));
    console.log('');
    return false;
  }

  // 检查域名（不能是 localhost）
  if (CONFIG.domain === 'localhost' || CONFIG.domain.includes('localhost')) {
    logger.error('Let\'s Encrypt 不支持 localhost，请配置真实域名');
    return false;
  }

  logger.info(`为 ${CONFIG.domain} 申请证书...`);
  logger.info(`证书邮箱: ${CONFIG.ssl.email}`);

  // 使用 certbot 的 nginx 插件申请证书
  try {
    const cmd = [
      'sudo certbot certonly',
      '--nginx',
      `-d ${CONFIG.domain}`,
      `--email ${CONFIG.ssl.email}`,
      '--agree-tos',
      '--non-interactive',
      '--keep-until-expiring',  // 如果证书存在且未过期，保持不变
    ].join(' ');

    logger.info('执行 Certbot...');
    execSync(cmd, { stdio: 'inherit' });

    if (checkSSLCertificate()) {
      logger.success('🎉 SSL 证书申请成功！');
      return true;
    } else {
      logger.error('证书申请失败，请检查错误信息');
      return false;
    }
  } catch (err) {
    // Certbot 可能因为"证书已存在且未到期"返回非零退出码
    // 检查证书是否实际存在
    if (checkSSLCertificate()) {
      const certInfo = getSSLCertificateInfo();
      if (certInfo && !certInfo.isExpired) {
        logger.success(`证书已存在且有效，${certInfo.daysRemaining} 天后过期`);
        return true;
      }
    }
    
    logger.error(`证书申请失败: ${err.message}`);
    console.log('');
    console.log(colorize('yellow', '常见问题：'));
    console.log('  1. 确保域名 DNS 已正确解析到此服务器');
    console.log('  2. 确保服务器 80 端口可从公网访问');
    console.log('  3. 确保 Nginx 正在运行');
    console.log('');
    console.log(colorize('gray', '手动申请命令：'));
    console.log(colorize('cyan', `  sudo certbot --nginx -d ${CONFIG.domain}`));
    console.log('');
    return false;
  }
}

/**
 * 续期 SSL 证书
 */
export async function renewSSLCertificate() {
  console.log('');
  console.log(colorize('bold', '🔄 续期 SSL 证书'));
  console.log('');

  if (!checkCertbot()) {
    showCertbotInstallGuide();
    return false;
  }

  try {
    logger.info('执行证书续期...');
    execSync('sudo certbot renew --nginx', { stdio: 'inherit' });
    logger.success('证书续期完成');
    return true;
  } catch (err) {
    logger.error(`证书续期失败: ${err.message}`);
    return false;
  }
}

/**
 * 设置证书自动续期（Cron Job）
 */
export function setupAutoRenewal() {
  console.log('');
  logger.info('配置证书自动续期...');

  // Certbot 通常会自动设置定时任务
  // 我们检查并提示用户
  try {
    // 检查 systemd timer (现代 Linux)
    try {
      execSync('systemctl list-timers certbot.timer', { stdio: 'pipe' });
      logger.success('已检测到 Certbot 自动续期定时器 (systemd)');
      return true;
    } catch {}

    // 检查 crontab
    try {
      const crontab = execSync('sudo crontab -l 2>/dev/null || true', { encoding: 'utf-8' });
      if (crontab.includes('certbot')) {
        logger.success('已检测到 Certbot 自动续期任务 (cron)');
        return true;
      }
    } catch {}

    // 未找到自动续期配置，提示用户设置
    logger.warn('未检测到自动续期配置');
    console.log('');
    console.log(colorize('yellow', '建议添加定时任务（每天凌晨检查续期）：'));
    console.log('');
    console.log(colorize('gray', '  # 编辑 crontab'));
    console.log(colorize('cyan', '  sudo crontab -e'));
    console.log('');
    console.log(colorize('gray', '  # 添加以下行：'));
    console.log(colorize('cyan', '  0 3 * * * certbot renew --quiet --nginx'));
    console.log('');
    
    return false;
  } catch (err) {
    logger.warn(`检查自动续期配置失败: ${err.message}`);
    return false;
  }
}

/**
 * 显示 SSL 状态
 */
export function showSSLStatus() {
  console.log('');
  console.log(colorize('bold', '🔐 SSL 证书状态'));
  console.log('');

  if (!checkSSLCertificate()) {
    console.log(`  证书: ${colorize('yellow', '未配置')}`);
    console.log(`  HTTPS: ${colorize('gray', '未启用')}`);
    console.log('');
    console.log(colorize('gray', '  运行以下命令启用 HTTPS:'));
    console.log(colorize('cyan', '    npm run deploy:ssl'));
    return;
  }

  const certInfo = getSSLCertificateInfo();
  if (certInfo) {
    const statusColor = certInfo.isExpired ? 'red' : certInfo.isExpiringSoon ? 'yellow' : 'green';
    const statusText = certInfo.isExpired ? '已过期' : certInfo.isExpiringSoon ? '即将过期' : '有效';
    
    console.log(`  状态: ${colorize(statusColor, statusText)}`);
    console.log(`  过期时间: ${certInfo.expiryDate.toLocaleDateString()}`);
    console.log(`  剩余天数: ${certInfo.daysRemaining} 天`);
    
    if (certInfo.isExpiringSoon && !certInfo.isExpired) {
      console.log('');
      console.log(colorize('yellow', '  建议运行以下命令续期:'));
      console.log(colorize('cyan', '    npm run deploy:renew'));
    }
  } else {
    console.log(`  证书: ${colorize('green', '已配置')}`);
    console.log(`  详情: ${colorize('gray', '无法读取证书信息')}`);
  }
}
