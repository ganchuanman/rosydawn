# Test Cases

本文档基于 `specs` 和 `design` 文件，将需求和设计转化为可执行的测试用例。

## 1. Test Strategy

### 测试层级

- **单元测试（Unit Tests）**: 测试独立 Steps 的功能
- **集成测试（Integration Tests）**: 测试 Workflow 执行和 Step 间交互
- **端到端测试（E2E Tests）**: 测试 REPL 模式和命令行模式的完整流程
- **手动测试（Manual Tests）**: 测试需要人工判断的场景（如 AI 响应质量）

### 测试框架

- 单元/集成测试: Node.js 内置 `assert` + 自定义测试运行器
- E2E 测试: 使用 `child_process` 模拟 CLI 调用
- Mock 策略: Mock 文件系统、Git 命令、AI 服务

### 覆盖目标

- 代码覆盖率: > 80%（Steps 和 Workflow 引擎）
- 场景覆盖率: 100%（每个 Spec Scenario 至少一个测试用例）
- 错误路径: 所有关键错误场景都有测试

## 2. Environment & Preconditions

### 环境要求

- Node.js >= 18.0.0
- Git 已安装并配置
- OPENAI_API_KEY 环境变量已设置（或使用 Mock）
- 项目依赖已安装（`npm install`）

### 测试数据准备

- **Mock Git 仓库**: 在临时目录创建 Git 仓库用于测试
- **Mock 文章目录**: 预先创建 `src/content/posts/` 目录结构
- **Mock AI 响应**: 预定义 AI 返回的元数据
- **Mock 开发服务器**: 模拟端口 4321 占用检测

### 测试隔离

- 每个测试用例运行在独立的临时目录
- 测试间不共享状态
- 测试后自动清理创建的文件和目录

## 3. Execution List

### TC-01: Step 执行顺序验证
- **Target**: spec:article-create-cli - Step-based 文章创建流程 / Scenario: Step 执行顺序
- **Type**: Automated (Integration)
- **Preconditions**:
  - Workflow 引擎已初始化
  - create-article workflow 已注册
  - Mock 所有 Steps 的 execute 方法
- **Steps**:
  1. 触发 create-article workflow
  2. 记录每个 Step 的调用顺序
  3. 验证 Step 间的上下文传递
- **Expected Result**:
  - Steps 按以下顺序执行:
    1. validateGitStatus
    2. validateArticlesDirectory
    3. inputTopic
    4. generateMetadata
    5. buildFrontmatter
    6. generateSlug
    7. confirmCreation
    8. createFile
    9. startDevServer
    10. gitAdd
  - 每个 Step 接收到前序 Steps 的输出

### TC-02: Step 失败时的 Workflow 终止
- **Target**: spec:article-create-cli - Step-based 文章创建流程 / Scenario: Step 失败处理
- **Type**: Automated (Integration)
- **Preconditions**:
  - Mock generateMetadata Step 抛出错误
- **Steps**:
  1. 触发 create-article workflow
  2. 等待 Workflow 执行完成
  3. 检查后续 Steps 是否被调用
- **Expected Result**:
  - generateMetadata Step 执行失败
  - Workflow 显示错误信息
  - buildFrontmatter, generateSlug 等后续 Steps 未被调用
  - Workflow 返回失败状态

### TC-03: AI 元数据生成成功
- **Target**: spec:article-create-cli - AI 元数据生成 / Scenario: AI 生成成功
- **Type**: Automated (Unit)
- **Preconditions**:
  - Mock AI 服务返回:
    ```json
    {
      "title": "WebSocket 实时通信详解",
      "description": "深入探讨 WebSocket 协议及其应用场景",
      "tags": ["network", "realtime", "websocket"]
    }
    ```
- **Steps**:
  1. 调用 generateMetadata Step，输入 topic = "WebSocket"
  2. 验证返回的元数据结构
  3. 验证 AI 服务被正确调用
- **Expected Result**:
  - Step 返回包含 title, description, tags 的对象
  - title 为 "WebSocket 实时通信详解"
  - tags 数组包含 3 个元素
  - AI 服务接收 topic 参数

### TC-04: AI 服务不可用时的降级处理
- **Target**: spec:article-create-cli - AI 元数据生成 / Scenario: AI 服务不可用降级
- **Type**: Automated (Unit)
- **Preconditions**:
  - Mock AI 服务抛出网络错误（ECONNREFUSED）
- **Steps**:
  1. 调用 generateMetadata Step，输入 topic = "WebSocket"
  2. 捕获降级逻辑的执行
  3. 验证控制台输出
- **Expected Result**:
  - Step 不抛出错误，返回降级元数据
  - title = "WebSocket"
  - description = "关于 WebSocket 的文章"
  - tags = []
  - 控制台显示警告信息（包含 "AI" 和 "降级" 关键词）

### TC-05: AI 返回格式错误的处理
- **Target**: spec:article-create-cli - AI 元数据生成 / Scenario: AI 返回格式错误
- **Type**: Automated (Unit)
- **Preconditions**:
  - Mock AI 服务返回无效格式: `{ "foo": "bar" }`（缺少 title, description, tags）
- **Steps**:
  1. 调用 generateMetadata Step，输入 topic = "WebSocket"
  2. 验证降级逻辑被触发
- **Expected Result**:
  - Step 返回降级元数据
  - 错误被记录到日志
  - Step 不抛出异常

### TC-06: Slug 生成规则验证
- **Target**: spec:article-create-cli - 文件路径和 Slug 生成 / Scenario: Slug 生成规则
- **Type**: Automated (Unit)
- **Preconditions**:
  - 准备测试标题:
    - "WebSocket 实时通信"
    - "Node.js 性能优化"
    - "React 18 新特性"
- **Steps**:
  1. 调用 generateSlug Step，输入各个测试标题
  2. 验证生成的 slug 格式
- **Expected Result**:
  - "WebSocket 实时通信" → slug 包含拼音和连字符（如 "websocket-shi-shi-tong-xin"）
  - slug 仅包含小写字母、数字、连字符
  - 无连续连字符

### TC-07: 文件路径生成规则
- **Target**: spec:article-create-cli - 文件路径和 Slug 生成 / Scenario: 文件路径生成
- **Type**: Automated (Unit)
- **Preconditions**:
  - 当前日期: 2026-02-28（Mock Date）
  - slug = "websocket-shi-shi-tong-xin"
- **Steps**:
  1. 调用 generateSlug Step，生成 slug
  2. 调用 createFile Step，生成文件路径
  3. 验证文件路径和 URL
- **Expected Result**:
  - 文件路径: `src/content/posts/2026/02/websocket-shi-shi-tong-xin/index.md`
  - URL 路径: `/posts/websocket-shi-shi-tong-xin`

### TC-08: 文件冲突时的自动重命名
- **Target**: spec:article-create-cli - 文件路径和 Slug 生成 / Scenario: 文件冲突检测
- **Type**: Automated (Unit)
- **Preconditions**:
  - 文件 `src/content/posts/2026/02/websocket-shi-shi-tong-xin/index.md` 已存在
- **Steps**:
  1. 调用 createFile Step，尝试创建同名文件
  2. 验证冲突检测和重命名逻辑
- **Expected Result**:
  - 系统检测到文件已存在
  - 新文件路径: `src/content/posts/2026/02/websocket-shi-shi-tong-xin-2/index.md`
  - 如果仍冲突，继续尝试 `-3`, `-4` 等

### TC-09: Git 仓库检查
- **Target**: spec:article-create-cli - Git 状态验证 / Scenario: Git 仓库检查
- **Type**: Automated (Unit)
- **Preconditions**:
  - Case A: 在 Git 仓库内执行
  - Case B: 在非 Git 仓库内执行（临时目录）
- **Steps**:
  1. Case A: 调用 validateGitStatus Step
  2. Case B: 调用 validateGitStatus Step
- **Expected Result**:
  - Case A: Step 返回成功，不显示错误
  - Case B: Step 抛出错误，消息包含 "Git 仓库"
  - Case B: Workflow 终止

### TC-10: 工作目录不干净的警告
- **Target**: spec:article-create-cli - Git 状态验证 / Scenario: 工作目录检查
- **Type**: Automated (Unit)
- **Preconditions**:
  - Git 仓库内有未提交的更改（创建临时文件）
- **Steps**:
  1. 调用 validateGitStatus Step
  2. 验证警告消息
  3. 验证 Workflow 是否继续执行
- **Expected Result**:
  - Step 显示警告（包含 "未提交" 关键词）
  - Step 返回成功（不终止 Workflow）
  - 后续 Steps 正常执行

### TC-11: 文章目录自动创建
- **Target**: spec:article-create-cli - 文章目录结构验证 / Scenario: 目录不存在时创建
- **Type**: Automated (Unit)
- **Preconditions**:
  - 目录 `src/content/posts/2026/02` 不存在
- **Steps**:
  1. 调用 validateArticlesDirectory Step
  2. 检查目录是否被创建
- **Expected Result**:
  - Step 成功执行
  - 目录 `src/content/posts/2026/02` 被创建
  - 权限为 755（或系统默认）

### TC-12: 目录权限错误处理
- **Target**: spec:article-create-cli - 文章目录结构验证 / Scenario: 目录权限检查
- **Type**: Automated (Unit)
- **Preconditions**:
  - 目录 `src/content/posts` 存在但权限为 000（无写入权限）
- **Steps**:
  1. 调用 validateArticlesDirectory Step
  2. 验证错误消息
- **Expected Result**:
  - Step 抛出错误
  - 错误消息包含权限修复建议（如 "chmod"）
  - Workflow 终止

### TC-13: REPL 模式下的用户确认
- **Target**: spec:article-create-cli - 用户确认机制 / Scenario: REPL 模式确认
- **Type**: Automated (Integration)
- **Preconditions**:
  - REPL 模式标识为 true
  - 准备元数据: title, description, tags, filePath
- **Steps**:
  1. 调用 confirmCreation Step
  2. 验证显示的预览内容
  3. 模拟用户输入 "n"
- **Expected Result**:
  - Step 显示元数据预览（包含标题、描述、文件路径）
  - Step 询问 "是否继续？(Y/n)"
  - 用户输入 "n" 后，Workflow 终止
  - 文件未被创建

### TC-14: 命令行模式跳过确认
- **Target**: spec:article-create-cli - 用户确认机制 / Scenario: 命令行模式跳过确认
- **Type**: Automated (Integration)
- **Preconditions**:
  - 命令行模式标识为 true
- **Steps**:
  1. 调用 confirmCreation Step
  2. 验证无交互式提示
  3. 验证 Step 立即返回成功
- **Expected Result**:
  - Step 不显示 "是否继续" 提示
  - Step 返回成功
  - 后续 Steps 正常执行

### TC-15: 开发服务器自动启动
- **Target**: spec:article-create-cli - 开发服务器自动启动 / Scenario: 服务器未运行时启动
- **Type**: Automated (Integration)
- **Preconditions**:
  - 端口 4321 未被占用
  - Mock `npm run dev` 进程
- **Steps**:
  1. 调用 startDevServer Step
  2. 验证 `npm run dev` 被调用
  3. 验证等待逻辑（最多 10 秒）
- **Expected Result**:
  - Step 启动子进程执行 `npm run dev`
  - Step 等待服务器就绪（检查端口）
  - Step 显示成功消息

### TC-16: 开发服务器已运行时跳过启动
- **Target**: spec:article-create-cli - 开发服务器自动启动 / Scenario: 服务器已运行时跳过
- **Type**: Automated (Integration)
- **Preconditions**:
  - 端口 4321 已被占用（启动 Mock 服务器）
- **Steps**:
  1. 调用 startDevServer Step
  2. 验证跳过逻辑
- **Expected Result**:
  - Step 检测到端口占用
  - Step 不启动新的 `npm run dev` 进程
  - Step 显示 "开发服务器已在运行"

### TC-17: Git 自动添加文件
- **Target**: spec:article-create-cli - Git 自动添加 / Scenario: 自动 git add
- **Type**: Automated (Unit)
- **Preconditions**:
  - 文件已创建: `src/content/posts/2026/02/test/index.md`
- **Steps**:
  1. 调用 gitAdd Step，传入文件路径
  2. 执行 `git status` 验证
- **Expected Result**:
  - `git add` 命令成功执行
  - 文件出现在 Git 暂存区
  - 控制台显示 "已添加到 Git: <file-path>"

### TC-18: Git 命令失败的警告处理
- **Target**: spec:article-create-cli - Git 自动添加 / Scenario: Git 命令失败
- **Type**: Automated (Unit)
- **Preconditions**:
  - Mock `git add` 命令返回错误（如权限不足）
- **Steps**:
  1. 调用 gitAdd Step
  2. 验证错误处理
- **Expected Result**:
  - Step 显示警告（不抛出错误）
  - 警告包含 "手动添加" 提示
  - Workflow 继续执行（不终止）

### TC-19: REPL 模式 - AI 识别主题
- **Target**: spec:article-create-cli - 交互式主题输入 / Scenario: REPL 模式 - AI 识别主题
- **Type**: Automated (E2E)
- **Preconditions**:
  - REPL 环境已启动
  - AI 意图识别器已加载
  - 知识库已加载
- **Steps**:
  1. 启动 REPL: `rosydawn`
  2. 输入: "创建一篇关于 WebSocket 的文章"
  3. 验证 AI 识别结果
  4. 验证 inputTopic Step 接收到 topic
- **Expected Result**:
  - AI 识别 intent = "create_article"
  - AI 识别 params = { topic: "WebSocket" }
  - inputTopic Step 接收到 topic 参数
  - Workflow 继续执行

### TC-20: 命令行模式 - 直接参数传递
- **Target**: spec:article-create-cli - 交互式主题输入 / Scenario: 命令行模式 - 直接参数
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn content new --topic "WebSocket 实时通信"`
  2. 验证参数解析
  3. 验证 inputTopic Step 接收
- **Expected Result**:
  - 系统解析 topic = "WebSocket 实时通信"
  - inputTopic Step 接收到 topic 参数
  - Workflow 开始执行

### TC-21: REPL 模式 - 缺失主题时的追问
- **Target**: spec:article-create-cli - 交互式主题输入 / Scenario: 缺失主题 - REPL 追问
- **Type**: Manual (需要多轮交互)
- **Preconditions**:
  - REPL 环境已启动
  - Mock AI 识别到 create_article 意图但 topic 缺失
- **Steps**:
  1. 输入: "创建一篇文章"（未指定主题）
  2. 等待系统提示
  3. 输入: "WebSocket"
  4. 验证 Workflow 继续执行
- **Expected Result**:
  - 系统提示: "请告诉我文章的主题是什么？"
  - 用户输入主题后，inputTopic Step 接收到参数
  - Workflow 继续执行

### TC-22: 命令行模式 - 缺失必填参数错误
- **Target**: spec:article-create-cli - 交互式主题输入 / Scenario: 命令行模式 - 缺失必填参数
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn content new`（未提供 --topic）
  2. 验证错误消息
  3. 验证退出码
- **Expected Result**:
  - 系统显示错误: "Missing required argument: topic"
  - 系统显示用法提示
  - 进程退出码为 1

### TC-23: Workflow 注册验证
- **Target**: spec:article-create-cli - 基于 Workflow 的执行 / Scenario: Workflow 注册
- **Type**: Automated (Unit)
- **Preconditions**:
  - Workflow 注册表已初始化
- **Steps**:
  1. 查询 workflow 注册表
  2. 验证 create-article workflow 存在
  3. 验证 workflow 定义
- **Expected Result**:
  - create-article workflow 已注册
  - workflow.name = "create-article"
  - workflow.intent = "create_article"
  - workflow.params.required = ["topic"]
  - workflow.params.optional = ["tags", "category"]
  - workflow.steps.length = 10

### TC-24: Step 上下文传递验证
- **Target**: spec:article-create-cli - 基于 Workflow 的执行 / Scenario: Step 上下文传递
- **Type**: Automated (Integration)
- **Preconditions**:
  - Mock 前序 Steps 的输出
- **Steps**:
  1. 触发 create-article workflow
  2. 在 buildFrontmatter Step 中验证上下文
  3. 检查 context.params.topic
  4. 检查 context.steps.inputTopic.topic
  5. 检查 context.steps.generateMetadata.*
- **Expected Result**:
  - context.params.topic = "WebSocket"
  - context.steps.inputTopic.topic = "WebSocket"
  - context.steps.generateMetadata.title 存在
  - context.steps.generateMetadata.description 存在
  - context.steps.generateMetadata.tags 存在

### TC-25: REPL 模式完成摘要显示
- **Target**: spec:article-create-cli - 显示完成摘要 / Scenario: REPL 模式响应
- **Type**: Automated (E2E)
- **Preconditions**:
  - REPL 模式
  - 文章创建成功
- **Steps**:
  1. 执行创建文章流程
  2. 捕获最终输出
  3. 验证输出格式
- **Expected Result**:
  - 输出包含 "✅ 已创建文章《{title}》"
  - 输出包含 "📄 文件路径: {file-path}"
  - 输出包含 "🔗 预览地址: http://localhost:4321{url-path}"
  - 输出包含 "💡 提示: 文件已添加到 Git 暂存区"
  - 使用图标和颜色增强可读性

### TC-26: 命令行模式完成摘要显示
- **Target**: spec:article-create-cli - 显示完成摘要 / Scenario: 命令行模式输出
- **Type**: Automated (E2E)
- **Preconditions**:
  - 命令行模式
  - 文章创建成功
- **Steps**:
  1. 执行: `rosydawn content new --topic "WebSocket"`
  2. 捕获输出
  3. 验证输出格式
- **Expected Result**:
  - 输出包含 "Created: {title}"
  - 输出包含 "Path: {file-path}"
  - 输出包含 "URL: http://localhost:4321{url-path}"
  - 输出包含 "Git: Added to staging area"
  - 输出格式简洁，适合脚本解析（无颜色代码）

### TC-27: 部分成功时的警告显示
- **Target**: spec:article-create-cli - 显示完成摘要 / Scenario: 部分成功提示
- **Type**: Automated (Integration)
- **Preconditions**:
  - 文章创建成功
  - Mock startDevServer Step 失败
- **Steps**:
  1. 触发 workflow
  2. 验证输出包含成功消息和警告
- **Expected Result**:
  - 输出包含文章创建成功的消息
  - 输出包含警告: "⚠️  开发服务器启动失败，请手动运行 npm run dev"
  - Workflow 返回成功状态（因为核心操作已完成）

### TC-28: 命令行基础参数解析
- **Target**: spec:unified-cli-interface - 命令行参数解析 / Scenario: 基础参数解析
- **Type**: Automated (Unit)
- **Preconditions**:
  - 参数解析器已实现
- **Steps**:
  1. 解析命令: `rosydawn content new --topic "WebSocket" --tags "network,realtime"`
  2. 验证解析结果
- **Expected Result**:
  - command = "content new"
  - params.topic = "WebSocket"
  - params.tags = ["network", "realtime"]

### TC-29: 参数格式标准化
- **Target**: spec:unified-cli-interface - 命令行参数解析 / Scenario: 参数格式标准化
- **Type**: Automated (Unit)
- **Preconditions**:
  - 参数解析器已实现
- **Steps**:
  1. 测试 `--key value` 格式
  2. 测试 `--key` 布尔格式
  3. 测试多值参数（逗号分隔）
- **Expected Result**:
  - `--verbose` → { verbose: true }
  - `--topic "test"` → { topic: "test" }
  - `--tags "a,b,c"` → { tags: ["a", "b", "c"] }

### TC-30: 参数类型推断
- **Target**: spec:unified-cli-interface - 命令行参数解析 / Scenario: 参数类型推断
- **Type**: Automated (Unit)
- **Preconditions**:
  - 参数解析器已实现
- **Steps**:
  1. 测试布尔值转换
  2. 测试数字转换
  3. 测试字符串保持
- **Expected Result**:
  - "true" → true (boolean)
  - "false" → false (boolean)
  - "123" → 123 (number)
  - "hello" → "hello" (string)

### TC-31: 必填参数验证
- **Target**: spec:unified-cli-interface - 命令到 Workflow 的参数映射 / Scenario: 必填参数验证
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn content new`（缺少 --topic）
  2. 验证错误消息
  3. 验证退出码
- **Expected Result**:
  - 错误消息: "Error: Missing required argument: topic"
  - 用法提示: "Usage: rosydawn content new --topic <topic>"
  - 退出码: 1

### TC-32: 可选参数处理
- **Target**: spec:unified-cli-interface - 命令到 Workflow 的参数映射 / Scenario: 可选参数处理
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn content new --topic "WebSocket"`（未提供 --tags）
  2. 验证 workflow 接收的参数
- **Expected Result**:
  - Workflow 接收: { topic: "WebSocket", tags: undefined }
  - Workflow 正常执行（不报错）

### TC-33: 参数别名支持
- **Target**: spec:unified-cli-interface - 命令到 Workflow 的参数映射 / Scenario: 参数别名支持
- **Type**: Automated (E2E)
- **Preconditions**:
  - 别名映射已配置: -t → --topic
- **Steps**:
  1. 执行: `rosydawn content new -t "WebSocket"`
  2. 验证参数映射
- **Expected Result**:
  - 系统识别 -t 为 --topic 的别名
  - Workflow 接收: { topic: "WebSocket" }
  - 行为与 `--topic` 一致

### TC-34: 无参数启动 REPL 模式
- **Target**: spec:unified-cli-interface - 双模式入口实现 / Scenario: 无参数启动 REPL
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn`（process.argv.length === 2）
  2. 验证 REPL 启动
- **Expected Result**:
  - 系统启动 REPL 模式
  - 显示欢迎信息
  - AI 意图识别器已加载
  - 知识库已加载
  - Workflows 已注册
  - 进入交互循环（等待用户输入）

### TC-35: 带参数启动命令行模式
- **Target**: spec:unified-cli-interface - 双模式入口实现 / Scenario: 带参数启动命令行模式
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn content new --topic "WebSocket"`
  2. 验证命令行模式
- **Expected Result**:
  - 系统启动命令行模式
  - 跳过 REPL 和 AI 意图识别
  - 直接解析命令行参数
  - 路由到 create-article workflow
  - 执行完成后退出

### TC-36: 帮助标志处理
- **Target**: spec:unified-cli-interface - 双模式入口实现 / Scenario: 帮助标志处理
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn --help`
  2. 验证帮助信息
  3. 验证退出码
- **Expected Result**:
  - 显示 REPL 模式说明
  - 显示可用命令列表
  - 显示常见示例
  - 退出码: 0

### TC-37: 无效命令错误处理
- **Target**: spec:unified-cli-interface - 错误处理和用户反馈 / Scenario: 无效命令错误
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn invalid-command`
  2. 验证错误消息
  3. 验证退出码
- **Expected Result**:
  - 错误消息: "Error: Unknown command 'invalid-command'"
  - 显示可用命令: "Available commands: content new, ..."
  - 退出码: 1

### TC-38: 参数类型错误宽松处理
- **Target**: spec:unified-cli-interface - 错误处理和用户反馈 / Scenario: 参数类型错误
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn content new --topic 123`
  2. 验证类型转换
  3. 验证 Workflow 执行
- **Expected Result**:
  - 系统将 123 转换为 "123"
  - Workflow 正常执行（不报错）

### TC-39: Workflow 执行失败的用户友好提示
- **Target**: spec:unified-cli-interface - 错误处理和用户反馈 / Scenario: Workflow 执行失败
- **Type**: Automated (E2E)
- **Preconditions**:
  - Mock validateGitStatus Step 失败
- **Steps**:
  1. 执行: `rosydawn content new --topic "WebSocket"`
  2. 验证错误消息
  3. 验证退出码
- **Expected Result**:
  - 显示用户友好的错误消息
  - 显示错误上下文（validateGitStatus Step 失败）
  - 退出码: 1

### TC-40: 命令路由表验证
- **Target**: spec:unified-cli-interface - 命令路由表维护 / Scenario: 路由表定义
- **Type**: Automated (Unit)
- **Preconditions**:
  - 路由表已定义
- **Steps**:
  1. 检查路由表结构
  2. 验证 "content new" 映射
- **Expected Result**:
  - 路由表包含 "content new"
  - "content new" 映射到:
    - workflow: "create-article"
    - intent: "create_article"
    - description: "创建一篇新文章"

### TC-41: 路由查找和 Workflow 执行
- **Target**: spec:unified-cli-interface - 命令路由表维护 / Scenario: 路由查找
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn content new --topic "WebSocket"`
  2. 验证路由查找
  3. 验证 Workflow 执行
- **Expected Result**:
  - 系统从路由表查找 "content new"
  - 系统获取 workflow 名称 "create-article"
  - 系统从注册表获取 Workflow 定义
  - 系统执行 Workflow

### TC-42: REPL 中的意图路由
- **Target**: spec:unified-cli-interface - REPL 中的意图路由 / Scenario: 意图到 workflow 映射
- **Type**: Automated (E2E)
- **Preconditions**:
  - REPL 环境已启动
  - AI 意图识别器已加载
- **Steps**:
  1. 输入: "创建一篇关于 WebSocket 的文章"
  2. 验证 AI 识别
  3. 验证 Workflow 查找
  4. 验证参数传递
- **Expected Result**:
  - AI 识别 intent = "create_article"
  - 系统查找 workflow 名称 = "create-article"（kebab-case）
  - 系统执行 workflow，传递 { topic: "WebSocket" }

### TC-43: 未知意图的友好响应
- **Target**: spec:unified-cli-interface - REPL 中的意图路由 / Scenario: 未知意图处理
- **Type**: Manual (需要判断响应质量)
- **Preconditions**:
  - REPL 环境已启动
- **Steps**:
  1. 输入: "删除所有文章"（超出范围的意图）
  2. 验证系统响应
- **Expected Result**:
  - 系统显示友好的响应（非技术错误）
  - 响应解释可用能力
  - 系统不崩溃
  - 系统提示尝试其他表达方式

### TC-44: MVP 阶段仅支持 content new 命令
- **Target**: spec:unified-cli-interface - 命令与 Workflow 映射 / Scenario: MVP 阶段支持的命令
- **Type**: Automated (Unit)
- **Preconditions**:
  - 路由表已加载
- **Steps**:
  1. 查询路由表
  2. 验证仅包含 "content new"
- **Expected Result**:
  - 路由表仅包含 "content new"
  - 其他命令（如 "content publish"）未注册

### TC-45: 未实现命令的错误提示
- **Target**: spec:unified-cli-interface - 命令与 Workflow 映射 / Scenario: 未实现命令提示
- **Type**: Automated (E2E)
- **Preconditions**:
  - CLI 入口已配置
- **Steps**:
  1. 执行: `rosydawn content publish`
  2. 验证错误消息
- **Expected Result**:
  - 错误消息: "Error: Command 'content publish' is not implemented yet"
  - 提示: "This feature will be available in a future update"
  - 退出码: 1

### TC-46: 命令别名支持（可选）
- **Target**: spec:unified-cli-interface - 命令与 Workflow 映射 / Scenario: 命令别名支持
- **Type**: Automated (E2E)
- **Preconditions**:
  - 别名映射已配置: "new" → "content new"
- **Steps**:
  1. 执行: `rosydawn new --topic "WebSocket"`
  2. 验证行为与 `rosydawn content new` 一致
- **Expected Result**:
  - 系统识别 "new" 为 "content new" 的别名
  - Workflow 正常执行
  - 输出与完整命令一致

## 4. Edge Cases & Error Handling

### TC-47: 特殊字符处理（主题包含引号）
- **Target**: design - Risk 3: 参数解析一致性
- **Type**: Automated (E2E)
- **Preconditions**: 无
- **Steps**:
  1. 执行: `rosydawn content new --topic "WebSocket's 实时通信"`
  2. 验证文件创建
- **Expected Result**:
  - 系统正确处理单引号
  - 文件创建成功
  - 标题包含单引号

### TC-48: 超长主题处理
- **Target**: Edge Case
- **Type**: Automated (E2E)
- **Preconditions**: 无
- **Steps**:
  1. 执行: `rosydawn content new --topic "这是一个非常非常非常非常非常长的主题..."`（> 100 字符）
  2. 验证 slug 生成
  3. 验证文件路径
- **Expected Result**:
  - 系统生成合理的 slug（可能截断）
  - 文件路径不超过系统限制（255 字符）
  - 文件创建成功

### TC-49: 并发创建文章
- **Target**: Edge Case
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 同时执行两个 `rosydawn content new --topic "WebSocket"` 命令
  2. 验证文件冲突处理
- **Expected Result**:
  - 两个进程都成功创建文件
  - 第二个文件使用 `-2` 后缀
  - 无数据损坏

### TC-50: AI 服务超时处理
- **Target**: design - Decision 3: AI 降级逻辑
- **Type**: Automated (Unit)
- **Preconditions**:
  - Mock AI 服务延迟 > 30 秒
- **Steps**:
  1. 调用 generateMetadata Step
  2. 验证超时处理
- **Expected Result**:
  - Step 在 30 秒后触发超时
  - 使用降级逻辑生成元数据
  - 显示警告信息

## 5. Performance Tests

### TC-51: Workflow 执行时间
- **Target**: Performance
- **Type**: Automated (Integration)
- **Preconditions**: 无
- **Steps**:
  1. 执行完整的 create-article workflow
  2. 记录总执行时间
  3. 记录每个 Step 的执行时间
- **Expected Result**:
  - 总执行时间 < 5 秒（不包括 AI 调用）
  - 最慢的 Step 是 generateMetadata（AI 调用）
  - 文件操作 Steps < 100ms

### TC-52: 大量文件时的冲突检测性能
- **Target**: Performance
- **Type**: Automated (Unit)
- **Preconditions**:
  - 目录中已存在 100 个文章
- **Steps**:
  1. 调用 createFile Step，slug 冲突
  2. 测量冲突检测时间
- **Expected Result**:
  - 冲突检测时间 < 50ms
  - 系统快速找到可用的文件名

## 6. Regression Tests

### TC-53: 与原有脚本行为兼容性
- **Target**: Regression
- **Type**: Manual
- **Preconditions**:
  - 保留原有的 `scripts/content/new.js`
- **Steps**:
  1. 使用新 CLI 创建文章
  2. 验证生成的文件格式与原脚本一致
  3. 验证 frontmatter 结构
  4. 验证文件路径规则
- **Expected Result**:
  - 生成的文件格式完全一致
  - frontmatter 包含 title, date, description, tags
  - 文件路径遵循 `{year}/{month}/{slug}/index.md` 规则

## 7. Test Summary

- **Total Test Cases**: 53
- **Automated**: 46
- **Manual**: 7
- **Unit Tests**: 20
- **Integration Tests**: 15
- **E2E Tests**: 11
- **Edge Cases**: 4
- **Performance Tests**: 2
- **Regression Tests**: 1

### Coverage by Spec Requirement

| Spec Requirement | Test Cases |
|------------------|-----------|
| Step-based 文章创建流程 | TC-01, TC-02 |
| AI 元数据生成 | TC-03, TC-04, TC-05 |
| 文件路径和 Slug 生成 | TC-06, TC-07, TC-08 |
| Git 状态验证 | TC-09, TC-10 |
| 文章目录结构验证 | TC-11, TC-12 |
| 用户确认机制 | TC-13, TC-14 |
| 开发服务器自动启动 | TC-15, TC-16 |
| Git 自动添加 | TC-17, TC-18 |
| 交互式主题输入 | TC-19, TC-20, TC-21, TC-22 |
| 基于 Workflow 的执行 | TC-23, TC-24 |
| 显示完成摘要 | TC-25, TC-26, TC-27 |
| 命令行参数解析 | TC-28, TC-29, TC-30 |
| 命令到 Workflow 的参数映射 | TC-31, TC-32, TC-33 |
| 双模式入口实现 | TC-34, TC-35, TC-36 |
| 错误处理和用户反馈 | TC-37, TC-38, TC-39 |
| 命令路由表维护 | TC-40, TC-41 |
| REPL 中的意图路由 | TC-42, TC-43 |
| 命令与 Workflow 映射 | TC-44, TC-45, TC-46 |
