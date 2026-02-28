# Workflow Engine

统一的工作流定义和执行框架。

## 概述

Workflow Engine 提供了一个结构化的方式来定义、注册和执行工作流。每个 Workflow 由一系列 Step 组成,按顺序执行,支持上下文传递和差异化错误处理。

## 核心概念

### Workflow

Workflow 是一组按顺序执行的步骤集合,包含:

- `name`: 工作流名称 (kebab-case 格式,如 `create-article`)
- `intent`: 意图标识 (snake_case 格式,如 `create_article`)
- `description`: 工作流描述
- `params`: 参数定义 (required/optional)
- `steps`: Step 列表

### Step

Step 是工作流中的单个步骤,包含:

- `type`: 步骤类型 (`validator`/`processor`/`action`/`notifier`)
- `name`: 步骤名称 (唯一标识)
- `description`: 步骤描述
- `execute`: 执行函数

### Step Types

- **Validator**: 校验器,用于前置条件检查,**失败会中断流程**
- **Processor**: 处理器,用于数据转换和准备,**失败会中断流程**
- **Action**: 动作,用于执行核心操作,**失败会中断流程**
- **Notifier**: 通知器,用于用户交互和通知,**失败不会中断流程**

### Context

Context 是在 steps 之间传递的共享上下文:

```typescript
interface WorkflowContext {
  params: Record<string, any>;      // 用户输入的参数
  steps: Record<string, any>;       // 各 step 的输出结果
  metadata: Record<string, any>;    // 工作流元数据
}
```

## 使用方法

### 1. 定义 Workflow

```typescript
import { defineWorkflow } from '@/workflow';

const createArticleWorkflow = defineWorkflow({
  name: 'create-article',
  description: '创建新文章',
  intent: 'create_article',
  params: {
    required: ['topic'],
    optional: ['dryRun'],
  },
  steps: [
    {
      type: 'validator',
      name: 'checkInput',
      execute: async (ctx) => {
        if (!ctx.params.topic) {
          throw new Error('Topic is required');
        }
        return { topic: ctx.params.topic };
      },
    },
    {
      type: 'processor',
      name: 'generateMetadata',
      execute: async (ctx) => {
        // 生成文章元数据
        return { title: '...', description: '...', tags: [...] };
      },
    },
    {
      type: 'action',
      name: 'createFile',
      execute: async (ctx) => {
        // 创建文件
        return { filePath: '...' };
      },
    },
    {
      type: 'notifier',
      name: 'notifyCompletion',
      execute: async (ctx) => {
        console.log('Article created successfully!');
        return { notified: true };
      },
    },
  ],
});
```

### 2. 注册 Workflow

```typescript
import { registerWorkflow } from '@/workflow';

registerWorkflow(createArticleWorkflow);
```

### 3. 执行 Workflow

```typescript
import { executeWorkflow } from '@/workflow';

const result = await executeWorkflow(createArticleWorkflow, {
  topic: 'My New Article',
});

if (result.success) {
  console.log('Workflow completed:', result.data);
} else {
  console.error('Workflow failed:', result.error);
}
```

### 4. 意图路由

```typescript
import { routeWorkflow, executeWorkflow } from '@/workflow';

// 根据意图查找 workflow
const workflow = routeWorkflow('create_article');

if (workflow) {
  const result = await executeWorkflow(workflow, params);
}
```

## 高级特性

### 上下文传递

每个 Step 的返回值会自动写入 `context.steps[stepName]`,供后续步骤使用:

```typescript
{
  type: 'processor',
  name: 'step1',
  execute: async (ctx) => {
    return { value: 42 };
  },
},
{
  type: 'processor',
  name: 'step2',
  execute: async (ctx) => {
    const { value } = ctx.steps.step1; // { value: 42 }
    return value * 2; // 84
  },
}
```

### 差异化错误处理

- **Validator/Processor/Action 失败**: 中断流程,返回错误
- **Notifier 失败**: 记录日志,继续执行

```typescript
{
  type: 'notifier',
  name: 'sendEmail',
  execute: async (ctx) => {
    // 即使这里抛出错误,workflow 也会继续执行
    throw new Error('Email service unavailable');
  },
}
```

### Workflow 注册表

Workflow 注册表支持按意图路由和按名称查找:

```typescript
import { getWorkflowByName, getWorkflowMetadata } from '@/workflow';

// 按名称查找
const workflow = getWorkflowByName('create-article');

// 获取元数据(用于知识库生成)
const metadata = getWorkflowMetadata('create-article');
// { name, description, intent, params }
```

## 最佳实践

1. **命名规范**:
   - Workflow 名称使用 `kebab-case` (如 `create-article`)
   - Intent 名称使用 `snake_case` (如 `create_article`)

2. **Step 粒度**:
   - 每个 Step 应该只做一件事
   - 保持 Step 的可复用性

3. **错误处理**:
   - Validator 用于前置条件检查
   - 不要在 Notifier 中执行关键操作

4. **类型安全**:
   - 为 Context 定义类型接口
   - 使用 TypeScript 泛型约束

## API 参考

### `defineWorkflow(definition: Workflow): Workflow`

定义一个工作流。

### `executeWorkflow(workflow: Workflow, params?: Record<string, any>): Promise<WorkflowResult>`

执行一个工作流。

### `registerWorkflow(workflow: Workflow): void`

注册工作流到全局注册表。

### `routeWorkflow(intent: string): Workflow | undefined`

根据意图路由到对应的工作流。

### `getWorkflowByName(name: string): Workflow | undefined`

根据名称获取工作流。

### `getWorkflowMetadata(name: string): object | undefined`

获取工作流元数据。

## 示例

查看 `src/workflow/demo.ts` 获取完整示例。
