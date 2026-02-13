## Context

当前项目使用 `astro-plantuml` 插件处理 Markdown 中的 PlantUML 代码块。该插件在 Astro 构建时：
1. 检测 `plantuml` 语言标识的代码块
2. 向 `https://www.plantuml.com/plantuml/png/` 发送 HTTP 请求
3. 将返回的 PNG 图片转为 base64 嵌入 HTML

这导致构建依赖网络、速度慢、HTML 体积大、且用户无法查看原始代码。

**约束条件：**
- 必须兼容现有 Markdown 文件中的 `plantuml` 代码块语法
- 不能引入额外的 npm 依赖
- 需要支持 Astro 的 View Transitions
- 图片/源码切换需要在页面导航后仍能正常工作

## Goals / Non-Goals

**Goals:**
- 构建时将 PlantUML 代码编码为 URL，不发起网络请求
- 生成的 HTML 包含指向 PlantUML 服务器的 SVG 图片链接
- 提供图片/源码切换功能，用户可查看原始 PlantUML 代码
- 支持配置自定义服务器地址和输出格式

**Non-Goals:**
- 不实现本地 PlantUML 渲染（仍依赖 PlantUML 在线服务）
- 不实现图片缓存或离线支持
- 不支持 PlantUML 以外的图表格式（如 Mermaid）

## Decisions

### 1. 编码算法实现

**决定：** 使用 Node.js 内置 `zlib.deflateRawSync` + 自定义 Base64 编码

**理由：**
- PlantUML 官方编码格式：UTF-8 → Deflate 压缩 → 自定义 64 字符集编码
- Node.js `zlib` 是内置模块，无需额外依赖
- 自定义 Base64 字符集：`0-9A-Za-z-_`（URL 安全）

**备选方案：**
- `pako` 库：需要新增依赖，且功能与内置 zlib 重复
- 不压缩直接编码：URL 过长，可能超出浏览器限制

### 2. Remark 插件架构

**决定：** 创建独立的 remark 插件 `remark-plantuml-url.mjs`

**理由：**
- 遵循 Astro 的 Markdown 处理管道
- 可在 `astro.config.mjs` 中配置，与其他 remark 插件一致
- 便于单独测试和维护

**插件配置选项：**
```typescript
interface Options {
  server?: string;      // 默认: 'https://www.plantuml.com/plantuml'
  format?: 'svg' | 'png'; // 默认: 'svg'
  darkMode?: boolean;   // 是否生成暗色模式版本（未来扩展）
}
```

### 3. HTML 输出结构

**决定：** 生成包含图片的容器，源码通过 Base64 存储在 data 属性中，由客户端 JS 动态创建代码块

```html
<div class="plantuml-container" data-state="image" data-plantuml-source="BASE64_ENCODED_SOURCE">
  <div class="plantuml-image-wrapper">
    <img class="plantuml-image" src="https://www.plantuml.com/plantuml/svg/..." alt="PlantUML Diagram" loading="lazy" />
    <button class="plantuml-toggle-to-code" type="button" title="查看源码">
      <!-- 代码图标 SVG -->
    </button>
  </div>
  <div class="plantuml-code-placeholder"></div>
</div>
```

客户端 JS 会将 `plantuml-code-placeholder` 替换为与现有代码块完全一致的结构：

```html
<div class="code-wrapper plantuml-code-wrapper">
  <div class="code-toolbar">
    <div class="code-left-group">
      <span class="code-lang">plantuml</span>
    </div>
    <div class="code-btn-group">
      <button class="plantuml-toggle-to-image">图片</button>
      <button class="copy-btn">复制</button>
    </div>
  </div>
  <pre><code class="has-line-numbers">...</code></pre>
</div>
```

**理由：**
- 图片模式简洁无边框，切换按钮悬浮显示（hover 时出现）
- 源码模式复用现有代码块样式，保持视觉一致性
- 源码存储在 data 属性中避免被 Shiki 代码高亮处理
- 由 JS 动态创建代码块，可以复用行号、复制等功能

### 4. 切换交互实现

**决定：** 图片模式悬浮按钮 + 源码模式工具栏按钮

**图片模式：**
- 图片无边框，直接显示
- 右上角悬浮代码图标按钮（默认透明，hover 时显示）
- 点击按钮切换到源码模式

**源码模式：**
- 完全复用现有代码块样式（工具栏、行号、复制按钮）
- 工具栏右侧增加"图片"按钮（在复制按钮前）
- 点击"图片"按钮切换回图片模式

**JavaScript 职责：**
- 页面加载时为 PlantUML 容器动态创建代码块结构
- 监听切换按钮点击，切换 `data-state` 属性
- 支持 Astro View Transitions（使用 `astro:page-load` 事件重新初始化）

**理由：**
- 图片模式简洁，不干扰阅读
- 源码模式与其他代码块视觉一致，用户体验统一
- CSS 控制显示逻辑，JS 负责状态切换和代码块创建

### 5. 样式集成

**决定：** 在 `Layout.astro` 中添加全局样式

**理由：**
- PlantUML 图可能出现在任何博客文章中
- 全局样式确保一致的视觉效果
- 与现有 `.plantuml-diagram` 样式保持兼容

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| PlantUML 服务器不可用 | 图片无法显示 | 用户仍可切换查看源码；可配置备用服务器 |
| 超长代码导致 URL 过长 | 部分浏览器可能无法加载 | Deflate 压缩可处理大多数情况；极端情况下显示警告 |
| View Transitions 导致事件丢失 | 切换按钮失效 | 使用 `astro:page-load` 事件重新初始化 |
| SVG 在暗色模式下显示问题 | 图表可能不清晰 | 为 SVG 添加白色背景；未来可支持暗色主题 |
