# Rosydawn 项目架构文档

> **AI 阅读提示**：本文档是为 AI 工具设计的项目结构指南。阅读时请注意以下规则：
> 1. 所有文件路径都是相对于项目根目录
> 2. 核心逻辑集中在 `src/` 目录，内容在 `src/content/posts/` 目录
> 3. 项目使用 Astro 5.x 框架，需理解其 `.astro` 单文件组件格式
> 4. 修改样式时注意使用 `:global()` 选择器处理 Markdown 生成的 HTML
> 5. 部署脚本在 `scripts/` 目录，支持 Cron 环境自动部署
> 6. About 和 404 页面采用极简风格，与全站视觉一致

---

## 📌 项目概述

**Rosydawn** 是一个基于 [Astro](https://astro.build) 构建的个人技术博客，采用极简主义设计风格，强调良好的阅读体验和代码展示能力。

### 核心特性

| 特性 | 描述 |
|------|------|
| 静态生成 | 基于 Astro SSG，无需服务器 |
| 内容管理 | 使用 Astro Content Collections 管理博客文章 |
| Markdown/MDX | 支持标准 Markdown 和 MDX 扩展语法 |
| 代码高亮 | 集成 Shiki（使用 `one-light` 主题） |
| 图表支持 | 集成 PlantUML 绘图能力 |
| 响应式设计 | 移动端友好，自适应布局 |
| 自动部署 | 基于 Cron 的 Git 监听自动部署 |
| 极简风格页面 | About 和 404 页面采用统一的极简视觉风格 |

### 技术栈

```yaml
框架: Astro 5.17.x
语言: TypeScript
样式: Scoped CSS (无预处理器)
字体: 系统原生字体栈（零网络请求）
  - 正文: -apple-system, PingFang SC, Microsoft YaHei
  - 代码: ui-monospace, SF Mono, Menlo, Monaco, Consolas
代码高亮: Shiki (内置于 Astro)
图表: astro-plantuml
部署: Nginx + Let's Encrypt (自动化脚本)
自动化: Cron + Git 监听 + 邮件通知
```

---

## 📁 目录结构

```
rosydawn/
├── public/                     # 静态资源
│   ├── favicon.ico
│   └── favicon.svg
│
├── src/
│   ├── content/                # 内容目录
│   │   └── posts/              # 博客文章
│   │       └── {year}/{month}/{slug}/
│   │           ├── index.md    # 文章内容 (或 index.mdx)
│   │           ├── cover.jpg   # 封面图片 (可选)
│   │           └── assets/     # 文章资源 (可选)
│   │
│   ├── layouts/
│   │   └── Layout.astro        # 全局布局组件
│   │
│   ├── pages/                  # 页面路由
│   │   ├── index.astro         # 首页 (重定向到 /blog)
│   │   ├── about.astro         # 关于页面 (极简风格，含 GitHub 链接)
│   │   ├── 404.astro           # 404 错误页面 (极简风格)
│   │   ├── blog/
│   │   │   ├── [...page].astro # 文章列表 (分页)
│   │   │   └── [...slug].astro # 文章详情
│   │   └── tags/
│   │       ├── index.astro     # 标签云
│   │       └── [tag].astro     # 标签详情
│   │
│   └── content.config.ts       # 内容集合配置
│
├── scripts/                    # 部署脚本
│   ├── deploy.mjs              # 部署脚本入口
│   └── lib/                    # 部署脚本模块
│       ├── config.mjs          # 配置管理、.env 加载
│       ├── logger.mjs          # 日志输出、颜色
│       ├── utils.mjs           # 工具函数 (getCurrentUser 等)
│       ├── nginx.mjs           # Nginx 配置管理
│       ├── ssl.mjs             # SSL 证书管理
│       ├── mail.mjs            # 邮件通知
│       ├── watch.mjs           # Cron 自动部署、日志轮转
│       └── index.mjs           # 模块统一导出
│
├── logs/                       # 日志目录 (git ignored)
│   └── deploy.log              # 自动部署日志 (最多保留 500 行)
│
├── astro.config.mjs            # Astro 配置
├── package.json
├── .env.example                # 环境变量模板
├── tsconfig.json
└── README.md                   # 项目文档
```

---

## 🧩 核心文件详解

### 1. `astro.config.mjs` - Astro 配置

```javascript
export default defineConfig({
  integrations: [
    mdx(),           // 支持 MDX 语法
    plantuml(),      // PlantUML 图表
  ],
  markdown: {
    shikiConfig: {
      theme: 'one-light',  // 代码高亮主题
      wrap: false,          // 不自动换行
    },
  },
  build: {
    format: 'file',        // 生成 /blog/post.html 而非 /blog/post/index.html
  },
  trailingSlash: 'never',  // URL 不带尾部斜杠
});
```

### 2. `src/content.config.ts` - 内容集合定义

定义博客文章的 Schema：

```typescript
const postsCollection = defineCollection({
  loader: glob({ 
    pattern: '**/index.{md,mdx}', 
    base: './src/content/posts' 
  }),
  schema: ({ image }) => z.object({
    title: z.string(),           // 文章标题
    date: z.date(),              // 发布日期
    description: z.string(),     // 文章描述
    tags: z.array(z.string()).optional(),  // 标签列表
    coverImage: image().optional(),         // 封面图片
  }),
});
```

### 3. `src/layouts/Layout.astro` - 全局布局

包含：
- HTML 基础结构
- 全局 CSS 变量定义
- 系统原生字体栈（零外部请求，首屏秒开）
- 通用样式（滚动条、链接、代码块等）

**CSS 变量定义**：
```css
:root {
  --bg: #fafafa;           /* 背 bgColor */
  --bg-secondary: #f0f0f0; /* 次级背景 */
  --text: #1a1a1a;         /* 主文字 */
  --text-muted: #666666;   /* 次级文字 */
  --accent: #0969da;       /* 主题色 */
  --border: #d0d7de;       /* 边框色 */
  --code-bg: #f6f8fa;      /* 代码背景 */
  /* 系统原生字体栈，无网络请求 */
  --font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
```

### 4. `src/pages/404.astro` - 404 错误页面

**极简设计**，居中显示 404 数字、提示文字和返回首页链接。用户可通过顶部导航栏返回其他页面。

### 4.5 `src/pages/about.astro` - 关于页面

**极简设计**，直接展示个人信息（无标题，避免与导航重复），底部通过分隔线展示 [GitHub](https://github.com/ganchuanman/rosydawn) 项目链接。

### 5. `src/pages/blog/[...slug].astro` - 文章详情页

**关键功能**：

1. **目录导航 (TOC)**：自动提取 h2/h3 生成侧边栏目录
2. **代码块增强**：
   - 语言标签显示
   - 行号显示（等宽对齐）
   - 复制按钮
   - 展开/收起功能（超过 15 行时）
   - 滚动位置补偿（防止展开/收起时页面跳动）
3. **返回按钮**：使用 `history.back()` 实现真正的浏览器回退

**代码块处理逻辑**（客户端 JavaScript）：
```javascript
// 关键点：展开/收起时的滚动补偿
const rectBefore = wrapper.getBoundingClientRect();
const topBefore = rectBefore.top;

wrapper.classList.toggle('collapsed');

const rectAfter = wrapper.getBoundingClientRect();
const scrollDiff = rectAfter.top - topBefore;
if (scrollDiff !== 0) {
  window.scrollBy(0, scrollDiff);
}
```

### 6. `src/pages/blog/[...page].astro` - 文章列表页

**特性**：
- 分页支持（每页 5 篇）
- 文章卡片展示（标题、描述、日期、标签）
- 分页导航

### 7. `src/pages/tags/[tag].astro` - 标签详情页

按标签筛选文章，样式与文章列表保持一致。

---

## 📝 文章编写规范

### 文件结构

```
src/content/posts/2026/03/my-article/
├── index.md          # 或 index.mdx
├── cover.jpg         # 封面图（可选）
└── assets/           # 文章资源目录（可选）
    ├── diagram.png
    └── screenshot.jpg
```

### Frontmatter 格式

```yaml
---
title: "文章标题"
date: 2026-03-15
description: "一句话描述，会显示在列表页"
tags: ["标签1", "标签2"]
coverImage: ./cover.jpg  # 可选
---
```

### 支持的 Markdown 扩展

1. **代码块**：
   ````markdown
   ```typescript
   const hello = "world";
   ```
   ````

2. **PlantUML 图表**：
   ````markdown
   ```plantuml
   @startuml
   Alice -> Bob: Hello
   @enduml
   ```
   ````

3. **MDX 组件**（仅 `.mdx` 文件）

---

## 🎨 UI/UX 设计规范

### 颜色系统

| 变量 | 色值 | 用途 |
|------|------|------|
| `--accent` | #0969da | 主题色、链接 |
| `--text` | #1a1a1a | 主文字 |
| `--text-muted` | #666666 | 次级文字 |
| `--text-dim` | #999999 | 弱化文字 |
| `--bg` | #fafafa | 页面背景 |
| `--code-bg` | #f6f8fa | 代码块背景 |

### 字体规范

- **正文**：系统原生字体（-apple-system, PingFang SC, Microsoft YaHei）
- **代码**：系统等宽字体（ui-monospace, SF Mono, Menlo, Monaco, Consolas）
- **代码块**：13px, 行高 1.5
- **优势**：零网络请求，首屏渲染无阻塞

### 响应式断点

```css
/* 移动端 */
@media (max-width: 640px) { ... }

/* 目录隐藏 */
@media (max-width: 1200px) { .toc-sidebar { display: none; } }
```

---

## 🔧 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🚀 部署命令

部署脚本位于 `scripts/deploy.mjs`，基于 Node.js 实现，提供完整的一键部署能力，包括**自动配置 Nginx**、**HTTPS 证书管理**和**基于 Cron 的自动部署**。

### 可用命令

#### 基础命令

| 命令 | npm 脚本 | 说明 |
|------|----------|------|
| `build` | `npm run deploy` | 构建项目、部署文件、自动配置 Nginx (HTTP) |
| `ssl` | `npm run deploy:ssl` | 申请 SSL 证书并配置 HTTPS (Let's Encrypt) |
| `renew` | `npm run deploy:renew` | 手动续期 SSL 证书 |
| `status` | `npm run deploy:status` | 显示部署状态、Nginx 和 SSL 证书信息 |
| `help` | `npm run deploy:help` | 显示帮助信息 |

#### 自动部署命令 (Cron)

| 命令 | npm 脚本 | 说明 |
|------|----------|------|
| `cron` | `npm run deploy:cron` | 单次检查 Git 更新并部署（供 cron 调用） |
| `cron:install` | `npm run deploy:cron:install` | 安装 cron 定时任务 |
| `cron:remove` | `npm run deploy:cron:remove` | 移除 cron 定时任务 |
| `cron:status` | `npm run deploy:cron:status` | 查看 cron 任务状态和最近日志 |

```bash
# 一键构建部署（HTTP）
npm run deploy

# 指定域名部署
DOMAIN=blog.example.com npm run deploy

# 启用 HTTPS（需要先完成 HTTP 部署）
SSL_EMAIL=admin@example.com npm run deploy:ssl

# 手动续期证书
npm run deploy:renew

# 查看部署状态
npm run deploy:status

# 安装自动部署（每 5 分钟检查 Git 更新）
npm run deploy:cron:install

# 查看自动部署状态
npm run deploy:cron:status

# 移除自动部署
npm run deploy:cron:remove
```

### 部署配置

在 `scripts/lib/config.mjs` 文件中的 `CONFIG` 对象修改：

```javascript
const CONFIG = {
  buildOutput: 'dist',                 // Astro 构建输出目录
  webRoot: '/var/www/html/rosydawn',   // Nginx 网站根目录
  nodeVersionRequired: 18,             // Node.js 版本要求
  domain: 'www.rosydawn.space',        // 服务器域名
  nginx: {
    siteName: 'rosydawn',              // Nginx 配置文件名
    port: 80,                          // 监听端口
  },
  ssl: {
    enabled: false,                    // 是否启用 HTTPS
    email: '',                         // Let's Encrypt 邮箱
    certPath: '/etc/letsencrypt/live', // 证书目录
  },
  watch: {
    interval: 5,                       // Cron 检查间隔（分钟）
    branch: 'main',                    // Git 分支
    logFile: 'logs/deploy.log',        // 日志文件路径
    maxLogLines: 500,                  // 日志最大行数（自动轮转）
  },
};
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DOMAIN` | 服务器域名 | `www.rosydawn.space` |
| `SSL_EMAIL` | SSL 证书邮箱（用于续期通知） | - |
| `ENABLE_SSL` | 设为 `true` 启用 HTTPS 配置 | `false` |

### 部署流程

#### HTTP 部署

运行 `npm run deploy` 后，脚本会自动完成以下步骤：

1. ✅ **环境检查** - 验证 Node.js 版本和 Nginx 安装
2. ✅ **安装依赖** - 运行 `npm install`
3. ✅ **构建项目** - 运行 `npm run build`
4. ✅ **部署文件** - 复制构建产物到 `/var/www/html/rosydawn`
5. ✅ **配置 Nginx** - 自动生成并写入 Nginx 站点配置
6. ✅ **重载 Nginx** - 自动测试配置并重载服务

#### HTTPS 部署

运行 `SSL_EMAIL=your@email.com npm run deploy:ssl` 后，脚本会自动完成：

1. ✅ **检查 Certbot** - 验证 Certbot 是否已安装
2. ✅ **检查现有证书** - 如证书有效则跳过申请
3. ✅ **申请证书** - 使用 Let's Encrypt 申请免费 SSL 证书
4. ✅ **更新 Nginx** - 自动生成 HTTPS 配置并重载
5. ✅ **配置自动续期** - 检查并提示设置定时续期任务

### 支持的平台

脚本自动检测并适配不同平台的 Nginx 配置目录：

| 平台 | 配置目录 |
|------|----------|
| Ubuntu/Debian | `/etc/nginx/sites-available/` |
| CentOS/RHEL | `/etc/nginx/conf.d/` |
| macOS (Homebrew) | `/opt/homebrew/etc/nginx/servers/` |

### 自动生成的 Nginx 配置

#### HTTP 配置

```nginx
server {
    listen 80;
    server_name www.rosydawn.space;
    
    root /var/www/html/rosydawn;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # 静态资源缓存（1年，Astro 带 hash）
    location ~* \.(css|js|jpg|png|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    # 404 错误页面
    error_page 404 /404.html;
}
```

#### HTTPS 配置

启用 SSL 后，脚本会生成包含以下安全特性的配置：

```nginx
# HTTP -> HTTPS 重定向
server {
    listen 80;
    server_name www.rosydawn.space;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html/rosydawn;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name www.rosydawn.space;
    
    # SSL 证书 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/www.rosydawn.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.rosydawn.space/privkey.pem;
    
    # 现代 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:...;
    
    # HSTS（强制 HTTPS）
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 404 错误页面
    error_page 404 /404.html;
    
    # ... 其他配置同 HTTP
}
```

### SSL 证书管理

#### 安装 Certbot

脚本会自动检测 Certbot，如未安装会提示安装命令：

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL 8+
sudo dnf install certbot python3-certbot-nginx -y

# macOS (仅测试用)
brew install certbot
```

#### 证书续期

Let's Encrypt 证书有效期为 90 天。Certbot 通常会自动设置续期任务。

```bash
# 手动续期
npm run deploy:renew

# 检查续期状态
sudo certbot certificates

# 添加定时任务（如自动续期未配置）
sudo crontab -e
# 添加: 0 3 * * * certbot renew --quiet --nginx
```

#### 查看证书状态

运行 `npm run deploy:status` 可查看证书详情：

```
SSL 证书:
  Certbot:  已安装 ✓
  证书状态: ✓ 已配置
  证书域名: www.rosydawn.space
  过期时间: 2025/9/15
  剩余天数: 87 天 (有效)
  证书路径: /etc/letsencrypt/live/www.rosydawn.space
```

### 自动部署 (Cron)

脚本支持基于系统 Cron 的自动部署，定时检查 Git 仓库更新并自动构建部署。

#### 工作原理

1. **Cron 定时触发** - 系统 Cron 每 N 分钟调用脚本
2. **Git 检查** - 比较本地和远程 commit hash
3. **自动拉取** - 检测到更新后执行 `git pull`
4. **构建部署** - 自动执行构建和部署流程
5. **日志轮转** - 部署成功后自动清理日志，保留最近 500 行
6. **邮件通知** - 部署完成后发送邮件通知（可选）

#### 快速开始

```bash
# 1. 配置邮件通知（可选）
cp .env.example .env
nano .env  # 填写 SMTP 配置

# 2. 安装 Cron 任务
npm run deploy:cron:install

# 3. 查看状态
npm run deploy:cron:status

# 4. 查看实时日志
tail -f logs/deploy.log
```

#### SSH 配置

Cron 环境没有 SSH Agent，脚本会自动检测并使用 SSH key 进行 Git 认证。

**自动检测顺序**：
1. 环境变量 `SSH_KEY_PATH`（如已设置）
2. `~/.ssh/id_github`（GitHub 专用 key）
3. `~/.ssh/id_ed25519`（现代默认）
4. `~/.ssh/id_rsa`（传统默认）

**手动指定 SSH key**：
```bash
# 在 .env 中指定
SSH_KEY_PATH=/path/to/your/private_key
```

**验证 SSH key 是否可用**：
```bash
# 测试 GitHub 连接
ssh -i ~/.ssh/id_github -T git@github.com
```

#### 配置项

自动部署相关的环境变量：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WATCH_INTERVAL` | 检查间隔（分钟） | `5` |
| `GIT_BRANCH` | Git 分支 | `main` |
| `SSH_KEY_PATH` | SSH 私钥路径（可选） | 自动检测 |
| `SMTP_HOST` | SMTP 服务器 | `smtp.163.com` |
| `SMTP_PORT` | SMTP 端口 | `465` |
| `SMTP_USER` | 发件人邮箱 | - |
| `SMTP_PASS` | 邮箱授权码 | - |
| `NOTIFY_EMAIL` | 收件人邮箱 | - |

#### 日志管理

日志保存在项目目录下，无需 root 权限：

```
logs/deploy.log
```

**日志轮转**：每次部署后自动轮转，保留最近 500 行，防止日志文件无限增长：

```
[2026-02-08T08:37:00.418Z] 检查 Git 更新...
[2026-02-08T08:37:04.425Z] 无更新 (当前版本: 0d7634b)
[2026-02-08T08:45:02.123Z] 检测到新提交: abc1234
[2026-02-08T08:45:30.456Z] 部署成功！共 42 个文件
[2026-02-08T08:45:30.789Z] 日志已清理，保留最近 500 行
```

#### 查看任务状态

```bash
npm run deploy:cron:status
```

输出示例：

```
⏰ 自动部署任务状态

配置信息:
  检查间隔: 每 5 分钟
  Git 分支: main
  日志文件: /path/to/project/logs/deploy.log
  邮件通知: ✓ 已启用

Cron 任务:
  ✓ 已安装并运行中
  Cron 表达式: */5 * * * *

最近日志:
  [2026-06-15T10:00:01.123Z] 检查 Git 更新...
  [2026-06-15T10:00:02.456Z] 无更新 (当前版本: abc1234)
```

#### 故障排查

**问题：Git fetch 失败 (Permission denied)**

原因：Cron 环境没有 SSH Agent，无法访问 SSH key。

解决：
1. 确保 SSH key 存在于 `~/.ssh/` 目录
2. 验证 key 权限：`chmod 600 ~/.ssh/id_github`
3. 测试连接：`ssh -i ~/.ssh/id_github -T git@github.com`
4. 如使用非标准路径，在 `.env` 中设置 `SSH_KEY_PATH`

**问题：日志文件无法写入**

原因：`logs/` 目录不存在或权限不足。

解决：脚本会自动创建目录，如仍有问题：
```bash
mkdir -p logs && chmod 755 logs
```

**问题：Astro 构建失败 (Node.js 版本不匹配)**

原因：Cron 使用指定版本的 Node 启动脚本，但脚本内部执行 `npm run build` 时使用了系统默认的 Node。

解决：脚本已内置自动修复，会将当前 Node 的 bin 目录添加到 PATH 开头。如仍有问题，可在 crontab 中手动设置 PATH：
```bash
PATH=/home/user/.nvm/versions/node/v20.20.0/bin:/usr/local/bin:/usr/bin:/bin
```

**问题：chown 失败 (invalid user: undefined)**

原因：Cron 环境中 `process.env.USER` 环境变量为空。

解决：脚本已使用 `id -un` 命令获取用户名，不依赖环境变量。如使用旧版本脚本，请更新到最新版本。

#### Cron 环境兼容性

脚本针对 Cron 的特殊环境做了以下适配：

| 问题 | 解决方案 |
|------|----------|
| PATH 环境变量精简 | 脚本启动时自动将当前 Node.js 的 bin 目录添加到 PATH |
| USER 环境变量缺失 | 使用 `id -un` 系统命令获取用户名 |
| SSH Agent 不可用 | 自动检测 SSH key 并通过 `GIT_SSH_COMMAND` 注入 |
| 日志目录不存在 | 写入日志前自动创建 `logs/` 目录 |
| 日志无限增长 | 每次部署后自动轮转，保留最近 500 行 |

#### 移除自动部署

```bash
npm run deploy:cron:remove
```

---

## ⚡ 性能优化

### 前端优化

| 优化项 | 实现方式 | 效果 |
|--------|----------|------|
| 零字体请求 | 使用系统原生字体栈 | 首屏渲染无阻塞 |
| 单一 Favicon | 仅使用 SVG 格式 | 减少 1 次网络请求 |
| 静态生成 | Astro SSG 预渲染 | 无服务端渲染开销 |

### Nginx 服务端优化

部署脚本自动配置以下性能优化：

```nginx
# 零拷贝传输
sendfile on;
tcp_nopush on;
tcp_nodelay on;

# 文件缓存（减少磁盘 I/O）
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;

# Gzip 压缩
gzip on;
gzip_comp_level 5;
gzip_types text/plain text/css application/json application/javascript;

# 静态预压缩（如有 .gz 文件直接使用）
gzip_static on;

# 静态资源长期缓存（Astro 带 hash，可永久缓存）
location ~* \.(css|js|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### URL 策略

采用无尾部斜杠的 URL 格式，消除 301 重定向：

```javascript
// astro.config.mjs
build: { format: 'file' },      // 生成 /blog/post.html
trailingSlash: 'never',         // 链接不带斜杠
```

Nginx 配置自动处理兼容性：
- `/blog/post` → 直接返回内容（无重定向）
- `/blog/post/` → 301 重定向到 `/blog/post`

---

## ⚠️ 开发注意事项

### 1. CSS 优先级问题

Astro 的 scoped CSS 无法直接选择 Markdown 生成的 HTML。需使用 `:global()` 选择器：

```css
/* ❌ 不生效 */
.content pre { ... }

/* ✅ 正确写法 */
.content :global(pre) { ... }
```

### 2. Shiki 样式覆盖

Shiki 生成的代码块有内联样式，覆盖时需使用 `!important`：

```css
.content :global(.code-wrapper.collapsed pre) {
  max-height: 312px !important;
  overflow: hidden !important;
}
```

### 3. 行号等宽对齐

使用 CSS 变量 + `ch` 单位实现动态宽度：

```javascript
const maxLineDigits = String(lineCount).length;
code.style.setProperty('--line-number-width', `${maxLineDigits}ch`);
```

```css
.line-number {
  width: var(--line-number-width, 2ch);
  text-align: right;
}
```

### 4. 导航一致性

所有页面的 Header 必须保持完全一致的样式，避免页面切换时的视觉跳动：

```css
/* 统一规范 */
.site-header { padding: 1rem 0; }
.logo a { font-size: 1.25rem; }
.container / .page-container { padding: 2rem; max-width: 800px; }
```

### 5. 返回按钮行为

使用 `history.back()` 而非硬编码 URL，确保从标签页进入的文章能正确返回：

```html
<a href="/" onclick="event.preventDefault(); history.back();">
  ← 返回
</a>
```

---

## 📋 页面路由表

| 路径 | 文件 | 描述 |
|------|------|------|
| `/` | `index.astro` | 重定向到 `/blog` |
| `/blog` | `blog/[...page].astro` | 文章列表首页 |
| `/blog/2` | `blog/[...page].astro` | 文章列表第 2 页 |
| `/blog/{slug}` | `blog/[...slug].astro` | 文章详情页 |
| `/tags` | `tags/index.astro` | 标签云 |
| `/tags/{tag}` | `tags/[tag].astro` | 标签下的文章 |
| `/about` | `about.astro` | 关于页面（极简风格，含 GitHub 链接） |
| `/404` | `404.astro` | 404 错误页面（极简风格） |

---

## 🤖 AI 操作指南

### 添加新文章

1. 在 `src/content/posts/{year}/{month}/` 下创建新目录
2. 添加 `index.md` 文件，包含正确的 frontmatter
3. 可选添加 `cover.jpg` 和 `assets/` 目录

### 修改样式

1. **全局样式** → `src/layouts/Layout.astro` 的 `<style is:global>`
2. **页面样式** → 对应 `.astro` 文件的 `<style>` 块
3. **Markdown 内容样式** → 使用 `:global()` 选择器

### 添加新页面

1. 在 `src/pages/` 下创建 `.astro` 文件
2. 复制现有页面的 Header/Footer 结构保持一致性
3. 导入并使用 `Layout.astro`

### 修改导航

导航菜单在以下文件中需要同步修改：
- `src/pages/blog/[...page].astro`
- `src/pages/blog/[...slug].astro`
- `src/pages/tags/index.astro`
- `src/pages/tags/[tag].astro`
- `src/pages/about.astro`
- `src/pages/404.astro`

当前导航结构：
```html
<nav class="nav">
  <a href="/">文章</a>
  <a href="/tags">分类</a>
  <a href="/about">关于</a>
</nav>
```

---

## 🦶 Footer 声明

所有页面底部统一显示：
```html
<p>built with <a href="https://astro.build" target="_blank" rel="noopener">astro</a> · developed with llm</p>
```

---

*本文档最后更新于：2026-02-09*