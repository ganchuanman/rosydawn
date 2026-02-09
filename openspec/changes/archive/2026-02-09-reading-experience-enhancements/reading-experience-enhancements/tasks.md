## 1. View Transitions 集成

- [x] 1.1 在 Layout.astro 中导入并添加 `<ViewTransitions />` 组件
- [x] 1.2 将 [...slug].astro 中的 `DOMContentLoaded` 事件监听改为 `astro:page-load`
- [x] 1.3 验证 TOC 高亮在页面切换后正常工作
- [x] 1.4 验证代码块功能（复制、行号、展开收起）在页面切换后正常工作
- [x] 1.5 验证阅读进度条在页面切换后正确重置

## 2. BackToTop 组件

- [x] 2.1 创建 `src/components/BackToTop.astro` 组件
- [x] 2.2 实现滚动监听逻辑（带节流），300px 阈值显示/隐藏按钮
- [x] 2.3 实现点击事件，使用 `window.scrollTo({ behavior: 'smooth' })` 滚动到顶部
- [x] 2.4 添加按钮样式：固定右下角、圆形、与主题色一致
- [x] 2.5 添加暗色模式样式支持
- [x] 2.6 添加无障碍属性：`aria-label`、键盘可操作

## 3. 集成与测试

- [x] 3.1 在 [...slug].astro 文章页面中引入 BackToTop 组件
- [x] 3.2 测试桌面端和移动端的显示效果
- [x] 3.3 测试 View Transitions 页面切换时 BackToTop 按钮状态正确重置
- [x] 3.4 在不支持 View Transitions 的浏览器中测试回退行为
