## ADDED Requirements

### Requirement: 启动开发服务器 Workflow

系统 SHALL 提供 start-dev workflow 用于启动本地开发环境。

#### Scenario: REPL 模式 - AI 识别意图
- **WHEN** 用户在 REPL 中输入 "启动开发服务器" 或 "本地预览"
- **THEN** AI 识别 intent 为 `start_dev`
- **THEN** workflow 引擎触发 `start-dev` workflow

#### Scenario: 命令行模式
- **WHEN** 用户执行 `rosydawn dev`
- **THEN** 系统直接触发 `start-dev` workflow
- **THEN** 不需要调用 AI

#### Scenario: Workflow 步骤执行
- **WHEN** start-dev workflow 被触发
- **THEN** 系统执行步骤：checkPort → startServer
- **THEN** 若端口被占用，提示用户选择其他端口

#### Scenario: REPL 模式响应
- **WHEN** 开发服务器启动成功（REPL 模式）
- **THEN** 系统显示 "开发服务器已启动"
- **THEN** 响应包含本地访问 URL

### Requirement: 构建项目 Workflow

系统 SHALL 提供 build workflow 用于构建生产版本。

#### Scenario: REPL 模式 - AI 识别意图
- **WHEN** 用户在 REPL 中输入 "构建项目" 或 "打包"
- **THEN** AI 识别 intent 为 `build`
- **THEN** workflow 引擎触发 `build` workflow

#### Scenario: 命令行模式
- **WHEN** 用户执行 `rosydawn build`
- **THEN** 系统直接触发 `build` workflow
- **THEN** 不需要调用 AI

#### Scenario: Workflow 步骤执行
- **WHEN** build workflow 被触发
- **THEN** 系统执行步骤：cleanDist → compileProject → optimizeAssets
- **THEN** 构建产物输出到 dist 目录

#### Scenario: 构建失败
- **WHEN** 构建过程中发生错误
- **THEN** 系统显示错误信息和错误位置
- **THEN** 系统以非零状态码退出（命令行模式）

#### Scenario: REPL 模式响应
- **WHEN** 构建成功（REPL 模式）
- **THEN** 系统显示 "构建完成"
- **THEN** 响应包含输出目录路径和文件大小统计

### Requirement: 检查状态 Workflow

系统 SHALL 提供 check-status workflow 用于检查项目当前状态。

#### Scenario: REPL 模式 - AI 识别意图
- **WHEN** 用户在 REPL 中输入 "检查状态" 或 "当前什么情况"
- **THEN** AI 识别 intent 为 `check_status`
- **THEN** workflow 引擎触发 `check-status` workflow

#### Scenario: 命令行模式
- **WHEN** 用户执行 `rosydawn status`
- **THEN** 系统直接触发 `check-status` workflow
- **THEN** 不需要调用 AI

#### Scenario: Workflow 步骤执行
- **WHEN** check-status workflow 被触发
- **THEN** 系统执行步骤：checkGitStatus → checkArticleStats → checkDeploymentStatus
- **THEN** 汇总各维度状态信息

#### Scenario: REPL 模式响应
- **WHEN** 状态检查完成（REPL 模式）
- **THEN** 系统以自然语言显示状态摘要
- **THEN** 摘要包含：Git 状态、文章统计、最近部署时间

#### Scenario: 命令行模式响应
- **WHEN** 状态检查完成（命令行模式）
- **THEN** 系统以结构化格式显示状态
- **THEN** 格式便于脚本解析（可选 JSON 输出）
