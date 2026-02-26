## Why

Rosydawn 目前通过 `npm run xxx` 执行脚手架命令，用户需要记忆命令名称和参数。随着功能增多，命令行交互复杂度增加，用户体验下降。

**现在改变的原因**：AI 对话式 CLI 可以大幅降低使用门槛，让用户通过自然语言完成文章创建、发布、部署等完整生命周期，无需记忆命令。同时，项目已有 OpenAI 集成能力，可以复用现有的 AI 服务配置。

## What Changes

### 新增

- **REPL 交互模式**：执行 `rosydawn` 命令后进入对话式交互界面
- **AI 意图识别**：将用户自然语言输入解析为结构化意图和参数
- **Workflow 引擎**：统一的任务编排和执行框架
- **Step 复用体系**：可组合的验证器、处理器、操作和通知器
- **知识库生成**：从 Workflow 定义自动提取 AI 上下文

### 修改

- **命令入口**：`rosydawn` 支持双模式——无参数进入 REPL，带参数执行传统命令
- **错误处理**：REPL 模式下从命令行参数错误变为对话式参数追问

### 废弃

- `scripts/` 目录下的 CLI 脚本将迁移到 `src/` 目录结构中（功能保留，通过新的命令入口调用）

## Capabilities

### New Capabilities

- `repl-interface`: REPL 交互界面，处理用户输入/输出循环、会话管理
- `ai-intent-recognizer`: AI 意图识别，将自然语言解析为结构化意图和参数
- `workflow-engine`: 工作流引擎，编排 Step 执行、错误处理、结果返回
- `step-registry`: 步骤注册表，管理可复用的 validators/processors/actions/notifiers
- `knowledge-generator`: 知识库生成器，从 Workflow 定义自动提取 AI 上下文

### Modified Capabilities

- `article-create-cli`: 从命令行参数模式改为 Workflow 模式，被 `ai-intent-recognizer` 调度
- `article-publish-cli`: 从命令行参数模式改为 Workflow 模式，被 `ai-intent-recognizer` 调度
- `unified-cli-interface`: 入口从命令路由改为 REPL + 意图路由
- `cli-category-system`: 命令分类体系将被意图分类体系取代
- `cli-help-system`: 从静态帮助文本改为 AI 问答式帮助

## Impact

### 代码结构变更

```
新增目录:
- src/cli/          # REPL 入口和交互逻辑
- src/ai/           # AI 客户端、意图识别、响应格式化
- src/workflow/     # 工作流引擎和类型定义
- src/steps/        # 可复用的步骤实现
- src/workflows/    # 工作流定义
- src/knowledge/    # AI 知识库

迁移/废弃:
- scripts/          # 迁移到 src/core/ 和 src/steps/
```

### 依赖变更

- 新增：无（复用现有 `openai` 依赖）
- 保持：`@inquirer/prompts`（用于 REPL 交互）

### API 变更

- `rosydawn` → 进入 REPL（AI 对话模式）
- `rosydawn <command>` → 传统命令行模式（保留，无 AI 依赖）
- 新增：环境变量 `OPENAI_BASE_URL` 支持不同 AI 提供商

### 系统影响

- REPL 模式需要配置 `OPENAI_API_KEY` 环境变量（命令行模式不需要）
- REPL 模式下 AI 调用会增加网络延迟（约 0.5-2 秒）
- 不影响现有的构建、部署流程
