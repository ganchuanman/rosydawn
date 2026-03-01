# AI 交互层测试用例

## 1. Test Strategy

本测试计划覆盖 AI 对话式 CLI 的交互层实现，包括 REPL、AI 意图识别和知识库生成。

### 测试类型分布

- **单元测试 (60%)**: 覆盖核心逻辑（意图识别、知识库生成、参数提取）
- **集成测试 (30%)**: 验证 REPL + AI + Workflow 引擎的协作
- **手动测试 (10%)**: 用户体验验证（交互流程、错误提示）

### 测试重点

1. **AI 意图识别准确性**: 通过大量自然语言输入验证识别率
2. **容错能力**: AI 服务不可用、超时、响应格式错误等异常场景
3. **用户体验**: 交互流畅性、错误提示友好性
4. **性能**: 知识库加载速度、AI 调用延迟

## 2. Environment & Preconditions

### 环境要求

- Node.js 18+
- TypeScript strict mode
- 已安装依赖: `@inquirer/prompts`, `openai`, `tsx`
- 已配置环境变量:
  - `OPENAI_API_KEY` (有效值)
  - `OPENAI_BASE_URL` (可选，默认 OpenAI API)
  - `NODE_ENV` (development | production)

### 前置条件

- Change 1 (core) 已完成：Workflow 引擎和 Step 注册表可用
- 已注册 Mock Workflows: `mock_create_article`, `mock_list_articles`, `mock_publish`
- 知识库已生成: `dist/knowledge-base.json` (生产模式测试)
- AI 服务可用 (OpenAI/Azure/DeepSeek/Ollama)

### 测试数据

```yaml
# Mock Workflow 定义
mock_create_article:
  intent: create_article
  description: "[Mock] 创建文章（仅打印识别结果）"
  params:
    - name: topic
      type: string
      required: true
      description: 文章主题
  examples:
    - "创建一篇关于 WebSocket 的文章"

mock_list_articles:
  intent: list_articles
  description: "[Mock] 列出所有文章"
  params: []
  examples:
    - "显示所有文章"

mock_publish:
  intent: publish
  description: "[Mock] 发布文章"
  params: []
  examples:
    - "发布最新文章"
```

## 3. Execution List

### TC-01: REPL 启动与欢迎信息

- **Target**: repl-interface/spec.md - Requirement: REPL 启动脚本
- **Type**: Manual
- **Preconditions**: 项目依赖已安装
- **Steps**:
  1. 在项目根目录执行 `npm run repl`
  2. 观察终端输出
- **Expected Result**:
  - 显示欢迎信息（包含版本号）
  - 显示输入提示符 `🤖 >`
  - REPL 进入等待输入状态

### TC-02: Ctrl+C 优雅退出

- **Target**: repl-interface/spec.md - Requirement: 优雅退出处理
- **Type**: Manual
- **Preconditions**: REPL 已启动
- **Steps**:
  1. 在 REPL 输入提示符处按 `Ctrl+C`
- **Expected Result**:
  - 显示 "👋 再见！"
  - REPL 正常退出（退出码 0）

### TC-03: Ctrl+D 优雅退出

- **Target**: repl-interface/spec.md - Requirement: 优雅退出处理
- **Type**: Manual
- **Preconditions**: REPL 已启动
- **Steps**:
  1. 在 REPL 输入提示符处按 `Ctrl+D`
- **Expected Result**:
  - 显示 "👋 再见！"
  - REPL 正常退出（退出码 0）

### TC-04: exit 命令退出

- **Target**: repl-interface/spec.md - Requirement: 优雅退出处理
- **Type**: Automated
- **Preconditions**: REPL 已启动
- **Steps**:
  1. 输入 `exit` 并回车
- **Expected Result**:
  - 显示 "👋 再见！"
  - REPL 正常退出（退出码 0）

### TC-05: quit 和 q 命令退出

- **Target**: repl-interface/spec.md - Requirement: 优雅退出处理
- **Type**: Automated
- **Preconditions**: REPL 已启动
- **Steps**:
  1. 输入 `quit` 并回车
  2. 重启 REPL
  3. 输入 `q` 并回车
- **Expected Result**:
  - 两个命令都能正常退出 REPL
  - 显示 "👋 再见！"

### TC-06: 空输入处理

- **Target**: repl-interface/spec.md - 父 Spec - Requirement: 用户输入循环
- **Type**: Automated
- **Preconditions**: REPL 已启动
- **Steps**:
  1. 在输入提示符处直接按回车（不输入任何内容）
- **Expected Result**:
  - 系统重新显示输入提示符
  - 不执行任何操作
  - 不显示错误信息

### TC-07: 识别创建文章意图（高置信度）

- **Target**: ai-intent-recognizer/spec.md - Requirement: 置信度阈值判断
- **Type**: Automated
- **Preconditions**: AI 服务可用，知识库已加载
- **Steps**:
  1. 输入 "创建一篇关于 WebSocket 的文章"
- **Expected Result**:
  - AI 识别 intent 为 `create_article`
  - 识别 params 为 `{ topic: "WebSocket" }`
  - confidence >= 0.7
  - 显示 Mock Workflow 执行结果:
    ```
    ✅ 识别到意图: mock_create_article
       参数: { topic: "WebSocket" }
       (当前为 Mock Workflow，未执行真实操作)
    ```

### TC-08: 识别发布意图

- **Target**: ai-intent-recognizer/spec.md - 父 Spec - Requirement: 意图识别
- **Type**: Automated
- **Preconditions**: AI 服务可用
- **Steps**:
  1. 输入 "发布"
- **Expected Result**:
  - AI 识别 intent 为 `publish`
  - confidence >= 0.7
  - 显示 Mock Workflow 执行结果

### TC-09: 参数缺失检测与多轮对话

- **Target**: ai-intent-recognizer/spec.md - Requirement: 多轮参数收集
- **Type**: Automated
- **Preconditions**: AI 服务可用
- **Steps**:
  1. 输入 "创建文章"（不提供 topic）
  2. 系统提示 "📝 请输入文章主题："
  3. 输入 "WebSocket"
- **Expected Result**:
  - AI 检测到 topic 参数缺失
  - 系统进入参数收集模式
  - 用户输入主题后，参数补全
  - 显示完整的意图识别结果

### TC-10: 取消参数收集

- **Target**: ai-intent-recognizer/spec.md - Requirement: 多轮参数收集
- **Type**: Automated
- **Preconditions**: AI 服务可用
- **Steps**:
  1. 输入 "创建文章"（触发参数缺失）
  2. 在提示输入主题时，输入 `cancel`
- **Expected Result**:
  - 系统显示 "已取消操作"
  - 返回输入提示符
  - 不执行任何 Workflow

### TC-11: 低置信度请求确认

- **Target**: ai-intent-recognizer/spec.md - Requirement: 置信度阈值判断
- **Type**: Automated
- **Preconditions**: AI 服务可用
- **Steps**:
  1. 输入模糊指令 "搞一下文章"（故意使用不清晰表达）
- **Expected Result**:
  - AI 返回 confidence < 0.7
  - 系统显示 "我不太确定您的意图，您是想要执行 [X] 吗？"
  - 提供候选选项供用户选择

### TC-12: 未知意图处理

- **Target**: ai-intent-recognizer/spec.md - 父 Spec - Requirement: 意图识别
- **Type**: Automated
- **Preconditions**: AI 服务可用
- **Steps**:
  1. 输入 "帮我买个咖啡"（超出系统能力范围）
- **Expected Result**:
  - AI 识别 intent 为 `unknown`
  - 系统显示友好提示 "抱歉，我无法完成这个操作"
  - 显示可用命令列表

### TC-13: AI 响应解析容错 - JSON 代码块

- **Target**: ai-intent-recognizer/spec.md - Requirement: AI 响应解析容错
- **Type**: Automated
- **Preconditions**: 模拟 AI 返回带 ```json ``` 包裹的响应
- **Steps**:
  1. 发送测试输入
  2. 模拟 AI 返回:
     ```
     这是我识别的意图：
     ```json
     {
       "intent": "create_article",
       "params": { "topic": "Test" },
       "confidence": 0.9
     }
     ```
     ```
- **Expected Result**:
  - 系统自动提取代码块中的 JSON
  - 正确解析意图和参数
  - 不报错

### TC-14: AI 响应解析失败降级

- **Target**: ai-intent-recognizer/spec.md - Requirement: AI 响应解析容错
- **Type**: Automated
- **Preconditions**: 模拟 AI 返回非 JSON 响应
- **Steps**:
  1. 发送测试输入
  2. 模拟 AI 返回纯文本 "无法理解您的意图"
- **Expected Result**:
  - 系统记录原始响应到日志
  - 显示 "无法理解 AI 的响应，请换一种表达方式"
  - 用户可重新输入

### TC-15: AI 调用超时处理

- **Target**: ai-intent-recognizer/spec.md - Requirement: 超时控制
- **Type**: Automated
- **Preconditions**: 模拟 AI API 响应延迟 > 5 秒
- **Steps**:
  1. 输入任意指令
  2. 等待 5 秒
- **Expected Result**:
  - 系统显示 "🤔 思考中..." 加载提示
  - 5 秒后取消请求
  - 显示 "AI 服务响应超时，请稍后重试"
  - REPL 不崩溃，返回输入提示符

### TC-16: AI 认证失败处理

- **Target**: ai-intent-recognizer/spec.md - 父 Spec - Requirement: 错误处理
- **Type**: Automated
- **Preconditions**: `OPENAI_API_KEY` 未配置或无效
- **Steps**:
  1. 删除或清空 `OPENAI_API_KEY` 环境变量
  2. 启动 REPL
  3. 输入任意指令
- **Expected Result**:
  - 显示 "请检查 OPENAI_API_KEY 环境变量配置"
  - 显示 "建议使用命令行模式: npm run content:new"
  - REPL 不崩溃

### TC-17: AI 服务不可用处理

- **Target**: ai-intent-recognizer/spec.md - 父 Spec - Requirement: 错误处理
- **Type**: Automated
- **Preconditions**: 模拟 AI API 返回 5xx 错误
- **Steps**:
  1. 配置 `OPENAI_BASE_URL` 指向不可用的服务
  2. 启动 REPL
  3. 输入任意指令
- **Expected Result**:
  - 显示 "AI 服务暂时不可用"
  - 显示 "建议使用命令行模式绕过 AI"
  - REPL 不崩溃

### TC-18: 知识库构建时生成

- **Target**: knowledge-generator/spec.md - Requirement: 构建时生成知识库
- **Type**: Automated
- **Preconditions**: Mock Workflows 已注册
- **Steps**:
  1. 执行 `npm run build:knowledge`
  2. 检查 `dist/knowledge-base.json` 文件
- **Expected Result**:
  - 文件成功生成
  - 文件包含 `workflows`、`projectRules`、`constraints`、`generatedAt` 字段
  - `workflows` 包含 3 个 Mock Workflow 的元数据

### TC-19: 知识库文件格式验证

- **Target**: knowledge-generator/spec.md - Requirement: 构建时生成知识库
- **Type**: Automated
- **Preconditions**: 知识库已生成
- **Steps**:
  1. 读取 `dist/knowledge-base.json`
  2. 验证 JSON Schema
- **Expected Result**:
  - `workflows[0].name` 等于 "mock_create_article"
  - `workflows[0].params[0].name` 等于 "topic"
  - `workflows[0].params[0].required` 等于 true
  - `generatedAt` 为有效的 ISO 8601 时间戳

### TC-20: 知识库文件大小警告

- **Target**: knowledge-generator/spec.md - Requirement: 构建时生成知识库
- **Type**: Automated
- **Preconditions**: 模拟大量 Workflows（50+）
- **Steps**:
  1. 注册 50+ 个 Mock Workflows
  2. 执行 `npm run build:knowledge`
- **Expected Result**:
  - 生成知识库
  - 如果文件大小 > 50KB，显示警告 "知识库较大，可能影响 AI 性能"

### TC-21: 生产环境加载知识库

- **Target**: knowledge-generator/spec.md - Requirement: 运行时加载知识库
- **Type**: Automated
- **Preconditions**:
  - `NODE_ENV=production`
  - `dist/knowledge-base.json` 存在
- **Steps**:
  1. 设置 `NODE_ENV=production`
  2. 启动 REPL
- **Expected Result**:
  - 系统从 `dist/knowledge-base.json` 加载知识库
  - 不显示 "实时生成" 提示
  - REPL 启动速度快（< 1 秒）

### TC-22: 知识库文件不存在错误

- **Target**: knowledge-generator/spec.md - Requirement: 运行时加载知识库
- **Type**: Automated
- **Preconditions**:
  - `NODE_ENV=production`
  - `dist/knowledge-base.json` 不存在
- **Steps**:
  1. 删除 `dist/knowledge-base.json`
  2. 设置 `NODE_ENV=production`
  3. 启动 REPL
- **Expected Result**:
  - 显示 "知识库不存在，请先运行 npm run build:knowledge"
  - REPL 退出（退出码 1）

### TC-23: 开发模式实时生成知识库

- **Target**: knowledge-generator/spec.md - Requirement: 开发模式实时生成
- **Type**: Automated
- **Preconditions**: `NODE_ENV=development`
- **Steps**:
  1. 设置 `NODE_ENV=development`
  2. 启动 REPL
- **Expected Result**:
  - 显示 "🔄 开发模式：实时生成知识库..."
  - 系统动态生成知识库（不读取缓存）
  - 知识库包含最新注册的 Workflows

### TC-24: Workflow 元数据提取

- **Target**: knowledge-generator/spec.md - Requirement: Workflow 元数据提取
- **Type**: Automated
- **Preconditions**: 知识库已生成
- **Steps**:
  1. 读取 `dist/knowledge-base.json`
  2. 检查 `mock_create_article` 的元数据
- **Expected Result**:
  - `name` 等于 "mock_create_article"
  - `description` 包含 "[Mock]"
  - `params[0]` 包含 name、type、required、description
  - `examples` 包含至少一个示例

### TC-25: 静态知识文件加载

- **Target**: knowledge-generator/spec.md - Requirement: 静态知识文件
- **Type**: Automated
- **Preconditions**:
  - 创建 `knowledge/static.md` 文件
  - 内容包含项目背景和常见问题
- **Steps**:
  1. 执行 `npm run build:knowledge`
  2. 读取生成的知识库
- **Expected Result**:
  - 知识库的 `projectRules` 字段包含 `static.md` 的内容
  - 内容未被截断或损坏

### TC-26: 静态知识文件不存在

- **Target**: knowledge-generator/spec.md - Requirement: 静态知识文件
- **Type**: Automated
- **Preconditions**: `knowledge/static.md` 不存在
- **Steps**:
  1. 确保 `knowledge/static.md` 不存在
  2. 执行 `npm run build:knowledge`
- **Expected Result**:
  - 知识库成功生成
  - `projectRules` 为空字符串
  - 不显示错误信息

### TC-27: Mock Workflow 标注

- **Target**: knowledge-generator/spec.md - Requirement: Mock Workflow 元数据
- **Type**: Automated
- **Preconditions**: 知识库已生成
- **Steps**:
  1. 读取 `dist/knowledge-base.json`
  2. 检查 Mock Workflows 的描述和示例
- **Expected Result**:
  - 所有 Mock Workflow 的 `description` 包含 "[Mock]" 前缀
  - 示例中包含 "(Mock)" 或 "(仅用于测试)" 标注

### TC-28: 集成测试 - 完整交互流程

- **Target**: 所有 Specs - 综合验证
- **Type**: Manual
- **Preconditions**: 所有组件已实现
- **Steps**:
  1. 执行 `npm run build:knowledge`
  2. 启动 REPL (`npm run repl`)
  3. 输入 "创建一篇关于 TypeScript 的文章"
  4. 观察意图识别和参数提取
  5. 输入 "显示所有文章"
  6. 输入 "exit"
- **Expected Result**:
  - 知识库成功生成
  - REPL 显示欢迎信息
  - 第一个输入正确识别为 `mock_create_article`，参数为 `{ topic: "TypeScript" }`
  - 显示 Mock Workflow 执行结果
  - 第二个输入正确识别为 `mock_list_articles`
  - `exit` 命令正常退出 REPL

### TC-29: 边缘用例 - 特殊字符输入

- **Target**: ai-intent-recognizer/spec.md - 父 Spec - Requirement: 意图识别
- **Type**: Edge Case
- **Preconditions**: AI 服务可用
- **Steps**:
  1. 输入包含特殊字符的指令: "创建文章: <script>alert('test')</script>"
  2. 输入超长指令（500+ 字符）
- **Expected Result**:
  - 特殊字符不影响意图识别
  - 超长指令能正常处理（或显示友好提示）
  - REPL 不崩溃

### TC-30: 性能测试 - AI 调用延迟

- **Target**: ai-intent-recognizer/spec.md - Requirement: 超时控制
- **Type**: Manual
- **Preconditions**: AI 服务可用
- **Steps**:
  1. 启动 REPL
  2. 连续输入 10 个不同的指令
  3. 记录每次 AI 响应时间
- **Expected Result**:
  - 平均响应时间 < 2 秒
  - 无响应超过 5 秒（超时保护生效）
  - 用户感知流畅（显示加载提示）

### TC-31: 回归测试 - 空闲状态

- **Target**: repl-interface/spec.md - 父 Spec - Requirement: 用户输入循环
- **Type**: Regression
- **Preconditions**: REPL 已启动
- **Steps**:
  1. 启动 REPL
  2. 保持空闲状态 5 分钟（不输入任何内容）
  3. 输入简单指令 "exit"
- **Expected Result**:
  - REPL 保持稳定（无内存泄漏、无崩溃）
  - 输入提示符仍然可用
  - `exit` 命令正常工作

### TC-32: 兼容性测试 - 多 AI 提供商

- **Target**: ai-intent-recognizer/spec.md - 父 Spec - Requirement: AI 客户端配置
- **Type**: Manual
- **Preconditions**: 配置不同的 `OPENAI_BASE_URL`
- **Steps**:
  1. 配置 `OPENAI_BASE_URL` 为 Azure OpenAI
  2. 测试意图识别
  3. 配置 `OPENAI_BASE_URL` 为本地 Ollama (http://localhost:11434/v1)
  4. 测试意图识别
- **Expected Result**:
  - 所有兼容的 AI 提供商都能正常工作
  - 意图识别结果一致
  - 错误处理符合预期
