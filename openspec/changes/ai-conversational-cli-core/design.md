## Context

### 背景
Rosydawn 项目当前通过 `npm run xxx` 执行脚手架命令，随着功能增多，命令行交互复杂度增加。为了提升用户体验，项目计划引入 AI 对话式 CLI，让用户通过自然语言完成任务。

本 change 是整个 AI 对话式 CLI 的**基础设施层**，负责建立：
- **Workflow 引擎**：统一的工作流定义和执行框架
- **Step 注册表**：可复用的步骤管理和分类系统

这是系统的地基，后续的 AI 交互层和业务层都依赖此基础设施。

### 当前状态
- ✅ 已有 `scripts/` 目录下的命令行工具（content:new, content:publish, deploy 等）
- ✅ 已有 OpenAI 集成能力（用于生成文章元数据）
- ❌ 尚未建立统一的工作流框架
- ❌ 尚未建立可复用的步骤注册机制

### 约束
- **无外部依赖**：仅使用 TypeScript 标准库和项目现有依赖
- **类型安全**：必须使用 TypeScript strict mode
- **命名规范**：Workflow 名称 `kebab-case`，Intent 名称 `snake_case`
- **向后兼容**：不影响现有的命令行工具功能

### 利益相关者
- **开发者**：需要使用 Workflow 引擎定义新的业务流程
- **AI 交互层**（Change 2）：依赖 Workflow 注册表进行意图路由
- **业务层**（Change 3）：依赖 Step 注册表实现具体 workflows

## Goals / Non-Goals

**Goals:**
1. 实现类型安全的 Workflow 定义机制（`defineWorkflow()`）
2. 实现 Step 定义和注册机制（`defineStep()`, `registerStep()`）
3. 实现 Workflow 执行引擎，支持顺序执行、上下文传递、错误处理
4. 提供一组内置的 Steps（validators, processors, actions, notifiers）
5. 支持按意图名称路由到对应 Workflow

**Non-Goals:**
1. ❌ AI 意图识别功能（Change 2: ai-conversational-cli-interaction）
2. ❌ REPL 交互界面（Change 2: ai-conversational-cli-interaction）
3. ❌ 具体业务 Workflows（Change 3: ai-conversational-cli-mvp）
4. ❌ 知识库生成（Change 2: ai-conversational-cli-interaction）
5. ❌ CLI 命令行参数解析（Change 3: ai-conversational-cli-mvp）

## Decisions

### 决策 1: 使用链式上下文传递模式

**选择**: 每个 Step 接收 context 参数，返回的数据会被合并到 context 中，供后续 steps 使用。

**理由**:
- ✅ 简单直观，易于理解和调试
- ✅ 天然支持数据流动（前一步的输出 → 后一步的输入）
- ✅ 类型安全（通过 TypeScript 泛型约束 context 结构）
- ✅ 无需引入复杂的状态管理库

**替代方案**:
1. **全局状态对象**: 难以追踪数据来源，测试困难
2. **事件驱动**: 过于复杂，不适合顺序执行场景
3. **依赖注入**: 增加学习成本，对当前规模过度设计

**实现细节**:
```typescript
interface WorkflowContext {
  params: Record<string, any>;      // 用户输入的参数
  steps: Record<string, any>;       // 各 step 的输出结果
  metadata: Record<string, any>;    // 工作流元数据
}

// Step 执行后的结果会合并到 context.steps[stepName] 中
```

### 决策 2: 按 Step 类型差异化处理失败

**选择**: Validator/Processor/Action 失败中断流程，Notifier 失败仅记录日志。

**理由**:
- ✅ Validator 失败意味着前置条件不满足，继续执行无意义
- ✅ Processor/Action 失败意味着核心操作失败，必须中断
- ✅ Notifier 是辅助功能（如确认、通知），失败不应影响主流程
- ✅ 符合用户预期（确认失败可以继续，但校验失败必须停止）

**替代方案**:
1. **所有失败都中断**: Notifier 失败会导致主流程失败，不合理
2. **所有失败都继续**: Validator 失败后继续执行可能产生错误数据
3. **配置化失败策略**: 过于灵活，增加理解成本

**实现细节**:
```typescript
async function executeStep(step: Step, context: WorkflowContext): Promise<StepResult> {
  try {
    const result = await step.execute(context);
    return { success: true, data: result };
  } catch (error) {
    if (step.type === 'notifier') {
      logger.error(`Notifier ${step.name} failed:`, error);
      return { success: true, error }; // 继续执行
    }
    return { success: false, error }; // 中断执行
  }
}
```

### 决策 3: 使用 Map 存储注册表，支持按类型分类

**选择**: 使用两个数据结构：
- `Map<string, Step>` - 按名称存储所有 steps
- `Record<StepType, Set<string>>` - 按类型存储 step 名称索引

**理由**:
- ✅ Map 提供高效的名称查找（O(1)）
- ✅ 分类索引支持快速列出某类型的所有 steps
- ✅ Set 自动去重，避免重复注册
- ✅ 简单直接，无需引入额外的数据结构库

**替代方案**:
1. **单一 Map + 过滤**: 每次查询类型需要遍历，性能差
2. **四个独立的 Map**: 代码重复，不便于统一管理
3. **类数据库表结构**: 过于复杂，对当前规模过度设计

**实现细节**:
```typescript
class StepRegistry {
  private steps = new Map<string, Step>();
  private categories: Record<StepType, Set<string>> = {
    validator: new Set(),
    processor: new Set(),
    action: new Set(),
    notifier: new Set()
  };

  register(step: Step): void {
    this.steps.set(step.name, step);
    this.categories[step.type].add(step.name);
  }

  getByName(name: string): Step | undefined {
    return this.steps.get(name);
  }

  getByType(type: StepType): Step[] {
    return Array.from(this.categories[type])
      .map(name => this.steps.get(name)!);
  }
}
```

### 决策 4: Workflow 定义与注册分离

**选择**: 提供 `defineWorkflow()` 和 `registerWorkflow()` 两个函数。

**理由**:
- ✅ 先定义后注册，便于单元测试（无需注册就能测试 workflow 逻辑）
- ✅ 支持动态注册（根据环境变量决定是否注册某些 workflows）
- ✅ 符合关注点分离原则（定义是声明式的，注册是命令式的）

**替代方案**:
1. **定义即注册**: 测试困难，无法隔离测试单个 workflow
2. **装饰器注册**: 需要 experimental decorators，增加配置复杂度

**实现细节**:
```typescript
// 定义 workflow（不注册）
const createArticleWorkflow = defineWorkflow({
  name: 'create-article',
  intent: 'create_article',
  steps: [...]
});

// 注册到全局注册表
registerWorkflow(createArticleWorkflow);
```

### 决策 5: 内置 Steps 采用延迟加载

**选择**: 内置 steps 在首次使用时才注册，而不是模块加载时立即注册。

**理由**:
- ✅ 减少启动时间（不需要立即加载所有内置 steps）
- ✅ 支持按需加载（某些 steps 可能依赖可选模块）
- ✅ 便于测试（可以在测试环境中替换内置 steps）

**替代方案**:
1. **立即注册所有内置 steps**: 增加启动时间，即使某些 steps 不会用到
2. **手动注册**: 增加使用成本，开发者需要记住注册每个 step

**实现细节**:
```typescript
// src/steps/builtin.ts
export function registerBuiltinSteps(): void {
  registerStep(defineStep({
    type: 'validator',
    name: 'checkGitChanges',
    execute: async (ctx) => { ... }
  }));
  // ... 其他内置 steps
}

// 在 CLI 入口调用
if (process.argv.includes('--repl')) {
  registerBuiltinSteps(); // 仅在需要时注册
}
```

## Risks / Trade-offs

### 风险 1: Context 结构过于灵活导致类型丢失

**风险**: 使用 `Record<string, any>` 存储 context，可能导致类型推断失败。

**缓解措施**:
- 使用 TypeScript 泛型约束 Workflow 的 context 类型
- 提供类型辅助函数 `getContextValue<T>(ctx, key)`
- 在文档中强调为 context 字段添加类型注释

**示例**:
```typescript
interface CreateArticleContext extends WorkflowContext {
  steps: {
    generateMetadata: { title: string; description: string };
    createFile: { filePath: string };
  }
}
```

### 风险 2: Step 命名冲突

**风险**: 不同开发者可能创建同名 steps，导致覆盖。

**缓解措施**:
- 重复注册时发出警告（console.warn）
- 建议使用命名空间前缀（如 `content:checkChanges`）
- 提供命名规范文档

### 风险 3: Workflow 执行失败后状态难以恢复

**风险**: Workflow 执行到一半失败，已执行的 steps 无法回滚。

**缓解措施**:
- 记录详细的执行日志，包含每步的输入输出
- 提供 `dryRun` 模式，仅验证不执行
- 在 Change 4 中考虑引入补偿事务（Compensating Transaction）模式

### 风险 4: 内置 Steps 过多导致维护负担

**风险**: 随着项目发展，内置 steps 数量增长，难以维护。

**缓解措施**:
- 严格控制内置 steps 的数量，仅包含通用的、高复用的 steps
- 特定业务的 steps 放在各自的 workflow 文件中定义
- 定期审查内置 steps，移除不常用的

## Migration Plan

本 change 是全新实现，无需迁移现有代码。但需要考虑后续 change 的迁移路径：

### 阶段 1: 建立基础设施（本 Change）
1. 实现 Workflow 引擎和 Step 注册表
2. 实现一组内置 Steps
3. 编写单元测试和集成测试

### 阶段 2: 集成到 CLI（Change 2-3）
1. Change 2 实现 AI 交互层，调用 Workflow 引擎
2. Change 3 实现第一个业务 Workflow（create-article）
3. 保留现有的命令行工具作为 fallback

### 阶段 3: 迁移现有功能（Change 4）
1. 将 `scripts/content/publish.js` 迁移为 `publish-article` workflow
2. 将 `scripts/deploy/` 迁移为 `deploy` workflow
3. 验证功能一致性

### 阶段 4: 清理旧代码（Change 5）
1. 删除 `scripts/` 目录下的旧代码
2. 更新 package.json 脚本引用
3. 更新文档

### 回滚策略
由于本 change 是新增功能，不影响现有代码，回滚策略简单：
1. 删除 `src/workflow/` 和 `src/steps/` 目录
2. 恢复 package.json（如果有变更）
3. 无需数据迁移或配置恢复

## Open Questions

### 问题 1: Workflow 是否需要支持条件分支？

**背景**: 当前设计是顺序执行，但未来可能需要根据 context 动态决定执行路径。

**选项**:
1. 保持顺序执行，复杂逻辑通过 Step 内部实现
2. 引入条件步骤 `conditionalStep(condition, thenSteps, elseSteps)`
3. 引入状态机模式

**当前倾向**: 选项 1，在 Change 4 中根据实际需求再决定是否引入条件分支。

### 问题 2: Step 是否需要支持并行执行？

**背景**: 某些 steps 可能没有依赖关系，可以并行执行以提高性能。

**选项**:
1. 保持顺序执行，简单可靠
2. 引入 `parallelSteps([...])` 包装器
3. 引入依赖图自动分析

**当前倾向**: 选项 1，在 Change 4 中根据实际需求再决定是否引入并行执行。

### 问题 3: Context 是否需要持久化？

**背景**: 某些长时间运行的 workflow（如部署）可能需要中断后恢复。

**选项**:
1. 不持久化，每次执行都是新的
2. 提供可选的持久化接口（由调用方实现）
3. 内置文件系统持久化

**当前倾向**: 选项 1，在 Change 4 中根据实际需求再决定是否引入持久化。
