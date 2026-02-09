## Context

当前 Rosydawn 博客基于 Astro 构建，已有完整的文章页面布局，包括阅读进度条、TOC 目录（带 IntersectionObserver 高亮）、代码块功能等。页面间导航采用传统的整页刷新，缺乏过渡动画。长文章滚动后没有快速返回顶部的方式。

Astro 从 v3 开始内置 View Transitions API 支持，可以通过简单配置实现页面过渡动画。

## Goals / Non-Goals

**Goals:**
- 使用 Astro 内置 View Transitions 实现页面切换平滑过渡
- 添加浮动回到顶部按钮，滚动超过阈值后显示
- 保持现有 TOC 高亮功能正常工作（View Transitions 兼容）

**Non-Goals:**
- 不实现复杂的 SPA 路由系统
- 不修改现有 TOC 高亮算法（当前实现已满足需求）
- 不添加页面预加载或预取功能

## Decisions

### 1. View Transitions 集成方式

**决策**: 在 `Layout.astro` 的 `<head>` 中添加 `<ViewTransitions />` 组件

**理由**:
- Astro 内置支持，零额外依赖
- 自动处理页面间过渡，开箱即用
- 支持 `transition:name` 属性实现元素持久化动画
- 备选方案：自定义 CSS 过渡 → 需要手动管理状态，复杂度高

### 2. 回到顶部按钮实现

**决策**: 创建独立的 `BackToTop.astro` 组件，使用 scroll 事件监听

**理由**:
- 组件化便于复用和维护
- 使用原生 scroll 事件（带节流）检测滚动位置
- `window.scrollTo({ behavior: 'smooth' })` 实现平滑滚动
- 备选方案：IntersectionObserver → 需要 sentinel 元素，过于复杂

### 3. 显示阈值

**决策**: 滚动超过 300px 后显示回到顶部按钮

**理由**:
- 300px 约等于一屏的 30%，用户已开始阅读
- 不会在页面刚加载时就显示
- 可通过 CSS 变量调整

### 4. 按钮位置与样式

**决策**: 固定在右下角，圆形按钮，与主题色一致

**理由**:
- 右下角是用户习惯的位置，不遮挡内容
- 圆形按钮视觉简洁，hover 时放大
- 支持暗色模式

### 5. View Transitions 与现有脚本兼容

**决策**: 使用 `astro:page-load` 事件替代 `DOMContentLoaded`

**理由**:
- View Transitions 页面切换后不会触发 `DOMContentLoaded`
- `astro:page-load` 在每次页面加载（包括 View Transitions）后触发
- 确保 TOC 高亮、代码块功能等正常初始化

## Risks / Trade-offs

**[View Transitions 浏览器兼容性]** → 使用渐进增强，不支持的浏览器回退到正常导航。Astro 自动处理。

**[脚本重新初始化]** → 使用 `astro:page-load` 事件确保页面切换后脚本正确执行。需要测试 TOC 高亮和代码块功能。

**[回到顶部按钮遮挡内容]** → 使用半透明背景，hover 时提高不透明度。按钮尺寸适中（40px）。

**[滚动事件性能]** → 使用节流（throttle）限制事件处理频率，避免性能问题。
