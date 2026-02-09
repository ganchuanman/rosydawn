## Why

博客文章阅读体验需要进一步优化。当前缺少页面切换动画导致导航生硬，长文章滚动后返回顶部不便，且 TOC 高亮虽然已实现但可以继续优化。通过这三个增强功能，可以显著提升用户的阅读体验和网站的精致感。

## What Changes

- **View Transitions**: 使用 Astro 内置的 View Transitions API，实现页面切换时的平滑过渡动画（淡入淡出、元素持久化等）
- **TOC 高亮优化**: 改进现有的 TOC 高亮逻辑，确保滚动时侧边栏目录准确标记当前可见章节
- **回到顶部按钮**: 在长文章滚动超过一定距离后显示一个浮动的回到顶部按钮

## Capabilities

### New Capabilities

- `view-transitions`: Astro View Transitions 集成，提供页面间平滑过渡动画
- `back-to-top`: 浮动回到顶部按钮组件，滚动一定距离后出现

### Modified Capabilities

（无需修改现有 spec）

## Impact

- **Layout.astro**: 添加 `<ViewTransitions />` 组件
- **[...slug].astro**: 可能需要调整 TOC 高亮的 IntersectionObserver 配置，添加回到顶部按钮
- **新组件**: 可能创建 `BackToTop.astro` 组件
- **依赖**: 仅使用 Astro 内置功能，无需新增外部依赖
