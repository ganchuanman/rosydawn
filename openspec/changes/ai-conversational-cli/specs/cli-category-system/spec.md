## MODIFIED Requirements

### Requirement: 意图分类取代命令分类

系统 SHALL 按意图分类组织能力，而非 npm script 分类。

#### Scenario: 意图分类结构
- **WHEN** AI 知识库生成
- **THEN** 意图按类别组织：content、deploy、system
- **THEN** 每个意图有类别标签用于组织

#### Scenario: 内容意图
- **WHEN** 用户请求创建或发布文章
- **THEN** 意图属于 "content" 类别
- **THEN** 类别包含：create_article、publish_article

#### Scenario: 部署意图
- **WHEN** 用户询问部署相关
- **THEN** 意图属于 "deploy" 类别
- **THEN** 类别包含：deploy、check_status、setup_ssl

#### Scenario: 系统意图
- **WHEN** 用户询问工具使用或帮助
- **THEN** 意图属于 "system" 类别
- **THEN** 类别包含：help、start_dev、build

### Requirement: 向后兼容的命令分类

系统 SHALL 为命令行模式用户保留命令分类。

#### Scenario: 命令行模式使用现有分类
- **WHEN** 用户在命令行模式执行 `rosydawn --help`
- **THEN** 系统按 dev/content/deploy 分类显示命令
- **THEN** 分类系统与现有 npm script 组织一致

#### Scenario: 帮助命令显示两种模式
- **WHEN** 用户查看帮助
- **THEN** 帮助解释 REPL 模式及意图示例
- **THEN** 帮助解释命令行模式及分类结构
