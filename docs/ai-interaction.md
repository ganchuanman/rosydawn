# AI 交互功能使用指南

本文档说明如何使用 Rosydawn 的 AI 对话式交互功能。

## 快速开始

### 1. 配置环境变量

复制 `.env.example` 到 `.env` 并配置必需的变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件，**将 `your-api-key` 替换为真实的 API Key**：

```env
# OpenAI API 配置（必填）
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxx

# 可选：使用自定义 API 端点（Azure/Ollama/DeepSeek）
# OPENAI_BASE_URL=https://api.openai.com/v1

# 运行模式（development 或 production）
NODE_ENV=development
```

**重要**: 如果不配置真实的 API Key，REPL 会提示错误并退出。

**获取 API Key:**
- OpenAI: https://platform.openai.com/api-keys
- DeepSeek: https://platform.deepseek.com/
- Azure OpenAI: https://portal.azure.com/
- Ollama (免费本地): https://ollama.com/

### 2. 构建知识库

在首次使用或更新 Workflow 后，需要构建知识库：

```bash
npm run build:knowledge
```

这会生成 `dist/knowledge-base.json` 文件，包含所有已注册 Workflow 的元数据。

### 3. 启动 REPL

```bash
npm run repl
```

你会看到欢迎界面：

```
╔════════════════════════════════════════╗
║       Rosydawn AI Blog Assistant       ║
║           Version: 0.0.1                 ║
╚════════════════════════════════════════╝

💬 这是一个 AI 对话式博客管理工具
📝 输入自然语言指令，AI 会帮你执行操作
🚪 输入 exit/quit/q 或按 Ctrl+C/D 退出
```

## 使用示例

### 示例 1: 创建文章

```
🤖 > 创建一篇关于 WebSocket 的文章

🤔 思考中...

✅ 识别到意图: mock_create_article
   置信度: 95%
   推理: 用户想要创建文章，并指定了主题为 WebSocket

✅ Mock Workflow 执行结果:
   Intent: mock_create_article
   参数: { topic: "WebSocket", tags: [], category: "default" }
   (当前为 Mock Workflow，未执行真实操作)
```

### 示例 2: 参数缺失

```
🤖 > 创建文章

🤔 思考中...

✅ 识别到意图: mock_create_article
   置信度: 85%
   推理: 用户想要创建文章，但缺少 topic 参数

⚠️  需要补充以下参数: topic

📝 请输入 topic: WebSocket 实战指南

✅ Mock Workflow 执行结果:
   Intent: mock_create_article
   参数: { topic: "WebSocket 实战指南", tags: [], category: "default" }
   (当前为 Mock Workflow，未执行真实操作)
```

### 示例 3: 列出文章

```
🤖 > 显示所有文章

🤔 思考中...

✅ 识别到意图: mock_list_articles
   置信度: 92%
   推理: 用户想要查看文章列表

✅ Mock Workflow 执行结果:
   Intent: mock_list_articles
   参数: { category: "all", limit: 10 }
   结果: [] (空列表)
   (当前为 Mock Workflow，未执行真实操作)
```

### 示例 4: 发布文章

```
🤖 > 发布最新文章

🤔 思考中...

✅ 识别到意图: mock_publish
   置信度: 88%
   推理: 用户想要发布文章

✅ Mock Workflow 执行结果:
   Intent: mock_publish
   参数: { articleId: "latest", platform: "blog" }
   (当前为 Mock Workflow，未执行真实操作)
```

## Mock Workflows 说明

当前系统包含 3 个 Mock Workflows，用于测试 AI 交互功能：

### mock_create_article

创建文章（Mock）

- **必需参数**: `topic` (文章主题)
- **可选参数**: `tags` (标签), `category` (分类)
- **示例输入**: "创建一篇关于 WebSocket 的文章"

### mock_list_articles

列出文章（Mock）

- **可选参数**: `category` (分类), `limit` (数量限制)
- **示例输入**: "显示所有文章", "列出文章"

### mock_publish

发布文章（Mock）

- **必需参数**: `articleId` (文章 ID)
- **可选参数**: `platform` (发布平台)
- **示例输入**: "发布文章"

**注意**: Mock Workflows 不会执行真实操作，仅用于验证意图识别和参数收集功能。

## 环境变量配置

### OpenAI API

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
```

### Azure OpenAI

```env
OPENAI_API_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-35-turbo
OPENAI_BASE_URL=https://your-resource.openai.azure.com/
```

### Ollama (本地)

```env
OPENAI_BASE_URL=http://localhost:11434/v1
# Ollama 不需要 API Key，但需要设置一个占位符
OPENAI_API_KEY=ollama
```

### DeepSeek

```env
OPENAI_API_KEY=your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
```

## 开发模式 vs 生产模式

### 开发模式

```bash
NODE_ENV=development npm run repl
```

- 实时生成知识库（每次启动都会重新生成）
- 启动较慢，但方便调试
- 自动注册 Workflows

### 生产模式

```bash
npm run build:knowledge
npm run repl
```

- 从 `dist/knowledge-base.json` 加载知识库
- 启动快速
- 需要手动构建知识库

## 常见问题

### Q: AI 意图识别不准确怎么办？

A: 尝试以下方法：

1. 使用更明确的表达方式
2. 提供更多上下文信息
3. 使用标准语法（如 "创建一篇关于 [主题] 的文章"）

### Q: AI 调用超时怎么办？

A:

1. 检查网络连接
2. 尝试使用国内 API 代理
3. 考虑使用本地模型（Ollama）

### Q: 如何添加自定义 Workflow？

A:

1. 在 `src/workflows/` 目录下创建新文件
2. 定义 Workflow 对象
3. 在 `src/workflows/index.ts` 中注册
4. 运行 `npm run build:knowledge` 更新知识库

## 技术架构

```
用户输入 → AI 意图识别 → 参数收集 → Workflow 执行 → 结果输出
           ↓
        知识库 (Workflows + 静态知识)
```

### 核心组件

- **REPL**: `src/cli/repl.ts` - 交互式命令行
- **AI Client**: `src/ai/client.ts` - AI 提供商适配层
- **Intent Recognizer**: `src/ai/intent-recognizer.ts` - 意图识别
- **Param Collector**: `src/ai/param-collector.ts` - 参数收集
- **Knowledge Base**: `src/knowledge/` - 知识库生成和加载
- **Workflow Engine**: `src/workflow/` - 工作流引擎

## 后续计划

- [ ] 实现真实的内容管理 Workflows
- [ ] 支持多轮对话上下文
- [ ] 添加命令自动补全
- [ ] 实现 AI 响应缓存
- [ ] 支持更多 LLM 提供商

## 贡献指南

欢迎贡献代码和提出建议！请参考项目根目录的 README.md。
