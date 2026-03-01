# REPL Interface Specification

## Requirements

### Requirement: REPL 启动脚本

系统 SHALL 提供启动 REPL 的 npm 脚本入口。

#### Scenario: 通过 npm run 启动 REPL
- **WHEN** 用户执行 `npm run repl`
- **THEN** 系统启动 REPL 交互模式

#### Scenario: REPL 显示欢迎信息
- **WHEN** REPL 启动
- **THEN** 系统显示欢迎信息（包括版本号和简要说明）

### Requirement: 优雅退出处理

系统 SHALL 支持多种方式优雅退出 REPL。

#### Scenario: Ctrl+C 退出
- **WHEN** 用户在输入提示时按 Ctrl+C
- **THEN** 系统显示 "👋 再见！" 并正常退出（退出码 0）

#### Scenario: Ctrl+D 退出
- **WHEN** 用户在输入提示时按 Ctrl+D
- **THEN** 系统显示 "👋 再见！" 并正常退出（退出码 0）

#### Scenario: exit 命令退出
- **WHEN** 用户输入 `exit`、`quit` 或 `q`
- **THEN** 系统显示 "👋 再见！" 并正常退出（退出码 0）

### Requirement: 用户输入循环

系统 SHALL 持续接收用户输入，直到用户主动退出。

#### Scenario: 接收用户输入
- **WHEN** REPL 显示输入提示 `> `
- **THEN** 系统等待用户输入并按回车提交

#### Scenario: 空输入处理
- **WHEN** 用户输入空行
- **THEN** 系统重新显示输入提示，不执行任何操作

### Requirement: 输出格式化

系统 SHALL 将执行结果以友好的文本格式呈现给用户。

#### Scenario: 成功响应
- **WHEN** 操作执行成功
- **THEN** 系统显示简洁的成功信息，包含关键结果（如创建的文件路径）

#### Scenario: 错误响应
- **WHEN** 操作执行失败
- **THEN** 系统显示错误原因，并提供可能的解决方案

#### Scenario: 追问参数
- **WHEN** AI 识别到必需参数缺失
- **THEN** 系统以对话方式询问用户补充参数

### Requirement: 命令行模式兼容

系统 SHALL 支持通过命令行参数直接执行命令，绕过 REPL 和 AI。

#### Scenario: 命令行直接执行
- **WHEN** 用户执行 `rosydawn <command> [args]`
- **THEN** 系统直接执行对应命令，不启动 REPL

#### Scenario: 命令行模式不需要 AI
- **WHEN** 用户通过命令行模式执行命令
- **THEN** 系统不调用 AI 服务，使用传统参数解析方式

#### Scenario: 显示版本
- **WHEN** 用户执行 `rosydawn --version`
- **THEN** 系统显示当前版本号并退出

#### Scenario: 显示帮助
- **WHEN** 用户执行 `rosydawn --help`
- **THEN** 系统显示帮助信息（包括 REPL 模式和命令行模式的使用说明）并退出

### Requirement: Mock Workflow 测试

系统 SHALL 使用 Mock Workflows 验证 REPL 功能，不执行真实操作。

#### Scenario: 注册 Mock Workflow
- **WHEN** REPL 启动
- **THEN** 系统自动注册以下 Mock Workflows：
  - `mock_create_article`: 创建文章（Mock，仅打印识别结果）
  - `mock_list_articles`: 列出文章（Mock，返回空列表）
  - `mock_publish`: 发布文章（Mock，仅打印识别结果）

#### Scenario: Mock Workflow 执行结果
- **WHEN** 用户输入触发 Mock Workflow
- **THEN** 系统显示识别到的意图和参数
- **THEN** 系统显示 "(当前为 Mock Workflow，未执行真实操作)"
