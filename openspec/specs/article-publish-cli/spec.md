# Article Publish CLI

## Requirements

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

#### Scenario: 无变更 - 命令行模式
- **WHEN** 命令行模式下未检测到文章变更
- **THEN** 系统显示 "没有待发布的文章"
- **THEN** 系统退出

### Requirement: 基于 Workflow 的执行

系统 SHALL 通过 workflow 引擎执行文章发布。

#### Scenario: Workflow 步骤执行
- **WHEN** publish-article workflow 被触发
- **THEN** 系统执行步骤：getChangedArticles → collectExistingTags → generateMetadata → editConfirm → updateFrontmatter → commitAndPush
- **THEN** validator step（getChangedArticles）可在无变更时中断流程

#### Scenario: Step 复用
- **WHEN** publish-article workflow 运行
- **THEN** 它从 step 注册表复用 `getChangedArticles` validator
- **THEN** 同一 validator 可被 deploy workflow 使用

### Requirement: AI generates article metadata

系统 SHALL 调用 AI 生成 description、tags 和 commit message。

#### Scenario: 成功生成元数据
- **WHEN** 检测到文章变更
- **THEN** 系统显示 "正在分析文章内容..."
- **THEN** 系统读取完整文章内容
- **THEN** 系统调用 AI 分析文章
- **THEN** AI 返回 description（100-150 字符）、tags 数组和 commit message

#### Scenario: Description 生成
- **WHEN** AI 分析文章内容
- **THEN** AI 生成 100-150 字符的描述，总结文章要点
- **THEN** 描述准确反映文章主要内容

### Requirement: Tags recommendation with existing vocabulary

系统 SHALL 基于现有标签词汇表推荐标签。

#### Scenario: 构建标签词汇表
- **WHEN** 分析文章标签时
- **THEN** 系统扫描 `src/content/posts/` 中所有现有文章
- **THEN** 系统从 frontmatter 提取所有标签构建词汇表

#### Scenario: 优先使用现有标签
- **WHEN** AI 推荐标签
- **THEN** AI 获得现有标签词汇表作为上下文
- **THEN** AI 优先从现有词汇表中选择标签
- **THEN** 新标签遵循与现有标签相同的命名规范

### Requirement: Generate commit message

系统 SHALL 按照 Conventional Commits 格式生成提交信息。

#### Scenario: 新文章提交
- **WHEN** 发布新文章
- **THEN** 提交信息格式为 `feat(blog): add article about <topic>`

#### Scenario: 修改文章提交
- **WHEN** 发布修改的文章
- **THEN** 提交信息格式为 `fix(blog): update <article-title>` 或类似格式

### Requirement: Preview before publishing

系统 SHALL 显示生成的元数据供用户确认。

#### Scenario: 显示预览
- **WHEN** AI 生成完成
- **THEN** 系统显示生成的 description
- **THEN** 系统显示推荐的 tags
- **THEN** 系统显示建议的 commit message
- **THEN** 系统提示 "确认以上信息？ (Y/n/e)"

#### Scenario: 用户确认
- **WHEN** 用户输入 "Y"
- **THEN** 系统继续发布流程

#### Scenario: 用户取消
- **WHEN** 用户输入 "n"
- **THEN** 系统退出，不进行任何更改

#### Scenario: 用户编辑
- **WHEN** 用户输入 "e"
- **THEN** 系统允许用户修改 description、tags 或 commit message
- **THEN** 系统重新显示以供确认

### Requirement: Update frontmatter

系统 SHALL 使用生成的元数据更新文章的 frontmatter。

#### Scenario: 写入 description
- **WHEN** 用户确认发布
- **THEN** 系统更新 frontmatter 中的 `description` 字段

#### Scenario: 写入 tags
- **WHEN** 用户确认发布
- **THEN** 系统更新 frontmatter 中的 `tags` 数组

### Requirement: Git 操作前的最终确认

系统 SHALL 在执行 git 操作前显示摘要并要求确认。

#### Scenario: REPL 模式确认
- **WHEN** frontmatter 更新准备就绪（REPL 模式）
- **THEN** 系统提示 "确认提交并推送？"
- **THEN** 用户可通过 REPL 输入确认或取消

#### Scenario: 命令行模式确认
- **WHEN** frontmatter 更新准备就绪（命令行模式）
- **THEN** 系统显示 "即将提交的变更："
- **THEN** 系统显示 commit message
- **THEN** 系统显示变更文件列表和 diff 摘要
- **THEN** 系统显示文章数量和总变更摘要
- **THEN** 系统使用 @inquirer/prompts 进行确认
- **THEN** 系统提示 "确认提交并推送？ (Y/n)"

#### Scenario: 用户确认最终发布
- **WHEN** 用户在最终确认时输入 "Y"
- **THEN** 系统执行 git add、commit 和 push

#### Scenario: 用户取消最终发布
- **WHEN** 用户在最终确认时输入 "n"
- **THEN** 系统退出，不执行 git 操作
- **THEN** frontmatter 更改保留在文件中（未提交）
- **THEN** 系统显示 "已取消发布，文件变更已保留"

### Requirement: Git commit and push

系统 SHALL 在用户确认后提交更改并推送到远程仓库。

#### Scenario: 成功发布
- **WHEN** 用户确认最终发布
- **THEN** 系统对变更文件执行 `git add`
- **THEN** 系统使用生成的 message 执行 `git commit`
- **THEN** 系统执行 `git push origin <current-branch>`
- **THEN** 系统显示成功消息

#### Scenario: 推送失败
- **WHEN** `git push` 失败（网络或冲突）
- **THEN** 系统显示错误消息
- **THEN** 系统保留本地提交
- **THEN** 系统建议手动解决

### Requirement: Batch processing

系统 SHALL 支持处理多个变更文章。

#### Scenario: 多篇文章变更
- **WHEN** 多篇文章有变更
- **THEN** 系统列出所有变更文章
- **THEN** 系统依次处理每篇文章
- **THEN** 系统为所有变更创建单个提交

### Requirement: Graceful degradation without AI

系统 SHALL 在 AI 服务不可用时允许手动输入。

#### Scenario: AI 服务不可用
- **WHEN** AI 服务无法访问
- **THEN** 系统提示用户手动输入 description
- **THEN** 系统提示用户手动输入 tags
- **THEN** 系统提示用户手动输入 commit message
