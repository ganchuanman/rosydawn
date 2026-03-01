## ADDED Requirements

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

## REMOVED Requirements

### Requirement: 独立命令行工具

**Reason**: 在本次 change 中专注于功能实现，独立命令配置推迟到后续 change

**Migration**: 使用 `npm run repl` 替代 `rosydawn` 命令
