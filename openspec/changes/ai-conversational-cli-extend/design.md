## Context

本 change 是 AI 对话式 CLI 系列的第四批实现，负责扩展除"创建文章"之外的其他业务 Workflows。

### 当前状态
- **已完成**：
  - ai-conversational-cli-core: Workflow 引擎和 Step 注册表
  - ai-conversational-cli-interaction: REPL 界面和 AI 意图识别
  - ai-conversational-cli-mvp: 创建文章的端到端流程验证
- **现有架构**：
  - Workflow 引擎已支持 step-by-step 执行、validator 中断、上下文传递
  - Step 注册表已包含多个 validators、processors、actions、notifiers
  - 已实现 `create-article` workflow 作为 MVP 验证

### 本次扩展范围
新增 5 个 Workflows，覆盖发布、部署、系统操作三大业务场景：
1. **发布文章** (`publish-article`)
2. **部署到服务器** (`deploy`)
3. **启动开发服务器** (`start-dev`)
4. **构建项目** (`build`)
5. **检查状态** (`check-status`)

### 约束条件
- 必须复用现有的 Workflow 引擎和 Step 系统
- 不能破坏已有的 `create-article` workflow
- 需要从旧的 `scripts/` 目录迁移逻辑到新的 Step 架构
- 保持 REPL 和命令行两种模式的兼容性

## Goals / Non-Goals

**Goals:**
- ✅ 实现 5 个新 Workflows，全部注册到 workflow 注册表
- ✅ 复用已有 steps（`getChangedArticles`、`checkGitChanges`、`commitAndPush`）
- ✅ 新增必要的 steps（构建、部署、状态检查相关）
- ✅ 保持 REPL 自然语言响应风格
- ✅ 迁移旧脚本逻辑到 Step 架构

**Non-Goals:**
- ❌ 不实现 help system（Change 5）
- ❌ 不实现 category system（Change 5）
- ❌ 不重构 AI intent 识别逻辑
- ❌ 不改变 workflow 引擎核心实现

## Decisions

### Decision 1: Workflow 粒度设计

**选择**：每个业务场景一个 Workflow，每个 Workflow 由 3-6 个 Steps 组成。

**理由**：
- 符合单一职责原则，便于测试和维护
- 与现有 `create-article` workflow 保持一致
- 细粒度的 step 便于跨 workflow 复用

**备选方案**：
- ❌ *粗粒度 Workflow（每个 Workflow 包含大量逻辑）*：难以复用，测试困难
- ❌ *超细粒度（每个操作一个 Workflow）*：过度设计，增加复杂度

**示例**：
```typescript
// publish-article workflow
steps: [
  getChangedArticles,      // 复用已有 validator
  collectExistingTags,     // 复用已有 processor
  generateMetadata,        // 复用已有 processor
  editConfirm,             // 复用已有 notifier
  updateFrontmatter,       // 复用已有 processor
  commitAndPush,           // 复用已有 action
]
```

### Decision 2: 代码迁移策略

**选择**：渐进式迁移，保留旧脚本作为备份。

**理由**：
- 降低风险，新旧代码可并存
- 便于对比验证结果一致性
- 如果新实现有问题可快速回退

**实施步骤**：
1. 创建新的 step 文件（如 `src/steps/actions/deploy.ts`）
2. 从 `scripts/deploy/` 复制核心逻辑到新 step
3. 调整为 Step 接口（添加 context、返回类型）
4. 在新 workflow 中使用新 step
5. 验证通过后再删除旧脚本

**不选择的方案**：
- ❌ *直接删除旧脚本重写*：风险高，无法对比验证
- ❌ *保留旧脚本不迁移*：技术债务，维护两套逻辑

### Decision 3: 部署流程的 Step 拆分

**选择**：拆分为 3 个独立 steps：`buildProject`、`confirmDeploy`、`executeDeploy`。

**理由**：
- `buildProject` 可被其他 workflow 复用（如本地构建）
- `confirmDeploy` 遵循"修改前确认"原则
- `executeDeploy` 专注于远程部署逻辑

**备选方案**：
- ❌ *单一 `deploy` step*：难以复用构建逻辑，无法在构建后确认

**代码示例**：
```typescript
// src/steps/actions/build.ts
export const buildProject: Step = {
  name: 'build-project',
  type: 'action',
  execute: async (context) => {
    const result = await exec('npm run build');
    if (result.failed) {
      return { success: false, error: '构建失败' };
    }
    return { success: true, outputDir: 'dist' };
  }
};
```

### Decision 4: 状态检查的聚合方式

**选择**：每个维度一个 step，由 `check-status` workflow 聚合结果。

**理由**：
- 每个 step 可独立测试
- 便于未来扩展新的检查维度
- 符合单一职责原则

**维度划分**：
```typescript
steps: [
  checkGitStatus,        // 检查 Git 状态（复用 validator）
  checkArticleStats,     // 新增：文章统计
  checkDeploymentStatus, // 新增：部署状态
]
```

**不选择的方案**：
- ❌ *单一巨型 step*：难以维护，无法复用
- ❌ *直接调用函数*：不符合 step 架构，无法被 workflow 引擎管理

### Decision 5: 错误处理策略

**选择**：Validator step 返回 `{ success: false }` 中断流程，Action step 抛出异常。

**理由**：
- Validator 的失败是"正常流程分支"（如无变更可发布），不应抛异常
- Action 的失败是"异常情况"（如构建错误），需要异常处理

**示例**：
```typescript
// Validator 示例
export const getChangedArticles: ValidatorStep = {
  name: 'get-changed-articles',
  type: 'validator',
  execute: async (context) => {
    const articles = await detectChangedArticles();
    if (articles.length === 0) {
      // 中断流程，返回友好消息
      return {
        success: false,
        message: '没有找到未发布的文章变更'
      };
    }
    return { success: true, articles };
  }
};

// Action 示例
export const buildProject: ActionStep = {
  name: 'build-project',
  type: 'action',
  execute: async (context) => {
    const result = await exec('npm run build');
    if (result.failed) {
      // 抛出异常，触发错误处理
      throw new Error(`构建失败: ${result.stderr}`);
    }
    return { success: true };
  }
};
```

## Risks / Trade-offs

### Risk 1: 旧脚本迁移遗漏逻辑

**风险**：从 `scripts/deploy/` 迁移时可能遗漏边界条件处理。

**缓解措施**：
- 迁移前先阅读旧脚本的完整逻辑
- 为新 step 编写单元测试，覆盖边界情况
- 在测试环境验证新 workflow 的完整流程
- 保留旧脚本 1-2 个版本周期，作为备份

### Risk 2: Workflow 数量增加导致注册表混乱

**风险**：5 个新 workflow 加入后，注册表可能变得难以管理。

**缓解措施**：
- 添加 workflow 分类元数据（category: 'content' | 'deploy' | 'system'）
- 在 `registerAllWorkflows` 中按类别组织代码
- 为未来的 Change 5（help system）预留扩展点

### Risk 3: 部署流程的远程服务器依赖

**风险**：`executeDeploy` step 依赖远程服务器可用性，可能在测试中失败。

**缓解措施**：
- 在 CI 环境中跳过真实部署（使用 mock）
- 提供 `--dry-run` 选项用于测试
- 部署前检测服务器连接性，失败时提前退出

### Trade-off 1: Step 复用 vs 独立性

**权衡**：过度复用 steps 可能导致耦合，独立 steps 可能导致重复代码。

**决策**：
- **优先复用**：`getChangedArticles`、`checkGitChanges`、`commitAndPush` 等通用 steps
- **保持独立**：业务特定的 steps（如 `checkDeploymentStatus`）独立实现
- **原则**：一个 step 被至少 2 个 workflows 使用时才考虑复用

### Trade-off 2: 迁移速度 vs 稳定性

**权衡**：快速迁移所有逻辑 vs 逐步验证每个 workflow。

**决策**：
- **优先稳定性**：先实现并验证 `publish-article` 和 `deploy` 两个核心 workflow
- **后续扩展**：`start-dev`、`build`、`check-status` 可在后续小版本中添加
- **发布策略**：分两个 PR 提交，核心 workflows 优先合并

## Migration Plan

### Phase 1: 核心发布 Workflow（Week 1）

1. **实现 publish-article workflow**
   ```bash
   - 创建 src/workflows/publish-article.ts
   - 复用 steps: getChangedArticles, collectExistingTags, generateMetadata, editConfirm, updateFrontmatter, commitAndPush
   - 注册到 workflow 注册表
   ```

2. **验证 REPL 和命令行模式**
   ```bash
   # REPL 模式
   rosydawn
   > 发布

   # 命令行模式
   rosydawn content publish
   ```

3. **编写单元测试**
   - 测试无变更场景
   - 测试单篇文章发布
   - 测试多篇文章发布

### Phase 2: 部署 Workflow（Week 1-2）

1. **迁移构建逻辑**
   ```bash
   - 创建 src/steps/actions/build.ts
   - 从 package.json 的 build script 迁移逻辑
   ```

2. **迁移部署逻辑**
   ```bash
   - 创建 src/steps/actions/deploy.ts
   - 从 scripts/deploy/ 迁移远程部署逻辑
   - 添加服务器连接性检查
   ```

3. **实现 deploy workflow**
   ```bash
   - 创建 src/workflows/deploy.ts
   - 组装 steps: checkGitChanges → buildProject → confirmDeploy → executeDeploy
   ```

### Phase 3: 系统 Workflows（Week 2）

1. **start-dev workflow**
   - 复用 `startDevServer` step
   - 添加端口检查 step

2. **build workflow**
   - 复用 `buildProject` step
   - 添加清理 dist 目录 step

3. **check-status workflow**
   - 实现 `checkArticleStats` step
   - 实现 `checkDeploymentStatus` step
   - 组装到 workflow

### 回滚策略

如果新 workflows 出现严重问题：
1. **立即回滚**：从 `registerAllWorkflows` 中移除问题 workflow
2. **使用旧脚本**：用户可临时使用 `npm run content:publish` 等旧命令
3. **修复后重新发布**：修复问题后重新注册 workflow

## Open Questions

### Question 1: 部署状态如何持久化？

**问题**：`checkDeploymentStatus` step 需要知道最近一次部署的时间和状态，但当前没有持久化存储。

**备选方案**：
- A. 在 Git 仓库中存储部署记录（如 `.rosydawn/deploy-history.json`）
- B. 使用本地文件系统（如 `~/.rosydawn/cache.json`）
- C. 仅从远程服务器查询（需要 SSH 连接）

**倾向**：方案 B，避免污染 Git 仓库。

### Question 2: 多篇文章发布的交互方式？

**问题**：`publish-article` workflow 检测到多篇未发布文章时，如何处理？

**备选方案**：
- A. 一次性发布所有文章（批量模式）
- B. 让用户选择发布哪些文章（交互模式）
- C. 逐篇确认（逐个模式）

**倾向**：方案 B，使用 `@inquirer/prompts` 的多选功能。

### Question 3: 构建失败时的文章回滚？

**问题**：如果 `deploy` workflow 在构建阶段失败，已更新的 frontmatter 是否需要回滚？

**备选方案**：
- A. 自动回滚 frontmatter（复杂，需要 Git 操作）
- B. 不回滚，保留 frontmatter 更新（简单，但可能导致不一致）
- C. 在构建前先创建 Git stash（中等复杂度）

**倾向**：方案 C，使用 Git stash 保护工作区。
