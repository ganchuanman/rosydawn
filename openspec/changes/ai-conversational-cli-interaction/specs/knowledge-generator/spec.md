## ADDED Requirements

### Requirement: 构建时生成知识库

系统 SHALL 在项目构建时生成知识库 JSON 文件。

#### Scenario: 生成知识库脚本
- **WHEN** 用户执行 `npm run build:knowledge`
- **THEN** 系统扫描所有已注册 Workflows 并提取元数据
- **THEN** 系统生成 `dist/knowledge-base.json` 文件

#### Scenario: 知识库文件格式
- **WHEN** 知识库生成完成
- **THEN** 文件包含以下字段：
  - `workflows`: Workflow 列表（名称、描述、参数、示例）
  - `projectRules`: 项目特定规则
  - `constraints`: 系统约束
  - `generatedAt`: 生成时间戳

#### Scenario: 知识库文件大小控制
- **WHEN** 知识库生成完成
- **THEN** 系统检查文件大小
- **THEN** 如果超过 50KB，系统显示警告 "知识库较大，可能影响 AI 性能"

### Requirement: 运行时加载知识库

系统 SHALL 在 REPL 启动时加载预构建的知识库。

#### Scenario: 生产环境加载
- **WHEN** `NODE_ENV=production` 且 REPL 启动
- **THEN** 系统从 `dist/knowledge-base.json` 加载知识库

#### Scenario: 知识库文件不存在
- **WHEN** `dist/knowledge-base.json` 不存在
- **THEN** 系统显示错误 "知识库不存在，请先运行 npm run build:knowledge"
- **THEN** 系统退出（退出码 1）

### Requirement: 开发模式实时生成

系统 SHALL 在开发环境下实时生成知识库，方便调试。

#### Scenario: 开发环境实时生成
- **WHEN** `NODE_ENV=development` 且 REPL 启动
- **THEN** 系统显示 "🔄 开发模式：实时生成知识库..."
- **THEN** 系统动态生成知识库（不读取缓存）

#### Scenario: 开发模式启动较慢提示
- **WHEN** 知识库生成耗时超过 2 秒
- **THEN** 系统显示 "知识库生成中，请稍候..."

### Requirement: Workflow 元数据提取

系统 SHALL 从 Workflow 定义提取以下元数据。

#### Scenario: 提取基本信息
- **WHEN** 扫描 Workflow 定义
- **THEN** 系统提取：
  - `name`: Workflow 名称（kebab-case）
  - `description`: 简要描述（从 JSDoc 或注释提取）
  - `intent`: 对应的意图标识

#### Scenario: 提取参数定义
- **WHEN** Workflow 定义了 params
- **THEN** 系统提取每个参数的：
  - `name`: 参数名
  - `type`: 参数类型（string/number/boolean）
  - `required`: 是否必需
  - `description`: 参数说明
  - `default`: 默认值（如果有）

#### Scenario: 提取使用示例
- **WHEN** Workflow 定义了 examples
- **THEN** 系统提取示例列表（自然语言输入示例）

### Requirement: 静态知识文件

系统 SHALL 支持从静态文件加载项目特定知识。

#### Scenario: 静态知识文件路径
- **WHEN** 生成知识库
- **THEN** 系统读取 `knowledge/static.md` 文件（如果存在）

#### Scenario: 静态知识内容格式
- **WHEN** 静态知识文件存在
- **THEN** 文件内容应包括：
  - 项目背景介绍
  - 部署流程说明
  - 常见问题解答
  - 使用注意事项

#### Scenario: 静态知识文件不存在
- **WHEN** `knowledge/static.md` 不存在
- **THEN** 系统使用空字符串作为静态知识
- **THEN** 系统不报错

### Requirement: Mock Workflow 元数据

系统 SHALL 为 Mock Workflows 提供清晰的元数据。

#### Scenario: Mock Workflow 标注
- **WHEN** 提取 Mock Workflow 元数据
- **THEN** 在描述中包含 "[Mock]" 前缀
- **THEN** 示例中标注 "(仅用于测试)"

#### Scenario: Mock Workflow 示例
- **WHEN** 提取 `mock_create_article` 的示例
- **THEN** 示例为：["创建一篇关于 WebSocket 的文章 (Mock)"]

## REMOVED Requirements

### Requirement: 运行时检测文件变化自动刷新

**Reason**: 改为在构建时生成，简化运行时逻辑

**Migration**: 用户需手动执行 `npm run build:knowledge` 更新知识库
