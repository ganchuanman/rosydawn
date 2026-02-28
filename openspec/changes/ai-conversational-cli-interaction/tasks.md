# AI 交互层实现任务清单

## 1. 项目结构初始化

- [x] 1.1 创建 `src/cli/` 目录结构
- [x] 1.2 创建 `src/ai/` 目录结构
- [x] 1.3 创建 `src/knowledge/` 目录结构
- [x] 1.4 创建 `knowledge/` 目录用于存放静态知识文件
- [x] 1.5 在 `package.json` 中添加 `repl` 脚本: `"repl": "tsx src/cli/repl.ts"`
- [x] 1.6 在 `package.json` 中添加 `build:knowledge` 脚本: `"build:knowledge": "tsx scripts/build-knowledge.ts"`

## 2. Mock Workflows 注册

- [x] 2.1 创建 `src/workflows/mock-create-article.ts` (Mock 创建文章 Workflow)
- [x] 2.2 创建 `src/workflows/mock-list-articles.ts` (Mock 列出文章 Workflow)
- [x] 2.3 创建 `src/workflows/mock-publish.ts` (Mock 发布文章 Workflow)
- [x] 2.4 在 Workflow 注册表中注册这 3 个 Mock Workflows
- [x] 2.5 确保 Mock Workflows 的 metadata 包含 `[Mock]` 标注

## 3. REPL 基础实现

- [x] 3.1 创建 `src/cli/repl.ts` 主入口文件
- [x] 3.2 实现 `showWelcome()` 函数显示欢迎信息
- [x] 3.3 实现 `startREPL()` 主循环（使用 `@inquirer/prompts` 的 `input` 组件）
- [x] 3.4 实现空输入处理（直接返回提示符）
- [x] 3.5 实现退出命令处理（`exit`, `quit`, `q`）
- [x] 3.6 实现 Ctrl+C 和 Ctrl+D 信号处理
- [x] 3.7 创建 `processInput()` 函数作为输入处理入口

## 4. AI 客户端适配层

- [x] 4.1 创建 `src/ai/types.ts` 定义 AI 相关类型（`ChatOptions`, `ChatResponse`, `Intent` 等）
- [x] 4.2 创建 `src/ai/client.ts` 实现 `AIClient` 接口
- [x] 4.3 实现 `createAIClient()` 工厂函数（根据 `OPENAI_BASE_URL` 检测提供商）
- [x] 4.4 实现 `OpenAIClient` 类（标准 OpenAI API）
- [x] 4.5 实现 `AzureAIClient` 类（Azure OpenAI 适配）
- [x] 4.6 实现 `OllamaAIClient` 类（本地 Ollama 适配）
- [x] 4.7 添加环境变量读取逻辑（`OPENAI_API_KEY`, `OPENAI_BASE_URL`）
- [x] 4.8 实现 API 调用超时控制（5 秒超时）

## 5. 意图识别核心

- [x] 5.1 创建 `src/ai/intent-recognizer.ts` 文件
- [x] 5.2 定义 `IntentRecognitionResult` 接口（包含 intent, params, missing_params, confidence）
- [x] 5.3 实现 `buildSystemPrompt()` 函数（构建 System Prompt）
- [x] 5.4 实现 `parseAIResponse()` 函数（解析 AI JSON 响应）
- [x] 5.5 实现 JSON 代码块提取逻辑（处理 ```json ``` 包裹）
- [x] 5.6 实现 Markdown 格式清理逻辑
- [x] 5.7 实现 `recognizeIntent()` 主函数（调用 AI + 解析结果）
- [x] 5.8 实现置信度判断逻辑（confidence >= 0.7 直接执行，< 0.7 请求确认）
- [x] 5.9 实现未知意图处理（intent = "unknown" 时返回友好提示）

## 6. 多轮参数收集

- [x] 6.1 创建 `src/ai/param-collector.ts` 文件
- [x] 6.2 实现 `collectMissingParams()` 函数
- [x] 6.3 实现参数提示生成（如 "📝 请输入文章主题："）
- [x] 6.4 实现参数验证逻辑（检查格式是否正确）
- [x] 6.5 实现取消操作处理（用户输入 `cancel` 或 `取消`）
- [x] 6.6 集成到 `processInput()` 流程中

## 7. 知识库类型定义

- [x] 7.1 创建 `src/knowledge/types.ts` 文件
- [x] 7.2 定义 `WorkflowMetadata` 接口（name, description, params, examples）
- [x] 7.3 定义 `ParamSchema` 接口（name, type, required, description, default）
- [x] 7.4 定义 `KnowledgeBase` 接口（workflows, projectRules, constraints, generatedAt）

## 8. 知识库生成器

- [x] 8.1 创建 `src/knowledge/generator.ts` 文件
- [x] 8.2 实现 `extractWorkflowMetadata()` 函数（从 Workflow 定义提取元数据）
- [x] 8.3 实现 `loadStaticKnowledge()` 函数（读取 `knowledge/static.md`）
- [x] 8.4 实现 `generateKnowledgeBase()` 主函数（合并动态和静态知识）
- [x] 8.5 实现 Workflow 元数据格式化（转换为 Prompt 友好格式）
- [x] 8.6 添加 Mock Workflow 特殊标注逻辑

## 9. 知识库构建脚本

- [x] 9.1 创建 `scripts/build-knowledge.ts` 文件
- [x] 9.2 实现 Workflow 扫描和注册逻辑
- [x] 9.3 调用 `generateKnowledgeBase()` 生成知识库
- [x] 9.4 将知识库写入 `dist/knowledge-base.json`
- [x] 9.5 添加文件大小检查（>50KB 显示警告）
- [x] 9.6 添加生成时间戳（`generatedAt` 字段）
- [x] 9.7 添加成功/失败提示信息

## 10. 知识库加载器

- [x] 10.1 创建 `src/knowledge/loader.ts` 文件
- [x] 10.2 实现 `loadKnowledge()` 函数
- [x] 10.3 实现生产模式逻辑（加载 `dist/knowledge-base.json`）
- [x] 10.4 实现开发模式逻辑（实时生成知识库）
- [x] 10.5 实现文件不存在错误处理（生产模式）
- [x] 10.6 添加模式判断逻辑（`NODE_ENV=development` 或 `production`）

## 11. REPL + AI 集成

- [x] 11.1 在 `startREPL()` 中调用 `loadKnowledge()` 加载知识库
- [x] 11.2 在 `processInput()` 中调用 `recognizeIntent()` 进行意图识别
- [x] 11.3 实现加载提示显示（"🤔 思考中..."）
- [x] 11.4 实现意图识别结果格式化输出
- [x] 11.5 实现 Mock Workflow 执行结果输出
- [x] 11.6 集成参数收集流程（缺失参数时触发）

## 12. 错误处理与降级

- [x] 12.1 创建 `src/cli/error-handler.ts` 文件
- [x] 12.2 定义 `ErrorLevel` 枚举（INFO, WARNING, ERROR, FATAL）
- [x] 12.3 实现 `handleError()` 函数（分级错误处理）
- [x] 12.4 实现 AI 超时错误处理（显示友好提示）
- [x] 12.5 实现 AI 认证失败错误处理（提示检查 API Key）
- [x] 12.6 实现 AI 服务不可用错误处理（建议使用命令行模式）
- [x] 12.7 实现响应格式错误处理（提示换种表达方式）
- [x] 12.8 在 `processInput()` 中集成错误处理

## 13. 静态知识文件

- [x] 13.1 创建 `knowledge/static.md` 文件
- [x] 13.2 编写项目背景介绍
- [x] 13.3 编写部署流程说明
- [x] 13.4 编写常见问题解答
- [x] 13.5 编写使用注意事项
- [x] 13.6 添加 AI 交互示例

## 14. 单元测试

- [x] 14.1 创建 `tests/cli/repl.test.ts` 测试 REPL 基础功能
- [x] 14.2 测试退出命令（exit/quit/q）
- [x] 14.3 测试空输入处理
- [x] 14.4 创建 `tests/ai/intent-recognizer.test.ts` 测试意图识别
- [x] 14.5 测试 JSON 响应解析（标准格式）
- [x] 14.6 测试 JSON 代码块提取
- [x] 14.7 测试 Markdown 格式清理
- [x] 14.8 测试置信度判断逻辑
- [x] 14.9 创建 `tests/ai/param-collector.test.ts` 测试参数收集
- [x] 14.10 测试参数缺失检测
- [x] 14.11 测试参数验证
- [x] 14.12 测试取消操作
- [x] 14.13 创建 `tests/knowledge/generator.test.ts` 测试知识库生成
- [x] 14.14 测试 Workflow 元数据提取
- [x] 14.15 测试静态知识加载
- [x] 14.16 测试知识库合并
- [x] 14.17 创建 `tests/knowledge/loader.test.ts` 测试知识库加载
- [x] 14.18 测试生产模式加载
- [x] 14.19 测试开发模式实时生成
- [x] 14.20 测试文件不存在错误

## 15. 集成测试

- [x] 15.1 创建 `tests/integration/repl-flow.test.ts` 测试完整交互流程
- [x] 15.2 测试 REPL 启动 → 输入 → 意图识别 → 结果输出
- [x] 15.3 测试多轮参数收集流程
- [x] 15.4 测试 AI 调用失败降级
- [x] 15.5 测试知识库加载 → 意图识别完整链路

## 16. 文档与配置

- [x] 16.1 创建 `docs/ai-interaction.md` 说明 AI 交互功能使用方法
- [x] 16.2 编写环境变量配置说明（`OPENAI_API_KEY`, `OPENAI_BASE_URL`）
- [x] 16.3 编写知识库构建说明（`npm run build:knowledge`）
- [x] 16.4 编写 REPL 启动说明（`npm run repl`）
- [x] 16.5 编写 Mock Workflow 说明
- [x] 16.6 更新 `README.md` 添加 AI 交互功能介绍
- [x] 16.7 创建 `.env.example` 文件（包含必需的环境变量示例）

## 17. 性能优化

- [x] 17.1 优化知识库加载速度（确保 <1 秒）
- [x] 17.2 优化 AI 调用延迟监控（添加日志）
- [x] 17.3 添加 AI 响应缓存机制（可选，实验性）

## 18. 边缘用例处理

- [x] 18.1 测试特殊字符输入（`<script>alert('test')</script>`）
- [x] 18.2 测试超长输入（500+ 字符）
- [x] 18.3 测试空闲状态（5 分钟无输入）
- [x] 18.4 添加必要的输入清理和验证

## 19. 兼容性测试

- [x] 19.1 测试 OpenAI API 兼容性
- [x] 19.2 测试 Azure OpenAI 兼容性
- [x] 19.3 测试本地 Ollama 兼容性
- [x] 19.4 测试 DeepSeek API 兼容性（如果可用）

## 20. 最终验证

- [x] 20.1 运行所有单元测试（覆盖率 >80%）
- [x] 20.2 运行所有集成测试
- [x] 20.3 手动测试 TC-01 至 TC-32（参考 testcases.md）
- [x] 20.4 验证生产环境部署流程（构建知识库 + 启动 REPL）
- [x] 20.5 验证开发环境调试流程（实时生成知识库）
- [x] 20.6 检查代码符合 TypeScript strict mode
- [x] 20.7 检查代码符合项目命名规范
- [x] 20.8 代码审查（参考 review.md）
- [x] 20.9 更新 CHANGELOG.md 记录本 Change 的变更
- [x] 20.10 准备合并到主分支的 PR