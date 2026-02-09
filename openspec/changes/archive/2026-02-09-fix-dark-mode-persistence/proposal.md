## Why

暗黑模式在页面导航后无法保持。当用户在页面 A 切换到暗黑模式，然后通过 View Transitions 导航到页面 B 时，页面 B 会恢复为日间模式。这是因为 `<head>` 中的主题初始化脚本在 View Transitions 导航时不会重新执行，导致存储在 `localStorage` 中的主题偏好无法被应用。

## What Changes

- 修改主题初始化逻辑，使其在 View Transitions 页面切换后也能正确应用保存的主题偏好
- 监听 Astro 的 `astro:after-swap` 事件，在 DOM 交换完成后立即恢复主题状态
- 确保主题状态在整个 SPA 导航过程中保持一致

## Capabilities

### New Capabilities

无。此变更不引入新功能。

### Modified Capabilities

- `dark-mode`: 新增对 View Transitions 导航场景的支持，确保主题偏好在页面切换后正确持久化

## Impact

- **文件**: `src/layouts/Layout.astro` - 需要添加 `astro:after-swap` 事件监听
- **依赖**: 无新增依赖，使用 Astro 内置的 View Transitions 事件
- **兼容性**: 与现有主题切换逻辑完全兼容，无破坏性变更
