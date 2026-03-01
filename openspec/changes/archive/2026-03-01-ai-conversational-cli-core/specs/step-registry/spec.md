## ADDED Requirements

### Requirement: Step 定义

系统 SHALL 提供结构化的 Step 定义机制，每个 Step 包含类型、名称、执行函数。

#### Scenario: 定义 Step
- **WHEN** 开发者使用 `defineStep()` 定义步骤
- **THEN** 系统创建包含 type、name、execute 的步骤定义

#### Scenario: Step 类型约束
- **WHEN** 定义 Step 时指定类型
- **THEN** 类型必须是 `validator`、`processor`、`action`、`notifier` 之一

### Requirement: Step 注册

系统 SHALL 提供步骤注册表，支持按名称查找和复用。

#### Scenario: 注册 Step
- **WHEN** 开发者调用 `registerStep(step)`
- **THEN** step 被添加到注册表，可通过名称查找

#### Scenario: 查找 Step
- **WHEN** Workflow 定义中引用 step 名称
- **THEN** 系统能从注册表中找到对应的 step 定义

#### Scenario: 重复注册警告
- **WHEN** 尝试注册同名 step
- **THEN** 系统发出警告并覆盖原有定义

### Requirement: Step 分类

系统 SHALL 按 type 分类管理 steps，便于查找和理解。

#### Scenario: 按 type 分类存储
- **WHEN** steps 被注册
- **THEN** 系统按 validators/processors/actions/notifiers 分类存储

#### Scenario: 列出某类型所有 steps
- **WHEN** 需要查看某类型的所有可用 steps
- **THEN** 系统返回该类型下的所有 step 定义

### Requirement: 内置 Steps - Validators

系统 SHALL 提供一组内置的 validator steps，用于前置条件校验。

#### Scenario: checkGitChanges step
- **WHEN** 使用 `checkGitChanges` validator
- **THEN** 系统检查是否存在未提交的 Git 变更
- **THEN** 若有变更，返回变更列表；若无变更，中断流程并提示

#### Scenario: getChangedArticles step
- **WHEN** 使用 `getChangedArticles` validator
- **THEN** 系统检测内容目录中的文章变更（新增或修改的 markdown 文件）
- **THEN** 若无变更，中断流程并提示"没有找到未发布的文章变更"

#### Scenario: checkDirectory step
- **WHEN** 使用 `checkDirectory` validator
- **THEN** 系统检查目标目录是否存在，不存在则创建

### Requirement: 内置 Steps - Processors

系统 SHALL 提供一组内置的 processor steps，用于数据转换和准备。

#### Scenario: generateMetadata step
- **WHEN** 使用 `generateMetadata` processor
- **THEN** 系统调用 AI 生成文章的 title、description、tags
- **THEN** 生成的元数据写入上下文供后续 steps 使用

#### Scenario: collectExistingTags step
- **WHEN** 使用 `collectExistingTags` processor
- **THEN** 系统扫描已发布文章，收集所有已使用的标签
- **THEN** 标签列表写入上下文供 generateMetadata 使用

#### Scenario: inputTopic step
- **WHEN** 使用 `inputTopic` processor 且 topic 参数缺失
- **THEN** 系统将参数缺失标记写入上下文，触发 REPL 追问

#### Scenario: updateFrontmatter step
- **WHEN** 使用 `updateFrontmatter` processor
- **THEN** 系统将生成的元数据更新到文章的 frontmatter 中

### Requirement: 内置 Steps - Actions

系统 SHALL 提供一组内置的 action steps，用于执行核心操作。

#### Scenario: createFile step
- **WHEN** 使用 `createFile` action
- **THEN** 系统根据模板创建新的文章 markdown 文件
- **THEN** 文件路径写入上下文

#### Scenario: commitAndPush step
- **WHEN** 使用 `commitAndPush` action
- **THEN** 系统执行 git add、commit、push 操作
- **THEN** 提交信息基于操作类型自动生成

#### Scenario: startDevServer step
- **WHEN** 使用 `startDevServer` action
- **THEN** 系统启动本地开发服务器
- **THEN** 服务器 URL 写入上下文

### Requirement: 内置 Steps - Notifiers

系统 SHALL 提供一组内置的 notifier steps，用于用户交互和通知。

#### Scenario: confirmCreation step
- **WHEN** 使用 `confirmCreation` notifier
- **THEN** 系统显示即将创建的文章信息，请求用户确认
- **THEN** 用户确认后继续，取消则中断流程

#### Scenario: editConfirm step
- **WHEN** 使用 `editConfirm` notifier
- **THEN** 系统打开编辑器让用户确认/修改生成的元数据
- **THEN** 用户确认后继续

### Requirement: Step 复用

系统 SHALL 支持同一 step 被多个 workflows 引用。

#### Scenario: 跨 Workflow 复用
- **WHEN** `publish-article` 和 `deploy` workflows 都引用 `checkChanges` step
- **THEN** 两个 workflows 共享同一个 step 定义，避免重复代码
