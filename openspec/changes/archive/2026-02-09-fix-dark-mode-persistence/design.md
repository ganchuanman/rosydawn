## Context

当前暗黑模式实现使用两个内联脚本：
1. `<head>` 中的脚本：在页面渲染前从 `localStorage` 读取主题并设置 `data-theme` 属性，防止闪烁
2. `<body>` 结尾的脚本：监听 `astro:page-load` 事件，绑定主题切换按钮的点击事件

问题在于当使用 Astro View Transitions 进行 SPA 导航时，`<head>` 中的初始化脚本不会重新执行。虽然 `localStorage` 中保存了正确的主题偏好，但新页面的 `<html>` 元素没有被设置正确的 `data-theme` 属性。

## Goals / Non-Goals

**Goals:**
- 确保主题状态在 View Transitions 导航后保持一致
- 保持现有的防闪烁机制（首次加载时 `<head>` 脚本先于渲染执行）
- 最小化代码改动

**Non-Goals:**
- 重构整个主题系统
- 添加更多主题选项（如自动跟随系统）
- 修改主题切换的 UI

## Decisions

### Decision 1: 使用 `astro:after-swap` 事件恢复主题

**选择**: 监听 `astro:after-swap` 事件，在 DOM 交换后立即恢复主题状态

**原因**:
- `astro:after-swap` 在新 DOM 被交换到页面后、渲染前触发
- 这是恢复主题的最佳时机，可以防止新页面闪烁错误的主题
- Astro 官方文档推荐的方式

**替代方案**:
- `astro:page-load`: 太晚，页面已经渲染，会有闪烁
- 在每个页面组件中手动初始化：侵入性强，维护困难

### Decision 2: 将主题恢复逻辑保持在 `<head>` 内联脚本中

**选择**: 在现有的 `<head>` 内联脚本中添加 `astro:after-swap` 事件监听

**原因**:
- 保持相关逻辑集中
- 内联脚本可以在 View Transitions 期间持续存在并监听事件
- 无需额外的脚本文件

## Risks / Trade-offs

**风险**: 脚本执行顺序依赖 → 使用 `is:inline` 确保脚本阻塞执行，与现有行为一致

**权衡**: 增加少量代码复杂度 → 问题影响用户体验，修复收益大于成本
