## ADDED Requirements

### Requirement: 动态知识提取

系统 SHALL 从 Workflow 定义自动提取知识库内容。

#### Scenario: 提取意图列表
- **WHEN** 知识库生成器运行
- **THEN** 系统从所有已注册 workflows 提取 intent 名称和描述

#### Scenario: 提取参数定义
- **WHEN** 知识库生成器运行
- **THEN** 系统从 workflow 的 params 定义提取参数名称、类型、是否必需

#### Scenario: 提取示例
- **WHEN** workflow 定义了 examples
- **THEN** 系统将示例包含在知识库中

### Requirement: 静态知识加载

系统 SHALL 从文件加载手动维护的静态知识。

#### Scenario: 加载静态知识文件
- **WHEN** 知识库生成器运行
- **THEN** 系统读取 `knowledge/static.md` 文件内容

#### Scenario: 静态知识内容
- **WHEN** 静态知识被加载
- **THEN** 内容包含部署说明、常见问题、使用指南等

### Requirement: 知识合并

系统 SHALL 将动态知识和静态知识合并为完整的 System Prompt。

#### Scenario: 合并知识
- **WHEN** 生成最终知识库
- **THEN** 系统将动态知识（意图、参数）和静态知识合并

#### Scenario: 格式化为 Prompt
- **WHEN** 知识合并完成
- **THEN** 系统将知识格式化为适合 AI 理解的 Prompt 格式

### Requirement: 知识缓存

系统 SHALL 缓存生成的知识库，避免重复计算。

#### Scenario: 首次生成
- **WHEN** 系统首次需要知识库
- **THEN** 系统生成并缓存知识库

#### Scenario: 使用缓存
- **WHEN** 知识库已缓存
- **THEN** 系统直接使用缓存的知识库，不重新生成

#### Scenario: 刷新缓存
- **WHEN** workflow 定义发生变化
- **THEN** 系统在下次启动时重新生成知识库

### Requirement: 知识库格式

系统 SHALL 生成结构化的知识库，便于 AI 理解。

#### Scenario: JSON Schema 格式
- **WHEN** 生成意图定义
- **THEN** 使用 JSON Schema 格式描述参数结构

#### Scenario: 示例格式
- **WHEN** 包含示例
- **THEN** 示例使用 "用户输入 → 意图 + 参数" 的格式
