/**
 * ============================================
 * 邮件通知模块
 * ============================================
 */

import { createTransport } from 'nodemailer';
import { CONFIG } from './config.mjs';
import { logger } from './logger.mjs';

// ==================== 邮件发送 ====================

/**
 * 创建邮件发送器
 */
export function createMailTransporter() {
  if (!CONFIG.mail.smtp.auth.user || !CONFIG.mail.smtp.auth.pass) {
    return null;
  }
  
  return createTransport({
    host: CONFIG.mail.smtp.host,
    port: CONFIG.mail.smtp.port,
    secure: CONFIG.mail.smtp.secure,
    auth: {
      user: CONFIG.mail.smtp.auth.user,
      pass: CONFIG.mail.smtp.auth.pass,
    },
  });
}

/**
 * 发送部署通知邮件
 * @param {boolean} success - 是否成功
 * @param {object} details - 详情信息
 */
export async function sendDeployNotification(success, details = {}) {
  if (!CONFIG.mail.enabled) {
    return false;
  }
  
  const transporter = createMailTransporter();
  if (!transporter) {
    logger.warn('邮件配置不完整，跳过通知');
    return false;
  }
  
  const timestamp = new Date().toLocaleString('zh-CN');
  const status = success ? '✅ 成功' : '❌ 失败';
  const subject = `[Rosydawn] 自动部署${success ? '成功' : '失败'} - ${CONFIG.domain}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${success ? '#10b981' : '#ef4444'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .info-label { width: 100px; color: #6b7280; }
    .info-value { flex: 1; }
    .commit-info { background: #fff; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #e5e7eb; }
    .commit-hash { font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
    .error-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin-top: 15px; color: #991b1b; }
    .footer { margin-top: 20px; color: #9ca3af; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${status} 自动部署通知</h1>
    </div>
    <div class="content">
      <div class="info-row">
        <span class="info-label">域名</span>
        <span class="info-value"><a href="https://${CONFIG.domain}">${CONFIG.domain}</a></span>
      </div>
      <div class="info-row">
        <span class="info-label">时间</span>
        <span class="info-value">${timestamp}</span>
      </div>
      <div class="info-row">
        <span class="info-label">分支</span>
        <span class="info-value">${CONFIG.watch.branch}</span>
      </div>
      ${details.commitHash ? `
      <div class="commit-info">
        <strong>最新提交</strong><br>
        <span class="commit-hash">${details.commitHash.substring(0, 7)}</span>
        ${details.commitMessage ? `<br><span style="color: #6b7280;">${details.commitMessage}</span>` : ''}
        ${details.commitAuthor ? `<br><span style="font-size: 12px; color: #9ca3af;">by ${details.commitAuthor}</span>` : ''}
      </div>
      ` : ''}
      ${details.error ? `
      <div class="error-box">
        <strong>错误信息</strong><br>
        <pre style="margin: 10px 0 0 0; white-space: pre-wrap;">${details.error}</pre>
      </div>
      ` : ''}
      ${success && details.fileCount ? `
      <div class="info-row" style="margin-top: 15px;">
        <span class="info-label">文件数</span>
        <span class="info-value">${details.fileCount} 个</span>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      此邮件由 Rosydawn 自动部署系统发送
    </div>
  </div>
</body>
</html>
  `;
  
  try {
    await transporter.sendMail({
      from: CONFIG.mail.smtp.auth.user,
      to: CONFIG.mail.to,
      subject,
      html,
    });
    logger.success(`通知邮件已发送至 ${CONFIG.mail.to}`);
    return true;
  } catch (err) {
    logger.error(`发送邮件失败: ${err.message}`);
    return false;
  }
}
