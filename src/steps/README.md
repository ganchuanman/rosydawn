# Step Registry

可复用的步骤管理和分类系统。

## 概述

Step Registry 提供了一个统一的方式来定义、注册和管理可复用的步骤(Steps)。每个 Step 都有明确的类型、名称和执行函数,可以在多个 Workflow 中复用。

## 核心概念

### Step

Step 是一个可复用的步骤单元:

```typescript
interface Step<T = any> {
  type: StepType;              // 步骤类型
  name: string;                // 步骤名称(唯一标识)
  description?: string;        // 步骤描述
  execute: (context) => Promise<T> | T;  // 执行函数
}
```

### Step Types

- **validator**: 校验器,用于前置条件检查,**失败会中断流程**
- **processor**: 处理器,用于数据转换和准备,**失败会中断流程**
- **action**: 动作,用于执行核心操作,**失败会中断流程**
- **notifier**: 通知器,用于用户交互和通知,**失败不会中断流程**

## 使用方法

### 1. 定义 Step

```typescript
import { defineStep } from '@/steps';

const checkGitChanges = defineStep({
  type: 'validator',
  name: 'checkGitChanges',
  description: '检查是否存在未提交的 Git 变更',
  execute: async (ctx) => {
    // 实现逻辑
    const hasChanges = true;
    return { hasChanges, changes: [...] };
  },
});
```

### 2. 注册 Step

```typescript
import { registerStep } from '@/steps';

registerStep(checkGitChanges);
```

### 3. 在 Workflow 中使用

```typescript
import { defineWorkflow } from '@/workflow';
import { getStepByName } from '@/steps';

const workflow = defineWorkflow({
  name: 'publish-article',
  intent: 'publish_article',
  steps: [
    getStepByName('checkGitChanges')!,  // 复用已注册的 step
    // ... 其他 steps
  ],
});
```

### 4. 批量注册内置 Steps

```typescript
import { registerBuiltinSteps } from '@/steps';

// 注册所有内置 steps
registerBuiltinSteps();
```

## 内置 Steps

### Validators

#### `checkGitChanges`

检查是否存在未提交的 Git 变更。

**返回值**:
```typescript
{
  hasChanges: boolean;
  changes: string[];      // 变更文件列表
  changeCount: number;    // 变更文件数量
}
```

**使用示例**:
```typescript
{
  type: 'validator',
  name: 'checkGitChanges',
  execute: async (ctx) => { ... }
}
```

#### `getChangedArticles`

检测文章变更(新增或修改的 markdown 文件)。

**参数**:
- `contentDir`: 内容目录路径 (默认: `src/content`)

**返回值**:
```typescript
{
  hasChanges: boolean;
  articles: string[];     // 变更文章列表
  articleCount: number;   // 文章数量
}
```

#### `checkDirectory`

检查目标目录是否存在,不存在则创建。

**参数**:
- `directory`: 目录路径

**返回值**:
```typescript
{
  exists: boolean;
  created: boolean;       // 是否新创建
  path: string;
}
```

### Processors

#### `generateMetadata`

调用 AI 生成文章的 title、description、tags。

**参数**:
- `content`: 文章内容
- `aiClient`: AI 客户端实例

**返回值**:
```typescript
{
  title: string;
  description: string;
  tags: string[];
}
```

#### `collectExistingTags`

扫描已发布文章,收集所有已使用的标签。

**参数**:
- `contentDir`: 内容目录路径 (默认: `src/content`)

**返回值**:
```typescript
{
  tags: string[];         // 标签列表(已排序)
  tagCount: number;       // 标签数量
}
```

#### `inputTopic`

处理主题参数缺失,触发 REPL 追问。

**参数**:
- `topic`: 文章主题

**返回值**:
```typescript
{
  needsInput: boolean;    // 是否需要用户输入
  paramName?: string;     // 参数名
  prompt?: string;        // 提示语
  topic?: string;         // 主题(如果已提供)
}
```

#### `updateFrontmatter`

更新文章的 frontmatter。

**参数**:
- `filePath`: 文件路径
- `metadata`: 元数据(来自 generateMetadata)

**返回值**:
```typescript
{
  success: boolean;
  filePath: string;
  metadata: object;
}
```

### Actions

#### `createFile`

创建新的文章 markdown 文件。

**参数**:
- `filePath`: 文件路径
- `content`: 文件内容
- `template`: 模板文件路径(可选)

**返回值**:
```typescript
{
  success: boolean;
  filePath: string;
  created: boolean;
}
```

#### `commitAndPush`

执行 Git 提交和推送。

**参数**:
- `files`: 要提交的文件(默认: `.`)
- `message`: 提交信息

**返回值**:
```typescript
{
  success: boolean;
  committed: boolean;
  pushed: boolean;
  message: string;
}
```

#### `startDevServer`

启动本地开发服务器。

**参数**:
- `port`: 端口号(默认: `4321`)
- `command`: 启动命令(默认: `npm run dev`)

**返回值**:
```typescript
{
  success: boolean;
  started: boolean;
  url: string;            // 服务器 URL
  pid: number;            // 进程 ID
}
```

### Notifiers

#### `confirmCreation`

显示即将创建的文章信息,请求用户确认。

**参数**:
- `requireConfirmation`: 是否需要确认(默认: `true`)

**返回值**:
```typescript
{
  displayed: boolean;
  needsConfirmation: boolean;
}
```

#### `editConfirm`

打开编辑器让用户确认/修改生成的元数据。

**参数**:
- `filePath`: 文件路径

**返回值**:
```typescript
{
  edited: boolean;
  filePath?: string;
  editor?: string;        // 使用的编辑器
}
```

## Step Registry API

### `defineStep(definition: Step): Step`

定义一个步骤。

### `registerStep(step: Step): void`

注册步骤到全局注册表。

### `getStepByName(name: string): Step | undefined`

根据名称获取步骤。

### `getStepsByType(type: StepType): Step[]`

获取指定类型的所有步骤。

### `clearStepRegistry(): void`

清空注册表(用于测试)。

### `registerBuiltinSteps(): void`

注册所有内置步骤。

## 最佳实践

1. **Step 命名**:
   - 使用清晰、描述性的名称
   - 建议使用命名空间前缀(如 `content:checkChanges`)
   - 避免重复注册同名 step

2. **Step 粒度**:
   - 每个 Step 应该只做一件事
   - 保持 Step 的可复用性
   - 避免在 Step 中硬编码业务逻辑

3. **错误处理**:
   - Validator: 检查前置条件,失败抛出错误
   - Processor/Action: 执行核心逻辑,失败抛出错误
   - Notifier: 执行通知逻辑,失败可以忽略或记录日志

4. **类型安全**:
   - 为 Step 的返回值定义类型
   - 使用 TypeScript 泛型约束

## 跨 Workflow 复用

同一个 Step 可以在多个 Workflow 中使用:

```typescript
import { registerStep, getStepByName } from '@/steps';

// 注册一次
registerStep(checkGitChanges);

// 在多个 workflow 中复用
const workflow1 = defineWorkflow({
  name: 'workflow-1',
  steps: [getStepByName('checkGitChanges')!, ...],
});

const workflow2 = defineWorkflow({
  name: 'workflow-2',
  steps: [getStepByName('checkGitChanges')!, ...],
});
```

## 示例

查看 `src/steps/` 目录下的各个文件获取详细实现示例。
