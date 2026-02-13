## Why

当前 `astro-plantuml` 插件在构建时向 PlantUML 服务器发送请求获取 PNG 图片，并将其转为 base64 嵌入 HTML。这种方式存在以下问题：

1. **构建时依赖网络**：构建过程需要访问外部服务器，离线环境或网络不稳定时构建会失败
2. **构建速度慢**：每个 PlantUML 代码块都需要一次 HTTP 请求，增加构建时间
3. **HTML 体积膨胀**：base64 编码的 PNG 图片体积大（约增加 33%），且无法利用浏览器缓存
4. **格式固定为 PNG**：无法轻松切换到 SVG 等更适合网页的矢量格式
5. **源码不可见**：渲染后的图片丢失了原始 PlantUML 代码，用户无法查看或学习图表的实现方式

## What Changes

- **新增**：PlantUML URL 编码 remark 插件，在构建时将 PlantUML 代码编码为 URL 字符串
- **新增**：图片/源码切换组件，在每个 PlantUML 图上方添加"查看源码"按钮
- **修改**：生成的 HTML 使用 `<img src="https://www.plantuml.com/plantuml/svg/...">` 替代 base64 嵌入
- **移除**：不再依赖构建时的 HTTP 请求获取图片
- **配置**：支持自定义 PlantUML 服务器地址和输出格式（svg/png）

## Capabilities

### New Capabilities
- `plantuml-url-encoder`: PlantUML 代码到 URL 的编码器，实现 PlantUML 官方的编码算法（Deflate + 自定义 Base64），并生成包含源码切换功能的 HTML 结构

### Modified Capabilities
<!-- 无需修改现有 spec，这是全新的实现方式 -->

## Impact

- **代码变更**：
  - 新增 remark 插件替代 `astro-plantuml`
  - 修改 `astro.config.mjs` 配置
  - 新增 CSS 样式支持图片/源码切换交互
  - 新增客户端 JavaScript 处理切换逻辑
- **依赖变更**：
  - 移除 `astro-plantuml` 包
  - 使用 Node.js 内置 `zlib` 模块进行 Deflate 压缩，无需新增依赖
- **构建行为**：
  - 构建时不再发起网络请求
  - 图片请求延迟到浏览器渲染时
- **用户体验**：
  - 页面加载时才请求图片（懒加载友好）
  - SVG 格式支持更好的缩放和清晰度
  - 浏览器可缓存相同的 PlantUML 图片
  - 用户可切换查看原始 PlantUML 代码，便于学习和复制
