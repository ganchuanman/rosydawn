## MODIFIED Requirements

### Requirement: REPL 模式中的 AI 帮助

系统 SHALL 通过 AI 意图识别提供对话式帮助。

#### Scenario: 自然语言帮助查询
- **WHEN** 用户在 REPL 中输入 "这个工具怎么用？"
- **THEN** AI 识别 intent 为 `help`
- **THEN** 系统基于知识库返回上下文相关的帮助

#### Scenario: 特定能力查询
- **WHEN** 用户输入 "怎么部署？"
- **THEN** AI 识别 help 意图，主题为 "deploy"
- **THEN** 系统解释部署能力和选项

#### Scenario: 未知能力查询
- **WHEN** 用户询问系统无法做到的事情
- **THEN** AI 回复解释可用能力
- **THEN** 响应引导用户了解可以做什么

### Requirement: 命令行模式中的传统帮助

系统 SHALL 为命令行模式保留结构化的帮助输出。

#### Scenario: 命令行帮助
- **WHEN** 用户执行 `rosydawn --help`
- **THEN** 系统显示命令行模式的结构化帮助
- **THEN** 帮助包含所有可用命令及描述

#### Scenario: 命令特定帮助
- **WHEN** 用户执行 `rosydawn content new --help`
- **THEN** 系统显示该命令的详细帮助
- **THEN** 帮助显示用法、参数和示例

### Requirement: 知识库作为帮助来源

系统 SHALL 使用生成的知识库作为 AI 帮助响应的来源。

#### Scenario: 动态帮助内容
- **WHEN** 新 workflow 被添加
- **THEN** 知识库自动包含新能力
- **THEN** AI 帮助响应反映当前系统能力

#### Scenario: 静态帮助内容
- **WHEN** 用户询问关于工具的一般问题
- **THEN** AI 使用 knowledge/static.md 中的静态知识响应
- **THEN** 响应包含部署说明、常见问题等

## REMOVED Requirements

### Requirement: 帮助命令实现为独立脚本
**原因**: 帮助现在通过 REPL 模式中的 AI 对话提供，并集成到统一 CLI 的命令行模式中。

**迁移**: 使用 REPL 模式获取交互式帮助（`rosydawn` 然后提问），或使用命令行模式获取结构化帮助（`rosydawn --help`）。

### Requirement: 用于 AI 理解的结构化输出格式
**原因**: 帮助系统现在是 AI 驱动的，不再需要供 AI 消费的结构化输出。

**迁移**: AI 直接使用知识库来理解能力。
