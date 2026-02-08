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
import { existsSync, mkdirSync, rmSync, cpSync, readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
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
    email: '',
    // 证书目录（由 Certbot 自动管理）
    certPath: '/etc/letsencrypt/live',
  },
};

// 环境变量覆盖配置
if (process.env.DOMAIN) {
  CONFIG.domain = process.env.DOMAIN;
}
if (process.env.ENABLE_SSL === 'true' || process.env.SSL === 'true') {
  CONFIG.ssl.enabled = true;
}
if (process.env.SSL_EMAIL) {
  CONFIG.ssl.email = process.env.SSL_EMAIL;
}

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
 * 获取当前用户的主用户组
 * macOS: staff
 * Linux: 通常与用户名相同
 */
function getUserGroup() {
  try {
    // 使用 id -gn 获取当前用户的主组名
    return execSync('id -gn', { encoding: 'utf-8' }).trim();
  } catch {
    // 降级处理：macOS 默认 staff，Linux 默认用户名
    return process.platform === 'darwin' ? 'staff' : process.env.USER;
  }
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

// ==================== SSL/HTTPS 管理 ====================

/**
 * 检查 SSL 证书是否存在
 */
function checkSSLCertificate() {
  const certDir = join(CONFIG.ssl.certPath, CONFIG.domain);
  const fullchain = join(certDir, 'fullchain.pem');
  const privkey = join(certDir, 'privkey.pem');
  
  return existsSync(fullchain) && existsSync(privkey);
}

/**
 * 获取证书信息
 */
function getSSLCertificateInfo() {
  const certDir = join(CONFIG.ssl.certPath, CONFIG.domain);
  const fullchain = join(certDir, 'fullchain.pem');
  
  if (!existsSync(fullchain)) {
    return null;
  }
  
  try {
    // 使用 openssl 检查证书过期时间
    const result = execSync(`openssl x509 -enddate -noout -in ${fullchain}`, { 
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

/**
 * 检查 Certbot 是否安装
 */
function checkCertbot() {
  return commandExists('certbot');
}

/**
 * 显示 Certbot 安装指南
 */
function showCertbotInstallGuide() {
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
async function obtainSSLCertificate() {
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
      '--redirect',
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
async function renewSSLCertificate() {
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
function setupAutoRenewal() {
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

// ==================== Nginx 配置管理 ====================

/**
 * 获取 Nginx 配置目录信息
 */
function getNginxPaths() {
  const platform = process.platform;
  
  // macOS (Homebrew)
  if (platform === 'darwin') {
    // Apple Silicon
    if (existsSync('/opt/homebrew/etc/nginx')) {
      return {
        configDir: '/opt/homebrew/etc/nginx/servers',
        enabledDir: null, // macOS 不需要 sites-enabled
        needsSymlink: false,
      };
    }
    // Intel Mac
    if (existsSync('/usr/local/etc/nginx')) {
      return {
        configDir: '/usr/local/etc/nginx/servers',
        enabledDir: null,
        needsSymlink: false,
      };
    }
  }
  
  // Ubuntu/Debian
  if (existsSync('/etc/nginx/sites-available')) {
    return {
      configDir: '/etc/nginx/sites-available',
      enabledDir: '/etc/nginx/sites-enabled',
      needsSymlink: true,
    };
  }
  
  // CentOS/RHEL/其他 Linux
  if (existsSync('/etc/nginx/conf.d')) {
    return {
      configDir: '/etc/nginx/conf.d',
      enabledDir: null,
      needsSymlink: false,
    };
  }
  
  return null;
}

/**
 * 生成 Nginx 配置内容（HTTP 版本）
 */
function generateNginxConfigHTTP() {
  const { port } = CONFIG.nginx;
  
  return `# Rosydawn 博客 Nginx 配置 (HTTP)
# 由部署脚本自动生成于 ${new Date().toLocaleString('zh-CN')}

server {
    listen ${port};
    listen [::]:${port};
    
    server_name ${CONFIG.domain};
    
    root ${CONFIG.webRoot};
    index index.html;

    # 字符集
    charset utf-8;

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml 
               application/rss+xml application/atom+xml image/svg+xml;

    # 静态资源缓存（Astro 构建产物带 hash，可长期缓存）
    location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 主路由
    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # 404 错误页面
    error_page 404 /404.html;

    # 禁止访问隐藏文件
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
`;
}

/**
 * 生成 Nginx 配置内容（HTTPS 版本）
 */
function generateNginxConfigHTTPS() {
  const certDir = join(CONFIG.ssl.certPath, CONFIG.domain);
  
  return `# Rosydawn 博客 Nginx 配置 (HTTPS)
# 由部署脚本自动生成于 ${new Date().toLocaleString('zh-CN')}
# SSL 证书由 Let's Encrypt 提供

# HTTP -> HTTPS 重定向
server {
    listen 80;
    listen [::]:80;
    
    server_name ${CONFIG.domain};
    
    # Let's Encrypt 证书验证路径
    location /.well-known/acme-challenge/ {
        root ${CONFIG.webRoot};
    }
    
    # 其他请求重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name ${CONFIG.domain};
    
    # SSL 证书配置 (Let's Encrypt)
    ssl_certificate ${certDir}/fullchain.pem;
    ssl_certificate_key ${certDir}/privkey.pem;
    
    # SSL 安全配置
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # 现代 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS (可选，启用后浏览器会强制使用 HTTPS)
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate ${certDir}/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    root ${CONFIG.webRoot};
    index index.html;

    # 字符集
    charset utf-8;

    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml 
               application/rss+xml application/atom+xml image/svg+xml;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 静态资源缓存（Astro 构建产物带 hash，可长期缓存）
    location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 主路由
    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    # 404 错误页面
    error_page 404 /404.html;

    # 禁止访问隐藏文件
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
`;
}

/**
 * 生成 Nginx 配置内容
 */
function generateNginxConfig() {
  // 如果启用 SSL 且证书存在，使用 HTTPS 配置
  if (CONFIG.ssl.enabled && checkSSLCertificate()) {
    return generateNginxConfigHTTPS();
  }
  return generateNginxConfigHTTP();
}

/**
 * 获取现有 Nginx 配置路径
 */
function getExistingNginxConfigPath() {
  const paths = getNginxPaths();
  if (!paths) return null;
  
  const configFile = paths.needsSymlink 
    ? join(paths.configDir, CONFIG.nginx.siteName)
    : join(paths.configDir, `${CONFIG.nginx.siteName}.conf`);
  
  return existsSync(configFile) ? configFile : null;
}

/**
 * 配置 Nginx
 */
function setupNginx() {
 console.log('');
  console.log(colorize('bold', '⚙️  配置 Nginx'));
  console.log('');

  // 检查 Nginx 是否安装
  if (!commandExists('nginx')) {
    logger.error('Nginx 未安装，请先安装 Nginx');
    return false;
  }

  // 获取配置路径
  const paths = getNginxPaths();
  if (!paths) {
    logger.error('无法检测 Nginx 配置目录');
    return false;
  }

  logger.info(`检测到 Nginx 配置目录: ${paths.configDir}`);

  // 确定配置文件路径
  const configFileName = paths.needsSymlink 
    ? CONFIG.nginx.siteName 
    : `${CONFIG.nginx.siteName}.conf`;
  const configPath = join(paths.configDir, configFileName);
  const enabledPath = paths.enabledDir 
    ? join(paths.enabledDir, configFileName) 
    : null;

  // 生成配置内容
  const configContent = generateNginxConfig();

  // 写入配置文件
  logger.info(`写入配置文件: ${configPath}`);
  
  try {
    // 确保目录存在
    if (!existsSync(paths.configDir)) {
      execSync(`sudo mkdir -p ${paths.configDir}`, { stdio: 'inherit' });
    }

    // 写入临时文件然后移动（处理权限问题）
    const tempFile = `/tmp/${configFileName}`;
    writeFileSync(tempFile, configContent);
    execSync(`sudo cp ${tempFile} ${configPath}`, { stdio: 'inherit' });
    rmSync(tempFile, { force: true });

    logger.success('配置文件已创建');
  } catch (err) {
    logger.error(`写入配置文件失败: ${err.message}`);
    return false;
  }

  // Ubuntu/Debian: 创建软链接
  if (paths.needsSymlink && enabledPath) {
    logger.info('创建软链接到 sites-enabled...');
    try {
      // 删除旧的软链接（如果存在）
      if (existsSync(enabledPath)) {
        execSync(`sudo rm -f ${enabledPath}`, { stdio: 'inherit' });
      }
      execSync(`sudo ln -s ${configPath} ${enabledPath}`, { stdio: 'inherit' });
      logger.success('软链接已创建');
    } catch (err) {
      logger.error(`创建软链接失败: ${err.message}`);
      return false;
    }
  }

  // 测试 Nginx 配置
  logger.info('测试 Nginx 配置...');
  try {
    execSync('sudo nginx -t', { stdio: 'inherit' });
    logger.success('配置语法正确');
  } catch {
    logger.error('Nginx 配置测试失败，请检查配置文件');
    return false;
  }

  // 重载 Nginx
  logger.info('重载 Nginx...');
  try {
    // 检查 Nginx 是否在运行
    try {
      execSync('pgrep nginx', { stdio: 'pipe' });
      // Nginx 正在运行，重载配置
      execSync('sudo nginx -s reload', { stdio: 'inherit' });
    } catch {
      // Nginx 未运行，启动它
      logger.info('Nginx 未运行，正在启动...');
      if (process.platform === 'darwin') {
        execSync('sudo nginx', { stdio: 'inherit' });
      } else {
        execSync('sudo systemctl start nginx', { stdio: 'inherit' });
      }
    }
    logger.success('Nginx 已重载');
  } catch (err) {
    logger.warn(`Nginx 重载失败: ${err.message}`);
    console.log('');
    console.log(colorize('yellow', '请手动重载 Nginx:'));
    console.log(colorize('cyan', '  sudo nginx -s reload'));
    console.log('');
  }

  // 输出结果
  console.log('');
  console.log('─'.repeat(50));
  console.log('');
  logger.success('🎉 Nginx 配置完成！');
  console.log('');
  console.log(`  ${colorize('gray', '配置文件:')} ${configPath}`);
  console.log(`  ${colorize('gray', '域名:')}     ${CONFIG.domain}`);
  console.log(`  ${colorize('gray', '端口:')}     ${CONFIG.nginx.port}`);
  console.log(`  ${colorize('gray', '网站目录:')} ${CONFIG.webRoot}`);
  console.log('');

  // 提示访问
  const url = CONFIG.domain === 'localhost' 
    ? `http://localhost:${CONFIG.nginx.port}` 
    : `http://${CONFIG.domain}`;
  console.log(`  ${colorize('green', '立即访问:')} ${colorize('cyan', url)}`);
  console.log('');

  return true;
}

/**
 * 显示 Nginx 配置状态
 */
function showNginxStatus() {
  const paths = getNginxPaths();
  const existingConfig = getExistingNginxConfigPath();
  
  console.log('');
  console.log(colorize('cyan', 'Nginx 配置:'));
  
  if (!paths) {
    console.log(`  状态:     ${colorize('yellow', '○ 未检测到配置目录')}`);
    return;
  }
  
  console.log(`  配置目录: ${paths.configDir}`);
  
  if (existingConfig) {
    console.log(`  站点配置: ${colorize('green', '✓ 已配置')}`);
    console.log(`  配置文件: ${existingConfig}`);
    
    // 读取配置文件检查域名和 HTTPS 状态
    try {
      const content = readFileSync(existingConfig, 'utf-8');
      const serverNameMatch = content.match(/server_name\s+([^;]+);/);
      if (serverNameMatch) {
        console.log(`  域名:     ${serverNameMatch[1].trim()}`);
      }
      
      // 检查是否配置了 SSL
      const hasSSL = content.includes('ssl_certificate');
      console.log(`  HTTPS:    ${hasSSL ? colorize('green', '✓ 已启用') : colorize('gray', '○ 未启用')}`);
    } catch {}
  } else {
    console.log(`  站点配置: ${colorize('yellow', '○ 未配置')}`);
    console.log(`  ${colorize('gray', '运行 npm run deploy 自动配置')}`);
  }
}

/**
 * 显示 SSL 证书状态
 */
function showSSLStatus() {
  console.log('');
  console.log(colorize('cyan', 'SSL 证书:'));
  
  // 检查 Certbot
  console.log(`  Certbot:  ${checkCertbot() ? colorize('green', '已安装 ✓') : colorize('yellow', '未安装')}`);
  
  // 检查证书
  if (checkSSLCertificate()) {
    const certInfo = getSSLCertificateInfo();
    console.log(`  证书状态: ${colorize('green', '✓ 已配置')}`);
    console.log(`  证书域名: ${CONFIG.domain}`);
    
    if (certInfo) {
      const expiryColor = certInfo.isExpired ? 'red' : certInfo.isExpiringSoon ? 'yellow' : 'green';
      const expiryStatus = certInfo.isExpired ? '已过期' : certInfo.isExpiringSoon ? '即将过期' : '有效';
      
      console.log(`  过期时间: ${certInfo.expiryDate.toLocaleDateString('zh-CN')}`);
      console.log(`  剩余天数: ${colorize(expiryColor, `${certInfo.daysRemaining} 天 (${expiryStatus})`)}`);
    }
    
    console.log(`  证书路径: ${join(CONFIG.ssl.certPath, CONFIG.domain)}`);
  } else {
    console.log(`  证书状态: ${colorize('yellow', '○ 未配置')}`);
    console.log(`  ${colorize('gray', '运行 npm run deploy:ssl 申请证书')}`);
  }
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
      const userGroup = getUserGroup();
      execSync(`sudo mkdir -p ${CONFIG.webRoot}`, { stdio: 'inherit' });
      execSync(`sudo chown -R ${process.env.USER}:${userGroup} ${CONFIG.webRoot}`, { stdio: 'inherit' });
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

  // 完成文件部署
  console.log('');
  logger.success('📦 文件部署完成！');
  console.log('');
  console.log(`  ${colorize('gray', '网站目录:')} ${CONFIG.webRoot}`);
  console.log(`  ${colorize('gray', '文件数量:')} ${fileCount} 个`);
  console.log(`  ${colorize('gray', '占用空间:')} ${dirSize}`);

  // 自动配置 Nginx
  setupNginx();
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

  // Nginx 配置状态
  showNginxStatus();

  // SSL 状态
  showSSLStatus();

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
 * SSL 完整流程：申请证书 + 配置 HTTPS
 */
async function setupSSL() {
  console.log('');
  console.log(colorize('bold', '🔒 配置 HTTPS (Let\'s Encrypt)'));
  console.log('');

  // 检查 Nginx
  if (!commandExists('nginx')) {
    logger.error('Nginx 未安装，请先安装 Nginx');
    return false;
  }

  // 检查 Certbot
  if (!checkCertbot()) {
    showCertbotInstallGuide();
    return false;
  }

  // 检查域名
  if (CONFIG.domain === 'localhost' || CONFIG.domain.includes('localhost')) {
    logger.error('Let\'s Encrypt 不支持 localhost');
    console.log('');
    console.log(colorize('yellow', '请设置真实域名：'));
    console.log(colorize('cyan', '  DOMAIN=your-domain.com npm run deploy:ssl'));
    console.log('');
    return false;
  }

  // Step 1: 确保有 HTTP 配置（Certbot 需要）
  const existingConfig = getExistingNginxConfigPath();
  if (!existingConfig) {
    logger.info('未检测到 Nginx 配置，先创建 HTTP 配置...');
    if (!setupNginx()) {
      return false;
    }
  }

  // Step 2: 申请/检查证书
  const certObtained = await obtainSSLCertificate();
  if (!certObtained) {
    return false;
  }

  // Step 3: 启用 SSL 并重新生成配置
  logger.info('更新 Nginx 配置为 HTTPS...');
  CONFIG.ssl.enabled = true;
  
  if (!setupNginx()) {
    logger.error('更新 HTTPS 配置失败');
    return false;
  }

  // Step 4: 检查自动续期
  setupAutoRenewal();

  // 完成
  console.log('');
  console.log('─'.repeat(50));
  console.log('');
  logger.success('🎉 HTTPS 配置完成！');
  console.log('');
  console.log(`  ${colorize('gray', '域名:')}     ${CONFIG.domain}`);
  console.log(`  ${colorize('gray', '访问:')}     ${colorize('green', `https://${CONFIG.domain}`)}`);
  console.log('');
  console.log(`  ${colorize('gray', '证书路径:')} ${join(CONFIG.ssl.certPath, CONFIG.domain)}`);
  console.log(`  ${colorize('gray', '自动续期:')} Let's Encrypt 证书有效期 90 天，Certbot 会自动续期`);
  console.log('');

  return true;
}

/**
 * 显示帮助
 */
function showHelp() {
  console.log(`
${colorize('bold', 'Rosydawn 博客部署脚本')}

${colorize('yellow', '用法:')}
  node scripts/deploy.mjs <命令>
  npm run deploy            # 构建并部署 (HTTP)
  npm run deploy:ssl        # 配置 HTTPS
  npm run deploy:status     # 查看状态

${colorize('yellow', '命令:')}
  ${colorize('green', 'build')}     构建项目并部署到 Nginx（自动配置 Nginx）
  ${colorize('green', 'ssl')}       申请 SSL 证书并配置 HTTPS（Let's Encrypt）
  ${colorize('green', 'renew')}     手动续期 SSL 证书
  ${colorize('green', 'status')}    显示当前部署状态和配置信息
  ${colorize('green', 'help')}      显示此帮助信息

${colorize('yellow', '部署配置:')}
  构建输出:   ${CONFIG.buildOutput}/
  网站目录:   ${CONFIG.webRoot}
  域名:       ${CONFIG.domain}

${colorize('yellow', '环境变量:')}
  DOMAIN      覆盖配置中的域名设置
  SSL_EMAIL   SSL 证书邮箱（用于续期通知）
  ENABLE_SSL  设为 true 启用 HTTPS 配置

${colorize('yellow', '部署流程:')}
  ${colorize('cyan', '1. HTTP 部署（基础）:')}
     npm run deploy
  
  ${colorize('cyan', '2. HTTPS 部署（推荐）:')}
     npm run deploy                              # 先部署 HTTP
     SSL_EMAIL=you@example.com npm run deploy:ssl # 再配置 HTTPS

${colorize('yellow', '示例:')}
  npm run deploy                                  # HTTP 部署
  npm run deploy:status                           # 查看状态
  SSL_EMAIL=admin@example.com npm run deploy:ssl  # 启用 HTTPS
  npm run deploy:renew                            # 续期证书
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