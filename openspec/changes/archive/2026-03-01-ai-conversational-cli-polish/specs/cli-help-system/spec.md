## ADDED Requirements

### Requirement: 知识库文件组织结构

系统 SHALL 在 `src/knowledge/` 目录中维护结构化的知识库文件。

#### Scenario: 静态知识文件
- **WHEN** 系统初始化知识库
- **THEN** 存在 `src/knowledge/static.md` 文件
- **THEN** 文件包含部署说明、环境配置、常见问题

#### Scenario: Workflow 知识文件
- **WHEN** 新 workflow 被实现
- **THEN** 对应的知识文件存在于 `src/knowledge/workflows/`
- **THEN** 文件描述 workflow 的用途、参数和使用示例

### Requirement: AI 帮助响应格式

系统 SHALL 使用结构化格式返回 AI 帮助响应。

#### Scenario: 帮助响应包含代码示例
- **WHEN** 用户询问 "怎么创建文章？"
- **THEN** AI 返回包含命令示例的响应
- **THEN** 响应格式包含：描述、命令示例、参数说明

#### Scenario: 帮助响应包含相关链接
- **WHEN** 用户查询特定主题
- **THEN** AI 响应包含相关文档链接（如适用）
- **THEN** 链接指向项目内的其他知识文件

### Requirement: 命令行帮助文本生成

系统 SHALL 从 CommandRegistry 自动生成命令行帮助文本。

#### Scenario: 全局帮助生成
- **WHEN** 用户执行 `rosydawn --help`
- **THEN** 系统从 CommandRegistry 获取所有已注册命令
- **THEN** 系统生成格式化的帮助文本，包含 Usage、Commands、Options

#### Scenario: 命令帮助生成
- **WHEN** 用户执行 `rosydawn <command> --help`
- **THEN** 系统从 CommandRegistry 获取该命令的配置
- **THEN** 系统生成包含 Usage、Arguments、Options、Examples 的帮助文本
