## Parent Change

[ai-conversational-cli](../ai-conversational-cli) - AI 对话式 CLI 总体规划

## Why

本 change 是 ai-conversational-cli 的第二批实现，负责建立**AI 交互层**。

在基础设施层（Change 1: core）之上，本 change 实现用户与系统的交互入口：
- 用户如何输入（REPL）
- 系统如何理解（AI 意图识别）
- 系统如何知道能做什么（知识库）

## What Changes

### 新增

- **REPL 交互界面**: 处理用户输入/输出循环
- **AI 意图识别**: 将自然语言解析为结构化意图
- **知识库生成器**: 从 Workflow 定义自动提取 AI 上下文

### 不实现（留给后续 change）

- 业务 Workflow（Change 3: mvp）
- 其他扩展功能（Change 4-5）

## Scope

### 实现的 Specs

| Spec | 说明 |
|------|------|
| [repl-interface](../ai-conversational-cli/specs/repl-interface/spec.md) | REPL 启动、输入循环、输出格式化、命令行模式兼容 |
| [ai-intent-recognizer](../ai-conversational-cli/specs/ai-intent-recognizer/spec.md) | 意图识别、参数缺失检测、AI 客户端配置、知识库注入、错误处理 |
| [knowledge-generator](../ai-conversational-cli/specs/knowledge-generator/spec.md) | 动态知识提取、静态知识加载、知识合并、知识缓存 |

### 不实现的 Specs

- workflow-engine, step-registry（已在 Change 1 实现）
- 所有业务 workflow specs（将在 Change 3-4 实现）
- cli-help-system, cli-category-system（将在 Change 5 实现）

## Dependencies

- **前置依赖**: ai-conversational-cli-core（Workflow 引擎 + Step 注册表）
- **被依赖**: ai-conversational-cli-mvp

## Verification

### 验收标准

1. REPL 能启动并显示欢迎信息
2. 用户输入能被 AI 正确识别为意图和参数
3. 知识库能从已注册的 workflows 自动生成
4. 未知意图能返回友好提示
5. AI 调用失败能优雅处理

### 验证方式

```bash
# 启动 REPL
rosydawn

# 输入自然语言
> 创建一篇关于 WebSocket 的文章

# 期望输出（此时还没有真实 workflow，只打印识别结果）
Intent: create_article
Params: { topic: "WebSocket" }
```

## Impact

### 代码结构变更

```
新增目录:
- src/cli/          # REPL 入口和交互逻辑
- src/ai/           # AI 客户端、意图识别
- src/knowledge/    # 知识库
```

### 依赖变更

- 复用现有 `openai` 依赖
- 复用现有 `@inquirer/prompts` 依赖
