## ADDED Requirements

### Requirement: PlantUML 代码块编码

系统 SHALL 在 Markdown 构建时检测 `plantuml` 语言标识的代码块，并将其转换为指向 PlantUML 服务器的图片 URL。

#### Scenario: 标准 PlantUML 代码块转换
- **WHEN** Markdown 文件包含 `plantuml` 代码块
- **THEN** 系统将代码块替换为包含图片和源码的 HTML 容器

#### Scenario: 自动添加 PlantUML 包装
- **WHEN** 代码块内容不包含 `@startuml` 和 `@enduml`
- **THEN** 系统自动添加这些包装标记后再进行编码

#### Scenario: 保留已有包装
- **WHEN** 代码块内容已包含 `@startuml` 和 `@enduml`
- **THEN** 系统直接使用原始内容进行编码，不重复添加包装

### Requirement: URL 编码算法

系统 SHALL 使用 PlantUML 官方编码算法将代码转换为 URL 安全的字符串。

#### Scenario: Deflate 压缩编码
- **WHEN** 对 PlantUML 代码进行编码
- **THEN** 系统使用 UTF-8 编码 → Deflate 压缩 → 自定义 Base64 编码的顺序处理

#### Scenario: 自定义 Base64 字符集
- **WHEN** 进行 Base64 编码
- **THEN** 系统使用 PlantUML 官方字符集 `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_`

#### Scenario: 生成完整 URL
- **WHEN** 编码完成
- **THEN** 系统拼接为完整 URL 格式：`{server}/{format}/{encoded}`，默认为 `https://www.plantuml.com/plantuml/svg/{encoded}`

### Requirement: HTML 输出结构

系统 SHALL 生成包含图片和源码数据的容器结构，支持切换显示。

#### Scenario: 容器结构生成
- **WHEN** 转换 PlantUML 代码块
- **THEN** 系统生成包含 `.plantuml-container` 容器、图片包装器和源码占位符的 HTML 结构
- **AND** 源码以 Base64 编码存储在 `data-plantuml-source` 属性中

#### Scenario: 图片元素属性
- **WHEN** 生成图片元素
- **THEN** 图片元素 SHALL 包含 `class="plantuml-image"`、正确的 `src` URL、`alt="PlantUML Diagram"` 和 `loading="lazy"` 属性
- **AND** 图片无边框包裹，直接显示

#### Scenario: 切换按钮（图片模式）
- **WHEN** 显示图片视图
- **THEN** 右上角 SHALL 有一个悬浮的代码图标按钮
- **AND** 按钮默认透明，hover 时显示

### Requirement: 源码代码块生成

系统 SHALL 在客户端将 Base64 编码的源码正确解码并生成代码块。

#### Scenario: 解码 UTF-8 字符
- **WHEN** 源码包含 UTF-8 编码的中文字符或其他非 ASCII 字符
- **THEN** 系统 SHALL 使用 TextDecoder API 正确解码 Base64 字符串为 UTF-8 文本
- **AND** 解码后的源码 SHALL 正确显示中文字符，不出现乱码

#### Scenario: 代码块结构生成
- **WHEN** 页面加载时
- **THEN** 客户端 JS SHALL 将源码占位符替换为与现有代码块一致的结构
- **AND** 代码块 SHALL 包含工具栏、行号、复制按钮

### Requirement: 图片/源码切换功能

系统 SHALL 提供交互式切换功能，允许用户在图片和源码视图之间切换。

#### Scenario: 默认显示图片
- **WHEN** 页面加载完成
- **THEN** 容器 SHALL 显示图片视图，隐藏源码视图

#### Scenario: 点击切换到源码
- **WHEN** 用户点击图片右上角的代码图标按钮
- **THEN** 系统隐藏图片、显示源码代码块

#### Scenario: 点击切换回图片
- **WHEN** 用户在源码视图点击工具栏的"图片"按钮
- **THEN** 系统隐藏源码、显示图片

#### Scenario: 源码工具栏按钮
- **WHEN** 显示源码视图
- **THEN** 工具栏右侧 SHALL 包含"图片"按钮和"复制"按钮
- **AND** "图片"按钮在"复制"按钮前面

#### Scenario: View Transitions 兼容
- **WHEN** 页面通过 Astro View Transitions 导航
- **THEN** 切换功能 SHALL 重新初始化并正常工作

#### Scenario: 动态创建按钮的事件绑定
- **WHEN** 客户端 JavaScript 动态创建源码代码块和"图片"按钮
- **THEN** 系统 SHALL 使用事件委托机制确保动态创建的"图片"按钮点击事件能正确触发
- **AND** 点击"图片"按钮 SHALL 成功切换回图片视图

### Requirement: 插件配置选项

系统 SHALL 支持自定义配置，允许用户调整服务器地址和输出格式。

#### Scenario: 自定义服务器地址
- **WHEN** 用户在配置中指定 `server` 选项
- **THEN** 系统使用指定的服务器地址替代默认的 `https://www.plantuml.com/plantuml`

#### Scenario: 自定义输出格式
- **WHEN** 用户在配置中指定 `format` 选项为 `png`
- **THEN** 系统生成 PNG 格式的图片 URL

#### Scenario: 默认配置
- **WHEN** 用户未提供配置
- **THEN** 系统使用默认服务器 `https://www.plantuml.com/plantuml` 和默认格式 `svg`

### Requirement: 样式集成

系统 SHALL 提供 CSS 样式，确保 PlantUML 图和切换功能的视觉效果。

#### Scenario: 图片模式样式
- **WHEN** 显示图片视图
- **THEN** 图片 SHALL 无边框包裹，直接居中显示
- **AND** 图片 SHALL 自适应容器宽度，最大宽度 100%

#### Scenario: 悬浮按钮样式
- **WHEN** 鼠标悬停在图片区域
- **THEN** 右上角切换按钮 SHALL 显示（默认透明）

#### Scenario: 源码样式一致性
- **WHEN** 显示源码视图
- **THEN** 源码代码块 SHALL 与其他代码块样式完全一致
- **AND** 包含工具栏、语言标签、行号、复制按钮

#### Scenario: 暗色模式兼容
- **WHEN** 页面处于暗色模式
- **THEN** 图片 SHALL 保持白色背景以确保可读性
