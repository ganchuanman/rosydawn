## ADDED Requirements

### Requirement: 意图识别

系统 SHALL 将用户的自然语言输入解析为结构化的意图和参数。

#### Scenario: 识别创建文章意图
- **WHEN** 用户输入 "创建一篇关于 WebSocket 的文章"
- **THEN** 系统识别 intent 为 `create_article`，params 为 `{ topic: "WebSocket" }`

#### Scenario: 识别发布意图
- **WHEN** 用户输入 "发布"
- **THEN** 系统识别 intent 为 `publish_article`，params 为 `{}`

#### Scenario: 识别部署意图
- **WHEN** 用户输入 "部署到服务器"
- **THEN** 系统识别 intent 为 `deploy`，params 为 `{}`

#### Scenario: 识别帮助意图
- **WHEN** 用户输入 "这个工具怎么部署？"
- **THEN** 系统识别 intent 为 `help`，params 为 `{ question: "怎么部署" }`

#### Scenario: 识别未知意图
- **WHEN** 用户输入超出系统能力范围的请求（如 "帮我买个咖啡"）
- **THEN** 系统识别 intent 为 `unknown`，并返回提示信息

#### Scenario: 识别启动开发服务器意图
- **WHEN** 用户输入 "启动开发服务器" 或 "本地预览"
- **THEN** 系统识别 intent 为 `start_dev`，params 为 `{}`

#### Scenario: 识别构建意图
- **WHEN** 用户输入 "构建项目" 或 "打包"
- **THEN** 系统识别 intent 为 `build`，params 为 `{}`

#### Scenario: 识别检查状态意图
- **WHEN** 用户输入 "检查状态" 或 "当前什么情况"
- **THEN** 系统识别 intent 为 `check_status`，params 为 `{}`

#### Scenario: 识别部署意图
- **WHEN** 用户输入 "部署到服务器" 或 "发布到线上"
- **THEN** 系统识别 intent 为 `deploy`，params 为 `{}`

### Requirement: 参数缺失检测

系统 SHALL 检测必需参数是否缺失，并生成追问提示。

#### Scenario: 检测主题缺失
- **WHEN** 用户输入 "创建文章" 但未提供主题
- **THEN** 系统返回 missingParams 包含 `topic`，并生成追问 "请告诉我文章的主题是什么？"

#### Scenario: 检测上下文缺失
- **WHEN** 用户输入 "发布" 但没有未发布的文章变更
- **THEN** 系统返回 followUp 建议 "没有找到未发布的文章变更，你是要部署吗？"

### Requirement: AI 客户端配置

系统 SHALL 复用项目现有的 OpenAI 兼容 API 配置。

#### Scenario: 使用环境变量配置
- **WHEN** 系统初始化 AI 客户端
- **THEN** 系统从 `.env` 读取 `OPENAI_API_KEY` 和 `OPENAI_BASE_URL`

#### Scenario: 支持多种 AI 提供商
- **WHEN** `OPENAI_BASE_URL` 指向不同的服务商（OpenAI/Azure/DeepSeek/Ollama）
- **THEN** 系统能够正常调用对应的 API

### Requirement: 知识库注入

系统 SHALL 在调用 AI 时注入知识库上下文，确保 AI 基于实际能力回答。

#### Scenario: 注入动态知识
- **WHEN** 调用意图识别 API
- **THEN** System Prompt 包含从 Workflow 定义提取的意图列表和参数说明

#### Scenario: 注入静态知识
- **WHEN** 调用意图识别 API
- **THEN** System Prompt 包含静态知识（部署说明、常见问题等）

### Requirement: 错误处理

系统 SHALL 优雅处理 AI 服务调用失败的情况。

#### Scenario: API 超时
- **WHEN** AI API 调用超时（超过 30 秒未响应）
- **THEN** 系统显示友好的错误提示 "AI 服务响应超时，请稍后重试"
- **THEN** 系统不崩溃，用户可重新输入

#### Scenario: API 认证失败
- **WHEN** `OPENAI_API_KEY` 未配置或无效
- **THEN** 系统显示错误提示 "请检查 OPENAI_API_KEY 环境变量配置"
- **THEN** 系统建议用户使用命令行模式

#### Scenario: API 服务不可用
- **WHEN** AI 服务返回 5xx 错误或网络不可达
- **THEN** 系统显示错误提示 "AI 服务暂时不可用"
- **THEN** 系统建议用户使用命令行模式绕过 AI

#### Scenario: 响应格式错误
- **WHEN** AI 返回的内容无法解析为结构化意图
- **THEN** 系统提示用户换一种表达方式
- **THEN** 系统记录原始响应用于调试
