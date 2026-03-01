## Context

本项目是一个个人技术博客系统，已经实现了 AI 对话式 CLI 的核心功能（意图识别、多轮对话、工作流引擎）。在前期实现中，我们完成了：
- ai-conversational-cli-core: 核心框架和类型定义
- ai-conversational-cli-interaction: 基础交互流程
- ai-conversational-cli-mvp: 最小可用产品
- ai-conversational-cli-extend: 5 个业务工作流

当前状态：
- CLI 已经支持 REPL 模式和命令行模式
- 意图识别和工作流执行已经正常工作
- 但缺少完善的帮助系统和命令分类
- scripts/ 目录存在遗留代码需要清理

本 change 是系列的最后一个，负责**完善用户体验**和**代码清理**，不涉及新的核心架构变更。

## Goals / Non-Goals

**Goals:**
1. 实现完善的帮助系统（AI 问答式 + 传统命令行帮助）
2. 建立意图分类体系，按能力领域组织命令
3. 统一 CLI 入口，支持命令别名和完整参数解析
4. 清理 scripts/ 目录的遗留代码，完成代码迁移

**Non-Goals:**
1. 不修改 AI 意图识别的核心逻辑
2. 不添加新的工作流类型
3. 不修改已有的工作流实现
4. 不涉及前端博客功能的变更
5. 不修改部署脚本的核心逻辑（仅迁移位置）

## Decisions

### 1. 帮助系统架构：双模式设计

**决策**: 实现 REPL 模式和命令行模式两种帮助方式

**方案**:
- **REPL 模式**: 基于知识库的 AI 问答
  - 用户输入 "怎么用？"、"怎么部署？" 等自然语言
  - AI 从 knowledge/ 目录的知识库中检索相关内容
  - 返回结构化的帮助信息（包含代码示例、步骤说明）
  - 优势：自然交互、上下文感知、可追问

- **命令行模式**: 传统 --help 参数
  - `rosydawn --help` 显示全局帮助
  - `rosydawn <command> --help` 显示命令帮助
  - 使用固定的帮助文本格式（Usage、Options、Examples）
  - 优势：快速查看、可脚本化、符合 CLI 规范

**替代方案考虑**:
- 方案 A: 只保留 AI 问答式帮助
  - 优点：统一交互方式
  - 缺点：命令行模式无法快速查看帮助，不符合 CLI 规范
- 方案 B: 只保留传统帮助
  - 优点：简单直接
  - 缺点：REPL 模式下用户体验差，需要记忆命令格式

**选择理由**: 双模式设计兼顾了 REPL 的自然交互和命令行的规范性，满足不同使用场景。

### 2. 意图分类系统：基于能力域的分层结构

**决策**: 使用三层分类体系（Category → Workflow → Action）

**方案**:
```
Category（能力域）
├── content（内容管理）
│   ├── content:new（新建文章）
│   └── content:publish（发布文章）
├── deploy（部署运维）
│   └── deploy:apply（部署应用）
└── help（帮助系统）
    └── help:show（显示帮助）
```

**实现方式**:
1. 在 `src/ai/intent-recognition.ts` 中维护 `CATEGORY_MAP`
2. 意图识别时先分类到 Category，再映射到具体 Workflow
3. 向后兼容：支持旧的命令格式（如 `new` → `content:new`）

**替代方案考虑**:
- 方案 A: 扁平化分类（所有命令在同一层级）
  - 优点：实现简单
  - 缺点：命令数量增长后难以管理
- 方案 B: 基于标签的分类
  - 优点：灵活
  - 缺点：不够直观，用户需要记忆标签

**选择理由**: 分层结构清晰、可扩展性强，符合用户心智模型。

### 3. 命令映射表：中央注册机制

**决策**: 使用 `CommandRegistry` 类统一管理命令映射

**方案**:
```typescript
// src/cli/command-registry.ts
class CommandRegistry {
  private commands = new Map<string, CommandConfig>();
  private aliases = new Map<string, string>();

  register(config: CommandConfig): void;
  alias(name: string, target: string): void;
  resolve(input: string): CommandConfig | null;
  getHelp(command?: string): string;
}
```

**特性**:
- 支持命令别名（`new` → `content:new`）
- 自动生成帮助文本
- 验证命令参数
- 统一错误处理

**替代方案考虑**:
- 方案 A: 使用对象字面量
  - 优点：简单
  - 缺点：难以扩展、不支持动态注册
- 方案 B: 使用第三方库（如 commander.js）
  - 优点：功能完善
  - 缺点：增加依赖、与现有 REPL 架构集成困难

**选择理由**: 自定义 Registry 轻量、可控、与现有架构无缝集成。

### 4. 代码清理策略：分阶段迁移

**决策**: 分三步清理 scripts/ 目录

**步骤**:
1. **验证阶段**: 确认所有功能已在 src/ 中实现
2. **迁移阶段**: 移动遗留脚本到 src/ 对应位置（如果尚未迁移）
3. **清理阶段**: 删除 scripts/ 中已迁移的内容，保留构建相关脚本

**保留内容**:
- `scripts/dev.sh` - 开发服务器启动
- `scripts/build.sh` - 生产构建
- `scripts/preview.sh` - 预览构建结果

**删除内容**:
- `scripts/content/` - 已迁移到 `src/core/content/`
- `scripts/deploy/` - 已迁移到 `src/core/deploy/`
- `scripts/cli/` - 已迁移到 `src/cli/`

**风险缓解**: 清理前运行完整测试套件，确保所有功能正常。

## Risks / Trade-offs

### 风险 1: AI 帮助的准确性
- **问题**: 知识库内容可能不完整或过时，导致 AI 返回错误信息
- **缓解**:
  - 建立知识库更新机制（随代码变更同步更新）
  - 在帮助信息中标注最后更新时间
  - 提供反馈入口（用户可报告错误帮助）

### 风险 2: 命令别名冲突
- **问题**: 短命令别名可能与未来新增命令冲突
- **缓解**:
  - 保留常用别名（`new`, `publish`）
  - 在文档中明确别名列表
  - 提供命令重置机制（用户可禁用别名）

### 风险 3: 代码清理遗漏
- **问题**: 删除 scripts/ 时可能遗漏仍在使用的脚本
- **缓解**:
  - 清理前全局搜索脚本引用
  - 运行完整测试套件
  - 保留 scripts/ 的 Git 历史记录，便于回滚

### Trade-off 1: 帮助系统的双维护成本
- **权衡**: 需要同时维护 AI 知识库和命令行帮助文本
- **理由**: 双模式设计带来更好的用户体验，维护成本可接受
- **缓解**: 建立文档生成工具，从代码注释自动生成部分帮助文本

### Trade-off 2: 分类系统的复杂度
- **权衡**: 三层分类增加实现复杂度
- **理由**: 为未来扩展性付出代价，长期收益大于短期成本
- **缓解**: 提供清晰的分类文档和示例

## Migration Plan

本 change 不涉及数据迁移，仅需代码清理：

### 阶段 1: 功能实现（Day 1）
1. 实现 `CommandRegistry` 类
2. 创建知识库文件（`knowledge/`）
3. 实现帮助系统（REPL + 命令行）
4. 建立意图分类映射表

### 阶段 2: 集成测试（Day 1）
1. 测试 REPL 模式帮助问答
2. 测试命令行模式帮助输出
3. 测试命令别名解析
4. 测试意图分类准确性

### 阶段 3: 代码清理（Day 2）
1. 验证 scripts/ 中功能已迁移
2. 更新 package.json 的 bin 入口
3. 删除 scripts/ 遗留代码
4. 更新项目文档（README.md）

### 回滚策略
如果清理后发现问题：
1. 使用 Git 恢复删除的文件：`git checkout -- scripts/`
2. 回滚 package.json 变更
3. 重新测试受影响的功能

## Open Questions

1. **知识库的更新频率如何控制？**
   - 建议：每次 release 时同步更新知识库
   - 待确认：是否需要自动化工具从代码生成知识库？

2. **命令别名是否需要支持用户自定义？**
   - 建议：首期不支持，保持简单
   - 待确认：如果用户强烈需求，可以在后续版本添加配置文件

3. **帮助信息的国际化？**
   - 建议：首期仅支持中文（符合项目基础配置）
   - 待确认：未来是否需要支持英文帮助？
