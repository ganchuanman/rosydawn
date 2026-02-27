## Parent Change

[ai-conversational-cli](../ai-conversational-cli) - AI 对话式 CLI 总体规划

## Why

本 change 是 ai-conversational-cli 的第四批实现，负责**扩展其他 Workflows**。

在 MVP（Change 3）验证了端到端流程后，本 change 扩展更多业务能力：
- 发布文章
- 部署到服务器
- 系统操作（开发、构建、状态检查）

## What Changes

### 新增

- **发布文章 Workflow**: 文章发布和 Git 推送
- **部署 Workflow**: 构建并部署到服务器
- **系统 Workflows**: start-dev, build, check-status

### 迁移

- 从 `scripts/content/publish.js` 迁移逻辑
- 从 `scripts/deploy/` 迁移逻辑

## Scope

### 实现的 Specs

| Spec | 说明 |
|------|------|
| [article-publish-cli](../ai-conversational-cli/specs/article-publish-cli/spec.md) | 检测文章变更、基于 Workflow 的执行、Git 操作确认 |
| [deploy-workflow](../ai-conversational-cli/specs/deploy-workflow/spec.md) | 检测部署条件、执行部署、显示部署结果 |
| [system-workflows](../ai-conversational-cli/specs/system-workflows/spec.md) | start-dev, build, check-status 三个 workflow |

### 不实现的 Specs

- cli-help-system, cli-category-system（将在 Change 5 实现）
- unified-cli-interface 的完善（将在 Change 5 实现）

## Dependencies

- **前置依赖**:
  - ai-conversational-cli-core
  - ai-conversational-cli-interaction
  - ai-conversational-cli-mvp
- **被依赖**: ai-conversational-cli-polish

## Verification

### 验收标准

1. 发布文章：检测变更 → 生成元数据 → 确认 → Git 推送
2. 部署：检测变更 → 构建 → 确认 → 部署 → 显示结果
3. 开发服务器：启动本地服务器
4. 构建：生成生产版本
5. 状态检查：显示 Git 状态、文章统计、部署状态

### 验证方式

```bash
# REPL 模式测试
rosydawn
> 发布                    # 测试发布文章
> 部署                    # 测试部署
> 启动开发服务器           # 测试 start-dev
> 构建项目                 # 测试 build
> 检查状态                 # 测试 check-status

# 命令行模式测试
rosydawn content publish
rosydawn deploy
rosydawn dev
rosydawn build
rosydawn status
```

## Impact

### 代码结构变更

```
新增文件:
- src/workflows/publish-article.ts
- src/workflows/deploy.ts
- src/workflows/start-dev.ts
- src/workflows/build.ts
- src/workflows/check-status.ts
- src/steps/ (新增相关 steps)
- src/core/deploy/ (从 scripts/deploy 迁移)
```

### 功能变更

- 用户可以通过 AI 对话方式发布文章、部署、管理系统
