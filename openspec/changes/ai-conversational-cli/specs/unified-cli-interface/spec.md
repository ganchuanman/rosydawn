## MODIFIED Requirements

### Requirement: 双模式入口

系统 SHALL 从同一入口支持 REPL（AI 对话）模式和命令行模式。

#### Scenario: 进入 REPL 模式
- **WHEN** 用户执行 `rosydawn`（无参数）
- **THEN** 系统启动 REPL 并显示欢迎信息
- **THEN** 系统进入交互式输入循环

#### Scenario: 命令行模式
- **WHEN** 用户执行 `rosydawn <command> [args]`
- **THEN** 系统绕过 REPL 和 AI
- **THEN** 系统直接路由到对应的命令处理器

#### Scenario: REPL 中的帮助
- **WHEN** 用户执行 `rosydawn --help`
- **THEN** 系统显示两种模式的帮助
- **THEN** 帮助说明 REPL 模式用法和命令行模式语法

### Requirement: REPL 中的意图路由

系统 SHALL 基于 AI 意图识别将用户输入路由到对应的 workflow。

#### Scenario: 意图到 workflow 映射
- **WHEN** AI 识别出意图
- **THEN** 系统按意图名称查找 workflow
- **THEN** 系统使用识别的参数执行 workflow

#### Scenario: 未知意图处理
- **WHEN** AI 无法确定意图或意图超出范围
- **THEN** 系统显示友好的响应，解释可用能力
- **THEN** 系统不崩溃或显示技术错误

### Requirement: 命令行模式中的命令路由

系统 SHALL 解析命令行参数并路由到对应的处理器。

#### Scenario: 解析命令和参数
- **WHEN** 用户执行 `rosydawn content new --topic "foo"`
- **THEN** 系统解析命令为 `content new`
- **THEN** 系统解析 topic 参数
- **THEN** 系统直接触发对应的 workflow

#### Scenario: 无效命令处理
- **WHEN** 用户提供无效命令
- **THEN** 系统显示错误并建议有效命令
- **THEN** 系统以非零状态码退出

### Requirement: 命令与 Workflow 映射

系统 SHALL 维护命令行命令到 Workflow 的完整映射表。

| 命令行命令 | Workflow | Intent |
|-----------|----------|--------|
| `rosydawn content new` | create-article | create_article |
| `rosydawn content publish` | publish-article | publish_article |
| `rosydawn deploy` | deploy | deploy |
| `rosydawn dev` | start-dev | start_dev |
| `rosydawn build` | build | build |
| `rosydawn status` | check-status | check_status |

#### Scenario: 命令参数传递
- **WHEN** 用户执行 `rosydawn content new --topic "WebSocket"`
- **THEN** 系统将 `--topic` 参数映射为 workflow 的 `topic` 参数
- **THEN** workflow 接收 `{ topic: "WebSocket" }` 作为输入

#### Scenario: 命令别名支持
- **WHEN** 用户执行 `rosydawn new`（省略 content）
- **THEN** 系统识别为 `content new` 的别名
- **THEN** 行为与完整命令一致

## REMOVED Requirements

### Requirement: 无功能变更
**原因**: 接口正在从 npm scripts 根本性改变为统一的 CLI 入口点。这不再准确。

**迁移**: 使用双模式入口 - REPL 模式进行对话式交互，命令行模式进行脚本式使用。
