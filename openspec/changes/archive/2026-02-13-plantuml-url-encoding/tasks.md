## 1. 项目准备

- [x] 1.1 移除 `astro-plantuml` 依赖：从 `package.json` 中删除并运行 `npm uninstall astro-plantuml`
- [x] 1.2 从 `astro.config.mjs` 中移除 `astro-plantuml` 集成配置

## 2. 编码算法实现

- [x] 2.1 创建编码工具文件 `src/plugins/plantuml-encoder.mjs`
- [x] 2.2 实现 PlantUML 代码包装函数：自动添加 `@startuml`/`@enduml`（如果缺失）
- [x] 2.3 实现 Deflate 压缩函数：使用 `zlib.deflateRawSync` 压缩 UTF-8 编码的代码
- [x] 2.4 实现自定义 Base64 编码函数：使用 PlantUML 官方字符集 `0-9A-Za-z-_`
- [x] 2.5 实现完整 URL 生成函数：拼接 `{server}/{format}/{encoded}` 格式

## 3. Remark 插件实现

- [x] 3.1 创建 remark 插件文件 `src/plugins/remark-plantuml-url.mjs`
- [x] 3.2 实现代码块检测逻辑：识别 `plantuml` 语言标识的代码块
- [x] 3.3 实现 AST 转换：将代码块节点替换为 HTML 容器节点
- [x] 3.4 实现配置选项解析：支持 `server`、`format` 参数
- [x] 3.5 在 `astro.config.mjs` 中注册 remark 插件

## 4. HTML 结构生成

- [x] 4.1 生成 `.plantuml-container` 容器，设置 `data-state="image"` 初始状态
- [x] 4.2 生成 `.plantuml-toolbar` 工具栏，包含切换按钮
- [x] 4.3 生成切换按钮：包含"查看源码"和"显示图片"两个 span 元素
- [x] 4.4 生成 `.plantuml-image` 图片元素：设置正确的 `src`、`alt`、`class` 属性
- [x] 4.5 生成 `.plantuml-source` 源码元素：使用 `<pre><code>` 包裹原始代码

## 5. 样式集成

- [x] 5.1 在 `Layout.astro` 中添加 `.plantuml-container` 基础样式
- [x] 5.2 添加 `data-state` 控制的显示/隐藏样式
- [x] 5.3 添加切换按钮样式：hover、active 状态
- [x] 5.4 添加响应式图片样式：`max-width: 100%`
- [x] 5.5 添加源码样式：等宽字体、内边距、边框
- [x] 5.6 添加暗色模式兼容样式：图片白色背景

## 6. 交互功能实现

- [x] 6.1 创建切换功能脚本：监听按钮点击，切换 `data-state` 属性
- [x] 6.2 添加 View Transitions 兼容：监听 `astro:page-load` 事件重新初始化
- [x] 6.3 将脚本集成到 `Layout.astro` 或独立脚本文件

## 7. 测试验证

- [x] 7.1 创建测试用 Markdown 文件，包含各种 PlantUML 代码块
- [x] 7.2 验证编码算法正确性：与 PlantUML 官方工具对比
- [x] 7.3 验证 HTML 结构生成正确
- [x] 7.4 验证图片/源码切换功能正常
- [x] 7.5 验证 View Transitions 导航后功能正常
- [x] 7.6 验证响应式和暗色模式显示正常
- [x] 7.7 运行 Astro 构建，确认无错误

## 8. 清理与文档

- [x] 8.1 删除不再需要的旧 PlantUML 相关代码或样式
- [x] 8.2 更新项目 README 或相关文档（如需要）
