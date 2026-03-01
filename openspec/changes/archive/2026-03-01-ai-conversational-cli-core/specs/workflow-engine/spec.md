## ADDED Requirements

### Requirement: Workflow 定义

系统 SHALL 提供结构化的 Workflow 定义机制，每个 Workflow 包含名称、描述、意图映射、参数定义和步骤列表。

**命名规范**：
- Workflow 名称：`kebab-case`（如 `create-article`、`start-dev`）
- Intent 名称：`snake_case`（如 `create_article`、`start_dev`）

#### Scenario: 定义 Workflow
- **WHEN** 开发者使用 `defineWorkflow()` 定义工作流
- **THEN** 系统创建包含 name、description、intent、params、steps 的工作流定义

#### Scenario: Workflow 元数据
- **WHEN** Workflow 被注册
- **THEN** 系统提取其名称、描述、intent、参数定义用于知识库生成

### Requirement: Workflow 参数定义

系统 SHALL 支持在 Workflow 中声明参数定义，用于知识库生成和参数校验。

#### Scenario: 声明必需参数
- **WHEN** Workflow 定义 `params.required` 包含 `topic`
- **THEN** 知识库生成器提取 `topic` 为必需参数
- **THEN** AI 意图识别在缺失 `topic` 时返回 `missingParams`

#### Scenario: 声明可选参数
- **WHEN** Workflow 定义 `params.optional` 包含 `dryRun`
- **THEN** 知识库生成器提取 `dryRun` 为可选参数

### Requirement: Step 执行编排

系统 SHALL 按 Step 定义的顺序依次执行，根据 Step 类型处理失败。

#### Scenario: 顺序执行
- **WHEN** Workflow 包含多个 steps
- **THEN** 系统按数组顺序依次执行每个 step

#### Scenario: Validator 失败中断
- **WHEN** 类型为 `validator` 的 step 返回失败
- **THEN** 系统中断执行，返回错误信息

#### Scenario: Processor 失败中断
- **WHEN** 类型为 `processor` 的 step 抛出异常
- **THEN** 系统中断执行，返回错误信息

#### Scenario: Action 失败中断
- **WHEN** 类型为 `action` 的 step 抛出异常
- **THEN** 系统中断执行，返回错误信息

#### Scenario: Notifier 失败不中断
- **WHEN** 类型为 `notifier` 的 step 抛出异常
- **THEN** 系统记录日志，继续执行后续 steps

### Requirement: 上下文传递

系统 SHALL 在 steps 之间传递共享的执行上下文。

#### Scenario: 写入上下文
- **WHEN** 一个 step 返回数据
- **THEN** 数据被写入执行上下文，供后续 steps 读取

#### Scenario: 读取上下文
- **WHEN** 一个 step 需要前置 step 的输出
- **THEN** step 可以从上下文中读取所需数据

### Requirement: Workflow 路由

系统 SHALL 根据意图识别结果路由到对应的 Workflow。

#### Scenario: 意图路由
- **WHEN** AI 识别出 intent 为 `create_article`
- **THEN** 系统查找并执行 `create-article` workflow

#### Scenario: 未找到 Workflow
- **WHEN** intent 对应的 workflow 不存在
- **THEN** 系统返回错误提示

### Requirement: 结果返回

系统 SHALL 收集执行结果并格式化返回给调用方。

#### Scenario: 成功结果
- **WHEN** 所有 steps 执行完成
- **THEN** 系统返回成功状态和关键结果数据

#### Scenario: 失败结果
- **WHEN** 执行过程中断
- **THEN** 系统返回失败状态和错误原因
