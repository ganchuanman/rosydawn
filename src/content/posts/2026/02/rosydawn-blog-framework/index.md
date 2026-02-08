---
title: "Rosydawn：一个极简主义的 Astro 博客框架"
date: 2026-02-08
description: "介绍 Rosydawn 博客框架的架构设计、核心特性与自动化部署能力，包括基于 Cron 的 Git 自动部署和 HTTPS 证书管理。"
tags: ["Astro", "博客", "开源", "部署"]
---

这是 Rosydawn 博客框架的完整技术文档。Rosydawn 是一个基于 [Astro](https://astro.build) 构建的个人技术博客，采用极简主义设计风格，强调良好的阅读体验和代码展示能力。

## 核心特性

| 特性 | 描述 |
|------|------|
| 静态生成 | 基于 Astro SSG，无需服务器 |
| 内容管理 | 使用 Astro Content Collections 管理博客文章 |
| Markdown/MDX | 支持标准 Markdown 和 MDX 扩展语法 |
| 代码高亮 | 集成 Shiki（使用 `one-light` 主题） |
| 图表支持 | 集成 PlantUML 绘图能力 |
| 响应式设计 | 移动端友好，自适应布局 |
| 自动部署 | 基于 Cron 的 Git 监控与自动构建 |
| HTTPS | Let's Encrypt 证书自动申请与续期 |

## 技术栈

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
```

## 目录结构

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
│   │           ├── index.md    # 文章内容
│   │           ├── cover.jpg   # 封面图片 (可选)
│   │           └── assets/     # 文章资源 (可选)
│   │
│   ├── layouts/
│   │   └── Layout.astro        # 全局布局组件
│   │
│   ├── pages/                  # 页面路由
│   │   ├── index.astro         # 首页
│   │   ├── about.astro         # 关于页面
│   │   ├── blog/               # 博客相关
│   │   └── tags/               # 标签相关
│   │
│   └── content.config.ts       # 内容集合配置
│
├── scripts/
│   ├── deploy.mjs              # 部署脚本入口
│   └── lib/                    # 部署脚本模块
│
├── logs/                       # 日志目录
└── README.md                   # 项目文档
```

## 文章编写规范

### 文件结构

每篇文章存放在独立目录中，按年月组织：

```
src/content/posts/2026/02/my-article/
├── index.md          # 文章内容
├── cover.jpg         # 封面图（可选）
└── assets/           # 文章资源目录（可选）
    ├── diagram.png
    └── screenshot.jpg
```

### Frontmatter 格式

```yaml
---
title: "文章标题"
date: 2026-02-08
description: "一句话描述，会显示在列表页"
tags: ["标签1", "标签2"]
coverImage: ./cover.jpg  # 可选
---
```

## 部署系统

Rosydawn 提供了完整的自动化部署能力，基于 Node.js 实现。

### 基础命令

```bash
# 一键构建部署（HTTP）
npm run deploy

# 启用 HTTPS
SSL_EMAIL=admin@example.com npm run deploy:ssl

# 查看部署状态
npm run deploy:status
```

### 自动部署 (Cron)

脚本支持基于系统 Cron 的自动部署，定时检查 Git 仓库更新并自动构建部署：

```bash
# 安装 Cron 任务
npm run deploy:cron:install

# 查看状态
npm run deploy:cron:status

# 查看实时日志
tail -f logs/deploy.log
```

#### 工作原理

1. **Cron 定时触发** - 系统 Cron 每 N 分钟调用脚本
2. **Git 检查** - 比较本地和远程 commit hash
3. **自动拉取** - 检测到更新后执行 `git pull`
4. **构建部署** - 自动执行构建和部署流程
5. **邮件通知** - 部署完成后发送邮件通知（可选）

#### Cron 环境兼容性

脚本针对 Cron 的特殊环境做了以下适配：

| 问题 | 解决方案 |
|------|----------|
| PATH 环境变量精简 | 脚本启动时自动将当前 Node.js 的 bin 目录添加到 PATH |
| USER 环境变量缺失 | 使用 `id -un` 系统命令获取用户名 |
| SSH Agent 不可用 | 自动检测 SSH key 并通过 `GIT_SSH_COMMAND` 注入 |
| 日志目录不存在 | 写入日志前自动创建 `logs/` 目录 |

### SSL 证书管理

```bash
# 手动续期
npm run deploy:renew

# 查看证书状态
npm run deploy:status
```

Let's Encrypt 证书有效期为 90 天，Certbot 会自动设置续期任务。

## 性能优化

### 前端优化

| 优化项 | 实现方式 | 效果 |
|--------|----------|------|
| 零字体请求 | 使用系统原生字体栈 | 首屏渲染无阻塞 |
| 单一 Favicon | 仅使用 SVG 格式 | 减少网络请求 |
| 静态生成 | Astro SSG 预渲染 | 无服务端渲染开销 |

### Nginx 服务端优化

部署脚本自动配置以下性能优化：

```nginx
# 零拷贝传输
sendfile on;
tcp_nopush on;
tcp_nodelay on;

# Gzip 压缩
gzip on;
gzip_comp_level 5;
gzip_types text/plain text/css application/json application/javascript;

# 静态资源长期缓存
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

## 代码块增强

文章详情页对代码块做了以下增强：

1. **语言标签显示** - 代码块右上角显示语言名称
2. **行号显示** - 等宽对齐的行号
3. **复制按钮** - 一键复制代码内容
4. **展开/收起** - 超过 15 行时自动折叠
5. **滚动位置补偿** - 防止展开/收起时页面跳动

```javascript
// 展开/收起时的滚动补偿
const rectBefore = wrapper.getBoundingClientRect();
const topBefore = rectBefore.top;

wrapper.classList.toggle('collapsed');

const rectAfter = wrapper.getBoundingClientRect();
const scrollDiff = rectAfter.top - topBefore;
if (scrollDiff !== 0) {
  window.scrollBy(0, scrollDiff);
}
```

## 开发注意事项

### CSS 优先级

Astro 的 scoped CSS 无法直接选择 Markdown 生成的 HTML，需使用 `:global()` 选择器：

```css
/* ❌ 不生效 */
.content pre { ... }

/* ✅ 正确写法 */
.content :global(pre) { ... }
```

### Shiki 样式覆盖

Shiki 生成的代码块有内联样式，覆盖时需使用 `!important`：

```css
.content :global(.code-wrapper.collapsed pre) {
  max-height: 312px !important;
  overflow: hidden !important;
}
```

## 快速开始

```bash
# 克隆项目
git clone https://github.com/ganchuanman/rosydawn.git
cd rosydawn

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 部署到服务器
npm run deploy
```

---

Rosydawn 是一个专注于内容展示的博客框架，通过极简设计和自动化部署，让创作者专注于写作本身。
