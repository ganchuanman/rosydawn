## ADDED Requirements

### Requirement: 分类映射表维护

系统 SHALL 在代码中维护意图到类别的映射表。

#### Scenario: CATEGORY_MAP 数据结构
- **WHEN** 系统启动时
- **THEN** `src/ai/intent-recognition.ts` 中定义 CATEGORY_MAP
- **THEN** 映射表包含所有已实现意图的分类信息

#### Scenario: 新意图注册到分类
- **WHEN** 开发者添加新 workflow
- **THEN** 必须在 CATEGORY_MAP 中添加对应的分类条目
- **THEN** 条目包含：intent 名称、category、description

### Requirement: 命令分类显示

系统 SHALL 在帮助信息中按类别组织命令显示。

#### Scenario: REPL 模式按类别列出能力
- **WHEN** 用户在 REPL 中输入 "能做什么？"
- **THEN** AI 响应按 category 分组显示能力
- **THEN** 分组顺序为：content、deploy、system

#### Scenario: 命令行模式按类别显示命令
- **WHEN** 用户执行 `rosydawn --help`
- **THEN** 帮助文本按类别分组显示命令
- **THEN** 每个类别有清晰的标题和描述

### Requirement: 向后兼容的命令别名

系统 SHALL 支持短命令别名以保持向后兼容。

#### Scenario: content 类别名名
- **WHEN** 用户执行 `rosydawn new`
- **THEN** 系统识别为 `rosydawn content new`
- **THEN** 行为与完整命令一致

#### Scenario: 别名冲突检测
- **WHEN** 注册新别名时
- **THEN** 系统检查是否与现有命令冲突
- **THEN** 如果冲突则抛出错误并提示开发者
