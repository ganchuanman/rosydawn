## Context

Rosydawn 是基于 Astro 5 的个人技术博客，使用纯 CSS 变量体系管理主题颜色（定义在 `Layout.astro` 的 `:root` 中，共 12 个变量）。文章详情页 `[...slug].astro` 包含完整的阅读体验：目录侧边栏、代码块工具栏、滚动高亮等，全部使用 vanilla JS 实现，零外部运行时依赖。文章通过 Astro Content Collections 管理，frontmatter 包含 title、date、description、tags 字段。

## Goals / Non-Goals

**Goals:**

- 在不引入任何新依赖的前提下，为博客添加暗色模式、阅读进度条、预计阅读时间、上/下篇导航四项能力
- 暗色模式同时支持系统偏好自动跟随和手动切换，用户选择持久化到 localStorage
- 所有功能与现有的目录侧边栏、代码块工具栏等组件良好共存
- 保持现有设计语言的一致性（等宽字体 UI 元素、极简风格、CSS 变量驱动）

**Non-Goals:**

- 不支持多主题（如 sepia、高对比度等），仅做 light/dark 二选一
- 不修改 Shiki 代码高亮主题配置（暗色模式下代码块保持独立的颜色方案即可）
- 不引入 CSS 预处理器或 CSS-in-JS 方案
- 不做阅读进度的服务端持久化（如记住用户上次阅读位置）

## Decisions

### 1. 暗色模式：`data-theme` 属性 + CSS 变量覆盖

**方案**：在 `<html>` 元素上设置 `data-theme="dark"` 属性，通过 `html[data-theme="dark"]` 选择器覆盖 `:root` 中的 CSS 变量。

**备选**：
- 使用 `prefers-color-scheme` 媒体查询直接切换 → 无法支持手动覆盖，放弃
- 添加 `.dark` class 到 body → `data-theme` 语义更清晰且可扩展

**初始化策略**：在 `<head>` 中内联一段阻塞脚本（inline script），在 DOM 解析前读取 localStorage 并设置 `data-theme`，避免页面闪烁（FOUC）。逻辑：localStorage 有值 → 用它；否则 → 跟随 `prefers-color-scheme`。

**切换开关位置**：放在导航栏（site-header）右侧，使用太阳/月亮图标按钮，与导航链接对齐。

### 2. 暗色 CSS 变量值

在 `Layout.astro` 中添加 `html[data-theme="dark"]` 块，覆盖所有 12 个现有变量。暗色值基于 GitHub Dark 风格：

- `--bg: #0d1117` / `--bg-secondary: #161b22` / `--bg-tertiary: #21262d`
- `--text: #e6edf3` / `--text-muted: #8b949e` / `--text-dim: #6e7681`
- `--accent: #58a6ff` / `--accent-dim: #79c0ff` / `--accent-light: #1f3a5f`
- `--border: #30363d` / `--border-light: #21262d`
- `--code-bg: #161b22`

由于所有组件已使用 CSS 变量，切换变量值即可自动适配，无需修改组件样式。

### 3. 代码块暗色适配

Shiki 当前使用 `one-light` 主题，暗色下切换为 `github-dark` 需要 Astro 配置双主题（`shiki.themes`）。Astro 5 支持 dual themes，通过 CSS 变量 `--astro-code-*` 控制，配合 `data-theme` 选择器切换。

### 4. 阅读进度条：固定顶部细条

**方案**：在 `<body>` 顶部添加一个 `position: fixed` 的 `<div>`，宽度通过 JS 监听 `scroll` 事件动态设置为 `(scrollTop / (scrollHeight - clientHeight)) * 100%`。

**样式**：高度 2px，背景色 `var(--accent)`，z-index 高于其他固定元素，无过渡动画（跟手感更好）。

**性能**：直接操作 `style.width`，不使用 `requestAnimationFrame` 包装——现代浏览器的 scroll 事件已经在 rAF 节奏中触发。仅在文章详情页启用。

### 5. 预计阅读时间：构建时计算

**方案**：在 `[...slug].astro` 的 frontmatter 脚本中，获取文章渲染后的纯文本内容，按中文阅读速度（约 400 字/分钟）计算预计时间，`Math.max(1, Math.ceil(count / 400))`。

**备选**：
- frontmatter 字段手动填写 → 维护负担大，放弃
- 运行时 JS 计算 DOM 文本 → 不如构建时干净

**显示位置**：在 `meta-line` 中，紧跟日期之后、tags 之前，显示为 `· X 分钟`。

### 6. 上/下篇导航：构建时生成

**方案**：在 `getStaticPaths` 中获取所有文章，按日期排序后为每篇文章注入 `prevPost` 和 `nextPost` 到 props。导航组件放在 `article-footer` 中现有返回按钮的下方。

**样式**：两栏布局（flex），左侧「上一篇」右侧「下一篇」，缺少一侧时留空。显示文章标题，hover 时标题变色。使用等宽字体标签（← 上一篇 / 下一篇 →），与全站设计语言一致。

### 7. 进度条与暗色模式切换开关的层级

进度条 `z-index: 9999`，主题切换按钮跟随 header 正常流，不需要特别的 z-index 处理。进度条在所有页面最顶部，宽度 2px 不影响任何交互。

## Risks / Trade-offs

- **Shiki 双主题增加构建产物体积** → 每篇文章的代码块会包含两套颜色内联样式。对于代码密集的文章影响较大，但这是 Astro 官方支持的方案，可接受。
- **暗色模式下图片对比度** → 部分截图/图表可能在暗色背景上不协调。本次不做图片自动反色，用户可以在 coverImage 中提供暗色友好的图片。日后可考虑给图片加白色背景容器。
- **阅读时间计算对 MDX 组件不精确** → MDX 中嵌入的交互组件文本可能无法被纯文本提取计算。目前博客 MDX 使用量不大，可接受偏差。
- **localStorage 不可用时的回退** → 隐私模式或 storage 被禁用时，try-catch 包裹读写操作，回退到仅跟随系统偏好，不持久化。
