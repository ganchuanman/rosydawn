/**
 * ============================================
 * Nginx 配置管理模块
 * ============================================
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { CONFIG } from './config.mjs';
import { logger, colorize } from './logger.mjs';
import { commandExists } from './utils.mjs';
import { checkSSLCertificate, checkCertbot, getSSLCertificateInfo } from './ssl.mjs';

// ==================== 路径检测 ====================

/**
 * 获取 Nginx 配置目录信息
 */
export function getNginxPaths() {
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
 * 获取现有 Nginx 配置路径
 */
export function getExistingNginxConfigPath() {
  const paths = getNginxPaths();
  if (!paths) return null;
  
  const configFile = paths.needsSymlink 
    ? join(paths.configDir, CONFIG.nginx.siteName)
    : join(paths.configDir, `${CONFIG.nginx.siteName}.conf`);
  
  return existsSync(configFile) ? configFile : null;
}

// ==================== 配置生成 ====================

/**
 * 生成 Nginx 配置内容（HTTP 版本）
 */
export function generateNginxConfigHTTP() {
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

    # ==================== 性能优化 ====================
    
    # 启用 sendfile（零拷贝传输，减少 CPU 开销）
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml 
               application/rss+xml application/atom+xml image/svg+xml
               font/woff font/woff2 application/font-woff;
    
    # 启用 gzip 静态预压缩（如果存在 .gz 文件则直接使用）
    gzip_static on;

    # 开启文件缓存（减少磁盘 I/O）
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # ==================== 缓存策略 ====================

    # HTML 文件 - 短期缓存（允许更新）
    location ~* \\.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # 静态资源缓存（Astro 构建产物带 hash，可长期缓存）
    location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 去除尾部斜杠（301 重定向到无斜杠版本）
    # 例如 /blog/post/ -> /blog/post
    location ~ ^(.+)/$ {
        return 301 $1;
    }

    # 主路由 (配合 Astro build.format: 'file' 模式)
    location / {
        try_files $uri $uri.html $uri/ =404;
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
export function generateNginxConfigHTTPS() {
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
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    root ${CONFIG.webRoot};
    index index.html;

    # 字符集
    charset utf-8;

    # ==================== 性能优化 ====================
    
    # 启用 sendfile（零拷贝传输，减少 CPU 开销）
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    # 启用 gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml 
               application/rss+xml application/atom+xml image/svg+xml
               font/woff font/woff2 application/font-woff;
    
    # 启用 gzip 静态预压缩（如果存在 .gz 文件则直接使用）
    gzip_static on;

    # 开启文件缓存（减少磁盘 I/O）
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # ==================== 缓存策略 ====================

    # HTML 文件 - 短期缓存（允许更新）
    location ~* \\.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # 静态资源缓存（Astro 构建产物带 hash，可长期缓存）
    location ~* \\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # 去除尾部斜杠（301 重定向到无斜杠版本）
    # 例如 /blog/post/ -> /blog/post
    location ~ ^(.+)/$ {
        return 301 $1;
    }

    # 主路由 (配合 Astro build.format: 'file' 模式)
    location / {
        try_files $uri $uri.html $uri/ =404;
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
export function generateNginxConfig() {
  // 如果证书存在，自动使用 HTTPS 配置（无论是否显式启用）
  if (checkSSLCertificate()) {
    CONFIG.ssl.enabled = true;
    return generateNginxConfigHTTPS();
  }
  // 否则检查是否显式启用 SSL
  if (CONFIG.ssl.enabled) {
    logger.warn('SSL 已启用但证书不存在，使用 HTTP 配置');
    logger.info('运行 npm run deploy:ssl 申请证书');
  }
  return generateNginxConfigHTTP();
}

// ==================== Nginx 配置 ====================

/**
 * 配置 Nginx
 */
export function setupNginx() {
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
  console.log(`  ${colorize('gray', 'HTTPS:')}    ${CONFIG.ssl.enabled ? '✓ 已启用' : '○ 未启用'}`);
  console.log(`  ${colorize('gray', '网站目录:')} ${CONFIG.webRoot}`);
  console.log('');

  // 提示访问（根据 SSL 状态决定协议）
  let url;
  if (CONFIG.domain === 'localhost') {
    url = `http://localhost:${CONFIG.nginx.port}`;
  } else if (CONFIG.ssl.enabled) {
    url = `https://${CONFIG.domain}`;
  } else {
    url = `http://${CONFIG.domain}`;
  }
  console.log(`  ${colorize('green', '立即访问:')} ${colorize('cyan', url)}`);
  console.log('');

  return true;
}

/**
 * 显示 Nginx 配置状态
 */
export function showNginxStatus() {
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
 * 显示 SSL 证书状态（Nginx 视角）
 */
export function showSSLStatusInNginx() {
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
      
      console.log(`  有效期:   ${colorize(expiryColor, `${expiryStatus} (${certInfo.daysRemaining} 天)`)}`);
      console.log(`  过期时间: ${certInfo.expiryDate.toLocaleDateString('zh-CN')}`);
    }
  } else {
    console.log(`  证书状态: ${colorize('yellow', '○ 未配置')}`);
    console.log(`  ${colorize('gray', '运行 npm run deploy:ssl 申请证书')}`);
  }
}
