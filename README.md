# Rosydawn

基于 [Astro](https://astro.build) 构建的个人技术博客，采用极简主义设计风格。

## 核心特性

- **静态生成** - 基于 Astro SSG，无需服务器
- **内容管理** - 使用 Astro Content Collections 管理博客文章
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
```

## 内容创作

```bash
# 交互式创建新博客文章
npm run content:new

# 发布文章到 Git 仓库
npm run content:publish
```

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
