# Test Cases

## 1. Test Strategy

本 change 的测试策略采用**测试金字塔**模型：

- **单元测试**（70%）：覆盖 Workflow 引擎和 Step 注册表的核心逻辑
  - 使用 Vitest 作为测试框架
  - Mock 外部依赖（文件系统、AI 客户端）
  - 测试覆盖率目标：≥ 90%

- **集成测试**（20%）：验证多个组件协作
  - 测试完整的 workflow 执行流程
  - 测试 step 之间的上下文传递
  - 测试错误处理和中断逻辑

- **端到端测试**（10%）：验证真实场景
  - 使用 demo workflow 进行端到端验证
  - 验证 CLI 命令行入口（如果在 Change 2 之前完成）

## 2. Environment & Preconditions

### 环境要求
- Node.js 18+
- TypeScript 5.x（strict mode）
- Vitest 测试框架
- 测试环境变量：无（本 change 不依赖外部服务）

### 数据准备
- 无需真实数据（使用 mock 数据）
- 准备 demo workflow 定义用于测试
- 准备 demo step 定义用于测试

### 系统状态
- 全局 Step 注册表在测试前应清空
- 全局 Workflow 注册表在测试前应清空
- 每个测试用例应独立，不依赖其他测试的状态

## 3. Execution List

### TC-01: 定义 Workflow
- **Target**: workflow-engine/spec.md - Requirement: Workflow 定义 - Scenario: 定义 Workflow
- **Type**: Automated (单元测试)
- **Preconditions**: 无
- **Steps**:
  1. 调用 `defineWorkflow()` 创建工作流
  2. 传入 name='demo-workflow', intent='demo_workflow', steps=[...]
  3. 验证返回的 workflow 对象包含正确的属性
- **Expected Result**:
  - 返回的 workflow 对象包含 name='demo-workflow'
  - 返回的 workflow 对象包含 intent='demo_workflow'
  - 返回的 workflow 对象包含 description（如果提供）
  - 返回的 workflow 对象包含 params 定义（如果提供）
  - 返回的 workflow 对象包含 steps 数组

### TC-02: Workflow 参数定义 - 必需参数
- **Target**: workflow-engine/spec.md - Requirement: Workflow 参数定义 - Scenario: 声明必需参数
- **Type**: Automated (单元测试)
- **Preconditions**: 无
- **Steps**:
  1. 定义 workflow，params.required 包含 'topic'
  2. 验证 params.required 数组包含 'topic'
- **Expected Result**:
  - workflow.params.required 数组包含 'topic'
  - 可以从 workflow 对象中读取参数定义

### TC-03: Workflow 参数定义 - 可选参数
- **Target**: workflow-engine/spec.md - Requirement: Workflow 参数定义 - Scenario: 声明可选参数
- **Type**: Automated (单元测试)
- **Preconditions**: 无
- **Steps**:
  1. 定义 workflow，params.optional 包含 'dryRun'
  2. 验证 params.optional 数组包含 'dryRun'
- **Expected Result**:
  - workflow.params.optional 数组包含 'dryRun'

### TC-04: Step 顺序执行
- **Target**: workflow-engine/spec.md - Requirement: Step 执行编排 - Scenario: 顺序执行
- **Type**: Automated (集成测试)
- **Preconditions**:
  - 定义包含 3 个 steps 的 workflow
  - 每个 step 在执行时记录自己的执行顺序
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证 step 1 在 step 2 之前执行
  3. 验证 step 2 在 step 3 之前执行
- **Expected Result**:
  - steps 按照定义的顺序依次执行
  - 执行顺序可以通过日志或 context 追踪

### TC-05: Validator 失败中断
- **Target**: workflow-engine/spec.md - Requirement: Step 执行编排 - Scenario: Validator 失败中断
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 定义包含 3 个 steps 的 workflow
  - 第 2 个 step 是 validator，返回失败
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证执行在第 2 个 step 后中断
  3. 验证第 3 个 step 未执行
  4. 验证返回结果为失败状态
- **Expected Result**:
  - 执行在第 2 个 step 后停止
  - 返回结果 success=false
  - 返回结果包含错误信息

### TC-06: Processor 失败中断
- **Target**: workflow-engine/spec.md - Requirement: Step 执行编排 - Scenario: Processor 失败中断
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 定义包含 3 个 steps 的 workflow
  - 第 2 个 step 是 processor，抛出异常
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证执行在第 2 个 step 后中断
  3. 验证第 3 个 step 未执行
  4. 验证返回结果为失败状态
- **Expected Result**:
  - 执行在第 2 个 step 后停止
  - 返回结果 success=false
  - 返回结果包含异常信息

### TC-07: Action 失败中断
- **Target**: workflow-engine/spec.md - Requirement: Step 执行编排 - Scenario: Action 失败中断
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 定义包含 3 个 steps 的 workflow
  - 第 2 个 step 是 action，抛出异常
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证执行在第 2 个 step 后中断
  3. 验证第 3 个 step 未执行
  4. 验证返回结果为失败状态
- **Expected Result**:
  - 执行在第 2 个 step 后停止
  - 返回结果 success=false
  - 返回结果包含异常信息

### TC-08: Notifier 失败不中断
- **Target**: workflow-engine/spec.md - Requirement: Step 执行编排 - Scenario: Notifier 失败不中断
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 定义包含 3 个 steps 的 workflow
  - 第 2 个 step 是 notifier，抛出异常
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证第 3 个 step 仍然执行
  3. 验证返回结果为成功状态
  4. 验证日志中记录了 notifier 失败信息
- **Expected Result**:
  - 执行继续，第 3 个 step 正常执行
  - 返回结果 success=true
  - 日志包含 notifier 失败的错误信息

### TC-09: 写入上下文
- **Target**: workflow-engine/spec.md - Requirement: 上下文传递 - Scenario: 写入上下文
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 定义包含 2 个 steps 的 workflow
  - 第 1 个 step 返回数据 { key: 'value' }
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证 context.steps[step1Name] 包含 { key: 'value' }
- **Expected Result**:
  - context.steps 对象包含第 1 个 step 的输出
  - 可以通过 step 名称访问 step 的输出数据

### TC-10: 读取上下文
- **Target**: workflow-engine/spec.md - Requirement: 上下文传递 - Scenario: 读取上下文
- **Type**: Automated (集成测试)
- **Preconditions**:
  - 定义包含 2 个 steps 的 workflow
  - 第 1 个 step 返回数据 { key: 'value' }
  - 第 2 个 step 从 context 读取第 1 个 step 的输出
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证第 2 个 step 能读取到 { key: 'value' }
- **Expected Result**:
  - 第 2 个 step 的 execute 函数接收到的 context 参数包含第 1 个 step 的输出
  - 第 2 个 step 能正确使用第 1 个 step 的数据

### TC-11: 意图路由
- **Target**: workflow-engine/spec.md - Requirement: Workflow 路由 - Scenario: 意图路由
- **Type**: Automated (集成测试)
- **Preconditions**:
  - 定义 workflow，intent='create_article'
  - 注册 workflow 到全局注册表
- **Steps**:
  1. 调用 `routeWorkflow('create_article')`
  2. 验证返回的 workflow 是之前定义的 workflow
- **Expected Result**:
  - 返回的 workflow 对象的 intent 为 'create_article'
  - 返回的 workflow 对象的 name 为 'create-article'

### TC-12: 未找到 Workflow
- **Target**: workflow-engine/spec.md - Requirement: Workflow 路由 - Scenario: 未找到 Workflow
- **Type**: Automated (单元测试)
- **Preconditions**: 全局 workflow 注册表为空
- **Steps**:
  1. 调用 `routeWorkflow('non_existent_intent')`
  2. 验证返回错误
- **Expected Result**:
  - 抛出错误或返回 undefined
  - 错误信息提示未找到对应的 workflow

### TC-13: 成功结果
- **Target**: workflow-engine/spec.md - Requirement: 结果返回 - Scenario: 成功结果
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 定义包含多个 steps 的 workflow
  - 所有 steps 执行成功
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证返回结果
- **Expected Result**:
  - 返回结果 success=true
  - 返回结果包含所有 steps 的输出数据
  - 返回结果包含执行时间等元数据

### TC-14: 失败结果
- **Target**: workflow-engine/spec.md - Requirement: 结果返回 - Scenario: 失败结果
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 定义包含多个 steps 的 workflow
  - 第 2 个 step 是 validator，返回失败
- **Steps**:
  1. 调用 `executeWorkflow(workflow, {})`
  2. 验证返回结果
- **Expected Result**:
  - 返回结果 success=false
  - 返回结果包含错误信息
  - 返回结果包含失败 step 的名称
  - 返回结果包含已执行 steps 的输出数据

### TC-15: 定义 Step
- **Target**: step-registry/spec.md - Requirement: Step 定义 - Scenario: 定义 Step
- **Type**: Automated (单元测试)
- **Preconditions**: 无
- **Steps**:
  1. 调用 `defineStep()` 创建步骤
  2. 传入 type='validator', name='checkInput', execute=fn
  3. 验证返回的 step 对象包含正确的属性
- **Expected Result**:
  - 返回的 step 对象包含 type='validator'
  - 返回的 step 对象包含 name='checkInput'
  - 返回的 step 对象包含 execute 函数

### TC-16: Step 类型约束
- **Target**: step-registry/spec.md - Requirement: Step 定义 - Scenario: Step 类型约束
- **Type**: Automated (单元测试)
- **Preconditions**: 无
- **Steps**:
  1. 尝试定义 type='invalid_type' 的 step
  2. 验证 TypeScript 编译错误或运行时错误
- **Expected Result**:
  - TypeScript 编译时报错（类型不匹配）
  - 或者运行时抛出错误（如果类型检查被绕过）

### TC-17: 注册 Step
- **Target**: step-registry/spec.md - Requirement: Step 注册 - Scenario: 注册 Step
- **Type**: Automated (单元测试)
- **Preconditions**: 全局 step 注册表为空
- **Steps**:
  1. 定义 step，name='myStep'
  2. 调用 `registerStep(step)`
  3. 调用 `getStepByName('myStep')`
  4. 验证返回的 step 是之前定义的 step
- **Expected Result**:
  - step 被成功注册
  - 可以通过名称查找到 step

### TC-18: 查找 Step
- **Target**: step-registry/spec.md - Requirement: Step 注册 - Scenario: 查找 Step
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 全局 step 注册表包含名为 'checkGitChanges' 的 step
- **Steps**:
  1. 调用 `getStepByName('checkGitChanges')`
  2. 验证返回的 step 对象
- **Expected Result**:
  - 返回的 step 对象的 name 为 'checkGitChanges'
  - 返回的 step 对象包含 execute 函数

### TC-19: 重复注册警告
- **Target**: step-registry/spec.md - Requirement: Step 注册 - Scenario: 重复注册警告
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 全局 step 注册表已包含名为 'myStep' 的 step
- **Steps**:
  1. 定义新的 step，name='myStep'（同名）
  2. 调用 `registerStep(step)`
  3. 验证控制台输出警告信息
  4. 验证旧的 step 被新的 step 覆盖
- **Expected Result**:
  - 控制台输出警告："Step 'myStep' is already registered. Overwriting..."
  - `getStepByName('myStep')` 返回新的 step 定义

### TC-20: 按 type 分类存储
- **Target**: step-registry/spec.md - Requirement: Step 分类 - Scenario: 按 type 分类存储
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 注册多个不同类型的 steps（validator, processor, action, notifier）
- **Steps**:
  1. 调用 `getStepsByType('validator')`
  2. 验证返回的所有 steps 的 type 都为 'validator'
- **Expected Result**:
  - 返回的 steps 数组仅包含 type='validator' 的 steps
  - 不包含其他类型的 steps

### TC-21: 列出某类型所有 steps
- **Target**: step-registry/spec.md - Requirement: Step 分类 - Scenario: 列出某类型所有 steps
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 注册 3 个 validator steps
  - 注册 2 个 action steps
- **Steps**:
  1. 调用 `getStepsByType('validator')`
  2. 验证返回的数组长度为 3
  3. 调用 `getStepsByType('action')`
  4. 验证返回的数组长度为 2
- **Expected Result**:
  - `getStepsByType('validator')` 返回 3 个 steps
  - `getStepsByType('action')` 返回 2 个 steps

### TC-22: checkGitChanges step - 有变更
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Validators - Scenario: checkGitChanges step
- **Type**: Automated (集成测试)
- **Preconditions**:
  - 在测试用的 git 仓库中
  - 存在未提交的文件变更
- **Steps**:
  1. 调用 `executeStep(checkGitChangesStep, context)`
  2. 验证返回的变更列表
- **Expected Result**:
  - step 执行成功，返回 true
  - context 中包含变更文件列表

### TC-23: checkGitChanges step - 无变更
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Validators - Scenario: checkGitChanges step
- **Type**: Automated (集成测试)
- **Preconditions**:
  - 在测试用的 git 仓库中
  - 工作区干净，无未提交的变更
- **Steps**:
  1. 调用 `executeStep(checkGitChangesStep, context)`
  2. 验证 step 返回失败
- **Expected Result**:
  - step 执行失败，返回 false
  - 错误信息提示"没有找到未提交的变更"

### TC-24: getChangedArticles step - 有文章变更
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Validators - Scenario: getChangedArticles step
- **Type**: Automated (集成测试)
- **Preconditions**:
  - src/content/posts/ 目录中存在新增或修改的 markdown 文件
- **Steps**:
  1. 调用 `executeStep(getChangedArticlesStep, context)`
  2. 验证返回的文章列表
- **Expected Result**:
  - step 执行成功，返回 true
  - context 中包含变更文章的文件路径列表

### TC-25: getChangedArticles step - 无文章变更
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Validators - Scenario: getChangedArticles step
- **Type**: Automated (集成测试)
- **Preconditions**:
  - src/content/posts/ 目录中无新增或修改的 markdown 文件
- **Steps**:
  1. 调用 `executeStep(getChangedArticlesStep, context)`
  2. 验证 step 返回失败
- **Expected Result**:
  - step 执行失败，返回 false
  - 错误信息提示"没有找到未发布的文章变更"

### TC-26: checkDirectory step - 目录存在
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Validators - Scenario: checkDirectory step
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 目标目录已存在
- **Steps**:
  1. 调用 `executeStep(checkDirectoryStep, context)`，传入目录路径
  2. 验证 step 执行成功
- **Expected Result**:
  - step 执行成功，返回 true
  - 无需创建目录

### TC-27: checkDirectory step - 目录不存在
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Validators - Scenario: checkDirectory step
- **Type**: Automated (单元测试)
- **Preconditions**:
  - 目标目录不存在
- **Steps**:
  1. 调用 `executeStep(checkDirectoryStep, context)`，传入目录路径
  2. 验证目录被创建
  3. 验证 step 执行成功
- **Expected Result**:
  - 目录被成功创建
  - step 执行成功，返回 true

### TC-28: generateMetadata step
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Processors - Scenario: generateMetadata step
- **Type**: Automated (集成测试 - 需要 mock AI 客户端)
- **Preconditions**:
  - context 中包含文章内容或主题
  - AI 客户端已 mock
- **Steps**:
  1. 调用 `executeStep(generateMetadataStep, context)`
  2. 验证 AI 客户端被调用
  3. 验证生成的元数据写入 context
- **Expected Result**:
  - AI 客户端被正确调用
  - context 中包含 title、description、tags
  - 元数据格式正确

### TC-29: collectExistingTags step
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Processors - Scenario: collectExistingTags step
- **Type**: Automated (集成测试)
- **Preconditions**:
  - src/content/posts/ 目录中存在多个已发布的文章
  - 文章包含不同的 tags
- **Steps**:
  1. 调用 `executeStep(collectExistingTagsStep, context)`
  2. 验证标签列表写入 context
- **Expected Result**:
  - context 中包含所有已使用的标签列表
  - 标签列表去重
  - 标签列表按字母顺序排序（可选）

### TC-30: inputTopic step - topic 缺失
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Processors - Scenario: inputTopic step
- **Type**: Automated (单元测试)
- **Preconditions**:
  - context.params 中不包含 topic
- **Steps**:
  1. 调用 `executeStep(inputTopicStep, context)`
  2. 验证 context 中标记参数缺失
- **Expected Result**:
  - context.missingParams 包含 'topic'
  - 或者 step 返回特定标识表示需要用户输入

### TC-31: updateFrontmatter step
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Processors - Scenario: updateFrontmatter step
- **Type**: Automated (集成测试)
- **Preconditions**:
  - context 中包含生成的元数据
  - 目标文章文件存在
- **Steps**:
  1. 调用 `executeStep(updateFrontmatterStep, context)`
  2. 读取文章文件
  3. 验证 frontmatter 被更新
- **Expected Result**:
  - 文章的 frontmatter 包含新的 title、description、tags
  - 文章内容保持不变
  - frontmatter 格式正确（YAML 格式）

### TC-32: createFile step
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Actions - Scenario: createFile step
- **Type**: Automated (集成测试)
- **Preconditions**:
  - context 中包含文件模板和路径
- **Steps**:
  1. 调用 `executeStep(createFileStep, context)`
  2. 验证文件被创建
  3. 验证文件内容正确
  4. 验证文件路径写入 context
- **Expected Result**:
  - 文件在正确的路径被创建
  - 文件内容符合模板
  - context.steps.createFile.filePath 包含文件路径

### TC-33: commitAndPush step
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Actions - Scenario: commitAndPush step
- **Type**: Automated (集成测试)
- **Preconditions**:
  - 在测试用的 git 仓库中
  - 存在未提交的变更
- **Steps**:
  1. 调用 `executeStep(commitAndPushStep, context)`
  2. 验证 git add 被执行
  3. 验证 git commit 被执行
  4. 验证 git push 被执行
- **Expected Result**:
  - 变更被提交到本地仓库
  - 变更被推送到远程仓库
  - 提交信息基于操作类型自动生成

### TC-34: startDevServer step
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Actions - Scenario: startDevServer step
- **Type**: Automated (集成测试)
- **Preconditions**: 无
- **Steps**:
  1. 调用 `executeStep(startDevServerStep, context)`
  2. 验证开发服务器启动
  3. 验证服务器 URL 写入 context
- **Expected Result**:
  - 开发服务器在后台启动
  - context.steps.startDevServer.url 包含服务器 URL（如 http://localhost:4321）

### TC-35: confirmCreation step - 用户确认
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Notifiers - Scenario: confirmCreation step
- **Type**: Automated (集成测试 - mock inquirer)
- **Preconditions**:
  - context 中包含文章信息
  - mock inquirer.prompt 返回确认
- **Steps**:
  1. 调用 `executeStep(confirmCreationStep, context)`
  2. 验证 inquirer 被调用
  3. 验证 step 执行成功
- **Expected Result**:
  - inquirer 显示文章信息并请求确认
  - 用户确认后 step 返回成功
  - 流程继续

### TC-36: confirmCreation step - 用户取消
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Notifiers - Scenario: confirmCreation step
- **Type**: Automated (集成测试 - mock inquirer)
- **Preconditions**:
  - context 中包含文章信息
  - mock inquirer.prompt 返回取消
- **Steps**:
  1. 调用 `executeStep(confirmCreationStep, context)`
  2. 验证 inquirer 被调用
  3. 验证 step 返回失败
- **Expected Result**:
  - inquirer 显示文章信息并请求确认
  - 用户取消后 step 返回失败
  - 流程中断

### TC-37: editConfirm step
- **Target**: step-registry/spec.md - Requirement: 内置 Steps - Notifiers - Scenario: editConfirm step
- **Type**: Automated (集成测试 - mock inquirer 和编辑器)
- **Preconditions**:
  - context 中包含生成的元数据
  - mock 编辑器打开和用户确认
- **Steps**:
  1. 调用 `executeStep(editConfirmStep, context)`
  2. 验证编辑器被打开
  3. 验证用户可以修改元数据
  4. 验证用户确认后 step 执行成功
- **Expected Result**:
  - 编辑器被打开，显示元数据
  - 用户修改并保存后，context 中的元数据被更新
  - step 返回成功

### TC-38: 跨 Workflow 复用 step
- **Target**: step-registry/spec.md - Requirement: Step 复用 - Scenario: 跨 Workflow 复用
- **Type**: Automated (集成测试)
- **Preconditions**:
  - 注册 step 'checkChanges'
  - 定义两个 workflows，都引用 'checkChanges' step
- **Steps**:
  1. 执行 workflow 1
  2. 验证 'checkChanges' step 被执行
  3. 执行 workflow 2
  4. 验证 'checkChanges' step 被执行
  5. 验证两个 workflows 使用的是同一个 step 定义
- **Expected Result**:
  - 两个 workflows 都能成功执行 'checkChanges' step
  - step 的 execute 函数是同一个引用
  - 无需重复定义 step

### TC-39: Workflow 元数据提取
- **Target**: workflow-engine/spec.md - Requirement: Workflow 定义 - Scenario: Workflow 元数据
- **Type**: Automated (单元测试)
- **Preconditions**: 无
- **Steps**:
  1. 定义 workflow，包含 name, description, intent, params
  2. 调用 `getWorkflowMetadata(workflow)`
  3. 验证返回的元数据
- **Expected Result**:
  - 返回的元数据包含 name
  - 返回的元数据包含 description
  - 返回的元数据包含 intent
  - 返回的元数据包含 params 定义

### TC-40: 端到端测试 - demo workflow
- **Target**: proposal.md - Verification - 验证方式
- **Type**: Automated (端到端测试)
- **Preconditions**:
  - Workflow 引擎和 Step 注册表已实现
  - 内置 steps 已注册
- **Steps**:
  1. 定义 demo workflow（如 proposal 中的示例）
  2. 调用 `executeWorkflow(demoWorkflow, {})`
  3. 验证返回结果
- **Expected Result**:
  - result.success === true
  - 所有 steps 按顺序执行
  - context 正确传递

## 4. Edge Cases & Error Handling

### EC-01: Context 类型丢失
- **Target**: design.md - 风险 1
- **Type**: Edge Case
- **Preconditions**: 无
- **Steps**:
  1. 在 step 中写入任意类型的数据到 context
  2. 在后续 step 中读取该数据
  3. 验证类型推断是否正确
- **Expected Result**:
  - 如果使用泛型约束，类型应正确推断
  - 如果未使用泛型，数据类型为 any

### EC-02: Step 命名冲突
- **Target**: design.md - 风险 2
- **Type**: Edge Case
- **Preconditions**:
  - step 'myStep' 已注册
- **Steps**:
  1. 注册新的 step，name='myStep'（同名）
  2. 验证控制台警告
  3. 验证旧 step 被覆盖
- **Expected Result**:
  - 控制台输出警告
  - 旧 step 被新 step 覆盖
  - 不影响程序运行

### EC-03: Workflow 执行失败后无法恢复
- **Target**: design.md - 风险 3
- **Type**: Manual (探索性测试)
- **Preconditions**:
  - 定义包含 3 个 steps 的 workflow
  - 第 2 个 step 会失败
- **Steps**:
  1. 执行 workflow
  2. 观察 step 2 失败后的状态
  3. 检查是否有回滚机制
- **Expected Result**:
  - step 2 失败后，step 1 的效果仍然存在
  - 日志中记录了失败原因
  - 无法自动回滚（符合设计）

### EC-04: 大量 steps 的性能测试
- **Target**: 性能验证
- **Type**: Edge Case
- **Preconditions**: 无
- **Steps**:
  1. 定义包含 100 个 steps 的 workflow
  2. 执行 workflow
  3. 测量执行时间
- **Expected Result**:
  - 执行时间在可接受范围内（< 1秒）
  - 无内存泄漏

### EC-05: Context 数据过大
- **Target**: 性能验证
- **Type**: Edge Case
- **Preconditions**: 无
- **Steps**:
  1. 定义 workflow，某个 step 返回大量数据（如 1MB）
  2. 执行 workflow
  3. 观察内存使用
- **Expected Result**:
  - workflow 能正常执行
  - 内存使用在合理范围内
  - 无内存泄漏

## 5. Regression Tests

### RT-01: 向后兼容性
- **Target**: proposal.md - Dependencies
- **Type**: Regression
- **Preconditions**: 无
- **Steps**:
  1. 运行现有的 CLI 命令（如 npm run content:new）
  2. 验证功能正常
- **Expected Result**:
  - 现有的 CLI 命令仍然可用
  - 功能不受影响
  - 无错误信息

### RT-02: TypeScript strict mode
- **Target**: 项目约定
- **Type**: Regression
- **Preconditions**: 无
- **Steps**:
  1. 运行 `npm run build` 或 `tsc --noEmit`
  2. 验证无类型错误
- **Expected Result**:
  - TypeScript 编译成功
  - 无类型错误
  - 符合 strict mode 要求

## 6. Test Execution Checklist

在执行测试前，请确认：

- [ ] 所有单元测试已编写并通过
- [ ] 所有集成测试已编写并通过
- [ ] 端到端测试已执行并通过
- [ ] 边界情况测试已覆盖
- [ ] 性能测试已通过
- [ ] TypeScript 类型检查通过
- [ ] 测试覆盖率 ≥ 90%
- [ ] 所有测试在 CI 环境中通过
