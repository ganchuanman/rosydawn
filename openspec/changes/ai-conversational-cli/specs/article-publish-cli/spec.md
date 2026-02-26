## MODIFIED Requirements

### Requirement: 检测文章变更

系统 SHALL 通过 workflow 执行检测文章变更，由 REPL AI 识别或命令行触发。

#### Scenario: REPL 模式 - AI 识别发布意图
- **WHEN** 用户在 REPL 中输入 "发布"
- **THEN** AI 识别 intent 为 `publish_article`
- **THEN** workflow 引擎触发 `publish-article` workflow

#### Scenario: 命令行模式
- **WHEN** 用户执行 `rosydawn content publish`
- **THEN** 系统直接触发 `publish-article` workflow
- **THEN** 不需要调用 AI

#### Scenario: 无变更 - REPL 响应
- **WHEN** REPL 模式下未检测到文章变更
- **THEN** 系统返回自然语言响应 "没有找到未发布的文章变更，你是要部署吗？"

### Requirement: 基于 Workflow 的执行

系统 SHALL 通过 workflow 引擎执行文章发布。

#### Scenario: Workflow 步骤执行
- **WHEN** publish-article workflow 被触发
- **THEN** 系统执行步骤：getChangedArticles → collectExistingTags → generateMetadata → editConfirm → updateFrontmatter → confirmAndPush
- **THEN** validator step（getChangedArticles）可在无变更时中断流程

#### Scenario: Step 复用
- **WHEN** publish-article workflow 运行
- **THEN** 它从 step 注册表复用 `getChangedArticles` validator
- **THEN** 同一 validator 可被 deploy workflow 使用

### Requirement: Git 操作前的最终确认

系统 SHALL 在执行 git 操作前显示摘要并要求确认。

#### Scenario: REPL 模式确认
- **WHEN** frontmatter 更新准备就绪（REPL 模式）
- **THEN** 系统提示 "确认提交并推送？"
- **THEN** 用户可通过 REPL 输入确认或取消

#### Scenario: 命令行模式确认
- **WHEN** frontmatter 更新准备就绪（命令行模式）
- **THEN** 系统使用 @inquirer/prompts 进行确认
- **THEN** 行为与现有发布流程一致
