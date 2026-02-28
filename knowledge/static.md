# Rosydawn 静态知识库

本文档包含项目的静态知识，用于辅助 AI 意图识别。

## 项目背景

Rosydawn 是一个基于 Astro 的个人技术博客系统，支持以下核心功能：

- **内容管理**: 创建、编辑、发布技术文章
- **AI 交互**: 通过自然语言管理博客
- **自动化部署**: 支持 GitHub Pages、Vercel 等平台

### 技术栈

- **前端框架**: Astro
- **AI 集成**: OpenAI API (支持 Azure/Ollama/DeepSeek)
- **工作流引擎**: 基于 Step 的可扩展工作流系统

## 部署流程

### 开发环境

1. 安装依赖: `npm install`
2. 配置环境变量: 复制 `.env.example` 到 `.env`
3. 构建知识库: `npm run build:knowledge`
4. 启动开发服务器: `npm run dev`

### 生产环境

1. 构建项目: `npm run build`
2. 部署到服务器: 使用 `npm run deploy:*` 系列命令

## 常见问题

### Q: AI 意图识别不准确怎么办？

A: 可以尝试以下方法：
- 使用更明确的表达方式
- 提供更多上下文信息
- 查看可用命令列表（输入 `help`）

### Q: AI 服务调用失败怎么办？

A: 检查以下项目：
- `OPENAI_API_KEY` 环境变量是否配置
- `OPENAI_BASE_URL` 是否正确（如使用第三方服务）
- 网络连接是否正常
- API 余额是否充足

### Q: 如何添加新的 Workflow？

A: 参考 `src/workflows/mock-*.ts` 文件，创建新的 Workflow 定义并在 `src/workflows/index.ts` 中注册。

## 使用注意事项

### 参数格式

- **字符串**: 直接输入文本即可
- **数字**: 输入纯数字（如 `123`）
- **布尔值**: 输入 `true`/`false` 或 `是`/`否`
- **数组**: 使用逗号分隔（如 `tag1, tag2, tag3`）

### 交互模式

- **REPL 模式**: 运行 `npm run repl` 进入交互式命令行
- **单次命令**: 直接运行 `npm run content:new` 等脚本

### Mock Workflows

当前系统包含 3 个 Mock Workflows，用于测试 AI 交互功能：

- `mock_create_article`: 创建文章（不执行真实操作）
- `mock_list_articles`: 列出文章（返回空列表）
- `mock_publish`: 发布文章（不执行真实操作）

这些 Mock Workflows 仅用于验证意图识别和参数收集功能，不会修改实际数据。

## AI 交互示例

### 示例 1: 创建文章

```
用户: 创建一篇关于 WebSocket 的文章
AI: 识别到意图 mock_create_article
    参数: { topic: "WebSocket" }
```

### 示例 2: 参数缺失

```
用户: 创建文章
AI: 需要更多信息
    📝 请输入文章主题:
用户: WebSocket 实战指南
AI: 识别到意图 mock_create_article
    参数: { topic: "WebSocket 实战指南" }
```

### 示例 3: 列出文章

```
用户: 显示所有文章
AI: 识别到意图 mock_list_articles
    结果: [] (空列表)
```

### 示例 4: 发布文章

```
用户: 发布最新的文章
AI: 识别到意图 mock_publish
    参数: { articleId: "latest" }
```

## 系统约束

1. **Workflow 数量限制**: 建议不超过 50 个，以免知识库过大影响 AI 性能
2. **参数数量限制**: 单个 Workflow 的参数不超过 10 个
3. **超时限制**: AI 调用超时时间为 5 秒
4. **置信度阈值**: 低于 0.7 时会请求用户确认

## 环境变量

### 必需变量

- `OPENAI_API_KEY`: OpenAI API 密钥（或兼容服务的密钥）

### 可选变量

- `OPENAI_BASE_URL`: API 端点（用于 Azure/Ollama/DeepSeek）
- `NODE_ENV`: 运行模式（`development` 或 `production`）
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI 端点
- `AZURE_OPENAI_API_KEY`: Azure OpenAI 密钥
- `AZURE_OPENAI_DEPLOYMENT`: Azure OpenAI 部署名称

## 后续计划

- [ ] 实现真实的内容管理 Workflows
- [ ] 添加命令自动补全
- [ ] 支持多轮对话上下文
- [ ] 实现 AI 响应缓存
- [ ] 添加更多 LLM 提供商支持
