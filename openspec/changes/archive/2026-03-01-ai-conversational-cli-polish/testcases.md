# Test Cases

## 1. Test Strategy

本测试计划采用多层次测试策略：

- **单元测试（Automated）**: 针对核心类和函数的测试（CommandRegistry、CATEGORY_MAP）
- **集成测试（Automated）**: 针对 CLI 入口和命令路由的测试
- **手动测试（Manual）**: REPL 模式的 AI 帮助响应测试
- **边界测试（Edge Case）**: 别名冲突、参数验证、未知命令处理
- **回归测试（Regression）**: 确保现有功能不受影响

测试优先级：
1. P0: 核心功能（命令注册、解析、别名）
2. P1: 帮助系统（AI 响应、命令行帮助）
3. P2: 分类系统（CATEGORY_MAP、分类显示）

## 2. Environment & Preconditions

### 环境要求
- Node.js 18+ 已安装
- 项目依赖已安装（`npm install`）
- 环境变量 `OPENAI_API_KEY` 已配置
- 测试环境为干净的 Git 工作区

### 数据准备
- `src/knowledge/static.md` 文件存在并包含基础知识
- `src/knowledge/workflows/` 目录包含所有 workflow 的知识文件
- 至少有一个测试文章（用于发布测试）

### 系统状态
- CLI 已构建（`npm run build`）
- 所有前置 change 已实现（core、interaction、mvp、extend）
- `scripts/` 目录待清理

## 3. Execution List

### TC-01: 知识库静态文件存在性验证
- **Target**: cli-help-system/spec.md - Requirement: 知识库文件组织结构 - Scenario: 静态知识文件
- **Type**: Automated
- **Preconditions**: 系统已构建
- **Steps**:
  1. 检查文件 `src/knowledge/static.md` 是否存在
  2. 读取文件内容
  3. 验证内容包含 "部署说明"、"环境配置"、"常见问题" 关键词
- **Expected Result**: 文件存在且包含必需的内容章节

### TC-02: 知识库 Workflow 文件验证
- **Target**: cli-help-system/spec.md - Requirement: 知识库文件组织结构 - Scenario: Workflow 知识文件
- **Type**: Automated
- **Preconditions**: 所有 workflow 已实现
- **Steps**:
  1. 列出 `src/workflows/` 中所有 workflow 文件
  2. 对每个 workflow，检查 `src/knowledge/workflows/<workflow-name>.md` 是否存在
  3. 验证知识文件包含：用途、参数、使用示例
- **Expected Result**: 每个 workflow 都有对应的知识文件，且格式正确

### TC-03: AI 帮助响应包含代码示例
- **Target**: cli-help-system/spec.md - Requirement: AI 帮助响应格式 - Scenario: 帮助响应包含代码示例
- **Type**: Manual
- **Preconditions**: REPL 模式可用，OPENAI_API_KEY 已配置
- **Steps**:
  1. 启动 REPL：执行 `rosydawn`
  2. 输入问题："怎么创建文章？"
  3. 观察 AI 响应
- **Expected Result**: 响应包含描述、命令示例（如 `rosydawn content new --topic "主题"`）、参数说明

### TC-04: AI 帮助响应包含相关链接
- **Target**: cli-help-system/spec.md - Requirement: AI 帮助响应格式 - Scenario: 帮助响应包含相关链接
- **Type**: Manual
- **Preconditions**: REPL 模式可用
- **Steps**:
  1. 启动 REPL：执行 `rosydawn`
  2. 输入特定主题查询："部署时需要注意什么？"
  3. 观察 AI 响应
- **Expected Result**: 响应包含相关文档链接，链接指向项目内知识文件（如 `knowledge/static.md`）

### TC-05: 全局帮助生成
- **Target**: cli-help-system/spec.md - Requirement: 命令行帮助文本生成 - Scenario: 全局帮助生成
- **Type**: Automated
- **Preconditions**: CommandRegistry 已实现
- **Steps**:
  1. 执行 `rosydawn --help`
  2. 捕获输出
  3. 验证输出包含 "Usage:"、"Commands:"、"Options:" 章节
  4. 验证所有已注册命令都列在 "Commands:" 下
- **Expected Result**: 输出格式化的帮助文本，包含 Usage、Commands、Options 三个章节

### TC-06: 命令特定帮助生成
- **Target**: cli-help-system/spec.md - Requirement: 命令行帮助文本生成 - Scenario: 命令帮助生成
- **Type**: Automated
- **Preconditions**: CommandRegistry 已实现
- **Steps**:
  1. 执行 `rosydawn content new --help`
  2. 捕获输出
  3. 验证输出包含 "Usage:"、"Arguments:"、"Options:"、"Examples:" 章节
  4. 验证参数描述准确
- **Expected Result**: 输出该命令的详细帮助，包含 Usage、Arguments、Options、Examples

### TC-07: CATEGORY_MAP 数据结构验证
- **Target**: cli-category-system/spec.md - Requirement: 分类映射表维护 - Scenario: CATEGORY_MAP 数据结构
- **Type**: Automated
- **Preconditions**: 代码已实现
- **Steps**:
  1. 检查文件 `src/ai/intent-recognition.ts` 存在
  2. 导入 CATEGORY_MAP 常量
  3. 验证每个条目包含：intent、category、description 字段
  4. 验证所有已实现 intent 都在映射表中
- **Expected Result**: CATEGORY_MAP 定义存在，包含所有已实现意图的分类信息

### TC-08: 新意图注册到分类
- **Target**: cli-category-system/spec.md - Requirement: 分类映射表维护 - Scenario: 新意图注册到分类
- **Type**: Manual (代码审查)
- **Preconditions**: 开发环境准备就绪
- **Steps**:
  1. 查看开发文档，确认新 workflow 开发流程包含分类注册步骤
  2. 检查 CATEGORY_MAP 类型定义，确认字段要求
- **Expected Result**: 文档明确要求新 workflow 必须在 CATEGORY_MAP 中注册，字段要求清晰

### TC-09: REPL 模式按类别列出能力
- **Target**: cli-category-system/spec.md - Requirement: 命令分类显示 - Scenario: REPL 模式按类别列出能力
- **Type**: Manual
- **Preconditions**: REPL 模式可用
- **Steps**:
  1. 启动 REPL：执行 `rosydawn`
  2. 输入："能做什么？"
  3. 观察 AI 响应
  4. 验证响应按 content、deploy、system 顺序分组
- **Expected Result**: AI 响应按类别分组显示能力，分组顺序为 content → deploy → system

### TC-10: 命令行模式按类别显示命令
- **Target**: cli-category-system/spec.md - Requirement: 命令分类显示 - Scenario: 命令行模式按类别显示命令
- **Type**: Automated
- **Preconditions**: 帮助系统已实现
- **Steps**:
  1. 执行 `rosydawn --help`
  2. 捕获输出
  3. 验证命令按类别分组（content、deploy、system）
  4. 验证每个类别有清晰的标题和描述
- **Expected Result**: 帮助文本按类别分组显示，每个类别有标题和描述

### TC-11: content 类别名名
- **Target**: cli-category-system/spec.md - Requirement: 向后兼容的命令别名 - Scenario: content 类别名名
- **Type**: Automated
- **Preconditions**: CommandRegistry 已实现别名功能
- **Steps**:
  1. 执行 `rosydawn new --topic "测试主题"`
  2. 验证命令成功执行
  3. 验证创建了对应主题的文章
  4. 执行 `rosydawn content new --topic "测试主题2"`
  5. 比较两次执行的行为是否一致
- **Expected Result**: `rosydawn new` 与 `rosydawn content new` 行为完全一致

### TC-12: 别名冲突检测
- **Target**: cli-category-system/spec.md - Requirement: 向后兼容的命令别名 - Scenario: 别名冲突检测
- **Type**: Edge Case / Automated
- **Preconditions**: CommandRegistry 已实现
- **Steps**:
  1. 尝试注册别名：`registry.alias('existing-command', 'some:command')`
  2. 验证系统抛出错误
  3. 验证错误消息提示别名冲突
- **Expected Result**: 系统检测到别名与现有命令冲突，抛出明确的错误信息

### TC-13: 命令注册
- **Target**: unified-cli-interface/spec.md - Requirement: CommandRegistry 类实现 - Scenario: 命令注册
- **Type**: Automated (单元测试)
- **Preconditions**: CommandRegistry 类已实现
- **Steps**:
  1. 创建 CommandRegistry 实例
  2. 调用 `registry.register()` 注册测试命令
  3. 验证命令被成功添加到内部命令表
  4. 验证注册信息包含：command、workflow、description、aliases、options
- **Expected Result**: 命令成功注册，信息完整

### TC-14: 命令解析
- **Target**: unified-cli-interface/spec.md - Requirement: CommandRegistry 类实现 - Scenario: 命令解析
- **Type**: Automated (单元测试)
- **Preconditions**: CommandRegistry 已注册命令
- **Steps**:
  1. 调用 `registry.resolve('new', { topic: 'test' })`
  2. 验证返回的 CommandConfig 对应 `content:new`
  3. 验证参数正确传递
- **Expected Result**: CommandRegistry 正确解析别名为完整命令，返回对应的 CommandConfig

### TC-15: 别名注册
- **Target**: unified-cli-interface/spec.md - Requirement: CommandRegistry 类实现 - Scenario: 别名注册
- **Type**: Automated (单元测试)
- **Preconditions**: CommandRegistry 类已实现
- **Steps**:
  1. 注册命令：`registry.register({ command: 'content:new', ... })`
  2. 注册别名：`registry.alias('new', 'content:new')`
  3. 验证 `registry.resolve('new')` 返回正确的 CommandConfig
  4. 验证 `registry.resolve('content:new')` 返回相同的 CommandConfig
- **Expected Result**: 别名注册成功，两种命令形式等价

### TC-16: 映射表完整性验证
- **Target**: unified-cli-interface/spec.md - Requirement: 完整的命令映射表 - Scenario: 映射表完整性验证
- **Type**: Automated
- **Preconditions**: 系统启动
- **Steps**:
  1. 列出 `src/workflows/` 中所有 workflow
  2. 检查每个 workflow 在 CommandRegistry 中都有映射
  3. 如果存在未映射的 workflow，验证控制台输出警告
- **Expected Result**: 所有已实现 workflow 都有命令映射，未映射时发出警告

### TC-17: 参数类型验证
- **Target**: unified-cli-interface/spec.md - Requirement: 参数解析和验证 - Scenario: 参数类型验证
- **Type**: Automated
- **Preconditions**: 参数解析功能已实现
- **Steps**:
  1. 执行 `rosydawn content new --topic 123`（数字类型）
  2. 验证 workflow 接收到的 topic 参数为字符串 "123"
  3. 验证命令正常执行
- **Expected Result**: 系统自动转换参数类型，workflow 接收正确类型的参数

### TC-18: 必填参数检查
- **Target**: unified-cli-interface/spec.md - Requirement: 参数解析和验证 - Scenario: 必填参数检查
- **Type**: Automated
- **Preconditions**: 参数验证功能已实现
- **Steps**:
  1. 执行 `rosydawn content new`（缺少必填参数 --topic）
  2. 捕获错误输出
  3. 验证显示错误信息和正确用法
  4. 验证退出码为非零
- **Expected Result**: 系统显示明确的错误信息和用法示例，以非零状态码退出

### TC-19: 可选参数默认值
- **Target**: unified-cli-interface/spec.md - Requirement: 参数解析和验证 - Scenario: 可选参数默认值
- **Type**: Automated
- **Preconditions**: 参数解析功能已实现，有可选参数的命令
- **Steps**:
  1. 执行命令时省略可选参数（如 `--dry-run`）
  2. 验证 workflow 接收到的参数对象包含默认值
  3. 验证命令正常执行
- **Expected Result**: 系统使用配置的默认值，workflow 接收完整的参数对象

### TC-20: 命令别名支持（new）
- **Target**: unified-cli-interface/spec.md - Requirement: 命令与 Workflow 映射 - Scenario: 命令别名支持
- **Type**: Automated
- **Preconditions**: 别名功能已实现
- **Steps**:
  1. 执行 `rosydawn new --topic "WebSocket"`
  2. 验证命令成功执行
  3. 验证创建了主题为 "WebSocket" 的文章
  4. 执行 `rosydawn content:new --topic "WebSocket2"`
  5. 比较两次执行的行为和结果
- **Expected Result**: `rosydawn new` 与 `rosydawn content:new` 行为完全一致

### TC-21: 命令别名支持（publish）
- **Target**: unified-cli-interface/spec.md - Requirement: 命令与 Workflow 映射 - Scenario: 命令别名支持（已存在场景的增强）
- **Type**: Automated
- **Preconditions**: 别名功能已实现，有可发布的文章
- **Steps**:
  1. 执行 `rosydawn publish`（省略 content）
  2. 验证命令成功执行
  3. 验证触发了 publish-article workflow
  4. 执行 `rosydawn content:publish`
  5. 比较两次执行的行为
- **Expected Result**: `rosydawn publish` 与 `rosydawn content:publish` 行为一致

### TC-22: scripts 目录清理验证
- **Target**: proposal.md - 验收标准 7
- **Type**: Manual
- **Preconditions**: 代码清理完成
- **Steps**:
  1. 列出 `scripts/` 目录内容
  2. 验证只存在 dev/build/preview 相关脚本
  3. 验证 `scripts/content/` 已删除
  4. 验证 `scripts/deploy/` 已删除
  5. 验证 `scripts/cli/` 已删除
- **Expected Result**: scripts/ 目录仅包含 dev/build/preview 相关脚本，其他子目录已删除

### TC-23: 集成测试 - 完整 REPL 帮助流程
- **Target**: proposal.md - 验收标准 1, 2
- **Type**: Manual
- **Preconditions**: 系统完整实现
- **Steps**:
  1. 启动 REPL：`rosydawn`
  2. 输入："这个工具怎么用？"
  3. 验证返回帮助信息
  4. 输入："怎么部署？"
  5. 验证返回部署说明
  6. 输入："能做什么？"
  7. 验证按类别列出能力
- **Expected Result**: 所有问题都得到相关的、结构化的帮助响应

### TC-24: 集成测试 - 命令行帮助完整性
- **Target**: proposal.md - 验收标准 3, 4
- **Type**: Automated
- **Preconditions**: 系统完整实现
- **Steps**:
  1. 执行 `rosydawn --help`
  2. 验证显示完整帮助（包含所有命令）
  3. 执行 `rosydawn content new --help`
  4. 验证显示命令详细帮助
- **Expected Result**: 全局帮助和命令帮助都正确显示

### TC-25: 集成测试 - 别名端到端测试
- **Target**: proposal.md - 验收标准 6
- **Type**: Automated
- **Preconditions**: 系统完整实现
- **Steps**:
  1. 执行 `rosydawn new --topic "测试主题"`
  2. 验证命令成功
  3. 执行 `rosydawn status`
  4. 验证命令成功
  5. 执行 `rosydawn build`
  6. 验证命令成功
- **Expected Result**: 所有别名命令正常工作，与完整命令行为一致

### TC-26: 边界测试 - 未知命令处理
- **Target**: design.md - 风险缓解
- **Type**: Edge Case / Automated
- **Preconditions**: 系统完整实现
- **Steps**:
  1. 执行 `rosydawn unknown-command`
  2. 验证显示友好错误信息
  3. 验证建议有效命令
  4. 验证以非零状态码退出
- **Expected Result**: 系统优雅处理未知命令，提供有用反馈

### TC-27: 边界测试 - AI 帮助超时处理
- **Target**: design.md - 风险缓解
- **Type**: Edge Case / Manual
- **Preconditions**: OPENAI_API_KEY 配置正确但网络可能不稳定
- **Steps**:
  1. 启动 REPL
  2. 输入问题触发 AI 调用
  3. 如果响应超时，验证显示友好错误信息
  4. 验证系统不崩溃，可以继续交互
- **Expected Result**: AI 帮助超时时系统优雅处理，不影响后续使用

### TC-28: 回归测试 - 现有 workflow 不受影响
- **Target**: design.md - Goals/Non-Goals
- **Type**: Regression / Automated
- **Preconditions**: 前置 change 的测试用例存在
- **Steps**:
  1. 运行 ai-conversational-cli-extend 的所有测试用例
  2. 验证所有测试通过
  3. 手动测试核心 workflow：create-article、publish-article、deploy
- **Expected Result**: 所有现有功能正常工作，不受本 change 影响

### TC-29: 性能测试 - 命令解析性能
- **Target**: design.md - 决策 3
- **Type**: Automated
- **Preconditions**: CommandRegistry 已实现
- **Steps**:
  1. 注册 100 个命令（包括别名）
  2. 测量命令解析时间（`registry.resolve()`）
  3. 验证平均解析时间 < 5ms
- **Expected Result**: 命令解析性能良好，无明显延迟

### TC-30: 用户验收测试 - 帮助系统易用性
- **Target**: proposal.md - Why
- **Type**: Manual (用户测试)
- **Preconditions**: 系统完整实现
- **Steps**:
  1. 邀请 2-3 名用户试用 REPL 帮助
  2. 让用户尝试获取不同主题的帮助
  3. 收集用户反馈
  4. 验证用户能够快速找到所需信息
- **Expected Result**: 用户反馈积极，认为帮助系统直观易用
