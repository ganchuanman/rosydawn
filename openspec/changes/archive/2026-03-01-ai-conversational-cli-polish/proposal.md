## Parent Change

[ai-conversational-cli](../ai-conversational-cli) - AI 对话式 CLI 总体规划

## Why

本 change 是 ai-conversational-cli 的最后一批实现，负责**完善和收尾**。

在所有核心功能实现后，本 change 负责：
- 完善用户体验（帮助系统、命令分类）
- 统一 CLI 入口
- 清理遗留代码

## What Changes

### 新增

- **帮助系统**: AI 问答式帮助 + 命令行帮助
- **意图分类系统**: 按类别组织能力

### 修改

- **unified-cli-interface**: 完善命令行参数解析、完整的命令映射表

### 删除

- `scripts/` 目录（保留 dev/build/preview 相关脚本）

## Scope

### 实现的 Specs

| Spec | 说明 |
|------|------|
| [cli-help-system](../ai-conversational-cli/specs/cli-help-system/spec.md) | REPL 模式 AI 帮助、命令行模式传统帮助、知识库作为帮助来源 |
| [cli-category-system](../ai-conversational-cli/specs/cli-category-system/spec.md) | 意图分类、向后兼容的命令分类 |
| [unified-cli-interface](../ai-conversational-cli/specs/unified-cli-interface/spec.md) | 完整实现：命令映射表、命令别名支持 |

## Dependencies

- **前置依赖**:
  - ai-conversational-cli-core
  - ai-conversational-cli-interaction
  - ai-conversational-cli-mvp
  - ai-conversational-cli-extend
- **被依赖**: 无（最后一个 change）

## Verification

### 验收标准

1. REPL 模式：输入 "怎么用？" → 返回帮助信息
2. REPL 模式：输入 "怎么部署？" → 返回部署说明
3. 命令行模式：`rosydawn --help` → 显示完整帮助
4. 命令行模式：`rosydawn content new --help` → 显示命令帮助
5. 意图按类别正确分类
6. 命令别名正常工作（`rosydawn new` = `rosydawn content new`）
7. `scripts/` 目录已清理

### 验证方式

```bash
# REPL 模式帮助测试
rosydawn
> 这个工具怎么用？
> 怎么部署？
> 能做什么？

# 命令行模式帮助测试
rosydawn --help
rosydawn content new --help

# 命令别名测试
rosydawn new --topic "test"  # 应等同于 rosydawn content new --topic "test"

# 清理验证
ls scripts/  # 应只剩下 dev/build/preview 相关脚本
```

## Impact

### 代码结构变更

```
删除目录:
- scripts/content/  (已迁移到 src/core/)
- scripts/deploy/   (已迁移到 src/core/)
- scripts/cli/      (已迁移到 src/cli/)

保留目录:
- scripts/          (仅保留 dev/build/preview)
```

### 配置变更

- 更新 package.json bin 入口
- 确保所有命令正确映射

### 最终目录结构

```
src/
├── cli/           # 入口和 REPL
├── ai/            # AI 客户端和意图识别
├── workflow/      # 引擎和类型
├── steps/         # 可复用步骤
│   ├── validators/
│   ├── processors/
│   ├── actions/
│   └── notifiers/
├── workflows/     # 工作流定义
├── core/          # 核心逻辑
└── knowledge/     # 知识库
```
