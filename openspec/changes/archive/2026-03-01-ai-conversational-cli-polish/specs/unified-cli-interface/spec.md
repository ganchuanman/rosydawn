## ADDED Requirements

### Requirement: CommandRegistry 类实现

系统 SHALL 实现 CommandRegistry 类来统一管理命令映射。

#### Scenario: 命令注册
- **WHEN** 系统初始化时
- **THEN** 所有可用命令通过 `registry.register()` 注册
- **THEN** 注册信息包含：command、workflow、description、aliases、options

#### Scenario: 命令解析
- **WHEN** 用户执行 `rosydawn new --topic "test"`
- **THEN** CommandRegistry 解析 `new` 为 `content:new`
- **THEN** 返回对应的 CommandConfig

#### Scenario: 别名注册
- **WHEN** 调用 `registry.alias('new', 'content:new')`
- **THEN** `new` 被注册为 `content:new` 的别名
- **THEN** 两种命令形式等价

### Requirement: 完整的命令映射表

系统 SHALL 维护所有命令的完整映射表。

| 命令 | 别名 | Workflow | 类别 |
|------|------|----------|------|
| `content:new` | `new` | create-article | content |
| `content:publish` | `publish` | publish-article | content |
| `deploy:apply` | `deploy` | deploy | deploy |
| `dev:start` | `dev` | start-dev | system |
| `build:run` | `build` | build | system |
| `status:check` | `status` | check-status | system |

#### Scenario: 映射表完整性验证
- **WHEN** 系统启动时
- **THEN** 验证所有已实现 workflow 都有对应的命令映射
- **THEN** 如果存在未映射的 workflow 则发出警告

### Requirement: 参数解析和验证

系统 SHALL 解析和验证命令行参数。

#### Scenario: 参数类型验证
- **WHEN** 用户执行 `rosydawn content new --topic 123`（topic 应为字符串）
- **THEN** 系统自动转换为字符串 "123"
- **THEN** 传递给 workflow 的参数类型正确

#### Scenario: 必填参数检查
- **WHEN** 用户执行缺少必填参数的命令
- **THEN** 系统显示错误信息和正确用法
- **THEN** 系统以非零状态码退出

#### Scenario: 可选参数默认值
- **WHEN** 用户省略可选参数
- **THEN** 系统使用配置的默认值
- **THEN** workflow 接收完整的参数对象

## MODIFIED Requirements

### Requirement: 命令与 Workflow 映射

系统 SHALL 维护命令行命令到 Workflow 的完整映射表。（从父 spec 扩展）

| 命令行命令 | 别名 | Workflow | Intent | 类别 |
|-----------|------|----------|--------|------|
| `rosydawn content new` | `rosydawn new` | create-article | create_article | content |
| `rosydawn content publish` | `rosydawn publish` | publish-article | publish_article | content |
| `rosydawn deploy apply` | `rosydawn deploy` | deploy | deploy | deploy |
| `rosydawn dev start` | `rosydawn dev` | start-dev | start_dev | system |
| `rosydawn build run` | `rosydawn build` | build | build | system |
| `rosydawn status check` | `rosydawn status` | check-status | check_status | system |

#### Scenario: 命令别名支持
- **WHEN** 用户执行 `rosydawn new --topic "WebSocket"`
- **THEN** 系统识别 `new` 为 `content:new` 的别名
- **THEN** 行为与 `rosydawn content:new --topic "WebSocket"` 完全一致

#### Scenario: 命令别名支持（已存在场景的增强）
- **WHEN** 用户执行 `rosydawn publish`（省略 content）
- **THEN** 系统识别为 `content:publish` 的别名
- **THEN** 行为与完整命令一致
