## Parent Change

[ai-conversational-cli](../ai-conversational-cli) - AI 对话式 CLI 总体规划

## Why

本 change 是 ai-conversational-cli 的第三批实现，负责实现**第一个完整业务流程**。

这是 MVP（最小可行产品）验证点：
- 基础设施层（Change 1）✓
- AI 交互层（Change 2）✓
- **业务层（本 Change）** - 连接所有层，实现端到端验证

选择"创建文章"作为第一个 workflow，因为：
1. 这是最核心的用户场景
2. 流程完整：输入 → AI 识别 → 参数处理 → 文件创建 → 结果返回
3. 可以验证所有层的集成

## What Changes

### 新增

- **创建文章 Workflow**: 完整的文章创建流程
- **相关 Steps**: inputTopic, generateMetadata, createFile, startDevServer 等
- **核心逻辑迁移**: 从 scripts/content/new.js 迁移到 src/core/content/

### 修改

- **unified-cli-interface**: 添加命令行参数解析支持

## Scope

### 实现的 Specs

| Spec | 说明 |
|------|------|
| [article-create-cli](../ai-conversational-cli/specs/article-create-cli/spec.md) | 交互式主题输入、基于 Workflow 的执行、显示完成摘要 |
| [unified-cli-interface](../ai-conversational-cli/specs/unified-cli-interface/spec.md) | 双模式入口、意图路由、命令路由（部分实现） |

### 不实现的 Specs

- article-publish-cli, deploy-workflow, system-workflows（将在 Change 4 实现）
- cli-help-system, cli-category-system（将在 Change 5 实现）

## Dependencies

- **前置依赖**:
  - ai-conversational-cli-core（Workflow 引擎 + Step 注册表）
  - ai-conversational-cli-interaction（REPL + AI 意图识别）
- **被依赖**: ai-conversational-cli-extend

## Verification

### 验收标准

1. REPL 模式：输入 "创建一篇关于 WebSocket 的文章" → 文件创建成功
2. 命令行模式：`rosydawn content new --topic "WebSocket"` → 文件创建成功
3. 参数缺失时能追问用户
4. 创建完成后显示文件路径和预览 URL

### 验证方式

```bash
# REPL 模式
rosydawn
> 创建一篇关于 WebSocket 的文章

# 期望输出
已创建文章《WebSocket 实时通信详解》
文件路径: src/content/posts/2026/02/websocket-shi-shi-tong-xin-xiang-jie.md
预览地址: http://localhost:4321/posts/websocket-shi-shi-tong-xin-xiang-jie
```

## Impact

### 代码结构变更

```
新增目录:
- src/workflows/    # Workflow 定义
- src/core/         # 核心逻辑（从 scripts 迁移）

新增文件:
- src/workflows/create-article.ts
- src/steps/validators/*.ts
- src/steps/processors/*.ts
- src/steps/actions/*.ts
- src/steps/notifiers/*.ts
```

### 功能变更

- 用户可以通过 AI 对话方式创建文章
- 保留原有的命令行方式
