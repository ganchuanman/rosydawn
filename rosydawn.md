# Rosydawn 项目架构文档

> **AI 阅读提示**：本文档是为 AI 工具设计的项目结构指南。阅读时请注意以下规则：
> 1. 所有文件路径都是相对于项目根目录
> 2. 核心逻辑集中在 `src/` 目录，内容在 `src/content/posts/` 目录
> 3. 项目使用 Astro 5.x 框架，需理解其 `.astro` 单文件组件格式
> 4. 修改样式时注意使用 `:global()` 选择器处理 Markdown 生成的 HTML

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

### 技术栈

```yaml
框架: Astro 5.17.x
语言: TypeScript
样式: Scoped CSS (无预处理器)
字体: 
  - 正文: LXGW WenKai (霞鹜文楷)
  - 代码: JetBrains Mono / SF Mono
代码高亮: Shiki (内置于 Astro)
图表: astro-plantuml
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
│   │   ├── about.astro         # 关于页面
│   │   ├── blog/
│   │   │   ├── [...page].astro # 文章列表 (分页)
│   │   │   └── [...slug].astro # 文章详情
│   │   └── tags/
│   │       ├── index.astro     # 标签云
│   │       └── [tag].astro     # 标签详情
│   │
│   └── content.config.ts       # 内容集合配置
│
├── astro.config.mjs            # Astro 配置
├── package.json
├── tsconfig.json
└── deploy.sh                   # 部署脚本
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
- 字体引入（Google Fonts + LXGW WenKai）
- 通用样式（滚动条、链接、代码块等）

**CSS 变量定义**：
```css
:root {
  --bg: #fafafa;           /* 背景色 */
  --bg-secondary: #f0f0f0; /* 次级背景 */
  --text: #1a1a1a;         /* 主文字 */
  --text-muted: #666666;   /* 次级文字 */
  --accent: #0969da;       /* 主题色 */
  --border: #d0d7de;       /* 边框色 */
  --code-bg: #f6f8fa;      /* 代码背景 */
  --font-mono: 'JetBrains Mono', ...;
  --font-sans: 'LXGW WenKai', ...;
}
```

### 4. `src/pages/blog/[...slug].astro` - 文章详情页

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

### 5. `src/pages/blog/[...page].astro` - 文章列表页

**特性**：
- 分页支持（每页 5 篇）
- 文章卡片展示（标题、描述、日期、标签）
- 分页导航

### 6. `src/pages/tags/[tag].astro` - 标签详情页

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

- **正文**：LXGW WenKai（霞鹜文楷）
- **代码**：JetBrains Mono（回退到 SF Mono、Menlo）
- **代码块**：13px, 行高 1.5

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

# 部署（执行 deploy.sh）
./deploy.sh
```

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
| `/about` | `about.astro` | 关于页面 |

---

## 🗂️ 现有文章列表

```
src/content/posts/
├── 2025/12/rust-wasm-web/
├── 2026/01/kubernetes-devops/
├── 2026/01/spec-driven-development/
├── 2026/02/android-remote-dev/
├── 2026/02/multi-agent-testing/
├── 2026/03/llm-prompt-engineering/
├── 2026/03/system-design-diagrams/
└── 2026/03/typescript-patterns/
```

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

当前导航结构：
```html
<nav class="nav">
  <a href="/">文章</a>
  <a href="/tags">分类</a>
  <a href="/about">关于</a>
</nav>
```

---

*本文档最后更新：2026-03*
