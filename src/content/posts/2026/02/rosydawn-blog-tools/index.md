---
title: "Rosydawn 博客命令行工具介绍"
date: 2026-02-09
description: "本文详细介绍了Rosydawn静态博客系统的命令行工具链，涵盖从文章创建到自动部署的全流程。文章创建工具通过AI交互生成规范的文章骨架；发布工具自动生成元数据并处理Git操作；部署工具支持一键构建、HTTPS配置和自动部署定时任务。系统强调AI驱动、标签一致性、优雅降级和零依赖部署等技术亮点，帮助用户专注于写作，自动化处理元数据管理和运维工作。"
tags: ["rosydawn"]
---

Rosydawn 是一个基于 Astro 构建的静态博客系统，除了优秀的页面性能外，还提供了一套完整的命令行工具链，覆盖从文章创建到自动部署的全流程。本文将详细介绍这些工具的使用方法。

## 命令概览

项目提供以下 npm 脚本命令：

| 分类 | 命令 | 说明 |
|------|------|------|
| 开发 | `npm run dev` | 启动开发服务器 |
| 构建 | `npm run build` | 构建静态站点 |
| 预览 | `npm run preview` | 本地预览构建产物 |
| 内容 | `npm run new` | 创建新文章 |
| 内容 | `npm run publish` | 发布文章到 Git |
| 部署 | `npm run deploy` | 构建并部署到 Nginx |
| SSL | `npm run deploy:ssl` | 配置 HTTPS 证书 |
| 运维 | `npm run deploy:cron:install` | 安装自动部署定时任务 |

## 文章创建：`npm run new`

这是一个交互式的文章创建向导，借助 AI 能力帮助你快速创建规范的文章骨架。

### 使用流程

```bash
npm run new
```

执行后，工具会：

1. **提示输入文章主题**：描述你想写的内容
2. **AI 生成元数据**：
   - 中文标题（简洁有力）
   - 英文 URL slug（2-4 个单词，小写连字符）
3. **创建文件结构**：`src/content/posts/{年}/{月}/{slug}/index.md`
4. **启动开发服务器**：如果 4321 端口没有服务在运行，会自动启动
5. **输出预览地址**：直接点击即可在浏览器中编辑预览

### 示例

```
? 请描述文章的核心主题：介绍 React 19 的新特性

✓ 生成标题: React 19 新特性全解析
✓ 生成 slug: react-19-features

文件已创建: src/content/posts/2026/02/react-19-features/index.md
预览地址: http://localhost:4321/posts/react-19-features
```

### 配置要求

需要配置 OpenAI API（或兼容接口）：

```bash
# .env 文件
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，支持自定义端点
OPENAI_MODEL=gpt-4o-mini                    # 可选，默认 gpt-4o-mini
```

支持的 API 端点包括：OpenAI、Azure OpenAI、DeepSeek、本地 Ollama 等任何 OpenAI 兼容接口。

## 文章发布：`npm run publish`

发布命令提供了完整的文章发布工作流，包括元数据生成、Git 提交和推送。

### 使用流程

```bash
npm run publish
```

工具会自动：

1. **检测变更文件**：扫描 `src/content/posts/` 目录下的 Markdown 变更
2. **显示变更列表**：展示待发布的文章标题和状态（新增/修改）
3. **AI 生成元数据**：
   - 文章描述（100-150 字符的中文摘要）
   - 标签（2-5 个，复用已有标签确保一致性）
   - 提交信息（遵循 Conventional Commits 规范）
4. **交互式确认**：显示生成内容，支持确认、取消或编辑
5. **更新 frontmatter**：将描述和标签写入文章
6. **Git 操作**：暂存、提交、推送

### 标签智能复用

发布工具会扫描所有已有文章的标签，优先复用现有标签，避免创建重复或相似的标签，保持博客标签体系的一致性。

### 示例输出

```
检测到 1 篇文章变更:
  ✚ React 19 新特性全解析 (新增)

正在生成文章元数据...

┌─────────────────────────────────────────┐
│ 描述: 深入解析 React 19 带来的新特性，  │
│       包括 Actions、文档元数据等重大更新 │
│ 标签: React, 前端, JavaScript           │
│ 提交: feat(blog): add React 19 特性介绍 │
└─────────────────────────────────────────┘

? 确认发布？ (确认 / 取消 / 编辑)
```

## 站点部署：`npm run deploy`

一键构建并部署到 Nginx 服务器。

### 部署流程

```bash
npm run deploy
```

执行步骤：

1. 检查 Node.js 版本（要求 v18+）
2. 运行 `npm run build` 构建静态站点
3. 验证构建输出目录 `dist/`
4. 复制文件到 Nginx 目录：`/var/www/html/rosydawn`
5. 设置文件权限（755）和所有者
6. 更新 Nginx 配置
7. 显示部署统计（文件数、总大小）

### 其他部署命令

```bash
npm run deploy:status   # 查看部署状态
npm run deploy:help     # 显示帮助信息
npm run deploy:ssl      # 配置 HTTPS
npm run deploy:renew    # 手动更新 SSL 证书
```

## HTTPS 配置：`npm run deploy:ssl`

使用 Let's Encrypt 免费证书配置 HTTPS。

```bash
npm run deploy:ssl
```

工具会自动：

1. 检查 Nginx 安装状态
2. 使用 Certbot 申请 SSL 证书
3. 更新 Nginx 配置启用 HTTPS
4. 配置证书自动续期（通过 systemd timer）

### 配置项

```bash
# .env 文件
DOMAIN=www.rosydawn.space    # 你的域名
SSL_EMAIL=your@email.com     # 证书通知邮箱
ENABLE_SSL=true              # 启用 HTTPS
```

## 自动部署：Cron 定时任务

自动部署功能会定期检查 Git 仓库更新，有新提交时自动拉取并部署。

### 安装自动部署

```bash
npm run deploy:cron:install
```

默认每 5 分钟检查一次更新，可通过环境变量配置：

```bash
WATCH_INTERVAL=10   # 检查间隔（分钟）
GIT_BRANCH=main     # 监控的分支
```

### 管理命令

```bash
npm run deploy:cron:status  # 查看自动部署状态
npm run deploy:cron:remove  # 移除定时任务
npm run deploy:cron         # 手动执行一次检查
```

### 邮件通知

配置 SMTP 后，每次自动部署会发送邮件通知：

```bash
# .env 文件
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
NOTIFY_EMAIL=admin@example.com
```

邮件内容包括：部署状态、域名、分支、提交信息、文件数量等。

## 配置系统

### 配置优先级

环境变量 > 配置文件 > 默认值

### 配置文件：`rosydawn.config.js`

```javascript
export default {
  ai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  publish: {
    autoPush: true,      // 提交后自动推送
    commitPrefix: 'feat', // 提交信息前缀
  },
};
```

### 环境变量：`.env`

完整的环境变量示例：

```bash
# AI 服务
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

# 部署配置
DOMAIN=www.rosydawn.space
ENABLE_SSL=true
SSL_EMAIL=your@email.com

# 自动部署
WATCH_INTERVAL=5
GIT_BRANCH=main

# 邮件通知
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your@gmail.com
SMTP_PASS=xxx
NOTIFY_EMAIL=admin@example.com
```

## 完整工作流示例

### 日常写作流程

```bash
# 1. 创建新文章
npm run new
# → 输入主题，AI 生成标题和 slug
# → 打开浏览器编辑（自动热重载）

# 2. 完成写作后发布
npm run publish
# → 自动生成描述和标签
# → 确认后提交推送到 Git
```

### 服务器部署流程

```bash
# 1. 首次部署
npm run deploy
npm run deploy:ssl

# 2. 配置自动部署
npm run deploy:cron:install

# 3. 监控状态
npm run deploy:cron:status
tail -f logs/deploy.log
```

## 技术亮点

1. **AI 驱动**：文章标题、描述、标签、提交信息均可 AI 生成，大幅减少重复劳动
2. **标签一致性**：发布时自动扫描已有标签，确保标签体系统一
3. **优雅降级**：AI 服务不可用时，自动回退到手动输入
4. **零依赖部署**：部署脚本仅使用 Node.js 内置模块，无需额外安装
5. **邮件通知**：自动部署支持邮件通知，及时了解部署状态
6. **日志轮转**：自动保留最近 500 行日志，避免磁盘占用

## 系统要求

- Node.js v18+
- Git（用于版本控制）
- Nginx（用于部署，服务器端）
- Certbot（用于 SSL 证书，可选）

通过这套命令行工具，你可以专注于写作本身，而将繁琐的元数据管理、版本控制和部署运维交给自动化流程处理。
