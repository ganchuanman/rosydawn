# Review Synthesis

## 1. TL;DR

本 change 建立 **AI 对话式 CLI 的基础设施层**，包括 Workflow 引擎和 Step 注册表。这是整个系统的地基，后续的 AI 交互层和业务层都依赖此基础设施。目标是实现类型安全、可扩展的工作流框架，支持按意图路由、上下文传递和差异化错误处理。

## 2. Core Changes

### 新增功能

- **Workflow 引擎**
  - 结构化的 Workflow 定义机制（`defineWorkflow()`）
  - Workflow 注册和意图路由（`registerWorkflow()`, `routeWorkflow()`）
  - 顺序执行 steps，支持上下文传递
  - 差异化错误处理：Validator/Processor/Action 失败中断，Notifier 失败不中断

- **Step 注册表**
  - 结构化的 Step 定义机制（`defineStep()`）
  - Step 注册和查找（`registerStep()`, `getStepByName()`）
  - 按 type 分类管理（validator, processor, action, notifier）
  - 内置一组通用 steps（checkGitChanges, generateMetadata, createFile 等）

### 代码结构变更

```
新增目录:
- src/workflow/     # Workflow 引擎和类型定义
- src/steps/        # Step 目录结构
  ├── validators/   # 校验器
  ├── processors/   # 数据处理器
  ├── actions/      # 核心操作
  └── notifiers/    # 通知器
```

### 不实现的功能（留给后续 change）

- ❌ AI 意图识别（Change 2）
- ❌ REPL 交互界面（Change 2）
- ❌ 具体业务 Workflows（Change 3）
- ❌ 知识库生成（Change 2）

## 3. Technical Highlights

### 关键决策 1: 链式上下文传递

**选择**: 每个 Step 接收 context 参数，返回的数据合并到 context 中供后续 steps 使用。

**为什么**: 简单直观，天然支持数据流动，易于理解和调试。无需引入复杂的状态管理库。

**示例**:
```typescript
// Step 1 返回数据
const metadata = await generateMetadata(ctx);
// 数据自动合并到 ctx.steps.generateMetadata

// Step 2 可以读取
const metadata = ctx.steps.generateMetadata;
```

### 关键决策 2: 差异化错误处理

**选择**: Validator/Processor/Action 失败中断流程，Notifier 失败仅记录日志。

**为什么**: Validator 失败意味着前置条件不满足，继续执行无意义。Notifier 是辅助功能（如确认、通知），失败不应影响主流程。

**实现**:
```typescript
if (step.type === 'notifier') {
  try {
    await step.execute(ctx);
  } catch (error) {
    logger.error(`Notifier failed:`, error);
    // 继续执行，不中断
  }
}
```

### 关键决策 3: 双数据结构存储注册表

**选择**: 使用 `Map<string, Step>` 存储所有 steps + `Record<StepType, Set<string>>` 存储类型索引。

**为什么**: Map 提供高效的名称查找（O(1)），分类索引支持快速列出某类型的所有 steps。

### 关键决策 4: 定义与注册分离

**选择**: 提供 `defineWorkflow()` 和 `registerWorkflow()` 两个函数。

**为什么**: 先定义后注册，便于单元测试（无需注册就能测试 workflow 逻辑）。支持动态注册（根据环境变量决定是否注册某些 workflows）。

### 关键决策 5: 内置 Steps 延迟加载

**选择**: 内置 steps 在首次使用时才注册，而不是模块加载时立即注册。

**为什么**: 减少启动时间，支持按需加载，便于测试（可以在测试环境中替换内置 steps）。

## 4. Quality Assurance Overview

### 测试策略

采用测试金字塔模型：
- **单元测试**（70%）：覆盖核心逻辑，测试覆盖率目标 ≥ 90%
- **集成测试**（20%）：验证多个组件协作
- **端到端测试**（10%）：验证真实场景

### 测试覆盖

**已定义 40 个测试用例**，覆盖：

1. **Workflow 引擎**（14 个测试用例）
   - Workflow 定义和参数声明
   - Step 顺序执行和上下文传递
   - 错误处理（中断 vs 继续）
   - 意图路由和结果返回

2. **Step 注册表**（14 个测试用例）
   - Step 定义和注册
   - 按 type 分类存储
   - 查找和重复注册警告

3. **内置 Steps**（10 个测试用例）
   - Validators: checkGitChanges, getChangedArticles, checkDirectory
   - Processors: generateMetadata, collectExistingTags, inputTopic, updateFrontmatter
   - Actions: createFile, commitAndPush, startDevServer
   - Notifiers: confirmCreation, editConfirm

4. **边界情况**（5 个测试用例）
   - Context 类型丢失
   - Step 命名冲突
   - 大量 steps 性能测试
   - Context 数据过大

5. **回归测试**（2 个测试用例）
   - 向后兼容性验证
   - TypeScript strict mode 验证

### 主要风险区域

1. **Context 类型安全**：使用 `Record<string, any>` 可能导致类型推断失败，需要通过泛型约束缓解
2. **Step 命名冲突**：重复注册会覆盖，已添加警告机制
3. **Workflow 失败恢复**：执行到一半失败无法自动回滚，已记录日志便于手动恢复
4. **性能**：大量 steps 或大数据 context 可能影响性能，已添加性能测试

## 5. Impact & Risks

### BREAKING CHANGES

- **无** - 本 change 是全新实现，不影响现有代码

### 功能影响

- ✅ 保留现有命令行工具（scripts/ 目录）
- ✅ 无需数据迁移或配置恢复
- ✅ 向后兼容，现有功能不受影响

### 依赖影响

- **无新增外部依赖** - 仅使用 TypeScript 标准库和项目现有依赖
- 后续 change（AI 交互层）需要配置 `OPENAI_API_KEY` 环境变量

### 风险与缓解措施

| 风险 | 缓解措施 |
|------|----------|
| Context 结构过于灵活导致类型丢失 | 使用 TypeScript 泛型约束，提供类型辅助函数 |
| Step 命名冲突导致覆盖 | 重复注册时发出警告，建议使用命名空间前缀 |
| Workflow 执行失败后状态难以恢复 | 记录详细执行日志，提供 dryRun 模式 |
| 内置 Steps 过多导致维护负担 | 严格控制数量，仅包含通用的、高复用的 steps |

### 开放问题

1. **Workflow 是否需要支持条件分支？**
   - 当前倾向：保持顺序执行，在 Change 4 中根据实际需求再决定

2. **Step 是否需要支持并行执行？**
   - 当前倾向：保持顺序执行，在 Change 4 中根据实际需求再决定

3. **Context 是否需要持久化？**
   - 当前倾向：不持久化，在 Change 4 中根据实际需求再决定

## 6. Review Focus

请审查者重点关注以下内容：

### 架构设计

- [ ] **上下文传递机制**：链式上下文传递是否符合预期？是否需要更复杂的状态管理？
- [ ] **错误处理策略**：Validator/Processor/Action 失败中断，Notifier 失败不中断的策略是否合理？
- [ ] **注册表设计**：双数据结构（Map + 类型索引）是否满足性能和功能需求？

### 实现细节

- [ ] **内置 Steps 列表**：内置 steps 的选择是否合适？是否有遗漏或冗余？
- [ ] **类型安全**：Context 类型约束是否足够？是否需要更严格的类型检查？
- [ ] **命名规范**：Workflow 名称 `kebab-case`，Intent 名称 `snake_case` 是否符合项目约定？

### 测试覆盖

- [ ] **测试用例完整性**：40 个测试用例是否覆盖了所有关键场景？
- [ ] **边界情况**：边界情况测试是否充分？是否有遗漏的边界情况？
- [ ] **测试覆盖率**：90% 的测试覆盖率目标是否合理？

### 风险评估

- [ ] **命名冲突**：Step 命名冲突的风险是否可接受？是否需要命名空间机制？
- [ ] **失败恢复**：Workflow 执行失败后无法自动回滚是否可接受？
- [ ] **性能**：大量 steps 或大数据 context 的性能风险是否需要提前优化？

### 开放问题

- [ ] **条件分支**：是否需要在当前 change 中就引入条件分支支持？
- [ ] **并行执行**：是否需要在当前 change 中就引入并行执行支持？
- [ ] **Context 持久化**：是否需要在当前 change 中就引入 Context 持久化支持？

### 具体审查请求

- **@tech-lead**: 请重点审查设计文档中的 5 个关键决策，确认是否符合项目长期规划
- **@qa**: 请审查测试用例文档，确认测试覆盖是否充分
- **@product**: 请确认内置 Steps 的列表是否满足业务需求
- **@security**: 请审查错误处理和日志记录是否存在安全隐患
