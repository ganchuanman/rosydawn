## ADDED Requirements

### Requirement: Step-based 文章创建流程

系统 SHALL 将文章创建流程拆分为独立的 Steps，按序执行。

#### Scenario: Step 执行顺序
- **WHEN** create-article workflow 被触发
- **THEN** 系统按以下顺序执行 Steps：
  1. Validators: `validateGitStatus`, `validateArticlesDirectory`
  2. Processors: `inputTopic`, `generateMetadata`, `buildFrontmatter`, `generateSlug`
  3. Notifiers: `confirmCreation`
  4. Actions: `createFile`, `startDevServer`, `gitAdd`
- **THEN** 每个 Step 接收前序 Steps 的输出作为上下文

#### Scenario: Step 失败处理
- **WHEN** 任意 Step 执行失败
- **THEN** 系统终止 Workflow 执行
- **THEN** 系统显示失败 Step 的错误信息
- **THEN** 系统不执行后续 Steps

### Requirement: AI 元数据生成

系统 SHALL 使用 AI 生成文章的标题、描述和标签。

#### Scenario: AI 生成成功
- **WHEN** `generateMetadata` Step 执行
- **THEN** 系统调用 AI 服务，输入为 topic
- **THEN** AI 返回包含 title, description, tags 的结构化数据
- **THEN** 系统将元数据传递给后续 Steps

#### Scenario: AI 服务不可用降级
- **WHEN** AI 服务调用失败（超时、API Key 无效、网络错误）
- **THEN** 系统使用降级逻辑生成元数据
- **THEN** title 设置为 topic 值
- **THEN** description 设置为 "关于 {topic} 的文章"
- **THEN** tags 设置为空数组
- **THEN** 系统在控制台显示警告信息

#### Scenario: AI 返回格式错误
- **WHEN** AI 返回的数据不符合预期格式
- **THEN** 系统使用降级逻辑生成元数据
- **THEN** 系统记录错误日志

### Requirement: 文件路径和 Slug 生成

系统 SHALL 根据标题自动生成文件路径和 URL slug。

#### Scenario: Slug 生成规则
- **WHEN** `generateSlug` Step 执行
- **THEN** 系统将标题转换为拼音 slug（使用 pinyin 库）
- **THEN** slug 仅包含小写字母、数字和连字符
- **THEN** 连续空格转换为一个连字符

#### Scenario: 文件路径生成
- **WHEN** 文章日期为 2026-02-28，slug 为 "websocket-shi-shi-tong-xin"
- **THEN** 文件路径为 `src/content/posts/2026/02/websocket-shi-shi-tong-xin/index.md`
- **THEN** URL 路径为 `/posts/websocket-shi-shi-tong-xin`

#### Scenario: 文件冲突检测
- **WHEN** 目标文件已存在
- **THEN** 系统在 slug 后添加 `-2`, `-3` 等后缀
- **THEN** 系统重新生成文件路径直到无冲突

### Requirement: Git 状态验证

系统 SHALL 在创建文章前验证 Git 仓库状态。

#### Scenario: Git 仓库检查
- **WHEN** `validateGitStatus` Step 执行
- **THEN** 系统检查当前目录是否为 Git 仓库
- **THEN** 如果不是，系统显示错误并终止

#### Scenario: 工作目录检查
- **WHEN** Git 仓库验证通过
- **THEN** 系统检查工作目录是否干净
- **THEN** 如果有未提交的更改，系统显示警告但继续执行

### Requirement: 文章目录结构验证

系统 SHALL 验证文章目录结构是否存在。

#### Scenario: 目录不存在时创建
- **WHEN** `validateArticlesDirectory` Step 执行
- **THEN** 系统检查 `src/content/posts/{year}/{month}` 目录
- **THEN** 如果目录不存在，系统自动创建

#### Scenario: 目录权限检查
- **WHEN** 目录存在但无写入权限
- **THEN** 系统显示错误并终止
- **THEN** 错误信息包含权限修复建议

### Requirement: 用户确认机制

系统 SHALL 在创建文件前请求用户确认。

#### Scenario: REPL 模式确认
- **WHEN** `confirmCreation` Step 在 REPL 模式下执行
- **THEN** 系统显示文章元数据预览（标题、描述、标签、文件路径）
- **THEN** 系统询问用户是否继续（Y/n）
- **THEN** 如果用户选择 n，系统终止 Workflow

#### Scenario: 命令行模式跳过确认
- **WHEN** `confirmCreation` Step 在命令行模式下执行
- **THEN** 系统跳过交互式确认
- **THEN** 系统直接继续执行

### Requirement: 开发服务器自动启动

系统 SHALL 在创建文章后启动开发服务器。

#### Scenario: 服务器未运行时启动
- **WHEN** `startDevServer` Step 执行
- **THEN** 系统检查端口 4321 是否被占用
- **THEN** 如果未占用，系统启动 `npm run dev`
- **THEN** 系统等待服务器就绪（最多 10 秒）

#### Scenario: 服务器已运行时跳过
- **WHEN** 端口 4321 已被占用
- **THEN** 系统跳过启动
- **THEN** 系统显示消息 "开发服务器已在运行"

### Requirement: Git 自动添加

系统 SHALL 将新创建的文章添加到 Git 暂存区。

#### Scenario: 自动 git add
- **WHEN** `gitAdd` Step 执行
- **THEN** 系统执行 `git add <file-path>`
- **THEN** 系统显示 "已添加到 Git: <file-path>"

#### Scenario: Git 命令失败
- **WHEN** git add 命令失败
- **THEN** 系统显示警告但不终止
- **THEN** 系统提示用户手动添加文件

## MODIFIED Requirements

### Requirement: 交互式主题输入

系统 SHALL 从 REPL AI 识别或命令行参数接收主题输入。

#### Scenario: REPL 模式 - AI 识别主题
- **WHEN** 用户在 REPL 中输入 "创建一篇关于 WebSocket 的文章"
- **THEN** AI 识别 intent 为 `create_article`，params 为 `{ topic: "WebSocket" }`
- **THEN** `inputTopic` Step 从 AI 识别结果获取 topic 参数
- **THEN** Step 验证 topic 不为空且为字符串
- **THEN** Step 将 topic 添加到上下文

#### Scenario: 命令行模式 - 直接参数
- **WHEN** 用户执行 `rosydawn content new --topic "WebSocket 实时通信"`
- **THEN** 系统从命令行参数解析 topic
- **THEN** `inputTopic` Step 直接获取 topic 参数
- **THEN** Step 验证 topic 格式

#### Scenario: 缺失主题 - REPL 追问
- **WHEN** AI 识别到 `create_article` 意图但 topic 缺失
- **THEN** AI 层调用参数收集器提示用户 "请告诉我文章的主题是什么？"
- **THEN** 用户在下一轮 REPL 输入主题
- **THEN** `inputTopic` Step 接收收集到的 topic

#### Scenario: 命令行模式 - 缺失必填参数
- **WHEN** 用户执行 `rosydawn content new`（未提供 --topic）
- **THEN** 系统显示错误 "Missing required argument: topic"
- **THEN** 系统以状态码 1 退出

### Requirement: 基于 Workflow 的执行

系统 SHALL 通过 workflow 引擎执行文章创建，而非直接脚本执行。

#### Scenario: Workflow 注册
- **WHEN** 系统初始化（CLI 启动）
- **THEN** `create-article` workflow 被注册到 workflow 注册表
- **THEN** workflow 映射到 intent `create_article`
- **THEN** workflow 定义包含：
  - name: "create-article"
  - description: "创建一篇新文章"
  - params: { required: ["topic"], optional: ["tags", "category"] }
  - steps: 8 个 Steps 按序排列

#### Scenario: Workflow 步骤执行
- **WHEN** create-article workflow 被触发
- **THEN** 系统执行步骤：
  1. `validateGitStatus` (Validator)
  2. `validateArticlesDirectory` (Validator)
  3. `inputTopic` (Processor)
  4. `generateMetadata` (Processor)
  5. `buildFrontmatter` (Processor)
  6. `generateSlug` (Processor)
  7. `confirmCreation` (Notifier)
  8. `createFile` (Action)
  9. `startDevServer` (Action)
  10. `gitAdd` (Action)
- **THEN** 每个 Step 接收包含所有前序 Step 输出的上下文对象
- **THEN** Workflow 引擎记录每个 Step 的执行时间和结果

#### Scenario: Step 上下文传递
- **WHEN** `buildFrontmatter` Step 执行
- **THEN** Step 从上下文获取：
  - `context.params.topic`（来自 input）
  - `context.steps.inputTopic.topic`（来自 inputTopic Step）
  - `context.steps.generateMetadata.title`（来自 generateMetadata Step）
  - `context.steps.generateMetadata.description`
  - `context.steps.generateMetadata.tags`

### Requirement: 显示完成摘要

系统 SHALL 在完成后显示包含文件路径和预览 URL 的摘要。

#### Scenario: REPL 模式响应
- **WHEN** 所有步骤在 REPL 模式下成功完成
- **THEN** 系统显示自然语言响应：
  ```
  ✅ 已创建文章《{title}》

  📄 文件路径: {file-path}
  🔗 预览地址: http://localhost:4321{url-path}

  💡 提示: 文件已添加到 Git 暂存区，可使用 git commit 提交
  ```
- **THEN** 响应使用绿色和图标增强可读性

#### Scenario: 命令行模式输出
- **WHEN** 所有步骤在命令行模式下成功完成
- **THEN** 系统显示结构化输出：
  ```
  Created: {title}
  Path: {file-path}
  URL: http://localhost:4321{url-path}
  Git: Added to staging area
  ```
- **THEN** 输出格式简洁，适合脚本解析

#### Scenario: 部分成功提示
- **WHEN** 文章创建成功但开发服务器启动失败
- **THEN** 系统显示文章创建成功的消息
- **THEN** 系统显示警告 "⚠️  开发服务器启动失败，请手动运行 npm run dev"
