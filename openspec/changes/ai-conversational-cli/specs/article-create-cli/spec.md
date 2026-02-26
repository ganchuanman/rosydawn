## MODIFIED Requirements

### Requirement: 交互式主题输入

系统 SHALL 从 REPL AI 识别或命令行参数接收主题输入。

#### Scenario: REPL 模式 - AI 识别主题
- **WHEN** 用户在 REPL 中输入 "创建一篇关于 WebSocket 的文章"
- **THEN** AI 识别 intent 为 `create_article`，params 为 `{ topic: "WebSocket" }`
- **THEN** workflow 从 AI 识别结果获取 topic 参数

#### Scenario: 命令行模式 - 直接参数
- **WHEN** 用户执行 `rosydawn content new --topic "WebSocket 实时通信"`
- **THEN** 系统从命令行参数解析 topic
- **THEN** workflow 直接获取 topic 参数

#### Scenario: 缺失主题 - REPL 追问
- **WHEN** AI 识别到 `create_article` 意图但 topic 缺失
- **THEN** 系统提示用户 "请告诉我文章的主题是什么？"
- **THEN** 用户在下一轮 REPL 输入主题

### Requirement: 基于 Workflow 的执行

系统 SHALL 通过 workflow 引擎执行文章创建，而非直接脚本执行。

#### Scenario: Workflow 注册
- **WHEN** 系统初始化
- **THEN** `create-article` workflow 被注册到 workflow 注册表
- **THEN** workflow 映射到 intent `create_article`

#### Scenario: Workflow 步骤执行
- **WHEN** create-article workflow 被触发
- **THEN** 系统执行步骤：inputTopic → generateMetadata → checkDirectory → confirmCreation → createFile → startDevServer
- **THEN** 每个 step 接收前序 step 的上下文数据

### Requirement: 显示完成摘要

系统 SHALL 在完成后显示包含文件路径和预览 URL 的摘要。

#### Scenario: REPL 模式响应
- **WHEN** 所有步骤在 REPL 模式下成功完成
- **THEN** 系统显示自然语言响应 "已创建文章《{title}》..."
- **THEN** 响应包含文件路径和预览 URL

#### Scenario: 命令行模式输出
- **WHEN** 所有步骤在命令行模式下成功完成
- **THEN** 系统显示结构化输出，包含文件路径和预览 URL
- **THEN** 输出格式与现有行为保持兼容
