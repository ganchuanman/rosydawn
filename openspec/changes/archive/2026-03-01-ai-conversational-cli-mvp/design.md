## Context

本设计文档描述 AI 对话式 CLI 的 MVP（最小可行产品）实现，这是 ai-conversational-cli 总体规划的第三个变更批次。

### 当前状态

- **基础设施层（Change 1）**：已完成 Workflow 引擎、Step 注册表、错误处理等核心基础设施
- **AI 交互层（Change 2）**：已完成 REPL 循环、AI 意图识别、参数收集、知识库加载
- **当前实现**：
  - Mock Workflows（`mock-create-article`, `mock-list-articles`, `mock-publish`）用于测试
  - AI 意图识别与 Workflow 路由已集成
  - 参数缺失时的追问机制已实现

### 目标

本 Change 负责实现**第一个完整的业务流程** - 创建文章 Workflow，验证所有层的集成。

### 约束

- 必须复用现有的 Workflow 引擎和 Step 注册表
- 必须与现有的 REPL 模式和 AI 意图识别集成
- 保持与原有命令行工具（`scripts/content/new.js`）的功能兼容
- 使用中文提示和响应

## Goals / Non-Goals

**Goals:**

1. **实现创建文章 Workflow**：将 `scripts/content/new.js` 的逻辑迁移到基于 Step 的 Workflow 架构
2. **实现双模式支持**：REPL 模式（AI 对话）和命令行模式（`rosydawn content new --topic "xxx"`）
3. **端到端验证**：验证基础设施层 + AI 交互层 + 业务层的完整集成
4. **提供清晰的用户反馈**：显示文件路径、预览 URL、操作摘要

**Non-Goals:**

1. **不实现其他 Workflows**：发布、部署、状态检查等 Workflow 留给 Change 4
2. **不实现 Help 系统**：`rosydawn --help` 的完整实现留给 Change 5
3. **不实现文章编辑/删除**：本 Change 仅关注创建流程
4. **不优化 AI 识别准确率**：使用现有的 Intent Recognition 系统，不调整模型或 Prompt

## Decisions

### Decision 1: 使用 Step-Based Workflow 架构

**选择**: 将 `scripts/content/new.js` 的逻辑拆分为独立的 Steps，而非迁移为单一的 Workflow 函数。

**理由**:

- **可测试性**: 每个 Step 可以独立测试，无需 Mock 整个创建流程
- **可复用性**: `generateMetadata`、`createFile` 等 Steps 可被其他 Workflows 复用（如批量创建、草稿恢复）
- **错误隔离**: 单个 Step 失败不会导致整个流程状态混乱
- **可见性**: 每步执行都有明确的输入/输出，便于调试

**替代方案**:
- **方案 A**: 保持单一脚本逻辑，在 Workflow 内部执行所有操作
  - 缺点：难以测试、难以复用、错误处理混乱
- **方案 B**: 使用面向对象的 Builder 模式
  - 缺点：增加抽象层，不符合现有的 Step-based 架构

### Decision 2: Steps 按职责分层

**选择**: 将 Steps 分为 4 层：Validators, Processors, Actions, Notifiers。

**分层依据**:

| 层级 | 职责 | 示例 Steps | 是否修改状态 |
|------|------|-----------|-------------|
| Validators | 验证前置条件 | `validateGitStatus`, `validateArticlesDirectory` | 否 |
| Processors | 数据处理/转换 | `inputTopic`, `generateMetadata`, `buildFrontmatter` | 否 |
| Actions | 执行副作用操作 | `createFile`, `startDevServer`, `gitAdd` | 是 |
| Notifiers | 用户通知/确认 | `confirmCreation`, `showEditPrompt` | 否 |

**理由**:
- 清晰的关注点分离
- 便于理解每个 Step 的职责
- 测试时可以 Mock Actions 层，避免真实文件操作

**目录结构**:
```
src/steps/
├── validators/      # 验证 Steps
│   ├── git.ts
│   ├── articles.ts
│   └── directory.ts
├── processors/      # 处理 Steps
│   ├── input-topic.ts
│   ├── metadata.ts
│   ├── frontmatter.ts
│   └── tags.ts
├── actions/         # 动作 Steps
│   ├── file.ts
│   ├── server.ts
│   └── git.ts
├── notifiers/       # 通知 Steps
│   ├── confirm.ts
│   └── edit.ts
└── registry.ts      # 统一注册
```

### Decision 3: AI Metadata Generation 保持可选

**选择**: `generateMetadata` Step 调用 AI 生成标题/描述/标签，但失败时降级为基础逻辑。

**实现逻辑**:
```typescript
// src/steps/processors/metadata.ts
async function generateMetadata(topic: string) {
  try {
    // 尝试 AI 生成
    const aiMetadata = await callAI(topic);
    return aiMetadata;
  } catch (error) {
    // 降级：使用基础逻辑
    return {
      title: topic,
      description: `关于 ${topic} 的文章`,
      tags: []
    };
  }
}
```

**理由**:
- **鲁棒性**: AI 服务不可用时不阻塞用户流程
- **向后兼容**: 与原有 `scripts/content/new.js` 的行为一致
- **可观测性**: 可以记录 AI 失败率，用于后续优化

**替代方案**:
- **方案 A**: AI 失败时终止流程，提示用户配置 API Key
  - 缺点：影响用户体验，原有功能不可用
- **方案 B**: 完全移除 AI 功能，使用固定模板
  - 缺点：失去 AI 辅助的价值

### Decision 4: 命令行模式使用参数映射

**选择**: `rosydawn content new --topic "xxx"` 通过参数映射触发 `create-article` Workflow。

**实现**:

```typescript
// src/cli/router.ts
const COMMAND_WORKFLOW_MAP = {
  'content new': 'create-article',
  'content publish': 'publish-article',
  // ...
};

function routeCommand(command: string, args: Record<string, any>) {
  const workflowName = COMMAND_WORKFLOW_MAP[command];
  const workflow = getWorkflow(workflowName);

  // 将命令行参数映射为 Workflow 参数
  const params = mapArgsToParams(args, workflow.params);

  return executeWorkflow(workflow, params);
}
```

**理由**:
- **统一入口**: 命令行模式和 REPL 模式最终都调用 Workflow 引擎
- **参数验证**: 利用 Workflow 的 `params.required` 和 `params.optional` 进行验证
- **可扩展性**: 新增命令只需添加映射关系

**替代方案**:
- **方案 A**: 命令行模式直接调用脚本，不经过 Workflow 引擎
  - 缺点：代码重复、行为不一致
- **方案 B**: 使用第三方 CLI 框架（如 Commander.js）
  - 缺点：引入额外依赖，与现有架构不匹配

### Decision 5: 使用现有的 AI 意图识别系统

**选择**: 复用 `src/ai/intent-recognizer.ts` 和知识库系统，不新增 Workflow 专属的意图识别逻辑。

**理由**:
- **架构一致性**: 所有 Workflow 共享同一套意图识别系统
- **维护成本**: 知识库集中管理，避免分散的 Prompt
- **可测试性**: Intent Recognizer 已有测试覆盖

**实现细节**:
- 知识库中已包含 `create_article` 意图定义
- Workflow 通过 `intent: 'create_article'` 声明映射关系
- AI 识别结果直接作为 Workflow 参数传递

## Risks / Trade-offs

### Risk 1: AI 识别不准确导致错误 Workflow 触发

**风险**: 用户输入 "删除关于 WebSocket 的文章"，AI 可能误识别为 `create_article`。

**缓解措施**:
1. **置信度阈值**: 仅在 `confidence > 0.7` 时自动执行，否则请求确认
2. **明确拒绝**: 在知识库中定义 "删除文章" 为 `unknown` 意图
3. **用户确认**: 在 `confirmCreation` Step 显示识别的参数，允许用户取消

**残留风险**: 用户可能在未仔细确认时执行错误操作（通过 Git 可恢复）

### Risk 2: Step 执行顺序错误导致数据损坏

**风险**: `createFile` 在 `validateArticlesDirectory` 之前执行，可能创建在错误位置。

**缓解措施**:
1. **显式依赖声明**: Workflow 定义中声明 Steps 依赖关系
2. **运行时验证**: Workflow 引擎检查前序 Step 是否执行成功
3. **原子性操作**: `createFile` 使用临时文件 + rename，避免半成品状态

**残留风险**: 极端情况（如进程被杀）可能留下临时文件（通过 Git clean 可清理）

### Risk 3: 命令行参数解析与 REPL 参数收集行为不一致

**风险**: `rosydawn content new --topic "WebSocket"` 和 REPL 输入 "创建 WebSocket 文章" 可能产生不同的参数格式。

**缓解措施**:
1. **参数标准化**: 在 Workflow 入口统一参数格式验证
2. **集成测试**: 添加双模式的端到端测试
3. **日志记录**: 记录参数来源和转换过程，便于调试

**残留风险**: 边缘情况（如特殊字符、空格）可能需要逐步修复

### Trade-off 1: 性能 vs 鲁棒性

**选择**: 优先保证鲁棒性，允许性能损耗。

**体现**:
- AI 意图识别增加 ~1s 延迟
- 每步 Step 都进行参数验证
- 降级逻辑增加额外的 try-catch

**收益**: 系统在 AI 服务不可用、网络故障、用户输入错误时仍能工作

### Trade-off 2: 灵活性 vs 简单性

**选择**: 限制当前 MVP 的灵活性，换取实现简单。

**体现**:
- 仅实现 `create-article` Workflow
- 不支持自定义 Steps 组合
- 不支持 Workflow 中断/恢复

**收益**: 快速验证核心架构，为后续扩展奠定基础

## Migration Plan

### 阶段 1: 实现 Core Steps（不修改现有脚本）

1. 在 `src/steps/` 下实现所有 Steps
2. 添加单元测试（Mock 文件系统、Git 操作）
3. 在 `src/steps/registry.ts` 中注册

**验证**: `npm test` 通过，覆盖率 > 80%

### 阶段 2: 创建 create-article Workflow

1. 在 `src/workflows/create-article.ts` 中定义 Workflow
2. 组合已实现的 Steps
3. 注册到 Workflow Registry

**验证**:
```bash
# 在 REPL 中测试
rosydawn
> 创建一篇关于 WebSocket 的文章
# 期望：文件创建成功，显示路径和预览 URL
```

### 阶段 3: 实现命令行模式

1. 在 `src/cli/router.ts` 中添加命令路由
2. 修改 `package.json` 的 `bin` 入口
3. 处理参数解析

**验证**:
```bash
rosydawn content new --topic "WebSocket"
# 期望：与 REPL 模式行为一致
```

### 阶段 4: 移除旧脚本（可选）

1. 保留 `scripts/content/new.js` 作为备份
2. 添加 Deprecation 警告
3. 在文档中更新使用方式

**回滚策略**: 如果新实现有严重问题，用户可以继续使用 `node scripts/content/new.js`

## Open Questions

1. **是否需要支持批量创建？**
   - 当前设计不支持 `rosydawn content new --topic "A" --topic "B"`
   - 如果需要，可以在后续 Change 中添加 `batch-create-articles` Workflow

2. **文章冲突时的处理策略？**
   - 当前行为：直接覆盖现有文件
   - 是否需要提示用户确认？
   - 建议：在 `confirmCreation` Step 显示 "文件已存在，是否覆盖？"

3. **AI 生成失败时的日志级别？**
   - 当前设计：`console.warn`（控制台可见）
   - 是否需要记录到文件日志？
   - 建议：MVP 阶段使用 `console.warn`，后续集成日志系统

4. **命令行别名（`rosydawn new`）是否在 MVP 实现？**
   - 当前范围：仅实现完整命令 `rosydawn content new`
   - 建议：推迟到 Change 5（Help 系统）统一处理别名

5. **是否需要在 REPL 模式下显示 Step 执行进度？**
   - 当前设计：仅显示最终结果
   - 是否需要显示 "✓ 参数验证"、"✓ 元数据生成" 等进度？
   - 建议：MVP 阶段不显示，避免输出过多，后续可添加 `--verbose` 选项
