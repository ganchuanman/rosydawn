# Rosydawn

基于 [Astro](https://astro.build) 构建的极简静态个人博客。

## 特性

- **纯静态生成** - 构建后直接部署 `dist/` 静态文件
- **内容集合** - 使用 Astro Content Collections 管理文章
- **Markdown/MDX** - 支持标准 Markdown 和 MDX
- **代码高亮** - 使用 Astro 内置 Shiki
- **Mermaid 图表** - 浏览器端按需运行时渲染
- **浅色/暗色模式** - 支持系统偏好和手动切换
- **响应式阅读体验** - 适配桌面和移动端

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Astro 5 |
| 语言 | TypeScript / Astro |
| 样式 | Scoped CSS |
| 内容 | Markdown / MDX |
| 图表 | Mermaid |
| 部署 | 静态文件 / Nginx |

## 目录结构

```text
rosydawn/
├── public/              # 静态资源
├── src/
│   ├── components/      # 页面组件
│   ├── content/posts/   # 博客文章
│   ├── layouts/         # 布局
│   ├── pages/           # 静态路由
│   └── plugins/         # Markdown 插件
├── scripts/             # 部署脚本
└── astro.config.mjs
```

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

构建产物位于 `dist/`。部署时只需要发布这个目录中的静态文件。

## 写文章

文章放在 `src/content/posts/` 下，推荐按年月和 slug 组织：

```text
src/content/posts/2026/03/my-article/
├── index.md
└── assets/
```

Frontmatter 示例：

```yaml
---
title: "文章标题"
date: 2026-03-15
description: "一句话描述"
tags: ["tag"]
---
```

## Mermaid

使用标准 Mermaid 代码块：

````markdown
```mermaid
flowchart LR
  A[Write] --> B[Build]
  B --> C[Deploy]
```
````

Mermaid 依赖会按需加载：普通页面不会加载图表运行时代码，只有包含 Mermaid 图表的页面才会加载。

## 部署脚本

```bash
npm run deploy:build
npm run deploy:status
npm run deploy:ssl
```

部署配置位于 `scripts/lib/config.mjs`，也可以通过 `.env` 覆盖部分配置。`.env.example` 提供了可选部署环境变量示例。
