/**
 * ============================================
 * 配置模块 - 管理所有配置项和环境变量
 * ============================================
 */

import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// ==================== 获取项目根目录 ====================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PROJECT_ROOT = resolve(__dirname, '../..');

// ==================== 加载 .env 文件 ====================

/**
 * 手动解析 .env 文件并注入到 process.env
 * 不依赖外部包，保持脚本零依赖
 */
function loadEnvFile() {
  const envPath = join(PROJECT_ROOT, '.env');

  if (!existsSync(envPath)) {
    return; // .env 文件不存在，静默跳过
  }

  try {
    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      // 跳过空行和注释
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      // 解析 KEY=VALUE 格式
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) {
        continue;
      }

      const key = trimmed.substring(0, eqIndex).trim();
      let value = trimmed.substring(eqIndex + 1).trim();

      // 移除引号 (支持 "value" 或 'value')
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // 只在环境变量未设置时才使用 .env 的值（环境变量优先级更高）
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // 解析失败静默忽略
  }
}

// 在配置加载前先加载 .env
loadEnvFile();

// ==================== 配置定义 ====================

export const CONFIG = {
  // Astro 构建输出目录（相对于项目根目录）
  buildOutput: 'dist',

  // Nginx 网站根目录（Astro 构建产物会复制到这里）
  webRoot: '/var/www/html/rosydawn',

  // Node.js 版本要求
  nodeVersionRequired: 18,

  // 服务器域名（环境变量 DOMAIN 可覆盖此配置）
  domain: 'www.rosydawn.space',

  // Nginx 配置
  nginx: {
    // 站点配置文件名
    siteName: 'rosydawn',
    // 监听端口
    port: 80,
  },

  // SSL/HTTPS 配置
  ssl: {
    // 是否启用 HTTPS（环境变量 ENABLE_SSL=true 可启用）
    enabled: false,
    // 证书邮箱（用于 Let's Encrypt 注册和续期通知）
    email: 'aaron_oh@163.com',
    // 证书目录（由 Certbot 自动管理）
    certPath: '/etc/letsencrypt/live',
  },

  // 自动部署监控配置
  watch: {
    // 检查间隔（毫秒），默认 10 分钟
    interval: 10 * 60 * 1000,
    // Git 分支
    branch: 'main',
    // 日志文件路径（默认在项目目录下，避免权限问题）
    logFile: join(PROJECT_ROOT, 'logs/deploy.log'),
  },

  // 邮件通知配置 (SMTP)
  mail: {
    // 是否启用邮件通知
    enabled: true,
    // 收件人邮箱（部署结果通知）
    to: 'aaron_oh@163.com',
    // SMTP 配置（支持 Gmail、QQ邮箱、163邮箱等）
    smtp: {
      host: 'smtp.163.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: '', // 发件人邮箱（环境变量 SMTP_USER 覆盖）
        pass: '', // 邮箱授权码（环境变量 SMTP_PASS 覆盖）
      },
    },
  },
};

// ==================== 环境变量覆盖配置 ====================

if (process.env.DOMAIN) {
  CONFIG.domain = process.env.DOMAIN;
}
if (process.env.ENABLE_SSL === 'true' || process.env.SSL === 'true') {
  CONFIG.ssl.enabled = true;
}
if (process.env.SSL_EMAIL) {
  CONFIG.ssl.email = process.env.SSL_EMAIL;
}
// 邮件配置环境变量
if (process.env.SMTP_USER) {
  CONFIG.mail.smtp.auth.user = process.env.SMTP_USER;
}
if (process.env.SMTP_PASS) {
  CONFIG.mail.smtp.auth.pass = process.env.SMTP_PASS;
}
if (process.env.SMTP_HOST) {
  CONFIG.mail.smtp.host = process.env.SMTP_HOST;
}
if (process.env.SMTP_PORT) {
  CONFIG.mail.smtp.port = parseInt(process.env.SMTP_PORT, 10);
}
if (process.env.MAIL_TO || process.env.NOTIFY_EMAIL) {
  CONFIG.mail.to = process.env.MAIL_TO || process.env.NOTIFY_EMAIL;
}
// 监控配置环境变量
if (process.env.WATCH_INTERVAL) {
  CONFIG.watch.interval = parseInt(process.env.WATCH_INTERVAL, 10) * 60 * 1000; // 分钟转毫秒
}
if (process.env.GIT_BRANCH) {
  CONFIG.watch.branch = process.env.GIT_BRANCH;
}
