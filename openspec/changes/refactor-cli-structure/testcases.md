# Test Cases

## 1. Test Strategy

本次 CLI 重构的测试策略包括：
- **手动测试**：验证所有 npm scripts 命令的可执行性和输出格式
- **集成测试**：确保命令分类体系的完整性和一致性
- **回归测试**：验证命令功能未发生改变
- **边界测试**：测试 help 命令输出的可读性和 AI 理解能力

主要测试重点：
1. 命令命名和分类的正确性
2. Help 命令输出的详细程度和结构化程度
3. 现有命令功能的完整性（无破坏性变更）
4. Package.json scripts 的配置正确性

## 2. Environment & Preconditions

- Node.js 环境（v16+）
- 已安装项目依赖（npm install）
- Git 仓库处于正常状态
- 环境变量配置正确（如 AI 服务配置）
- 开发服务器端口 4321 未被占用（用于 content:new 测试）

## 3. Execution List

### TC-01: 验证 package.json scripts 包含所有新命令
- **Target**: cli-category-system - Requirement: Three-tier command categorization
- **Type**: Manual
- **Preconditions**: package.json 已更新
- **Steps**:
  1. 打开 package.json 文件
  2. 检查 scripts 字段
  3. 确认包含 `content:new` 命令
  4. 确认包含 `content:publish` 命令
  5. 确认包含 `help` 命令
  6. 确认旧的 `new` 和 `publish` 命令已被移除
- **Expected Result**:
  - `content:new` 存在且指向 `tsx scripts/new.ts`
  - `content:publish` 存在且指向 `tsx scripts/publish.ts`
  - `help` 存在且指向 `tsx scripts/help.ts`
  - `new` 和 `publish` 命令不存在

### TC-02: 验证命令分类结构
- **Target**: cli-category-system - Requirement: Three-tier command categorization
- **Type**: Manual
- **Preconditions**: package.json 已更新
- **Steps**:
  1. 查看 package.json scripts
  2. 列出所有 dev 类别命令（dev, build, preview）
  3. 列出所有 content 类别命令（content:new, content:publish）
  4. 列出所有 deploy 类别命令（deploy:build, deploy:ssl 等）
  5. 列出 help 命令
- **Expected Result**:
  - 每个类别包含预期的命令
  - 命令命名符合 `<category>:<action>` 格式
  - deploy 类别包含所有部署相关命令

### TC-03: 执行 help 命令显示所有命令
- **Target**: cli-help-system - Requirement: Display all available commands
- **Type**: Manual
- **Preconditions**: scripts/help.ts 已创建
- **Steps**:
  1. 执行 `npm run help`
  2. 观察输出内容
  3. 确认命令按类别分组
  4. 确认类别顺序为：dev, content, deploy, help
- **Expected Result**:
  - 输出格式化的命令列表
  - 显示分类标题（如"开发命令"、"内容创作命令"等）
  - 命令按类别正确分组

### TC-04: 验证 help 命令包含详细描述
- **Target**: cli-help-system - Requirement: Detailed command descriptions
- **Type**: Manual
- **Preconditions**: scripts/help.ts 已创建
- **Steps**:
  1. 执行 `npm run help`
  2. 检查 `dev` 命令的描述信息
  3. 检查 `content:new` 命令的描述信息
  4. 验证每个命令包含：描述、使用场景、预期结果
- **Expected Result**:
  - `dev` 命令显示："启动本地开发服务器，支持热重载"
  - 显示使用场景："当需要实时预览博客文章或调试代码时使用"
  - 显示预期结果："在 http://localhost:4321 启动开发服务器"
  - `content:new` 显示完整的工作流程

### TC-05: 验证 help 输出的结构化格式
- **Target**: cli-help-system - Requirement: Structured output format for AI understanding
- **Type**: Manual
- **Preconditions**: scripts/help.ts 已创建
- **Steps**:
  1. 执行 `npm run help`
  2. 检查输出是否使用清晰分隔符
  3. 检查每个命令的信息结构是否一致
  4. 验证分类级别的描述
- **Expected Result**:
  - 类别之间有清晰的视觉分隔
  - 每个命令包含一致的字段：命令名称、描述、使用场景、预期结果
  - 每个类别有简短介绍说明其用途

### TC-06: 验证 AI 能理解 help 输出（意图：创建新文章）
- **Target**: cli-help-system - Requirement: AI-friendly command information
- **Type**: Manual
- **Preconditions**: help 输出包含详细信息
- **Steps**:
  1. 执行 `npm run help` 并保存输出
  2. 将输出提供给 AI 助手
  3. 询问 AI："我想创建一篇新文章，应该运行什么命令？"
  4. 观察 AI 的回答
- **Expected Result**:
  - AI 正确识别应使用 `npm run content:new`
  - AI 能说明该命令的工作流程
  - AI 能解释预期结果

### TC-07: 验证 AI 能理解前置条件
- **Target**: cli-help-system - Requirement: AI-friendly command information
- **Type**: Manual
- **Preconditions**: help 输出包含前置条件信息
- **Steps**:
  1. 将 help 输出提供给 AI
  2. 询问 AI："我想预览构建结果，应该怎么做？"
  3. 观察 AI 是否提到需要先运行 `npm run build`
- **Expected Result**:
  - AI 说明需要先运行 `npm run build`
  - AI 能解释为什么需要这个前置条件

### TC-08: 执行 content:new 命令创建文章
- **Target**: article-create-cli - Requirement: Interactive topic input
- **Type**: Manual
- **Preconditions**:
  - AI 服务配置正确
  - 开发服务器端口 4321 未被占用
- **Steps**:
  1. 执行 `npm run content:new`
  2. 观察是否显示提示："这篇文章的核心主题是什么？"
  3. 输入主题描述："测试文章：CLI 重构说明"
  4. 等待 AI 生成标题和 slug
  5. 确认创建
- **Expected Result**:
  - 显示交互式提示
  - AI 生成合适的标题和 slug
  - 在 `src/content/posts/{year}/{month}/{slug}/index.md` 创建文件
  - 自动启动开发服务器

### TC-09: 验证 content:new 命令的预览和确认流程
- **Target**: article-create-cli - Requirement: Preview before creation
- **Type**: Manual
- **Preconditions**: AI 服务配置正确
- **Steps**:
  1. 执行 `npm run content:new`
  2. 输入主题描述
  3. 等待 AI 生成结果
  4. 检查是否显示预览信息（标题、路径、文件名）
  5. 确认创建（输入 Y）
- **Expected Result**:
  - 显示生成的标题
  - 显示将创建的目录路径
  - 显示文件名
  - 提示确认："确认创建？ (Y/n)"

### TC-10: 取消 content:new 创建流程
- **Target**: article-create-cli - Requirement: Preview before creation
- **Type**: Manual
- **Preconditions**: AI 服务配置正确
- **Steps**:
  1. 执行 `npm run content:new`
  2. 输入主题描述
  3. 等待 AI 生成结果
  4. 在确认提示时输入 "n"
- **Expected Result**:
  - 不创建任何文件
  - 显示取消消息
  - 脚本正常退出

### TC-11: 验证 content:new 无 AI 服务的降级处理
- **Target**: article-create-cli - Requirement: Graceful degradation without AI
- **Type**: Manual / Edge Case
- **Preconditions**: AI 服务不可用或超时
- **Steps**:
  1. 临时禁用 AI 服务或设置错误的服务地址
  2. 执行 `npm run content:new`
  3. 输入主题描述
  4. 等待超时（10秒）
  5. 观察系统响应
- **Expected Result**:
  - 显示超时或错误消息
  - 提示用户手动输入标题
  - 提示用户手动输入 slug
  - 继续创建流程

### TC-12: 执行 content:publish 命令发布文章
- **Target**: article-publish-cli - Requirement: Detect article changes
- **Type**: Manual
- **Preconditions**:
  - 有未提交的文章变更
  - Git 仓库状态正常
  - AI 服务配置正确
- **Steps**:
  1. 修改或创建一篇文章
  2. 执行 `npm run content:publish`
  3. 观察是否检测到变更
  4. 检查显示的文章信息（标题、路径、状态）
- **Expected Result**:
  - 运行 `git status` 检测变更
  - 显示变更文件列表
  - 标记为 "[新增]" 或 "[修改]"
  - 显示文章标题和文件路径

### TC-13: 验证 content:publish 无变更时的行为
- **Target**: article-publish-cli - Requirement: Detect article changes
- **Type**: Manual
- **Preconditions**: 没有文章变更
- **Steps**:
  1. 确保没有未提交的文章文件变更
  2. 执行 `npm run content:publish`
  3. 观察输出
- **Expected Result**:
  - 显示"没有待发布的文章"
  - 脚本正常退出，无进一步操作

### TC-14: 验证 content:publish 的 AI 元数据生成
- **Target**: article-publish-cli - Requirement: AI generates article metadata
- **Type**: Manual
- **Preconditions**:
  - 有文章变更
  - AI 服务配置正确
- **Steps**:
  1. 执行 `npm run content:publish`
  2. 等待 AI 分析文章内容
  3. 检查生成的描述（100-150 字符）
  4. 检查推荐的标签
  5. 检查生成的 commit message
- **Expected Result**:
  - 显示"正在分析文章内容..."
  - 生成符合长度要求的描述
  - 生成相关标签
  - 生成符合 Conventional Commits 格式的 commit message

### TC-15: 验证 content:publish 的标签推荐（优先现有词汇）
- **Target**: article-publish-cli - Requirement: Tags recommendation with existing vocabulary
- **Type**: Manual
- **Preconditions**:
  - 仓库中已有文章和标签
  - 有新的文章变更
- **Steps**:
  1. 执行 `npm run content:publish`
  2. 观察 AI 推荐的标签
  3. 检查是否优先使用现有标签
  4. 检查新标签是否符合命名规范
- **Expected Result**:
  - 系统扫描现有文章构建标签词汇表
  - AI 优先推荐现有标签
  - 新标签与现有标签命名风格一致

### TC-16: 验证 content:publish 的确认流程
- **Target**: article-publish-cli - Requirement: Preview before publishing
- **Type**: Manual
- **Preconditions**: 有文章变更，AI 已生成元数据
- **Steps**:
  1. 执行 `npm run content:publish`
  2. 等待 AI 生成元数据
  3. 检查是否显示生成的描述、标签、commit message
  4. 检查提示："确认以上信息？ (Y/n/e)"
  5. 测试输入 "Y"、"n"、"e" 三种选项
- **Expected Result**:
  - 显示所有生成的元数据
  - 输入 "Y" 继续流程
  - 输入 "n" 取消操作
  - 输入 "e" 进入编辑模式

### TC-17: 验证 content:publish 的最终确认和提交
- **Target**: article-publish-cli - Requirement: Final confirmation before git operations
- **Type**: Manual
- **Preconditions**:
  - 用户已在元数据确认步骤输入 "Y"
  - frontmatter 已更新
- **Steps**:
  1. 执行 `npm run content:publish` 并确认元数据
  2. 检查是否显示"即将提交的变更："
  3. 检查是否显示 commit message
  4. 检查是否显示变更文件列表
  5. 确认最终提交（输入 "Y"）
- **Expected Result**:
  - 显示完整的变更摘要
  - 显示文章数量和总变更数
  - 提示"确认提交并推送？ (Y/n)"
  - 输入 "Y" 后执行 git add, commit, push

### TC-18: 验证 content:publish 取消最终提交
- **Target**: article-publish-cli - Requirement: Final confirmation before git operations
- **Type**: Manual
- **Preconditions**: frontmatter 已更新但未提交
- **Steps**:
  1. 执行 `npm run content:publish` 并确认元数据
  2. 在最终确认时输入 "n"
  3. 检查文件状态
- **Expected Result**:
  - 不执行 git 操作
  - frontmatter 更改保留在文件中（未提交）
  - 显示"已取消发布，文件变更已保留"

### TC-19: 验证 content:publish 无 AI 服务的降级处理
- **Target**: article-publish-cli - Requirement: Graceful degradation without AI
- **Type**: Manual / Edge Case
- **Preconditions**: AI 服务不可用
- **Steps**:
  1. 临时禁用 AI 服务
  2. 执行 `npm run content:publish`
  3. 观察系统响应
- **Expected Result**:
  - 检测到 AI 服务不可用
  - 提示用户手动输入描述
  - 提示用户手动输入标签
  - 提示用户手动输入 commit message
  - 继续发布流程

### TC-20: 验证命令一致性（content:new 使用相同脚本）
- **Target**: unified-cli-interface - Requirement: No functional changes
- **Type**: Manual
- **Preconditions**: package.json 已更新
- **Steps**:
  1. 查看 package.json
  2. 确认 `content:new` 指向 `tsx scripts/new.ts`
  3. 执行 `npm run content:new`
  4. 验证行为与原 `npm run new` 一致
- **Expected Result**:
  - `content:new` 执行相同的脚本文件
  - 所有参数和选项正常工作
  - 输出和行为未改变

### TC-21: 验证命令一致性（content:publish 使用相同脚本）
- **Target**: unified-cli-interface - Requirement: No functional changes
- **Type**: Manual
- **Preconditions**: package.json 已更新
- **Steps**:
  1. 查看 package.json
  2. 确认 `content:publish` 指向 `tsx scripts/publish.ts`
  3. 执行 `npm run content:publish`
  4. 验证行为与原 `npm run publish` 一致
- **Expected Result**:
  - `content:publish` 执行相同的脚本文件
  - 所有参数和选项正常工作
  - 输出和行为未改变

### TC-22: 验证命令命名格式一致性
- **Target**: unified-cli-interface - Requirement: Consistent command naming format
- **Type**: Manual
- **Preconditions**: package.json 已更新
- **Steps**:
  1. 列出所有 package.json scripts 中的命令
  2. 检查每个分类命令的命名格式
  3. 验证是否符合 `<category>:<action>` 或 `<category>:<subsystem>:<action>` 格式
- **Expected Result**:
  - `content:new` 符合格式
  - `content:publish` 符合格式
  - `deploy:cron:install` 符合格式（带子系统）
  - dev 类别命令不需要冒号格式

### TC-23: 验证 README 文档更新
- **Target**: cli-category-system - Requirement: Category documentation
- **Type**: Manual
- **Preconditions**: README.md 已更新
- **Steps**:
  1. 打开 README.md
  2. 查找"命令使用"或"Commands"部分
  3. 检查命令是否按类别组织
  4. 检查每个类别是否有简短描述
- **Expected Result**:
  - 命令按类别（dev, content, deploy）组织
  - 每个类别有描述说明其用途
  - 列出每个命令及其说明
  - 包含 `npm run help` 的说明

### TC-24: 验证 help 命令维护性
- **Target**: cli-help-system - Requirement: Help command maintenance
- **Type**: Manual
- **Preconditions**: scripts/help.ts 已创建
- **Steps**:
  1. 打开 scripts/help.ts
  2. 检查命令定义结构
  3. 验证每个命令包含必要字段（name, description, usageScenario, expectedResult）
  4. 尝试添加一个测试命令定义
  5. 执行 `npm run help` 验证新命令是否出现
- **Expected Result**:
  - 命令定义使用结构化对象
  - TypeScript 提供类型检查
  - 添加新命令后自动出现在 help 输出中
  - 易于阅读和修改

### TC-25: 验证 help 命令的分类描述
- **Target**: cli-help-system - Requirement: Structured output format for AI understanding
- **Type**: Manual
- **Preconditions**: help 命令已实现
- **Steps**:
  1. 执行 `npm run help`
  2. 检查每个类别的描述
  3. 验证 dev 类别描述："开发相关命令，用于本地开发和构建"
  4. 验证 content 类别描述："内容创作命令，用于创建和发布博客文章"
  5. 验证 deploy 类别描述："部署相关命令，用于服务器部署和维护"
- **Expected Result**:
  - 每个类别显示清晰的描述
  - 描述准确反映类别用途
  - AI 能根据描述判断应查看哪个类别
