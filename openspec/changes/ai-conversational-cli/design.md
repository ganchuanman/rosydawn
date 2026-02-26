## Context

Rosydawn 是个人技术博客系统，当前通过 `npm run xxx` 方式执行 CLI 命令。用户需要记忆命令名称和参数，交互体验较差。

**现状**：
- `scripts/cli/` 下的命令行工具，使用 `@inquirer/prompts` 进行交互
- `scripts/content/` 下的内容管理脚本（创建/发布文章）
- `scripts/deploy/` 下的部署脚本
- 已有 OpenAI 集成（用于生成文章标题、描述、标签）

**约束**：
- TypeScript strict mode
- 复用现有 `openai` 和 `@inquirer/prompts` 依赖
- 环境变量已配置在 `.env` 中（`OPENAI_API_KEY`, `OPENAI_BASE_URL`）
- 个人项目，无需考虑多租户、权限等复杂场景

## Goals / Non-Goals

**Goals:**
- 将命令行交互模式改为 AI 对话式 REPL
- 用户通过自然语言描述需求，AI 识别意图并执行
- 建立可扩展的 Workflow + Step 架构
- 从 Workflow 定义自动生成 AI 知识库

**Non-Goals:**
- 多轮对话状态管理（采用单轮无状态模式）
- AI 生成/改写文章内容
- 第三方插件系统
- Web UI

## Decisions

### 1. 交互模式：双模式并存

**选择**: 同时支持 REPL（AI 对话）和命令行两种模式

```
rosydawn              → 进入 REPL（AI 对话模式）
rosydawn <command>    → 传统命令行模式（无 AI 依赖）
rosydawn --version    → 显示版本
rosydawn --help       → 显示帮助
```

**理由**:
- 命令行模式作为 fallback，在无 AI 环境下仍可正常工作
- REPL 模式提供更友好的交互体验
- 两种模式共享底层 Workflow，代码复用

**替代方案**:
- 仅 REPL 模式：依赖 AI 可用性，容错性差
- 仅命令行模式：用户体验不佳

### 2. REPL 模式：单轮无状态

**选择**: REPL 内部采用单轮对话，每次交互独立

**理由**:
- 实现简单，无需复杂的状态管理
- 博客操作通常是独立的（创建、发布、部署）
- 参数缺失时通过追问补充，不需要上下文记忆

### 3. AI 意图识别：自建 Prompt + OpenAI API

**选择**: 使用结构化 Prompt 调用 OpenAI Compatible API，返回 JSON 格式的意图和参数

**理由**:
- 项目已集成 OpenAI，复用现有配置
- 通过 Prompt 注入知识库，保证 AI 回答基于实际能力
- 结构化输出便于后续处理

**Prompt 结构**:
```
System: 动态知识库 + 意图 Schema + 静态知识
User: 用户输入
Output: { intent, params, missingParams?, followUp? }
```

**替代方案**:
- LangChain / AI SDK：引入新依赖，增加复杂度
- 本地模型：效果不稳定，需要额外部署

### 4. 架构模式：Workflow + Step

**选择**: 所有意图对应 Workflow，Workflow 由多个 Step 组成

**理由**:
- 统一的执行模型，易于扩展
- Step 可复用（如 `checkChanges` 可用于发布和部署）
- 清晰的生命周期管理（validator → processor → action → notifier）

**Step 类型**:

| 类型 | 职责 | 失败行为 |
|-----|------|---------|
| validator | 校验前置条件 | 中断流程 |
| processor | 数据转换/准备 | 中断流程 |
| action | 核心操作 | 中断流程 |
| notifier | 通知/日志 | 不中断 |

**替代方案**:
- 直接函数调用：难以复用和扩展
- 事件驱动：过度设计

### 5. 知识库生成：动态 + 静态

**选择**: System Knowledge = 动态部分（从 Workflow 提取）+ 静态部分（手动维护）

**动态部分**:
- 意图列表及描述
- 每个意图的参数定义
- 示例输入/输出

**静态部分**:
- 部署说明
- 常见问题解答
- 工具使用指南

**理由**:
- 动态部分保证 AI 知识与代码同步
- 静态部分补充文档类信息
- 避免硬编码 Prompt

### 6. 代码组织：模块化目录结构

**选择**:

```
src/
├── cli/           # 入口和 REPL
├── ai/            # AI 客户端和意图识别
├── workflow/      # 引擎和类型
├── steps/         # 可复用步骤
│   ├── validators/
│   ├── processors/
│   ├── actions/
│   └── notifiers/
├── workflows/     # 工作流定义
├── core/          # 核心逻辑（从 scripts 迁移）
└── knowledge/     # 知识库
```

**理由**:
- 清晰的关注点分离
- 便于增量迁移
- 符合现有项目结构风格

## Risks / Trade-offs

### [Risk 1] AI 意图识别不准确
→ **Mitigation**: 通过完善的 Prompt 和知识库提高准确率；识别失败时提供帮助提示；用户可随时切换到命令行模式

### [Risk 2] AI 服务不可用
→ **Mitigation**: 保留命令行模式作为 fallback，用户可通过 `rosydawn <command>` 绕过 AI 依赖

### [Risk 3] AI 调用延迟影响体验
→ **Mitigation**: 显示 loading 状态；缓存常见意图的识别结果（可选优化）

### [Risk 4] 迁移过程中破坏现有功能
→ **Mitigation**: 增量迁移，保留 scripts/ 直到新系统稳定；充分的测试覆盖

### [Trade-off] 单轮无状态 vs 多轮对话
- 放弃了连续对话能力
- 换取了实现简单性和可靠性

### [Trade-off] 自建 Prompt vs AI SDK
- 需要自行维护 Prompt 工程
- 避免了额外的依赖和学习成本

## Migration Plan

### Phase 1: 基础架构
1. 创建 `src/cli/`, `src/ai/`, `src/workflow/` 目录
2. 实现 REPL 入口和基础循环
3. 实现 AI 客户端和意图识别
4. 实现 Workflow 引擎核心

### Phase 2: 首个 Workflow
1. 实现 `create-article` workflow
2. 从 `scripts/content/new.js` 迁移核心逻辑到 `src/core/content/`
3. 创建相关 steps（validators, actions）
4. 验证完整链路

### Phase 3: 扩展 Workflows
1. 实现 `publish-article` workflow
2. 实现 `deploy` workflow
3. 实现其他 workflows（start-dev, build, check-status 等）

### Phase 4: 收尾
1. 完善知识库
2. 添加帮助和错误处理
3. 删除 `scripts/` 目录（保留 dev/build/preview）
4. 更新 package.json bin 入口

### Rollback
- 保留 `scripts/` 目录直到 Phase 4 完成
- 通过 git 分支隔离变更

## Open Questions

1. **知识库更新策略？**
   - 新增 Workflow 后是否需要手动更新静态知识？
   - 当前方案：静态知识仅包含通用说明，动态部分自动同步

2. **命令行模式的参数格式？**
   - 延续现有 `rosydawn content new` 格式，还是改为更简洁的 `rosydawn new`？
   - 当前方案：保持与现有命令一致的格式
