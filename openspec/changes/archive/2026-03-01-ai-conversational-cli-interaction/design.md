# AI 交互层技术设计

## Context

### 背景

本项目正在构建一个 AI 对话式 CLI 工具，用于管理个人技术博客。在 Change 1（core）中，我们已经实现了：

- **Workflow 引擎**: 执行流程编排
- **Step 注册表**: 可扩展的步骤注册机制
- **基础类型定义**: Workflow、Step、Intent 等核心类型

现在需要实现**用户交互层**，让用户能够通过自然语言与系统交互。

### 当前状态

- **已完成**: 基础设施层（Workflow Engine + Step Registry）
- **进行中**: 交互层（REPL + AI 意图识别 + 知识库）
- **后续计划**: 业务 Workflow（MVP）→ 功能扩展（Extend/Polish）

### 约束

- 复用现有 `openai` 和 `@inquirer/prompts` 依赖
- 必须与 Change 1 的 Workflow 引擎无缝集成
- 需要兼容多种 OpenAI 兼容 API（OpenAI/Azure/DeepSeek/Ollama）
- 知识库构建时机：在项目构建时生成（运行时直接加载）
- 当前阶段通过 `npm run` 执行，不配置独立命令

### 相关方

- **用户**: 通过自然语言输入指令的博客作者
- **开发者**: 需要注册新 Workflow 的贡献者
- **AI 服务**: 提供意图识别能力的 LLM 提供商

## Goals / Non-Goals

### Goals

1. **提供流畅的 REPL 交互体验**
   - 支持交互式 REPL 模式（默认）
   - 支持单次命令行模式（CI/CD 场景）
   - 友好的错误提示和帮助信息

2. **实现准确的意图识别**
   - 将自然语言解析为结构化意图
   - 检测参数缺失并引导用户补充
   - 处理未知意图和模糊输入

3. **自动化知识库生成**
   - 从 Workflow 定义自动提取 AI 上下文
   - 在项目构建时生成知识库（运行时快速加载）
   - 支持静态知识补充（如项目特定规则）

### Non-Goals

1. **不实现具体业务 Workflow**（留给 Change 3: MVP）
   - 不实现 `create_article`、`publish` 等真实 Workflow
   - 仅用 Mock Workflow 验证交互层功能

2. **不实现高级 CLI 功能**（留给 Change 5: Polish）
   - 不实现命令自动补全
   - 不实现命令历史搜索
   - 不实现多级分类系统

3. **不重新实现基础设施**（已在 Change 1 完成）
   - 不重新实现 Workflow 引擎
   - 不重新实现 Step 注册表

4. **不配置独立命令行工具**（后续 change 处理）
   - 不添加 `bin` 字段到 package.json
   - 不配置全局命令 `rosydawn`
   - 通过 `npm run repl` 等脚本执行

## Decisions

### 1. REPL 实现方案

**决策**: 使用 `@inquirer/prompts` 的 `input` 组件实现 REPL

**备选方案**:
- **Node.js readline**: 原生 API，但功能有限（无自动补全、样式差）
- **enquirer**: 功能丰富但社区活跃度下降
- **inquirer（v8）**: 旧版本，API 不如 `@inquirer/prompts` 模块化

**选择理由**:
- 项目已依赖 `@inquirer/prompts`（用于 content:new 等命令）
- 支持键盘快捷键（Ctrl+C、Ctrl+D）
- 支持输入验证和默认值
- 模块化设计（只引入需要的组件）

**实现细节**:
```typescript
// src/cli/repl.ts
import { input } from '@inquirer/prompts';

export async function startREPL() {
  showWelcome();

  while (true) {
    try {
      const userInput = await input({
        message: '',
        prefix: '🤖 >'
      });

      // 退出命令
      if (['exit', 'quit', 'q'].includes(userInput.trim().toLowerCase())) {
        console.log('👋 再见！');
        break;
      }

      // 处理输入
      await processInput(userInput);
    } catch (error) {
      // Ctrl+C 或 Ctrl+D
      console.log('\n👋 再见！');
      break;
    }
  }
}
```

### 2. AI 意图识别架构

**决策**: 使用 Prompt Engineering + 结构化输出

**备选方案**:
- **Fine-tuned Model**: 成本高，维护复杂
- **Few-shot Learning**: 需要 Prompt 工程（✅ 选择）
- **Function Calling**: OpenAI 特有，不兼容所有提供商

**选择理由**:
- 兼容所有 OpenAI 兼容 API（通过 `OPENAI_BASE_URL`）
- 无需额外训练成本
- 通过 Prompt Engineering 可达到 90%+ 准确率
- 易于调试和迭代

**Prompt 设计**:
```text
你是一个博客管理助手的意图识别模块。

## 可用功能
{knowledge_base}

## 用户输入
{user_input}

## 输出要求
- 识别用户的意图（匹配最接近的功能名称）
- 提取参数（如果有）
- 检测缺失的必需参数
- 给出置信度（0-1）

## 输出格式（JSON）
{
  "intent": "create_article | list_articles | ...",
  "params": { ... },
  "missing_params": ["topic", "tags"],
  "confidence": 0.95,
  "reasoning": "用户想要创建文章，但没有指定主题"
}
```

**容错机制**:
```typescript
// src/ai/intent-recognizer.ts
export async function recognizeIntent(userInput: string, knowledge: KnowledgeBase) {
  try {
    const response = await aiClient.chat({
      messages: [
        { role: 'system', content: buildSystemPrompt(knowledge) },
        { role: 'user', content: userInput }
      ]
    });

    const result = parseJSON(response.content);

    // 低置信度处理
    if (result.confidence < 0.7) {
      return {
        type: 'clarification_needed',
        message: '我不太确定您的意图，请提供更多信息',
        possibleIntents: [result.intent]
      };
    }

    return result;
  } catch (error) {
    // AI 调用失败
    return {
      type: 'error',
      message: 'AI 服务暂时不可用',
      fallback: 'manual_mode'
    };
  }
}
```

### 3. 知识库生成策略

**决策**: 构建时生成 + 运行时加载 + 开发时实时生成

**知识库组成**:
```typescript
interface KnowledgeBase {
  // 从 Workflow 定义提取（动态）
  workflows: {
    name: string;
    description: string;
    params: {
      name: string;
      type: string;
      required: boolean;
      description: string;
    }[];
    examples: string[];
  }[];

  // 从静态文件加载（静态）
  projectRules: string[];
  constraints: string[];
}
```

**生成流程**:
```bash
# 构建时生成知识库
npm run build:knowledge
```

```typescript
// scripts/build-knowledge.ts
import { workflowRegistry } from '../src/workflow/registry';
import { generateKnowledgeBase } from '../src/knowledge/generator';
import fs from 'fs';

// 1. 扫描并注册所有 Workflows
await workflowRegistry.loadAll();

// 2. 生成知识库
const knowledge = generateKnowledgeBase(workflowRegistry.getAll());

// 3. 写入文件
fs.writeFileSync(
  'dist/knowledge-base.json',
  JSON.stringify(knowledge, null, 2)
);

console.log('✅ 知识库已生成到 dist/knowledge-base.json');
```

**运行时加载**:
```typescript
// src/knowledge/loader.ts
export async function loadKnowledge(): Promise<KnowledgeBase> {
  // 开发模式：实时生成
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 开发模式：实时生成知识库...');
    const { workflowRegistry } = await import('../workflow/registry');
    const { generateKnowledgeBase } = await import('./generator');
    await workflowRegistry.loadAll();
    return generateKnowledgeBase(workflowRegistry.getAll());
  }

  // 生产模式：加载预构建的知识库
  const knowledgePath = path.join(process.cwd(), 'dist/knowledge-base.json');
  if (!fs.existsSync(knowledgePath)) {
    throw new Error('知识库不存在，请先运行 npm run build:knowledge');
  }

  return JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'));
}
```

**缓存更新策略**:
- **构建时**: 通过 `npm run build:knowledge` 手动更新
- **开发时**: 每次启动 REPL 时重新生成
- **未来扩展**: 提供 `rosydawn knowledge refresh` 命令

**备选方案对比**:
- **完全静态**: 维护成本高（每次新增 Workflow 需手动更新）❌
- **完全动态**: 启动慢（每次启动都生成）❌
- **构建时 + 开发时实时**: 启动快 + 开发友好 ✅

### 4. 错误处理策略

**决策**: 分级错误处理 + 用户引导

**错误分类**:
```typescript
enum ErrorLevel {
  INFO = 'info',      // 未知意图，提示可用命令
  WARNING = 'warning', // 参数缺失，引导补充
  ERROR = 'error',     // AI 调用失败，降级处理
  FATAL = 'fatal'      // 系统错误，退出 REPL
}
```

**处理示例**:
```typescript
// 未知意图
function handleUnknownIntent() {
  console.log('❌ 没有理解您的意图');
  console.log('💡 可用命令：');
  console.log('  - 创建文章');
  console.log('  - 发布文章');
  console.log('  - 查看列表');
}

// 参数缺失
async function handleMissingParams(intent: string, missing: string[]) {
  console.log('⚠️  需要更多信息');

  if (missing.includes('topic')) {
    const topic = await input({ message: '📝 请输入文章主题：' });
    return { topic };
  }
}

// AI 调用失败
function handleAIFailure() {
  console.log('❌ AI 服务暂时不可用');
  console.log('💡 切换到手动模式');
  console.log('可用命令：[create_article, list_articles, publish]');
}
```

## Risks / Trade-offs

### Risk 1: AI 意图识别准确率低

**风险**: 用户输入模糊或不规范时，AI 可能误识别意图

**缓解措施**:
1. **置信度阈值**: 低于 0.7 时提示用户确认
2. **Few-shot Examples**: 在 Prompt 中提供典型示例
3. **迭代优化**: 收集 Bad Cases，持续改进 Prompt
4. **降级方案**: 允许用户直接输入结构化命令（如 `create_article --topic "WebSocket"`）

**示例**:
```typescript
// Prompt 中的 Few-shot Examples
const examples = [
  { input: "创建一篇关于 WebSocket 的文章", intent: "create_article", params: { topic: "WebSocket" } },
  { input: "发布最新文章", intent: "publish_article", params: {} },
  { input: "显示所有文章", intent: "list_articles", params: {} }
];
```

### Risk 2: AI 调用延迟影响体验

**风险**: 每次意图识别都需要调用 AI API（200-1000ms）

**缓解措施**:
1. **并行加载**: 启动时预加载知识库（避免首次延迟）
2. **加载提示**: 显示 "🤔 思考中..." 动画
3. **超时控制**: 设置 5 秒超时，超时后降级到手动模式

**实现**:
```typescript
const result = await Promise.race([
  recognizeIntent(userInput, knowledge),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 5000)
  )
]);
```

### Risk 3: 知识库过大导致 Prompt 过长

**风险**: 当 Workflow 数量增加到 50+ 时，Prompt 可能超过 Token 限制

**缓解措施**:
1. **Token 监控**: 启动时检查知识库大小，超过阈值时警告
2. **动态裁剪**: 根据用户输入关键词过滤相关 Workflow（未来优化）
3. **分层知识库**: 只加载高频 Workflow 的详细描述（未来优化）

**当前策略**:
- MVP 阶段预计 5-10 个 Workflow，Token 消耗可控
- 后续如超过 50 个 Workflow，再考虑优化方案

### Risk 4: 多 AI 提供商兼容性问题

**风险**: 不同提供商的 API 行为差异（如 Ollama 不支持某些参数）

**缓解措施**:
1. **适配层模式**: 封装统一的 `AIClient` 接口
2. **特性检测**: 启动时测试 API 能力（如是否支持流式输出）
3. **降级策略**: 不支持时使用基础 Prompt 方案

**适配层设计**:
```typescript
// src/ai/client.ts
export interface AIClient {
  chat(options: ChatOptions): Promise<ChatResponse>;
}

export function createAIClient(): AIClient {
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  // 根据 baseURL 检测提供商
  if (baseURL.includes('azure')) {
    return new AzureAIClient();
  } else if (baseURL.includes('localhost') || baseURL.includes('127.0.0.1')) {
    return new OllamaAIClient(); // 本地模型
  } else {
    return new OpenAIClient(); // 标准 OpenAI API
  }
}
```

## Migration Plan

### 阶段 1: 基础实现（本 Change）

**目标**: 建立交互层基础框架

1. **实现 REPL 基础循环** (Day 1-2)
   - 创建 `src/cli/repl.ts`
   - 实现欢迎信息和输入循环
   - 添加退出命令处理

2. **实现 AI 意图识别** (Day 2-3)
   - 创建 `src/ai/intent-recognizer.ts`
   - 实现 Prompt 模板
   - 添加 JSON 解析和错误处理

3. **实现知识库生成器** (Day 3-4)
   - 创建 `src/knowledge/generator.ts`
   - 创建 `scripts/build-knowledge.ts`
   - 实现 Workflow 元数据提取

4. **集成测试** (Day 4-5)
   - 注册 Mock Workflows
   - 测试完整交互流程
   - 编写单元测试（覆盖率 >80%）

**验证标准**:
```bash
# 启动 REPL
npm run repl

# 测试意图识别
🤖 > 创建一篇关于 WebSocket 的文章
✅ 识别到意图: mock_create_article
   参数: { topic: "WebSocket" }
   （当前为 Mock Workflow，未执行真实操作）

# 测试参数缺失
🤖 > 创建文章
⚠️  需要更多信息
📝 请输入文章主题：> WebSocket
✅ 识别到意图: mock_create_article
   参数: { topic: "WebSocket" }
```

### 阶段 2: 集成真实 Workflows（Change 3: MVP）

1. 注册真实 Workflows（`create_article`、`publish` 等）
2. 验证知识库自动更新
3. 优化 Prompt（基于真实使用数据）
4. 添加更多 Few-shot Examples

### 阶段 3: 性能优化（Change 5: Polish）

1. 实现本地缓存（可选）
2. 优化启动速度
3. 添加命令自动补全
4. 实现命令历史搜索

### 回滚策略

如果 AI 交互层出现严重问题，可快速降级：

1. **配置开关**: 在 `rosydawn.config.yaml` 中添加 `enableAI: false`
2. **降级行为**: 退回到传统 CLI 模式（`npm run content:new`）
3. **版本兼容**: 保留传统脚本入口

## Open Questions

1. **知识库刷新时机**
   - 问题: 用户安装第三方 Workflow 后，如何触发知识库更新？
   - 备选方案:
     - 手动运行 `npm run build:knowledge`（简单）
     - 提供 `npm run knowledge:refresh` 命令（友好）
     - 检测 `workflow-registry.json` 变化自动提示（智能）
   - 当前倾向: 手动命令 + 提示信息

2. **多轮对话支持**
   - 问题: 是否需要支持多轮对话（如 "创建文章" → "主题是 WebSocket"）？
   - 影响: 需要维护对话上下文（增加复杂度）
   - 当前倾向: MVP 不支持，留给 Change 5（可通过参数引导实现类似体验）

3. **AI 调用成本控制**
   - 问题: 如何避免频繁调用导致 API 费用过高？
   - 备选方案:
     - 本地速率限制（如每分钟最多 10 次）
     - 配置开关（用户可禁用 AI）
     - 显示每次调用的 Token 消耗
   - 当前倾向: 显示 Token 消耗 + 配置开关

4. **错误消息国际化**
   - 问题: 错误消息是否需要支持多语言？
   - 影响: 需要引入 i18n 机制
   - 当前倾向: 仅中文（根据项目约束）
