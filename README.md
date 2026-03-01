# Rosydawn

基于 [Astro](https://astro.build) 构建的个人技术博客，采用极简主义设计风格。

## 核心特性

- **静态生成** - 基于 Astro SSG，无需服务器
- **内容管理** - 使用 Astro Content Collections 管理博客文章
- **AI 交互** - 通过自然语言与博客系统对话（支持 OpenAI/Azure/Ollama/DeepSeek）
- **Markdown/MDX** - 支持标准 Markdown 和 MDX 扩展语法
- **代码高亮** - 集成 Shiki（支持 light/dark 双主题）
- **暗黑模式** - 支持系统偏好检测和手动切换，无 FOUC
- **图表支持** - 集成 PlantUML 绘图能力
- **响应式设计** - 移动端友好，自适应布局
- **自动部署** - 基于 Cron 的 Git 监听自动部署
- **SDD 开发** - 基于 OpenSpec 的规范驱动开发模式

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Astro 5.17.x |
| 语言 | TypeScript |
| 样式 | Scoped CSS (无预处理器) |
| 字体 | 系统原生字体栈（零网络请求） |
| 代码高亮 | Shiki |
| 图表 | PlantUML (自定义 remark 插件) |
| 部署 | Nginx + Let's Encrypt |

## 目录结构

```
rosydawn/
├── src/
│   ├── components/      # 可复用组件 (Header, Footer)
│   ├── content/posts/   # 博客文章
│   ├── layouts/         # 布局组件
│   └── pages/           # 页面路由
├── scripts/             # 部署脚本
├── openspec/            # OpenSpec SDD 规范目录
└── public/              # 静态资源
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 构建 AI 知识库
npm run build:knowledge

# 启动 AI 对话式 REPL
npm run repl
```

## 内容创作

### 统一 CLI（推荐）

Rosydawn 提供统一的命令行接口，支持两种模式：

#### REPL 模式（AI 对话）

```bash
# 启动交互式 REPL
rosydawn

# 或使用 npm
npm run repl
```

进入 REPL 后，可以用自然语言与系统对话：

```
🤖 > 怎么创建文章？
🤖 > 创建一篇关于 WebSocket 的文章
🤖 > 如何部署？
🤖 > 能做什么？
```

#### 命令行模式

```bash
# 查看帮助
rosydawn --help

# 创建文章
rosydawn new --topic "WebSocket 实战指南"

# 发布文章
rosydawn publish --slug "2026/03/my-article"

# 部署博客
rosydawn deploy

# 启动开发服务器
rosydawn dev

# 构建站点
rosydawn build

# 检查状态
rosydawn status
```

#### 命令别名

为方便使用，所有命令都支持短别名：

| 完整命令 | 别名 | 说明 |
|---------|------|------|
| `rosydawn content:new` | `rosydawn new` | 创建文章 |
| `rosydawn content:publish` | `rosydawn publish` | 发布文章 |
| `rosydawn deploy:apply` | `rosydawn deploy` | 部署 |
| `rosydawn dev:start` | `rosydawn dev` | 开发服务器 |
| `rosydawn build:run` | `rosydawn build` | 构建 |
| `rosydawn status:check` | `rosydawn status` | 检查状态 |

### 传统方式（已废弃）

```bash
# 交互式创建新博客文章
npm run content:new

# 发布文章到 Git 仓库
npm run content:publish
```

### AI 对话式（实验性）

```bash
# 首次使用需要配置 OPENAI_API_KEY 环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 API Key

# 构建知识库
npm run build:knowledge

# 启动 AI REPL
npm run repl

# 示例对话
🤖 > 创建一篇关于 WebSocket 的文章
🤖 > 显示所有文章
🤖 > 发布最新文章
```

详细使用说明请参考 [docs/ai-interaction.md](docs/ai-interaction.md)。

### 文章结构

```
src/content/posts/2026/03/my-article/
├── index.md          # 文章内容 (或 index.mdx)
├── cover.jpg         # 封面图（可选）
└── assets/           # 文章资源（可选）
```

### Frontmatter

```yaml
---
title: "文章标题"
date: 2026-03-15
description: "一句话描述"
tags: ["标签1", "标签2"]
coverImage: ./cover.jpg  # 可选
---
```

## 部署

```bash
# 构建并部署
npm run deploy:build

# 启用 HTTPS
SSL_EMAIL=admin@example.com npm run deploy:ssl

# 查看部署状态
npm run deploy:status

# 安装自动部署（每 5 分钟检查更新）
npm run deploy:cron:install
```

详细部署配置请参考 `scripts/lib/config.mjs`。

## OpenSpec SDD

本项目采用 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 的规范驱动开发模式：

```bash
# 创建新变更
/opsx:new <change-name>

# 逐步创建 artifacts
/opsx:continue

# 实现任务
/opsx:apply

# 归档变更
/opsx:archive
```

规范文件位于 `openspec/specs/`，变更记录位于 `openspec/changes/`。

## 许可证

MIT
