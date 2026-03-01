## ADDED Requirements

### Requirement: 命令行参数解析

系统 SHALL 使用最小化参数解析器处理命令行输入。

#### Scenario: 基础参数解析
- **WHEN** 用户执行 `rosydawn content new --topic "WebSocket" --tags "network,realtime"`
- **THEN** 系统解析为：
  - command: "content new"
  - params: { topic: "WebSocket", tags: ["network", "realtime"] }

#### Scenario: 参数格式标准化
- **WHEN** 系统解析命令行参数
- **THEN** `--key value` 格式的参数转换为 `{ key: value }`
- **THEN** `--key` 格式的布尔参数转换为 `{ key: true }`
- **THEN** 多值参数（如 tags）使用逗号分隔并转换为数组

#### Scenario: 参数类型推断
- **WHEN** 参数值为 "true" 或 "false"
- **THEN** 系统转换为布尔值
- **WHEN** 参数值为数字字符串（如 "123"）
- **THEN** 系统转换为数字
- **WHEN** 参数值为普通字符串
- **THEN** 系统保持字符串类型

### Requirement: 命令到 Workflow 的参数映射

系统 SHALL 将命令行参数映射为 Workflow 期望的格式。

#### Scenario: 必填参数验证
- **WHEN** 用户执行 `rosydawn content new`（缺少 --topic）
- **THEN** 系统查询 create-article workflow 的 params.required
- **THEN** 系统检测到 topic 缺失
- **THEN** 系统显示错误：`Error: Missing required argument: topic`
- **THEN** 系统显示用法提示：`Usage: rosydawn content new --topic <topic>`
- **THEN** 系统以状态码 1 退出

#### Scenario: 可选参数处理
- **WHEN** 用户执行 `rosydawn content new --topic "WebSocket"`（未提供 --tags）
- **THEN** 系统查询 create-article workflow 的 params.optional
- **THEN** 系统将 tags 设置为 undefined 或默认值
- **THEN** Workflow 接收 `{ topic: "WebSocket", tags: undefined }`

#### Scenario: 参数别名支持
- **WHEN** 用户执行 `rosydawn content new -t "WebSocket"`
- **THEN** 系统识别 `-t` 为 `--topic` 的别名
- **THEN** 系统将参数映射为 `{ topic: "WebSocket" }`

### Requirement: 双模式入口实现

系统 SHALL 在单一入口文件中判断运行模式。

#### Scenario: 无参数启动 REPL
- **WHEN** 用户执行 `rosydawn`（process.argv.length === 2）
- **THEN** 系统启动 REPL 模式
- **THEN** 系统加载 AI 意图识别器
- **THEN** 系统加载知识库
- **THEN** 系统注册 Workflows
- **THEN** 系统进入交互循环

#### Scenario: 带参数启动命令行模式
- **WHEN** 用户执行 `rosydawn content new --topic "WebSocket"`（process.argv.length > 2）
- **THEN** 系统启动命令行模式
- **THEN** 系统跳过 REPL 和 AI 意图识别
- **THEN** 系统解析命令行参数
- **THEN** 系统直接路由到对应 Workflow

#### Scenario: 帮助标志处理
- **WHEN** 用户执行 `rosydawn --help` 或 `rosydawn -h`
- **THEN** 系统显示帮助信息（即使是命令行模式）
- **THEN** 帮助信息包含：
  - REPL 模式说明
  - 可用命令列表
  - 常见示例
- **THEN** 系统以状态码 0 退出

### Requirement: 错误处理和用户反馈

系统 SHALL 提供清晰的错误消息和恢复建议。

#### Scenario: 无效命令错误
- **WHEN** 用户执行 `rosydawn invalid-command`
- **THEN** 系统显示错误：`Error: Unknown command 'invalid-command'`
- **THEN** 系统显示可用命令：`Available commands: content new, content publish, ...`
- **THEN** 系统以状态码 1 退出

#### Scenario: 参数类型错误
- **WHEN** 用户执行 `rosydawn content new --topic 123`（workflow 期望字符串）
- **THEN** 系统尝试将 123 转换为字符串 "123"
- **THEN** 系统继续执行（宽松类型检查）

#### Scenario: Workflow 执行失败
- **WHEN** Workflow 执行过程中抛出错误
- **THEN** 系统捕获错误并显示用户友好的消息
- **THEN** 系统显示错误上下文（哪个 Step 失败）
- **THEN** 系统以状态码 1 退出

### Requirement: 命令路由表维护

系统 SHALL 在代码中维护命令到 Workflow 的映射表。

#### Scenario: 路由表定义
- **WHEN** 系统初始化
- **THEN** 系统加载路由表：
  ```typescript
  const ROUTES = {
    'content new': {
      workflow: 'create-article',
      intent: 'create_article',
      description: '创建一篇新文章'
    },
    'content publish': {
      workflow: 'publish-article',
      intent: 'publish_article',
      description: '发布文章到服务器'
    },
    // ... 其他命令
  };
  ```

#### Scenario: 路由查找
- **WHEN** 用户执行 `rosydawn content new --topic "WebSocket"`
- **THEN** 系统从路由表查找 "content new"
- **THEN** 系统获取 workflow 名称 "create-article"
- **THEN** 系统从 Workflow 注册表获取 Workflow 定义
- **THEN** 系统执行 Workflow

## MODIFIED Requirements

### Requirement: 双模式入口

系统 SHALL 从同一入口支持 REPL（AI 对话）模式和命令行模式。

#### Scenario: 进入 REPL 模式
- **WHEN** 用户执行 `rosydawn`（无参数）
- **THEN** 系统启动 REPL 并显示欢迎信息
- **THEN** 系统进入交互式输入循环
- **THEN** REPL 入口文件为 `src/cli/repl.ts`

#### Scenario: 命令行模式
- **WHEN** 用户执行 `rosydawn <command> [args]`
- **THEN** 系统绕过 REPL 和 AI
- **THEN** 系统直接路由到对应的命令处理器
- **THEN** 命令行入口文件为 `src/cli/cli.ts`

#### Scenario: REPL 中的帮助
- **WHEN** 用户执行 `rosydawn --help`
- **THEN** 系统显示两种模式的帮助
- **THEN** 帮助说明 REPL 模式用法和命令行模式语法
- **THEN** 帮助内容从 `src/cli/help.ts` 加载

### Requirement: REPL 中的意图路由

系统 SHALL 基于 AI 意图识别将用户输入路由到对应的 workflow。

#### Scenario: 意图到 workflow 映射
- **WHEN** AI 识别出意图
- **THEN** 系统按意图名称查找 workflow
- **THEN** 系统使用识别的参数执行 workflow
- **THEN** 意图名称格式为 snake_case，Workflow 名称格式为 kebab-case

#### Scenario: 未知意图处理
- **WHEN** AI 无法确定意图或意图超出范围
- **THEN** 系统显示友好的响应，解释可用能力
- **THEN** 系统不崩溃或显示技术错误
- **THEN** 系统提示用户尝试其他表达方式

### Requirement: 命令行模式中的命令路由

系统 SHALL 解析命令行参数并路由到对应的处理器。

#### Scenario: 解析命令和参数
- **WHEN** 用户执行 `rosydawn content new --topic "foo"`
- **THEN** 系统解析命令为 `content new`
- **THEN** 系统解析参数为 `{ topic: "foo" }`
- **THEN** 系统从路由表查找 "content new"
- **THEN** 系统触发 create-article workflow

#### Scenario: 无效命令处理
- **WHEN** 用户提供无效命令（如 `rosydawn foo bar`）
- **THEN** 系统显示错误并建议有效命令
- **THEN** 系统以非零状态码退出
- **THEN** 错误消息格式：`Error: Unknown command 'foo bar'. Did you mean 'content new'?`

### Requirement: 命令与 Workflow 映射

系统 SHALL 维护命令行命令到 Workflow 的完整映射表。

#### Scenario: MVP 阶段支持的命令
- **WHEN** 系统初始化
- **THEN** 系统仅注册以下命令映射：
  - `rosydawn content new` → create-article → create_article

#### Scenario: 未实现命令提示
- **WHEN** 用户执行 `rosydawn content publish`（未在 MVP 实现）
- **THEN** 系统显示错误：`Error: Command 'content publish' is not implemented yet`
- **THEN** 系统提示：`This feature will be available in a future update`

#### Scenario: 命令参数传递
- **WHEN** 用户执行 `rosydawn content new --topic "WebSocket"`
- **THEN** 系统将 `--topic` 参数映射为 workflow 的 `topic` 参数
- **THEN** workflow 接收 `{ topic: "WebSocket" }` 作为输入

#### Scenario: 命令别名支持
- **WHEN** 用户执行 `rosydawn new`（省略 content）
- **THEN** 系统识别为 `content new` 的别名
- **THEN** 行为与完整命令一致
- **NOTE**: MVP 阶段可选实现，优先级较低
