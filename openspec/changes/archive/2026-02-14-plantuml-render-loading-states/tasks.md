# Implementation Tasks

## 1. HTML 结构调整

- [x] 1.1 修改 PlantUML 插件，在 `.plantuml-image-wrapper` 中添加三个状态容器
  - 添加 `.plantuml-loading-container`（loading 动画容器）
  - 添加 `.plantuml-error-container`（错误提示 + 重试按钮容器）
  - 保持 `.plantuml-image`（实际图片元素）

- [x] 1.2 为 `.plantuml-container` 添加默认状态类 `.plantuml-loading`

- [x] 1.3 确保 `.plantuml-loading-container` 包含旋转 spinner 的 HTML 结构（CSS 动画占位）

- [x] 1.4 确保 `.plantuml-error-container` 包含错误图标、提示文字和重试按钮的 HTML 结构

- [x] 1.5 验证所有状态容器使用绝对定位，占据相同布局空间

## 2. CSS 样式实现

- [x] 2.1 在 `Layout.astro` 的 `<style is:global>` 中添加 `.plantuml-loading-container` 样式
  - 实现 CSS 旋转 spinner 动画（使用 `@keyframes`）
  - 设置居中显示
  - 设置适当的尺寸和颜色

- [x] 2.2 添加 `.plantuml-error-container` 样式
  - 错误图标样式（使用 SVG 或 CSS 实现）
  - 提示文字样式（颜色、字体、间距）
  - 重试按钮样式（背景、边框、hover 状态）

- [x] 2.3 实现状态类控制样式
  - `.plantuml-loading` 类：显示 loading 容器，隐藏其他
  - `.plantuml-error` 类：显示 error 容器，隐藏其他
  - `.plantuml-loaded` 类：显示图片，隐藏其他

- [x] 2.4 添加暗色模式支持
  - 在 `html[data-theme="dark"]` 下调整 loading 动画颜色
  - 调整错误提示文字颜色
  - 调整重试按钮样式

- [x] 2.5 添加状态切换的平滑过渡动画（可选）

## 3. JavaScript 加载监听逻辑

- [x] 3.1 在 `Layout.astro` 的 `<script is:inline>` 中添加 PlantUML 图片加载监听函数

- [x] 3.2 实现使用 `Image` 对象预加载图片的逻辑
  - 创建 `new Image()` 对象
  - 设置 `src` 属性触发加载
  - 监听 `onload` 和 `onerror` 事件

- [x] 3.3 实现加载成功处理
  - 移除 `.plantuml-loading` 类
  - 添加 `.plantuml-loaded` 类
  - 清除超时计时器

- [x] 3.4 实现加载失败处理
  - 移除 `.plantuml-loading` 类
  - 添加 `.plantuml-error` 类
  - 清除超时计时器

- [x] 3.5 实现 30 秒超时机制
  - 在开始加载时启动 `setTimeout` 计时器（30 秒）
  - 超时后触发错误状态
  - 在加载成功/失败时清除计时器

## 4. 重试功能实现

- [x] 4.1 为重试按钮添加点击事件处理（使用事件委托）

- [x] 4.2 实现重试逻辑
  - 清除当前状态类
  - 添加 `.plantuml-loading` 类
  - 创建新的 `Image` 对象重新加载
  - 重置超时计时器

- [x] 4.3 实现重试按钮防抖机制（2 秒）
  - 点击后禁用按钮（添加 `disabled` 属性或样式类）
  - 2 秒后恢复按钮可用状态
  - 确保防抖期间不触发新的加载请求

- [x] 4.4 实现重试按钮的禁用样式（灰色或半透明）

## 5. View Transitions 兼容性

- [x] 5.1 确保加载监听在 `astro:page-load` 事件中重新初始化

- [x] 5.2 实现页面切换时的清理逻辑
  - 清除所有事件监听器
  - 清除超时计时器
  - 取消未完成的加载请求

- [x] 5.3 使用事件委托处理重试按钮点击（而非直接绑定）

- [x] 5.4 测试 View Transitions 导航场景
  - 从其他页面导航到包含 PlantUML 图片的页面
  - 从包含 PlantUML 图片的页面导航离开
  - 使用浏览器前进/后退按钮

## 6. 测试与验证

- [x] 6.1 本地开发环境测试
  - 测试正常加载流程（loading → loaded）
  - 测试网络错误场景（loading → error）
  - 测试超时场景（使用 Chrome DevTools throttling）
  - 测试重试功能（error → loading → loaded/error）

- [x] 6.2 测试暗色模式
  - 验证 loading 动画在暗色模式下清晰可见
  - 验证错误提示在暗色模式下可读
  - 验证重试按钮 hover 状态

- [x] 6.3 测试多图片场景
  - 在一个页面中包含多个 PlantUML 图片
  - 验证每个图片的加载状态独立管理
  - 验证重试一个图片不影响其他图片

- [x] 6.4 浏览器兼容性测试
  - Chrome 90+ 测试
  - Firefox 88+ 测试
  - Safari 14+ 测试
  - Edge 90+ 测试

- [x] 6.5 性能测试
  - 检查是否有额外的网络请求（应无）
  - 检查内存泄漏（快速导航场景）
  - 检查页面加载性能影响

## 7. 文档与清理

- [x] 7.1 更新项目文档（如需要）
  - 说明 PlantUML 图片加载状态功能
  - 记录自定义配置选项（如超时时间）

- [x] 7.2 代码审查与优化
  - 检查代码风格一致性
  - 移除调试日志（console.log）
  - 添加必要的注释

- [x] 7.3 提交代码
  - 创建有意义的 commit message
  - 关联相关的 issue 或需求文档

- [x] 7.4 部署验证
  - 在生产环境验证功能正常
  - 监控错误日志
  - 收集用户反馈
