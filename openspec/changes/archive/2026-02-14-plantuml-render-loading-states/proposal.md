## Why

当前 PlantUML 图片渲染直接在浏览器中请求 PlantUML 服务器，缺少加载状态反馈和失败处理机制。用户在等待图片加载时看不到任何进度提示，且当网络不稳定或服务器不可用时，图片加载失败后没有任何重试选项，严重影响用户体验。需要为 PlantUML 图片添加完整的加载状态管理和失败重试功能。

## What Changes

- 添加图片加载中的 loading 状态显示，提供视觉反馈
- 添加加载失败的错误提示界面，明确告知用户加载失败
- 提供失败后的重试按钮，允许用户手动重新加载图片
- 添加加载超时处理机制，避免无限等待
- 保持现有的图片/源码切换功能不受影响
- 支持暗色模式下的 loading 和错误状态样式

## Capabilities

### New Capabilities

- `plantuml-loading-states`: PlantUML 图片加载状态管理，包括 loading 动画、加载失败提示、重试按钮和超时处理

### Modified Capabilities

- `plantuml-url-encoder`: 修改现有的 PlantUML 图片渲染功能，在 HTML 结构中增加状态容器元素，支持显示不同的加载状态

## Impact

### 受影响的文件
- PlantUML 渲染相关的前端组件（需要添加状态管理逻辑）
- PlantUML 图片的 CSS 样式（需要添加 loading 和 error 状态样式）
- PlantUML 图片的 HTML 结构（需要增加状态容器）
- 客户端 JavaScript（需要添加图片加载事件监听和状态切换逻辑）

### 用户体验影响
- 用户在图片加载时能看到明确的 loading 提示
- 加载失败时有清晰的错误提示和重试选项
- 整体加载体验更加友好和专业

### 兼容性影响
- 保持与现有的图片/源码切换功能完全兼容
- 支持 View Transitions 导航场景
- 支持暗色模式
