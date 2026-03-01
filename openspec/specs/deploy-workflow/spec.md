# Deploy Workflow

## Requirements

### Requirement: 检测部署条件

系统 SHALL 通过 workflow 执行检测部署前置条件，由 REPL AI 识别或命令行触发。

#### Scenario: REPL 模式 - AI 识别部署意图
- **WHEN** 用户在 REPL 中输入 "部署到服务器" 或 "发布到线上"
- **THEN** AI 识别 intent 为 `deploy`
- **THEN** workflow 引擎触发 `deploy` workflow

#### Scenario: 命令行模式
- **WHEN** 用户执行 `rosydawn deploy`
- **THEN** 系统直接触发 `deploy` workflow
- **THEN** 不需要调用 AI

#### Scenario: 无变更 - REPL 响应
- **WHEN** REPL 模式下未检测到 Git 变更
- **THEN** 系统返回自然语言响应 "当前没有需要部署的变更"

### Requirement: 基于 Workflow 的执行

系统 SHALL 通过 workflow 引擎执行部署操作。

#### Scenario: Workflow 注册
- **WHEN** 系统初始化
- **THEN** `deploy` workflow 被注册到 workflow 注册表
- **THEN** workflow 映射到 intent `deploy`

#### Scenario: Workflow 步骤执行
- **WHEN** deploy workflow 被触发
- **THEN** 系统执行步骤：checkGitChanges → buildProject → confirmDeploy → executeDeploy → notifyComplete
- **THEN** validator step（checkGitChanges）可在无变更时中断流程

#### Scenario: Step 复用
- **WHEN** deploy workflow 运行
- **THEN** 它从 step 注册表复用 `checkGitChanges` validator
- **THEN** 同一 validator 可被 publish-article workflow 使用

### Requirement: 部署确认

系统 SHALL 在执行部署前显示摘要并要求确认。

#### Scenario: REPL 模式确认
- **WHEN** 构建完成准备部署（REPL 模式）
- **THEN** 系统提示 "即将部署到服务器，确认继续？"
- **THEN** 用户可通过 REPL 输入确认或取消

#### Scenario: 命令行模式确认
- **WHEN** 构建完成准备部署（命令行模式）
- **THEN** 系统使用 @inquirer/prompts 进行确认
- **THEN** 行为与现有部署流程一致

### Requirement: 显示部署结果

系统 SHALL 在完成后显示部署状态和访问 URL。

#### Scenario: REPL 模式响应
- **WHEN** 部署成功（REPL 模式）
- **THEN** 系统显示自然语言响应 "部署完成！网站已上线"
- **THEN** 响应包含网站访问 URL

#### Scenario: 部署失败
- **WHEN** 部署过程中发生错误
- **THEN** 系统显示错误信息和可能的解决方案
- **THEN** 系统不崩溃，用户可重试
