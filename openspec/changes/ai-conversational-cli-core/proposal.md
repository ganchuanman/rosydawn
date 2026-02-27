## Parent Change

[ai-conversational-cli](../ai-conversational-cli) - AI 对话式 CLI 总体规划

## Why

本 change 是 ai-conversational-cli 的第一批实现，负责建立**基础设施层**。

没有这层基础设施，上层的 AI 交互和业务 Workflow 都无法实现。这是整个系统的地基。

## What Changes

### 新增

- **Workflow 引擎**: 统一的工作流定义和执行框架
- **Step 注册表**: 可复用的步骤管理和分类系统

### 不实现（留给后续 change）

- AI 相关功能（Change 2: interaction）
- 业务 Workflow（Change 3: mvp）
- 其他扩展功能（Change 4-5）

## Scope

### 实现的 Specs

| Spec | 说明 |
|------|------|
| [workflow-engine](../ai-conversational-cli/specs/workflow-engine/spec.md) | Workflow 定义、执行编排、上下文传递、意图路由 |
| [step-registry](../ai-conversational-cli/specs/step-registry/spec.md) | Step 定义、注册、分类、内置 Steps |

### 不实现的 Specs

所有其他 specs 将在后续 change 中实现。

## Dependencies

- **无前置依赖** - 这是第一个 change
- **被依赖** - ai-conversational-cli-interaction 依赖本 change

## Verification

### 验收标准

1. 能使用 `defineWorkflow()` 定义工作流
2. 能使用 `registerStep()` 注册步骤
3. Workflow 能按顺序执行 steps
4. Context 能在 steps 之间正确传递
5. Validator 失败能中断流程
6. Notifier 失败不中断流程

### 验证方式

```typescript
// demo: 定义并执行一个简单 workflow
const demoWorkflow = defineWorkflow({
  name: 'demo',
  intent: 'demo',
  steps: [
    { type: 'validator', name: 'checkInput', execute: () => true },
    { type: 'action', name: 'sayHello', execute: (ctx) => 'Hello!' }
  ]
});

const result = await executeWorkflow(demoWorkflow, {});
// result.success === true
```

## Impact

### 代码结构变更

```
新增目录:
- src/workflow/     # Workflow 引擎和类型定义
- src/steps/        # Step 目录结构（validators/processors/actions/notifiers）
```

### 依赖变更

- 无新增依赖
