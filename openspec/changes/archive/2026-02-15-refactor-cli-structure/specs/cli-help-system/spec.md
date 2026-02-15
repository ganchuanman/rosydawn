## ADDED Requirements

### Requirement: Display all available commands
The system SHALL provide a `npm run help` command that displays all available npm scripts organized by category.

#### Scenario: User runs help command
- **WHEN** user runs `npm run help`
- **THEN** system displays a formatted list of all commands
- **THEN** commands are grouped by category (dev, content, deploy)
- **THEN** each command shows its full npm run syntax

#### Scenario: Command categories displayed
- **WHEN** help command output is displayed
- **THEN** system shows category headers (e.g., "开发命令", "内容创作命令", "部署命令")
- **THEN** commands are listed under their respective categories
- **THEN** category order is: dev, content, deploy

### Requirement: Detailed command descriptions
The system SHALL display comprehensive descriptions for each command, including usage scenarios and prerequisites.

#### Scenario: Development command detailed descriptions
- **WHEN** user views help output
- **THEN** `dev` command shows:
  - Description: "启动本地开发服务器，支持热重载"
  - Usage scenario: "当需要实时预览博客文章或调试代码时使用"
  - Result: "在 http://localhost:4321 启动开发服务器"
- **THEN** `build` command shows:
  - Description: "构建生产环境的静态文件"
  - Usage scenario: "部署前或需要检查构建产物时使用"
  - Result: "在 dist/ 目录生成优化后的静态文件"
- **THEN** `preview` command shows:
  - Description: "预览构建后的生产环境效果"
  - Usage scenario: "构建完成后，部署前验证效果"
  - Prerequisite: "需要先运行 npm run build"

#### Scenario: Content command detailed descriptions
- **WHEN** user views help output
- **THEN** `content:new` command shows:
  - Description: "交互式创建新博客文章"
  - Usage scenario: "当需要撰写新的博客文章时使用"
  - Workflow: "提示输入主题 → AI 生成标题和 slug → 确认后创建文件 → 自动启动开发服务器"
  - Result: "在 src/content/posts/{year}/{month}/{slug}/index.md 创建文章文件"
- **THEN** `content:publish` command shows:
  - Description: "发布已完成的博客文章到 Git 仓库"
  - Usage scenario: "文章撰写完成，准备发布时使用"
  - Workflow: "检测变更文件 → AI 生成描述和标签 → 确认后更新 frontmatter → 提交并推送到远程仓库"
  - Prerequisite: "需要有未提交的文章变更"

#### Scenario: Deploy command detailed descriptions
- **WHEN** user views help output
- **THEN** each deploy command shows detailed description with:
  - Command purpose and what it does
  - When to use this command
  - Expected outcome or result
  - Any prerequisites or dependencies
- **THEN** descriptions enable AI to understand which command to execute for deployment tasks

### Requirement: Structured output format for AI understanding
The system SHALL format help output with clear structure and enough detail for AI assistants to understand and select appropriate commands.

#### Scenario: Clear visual structure
- **WHEN** help command is executed
- **THEN** output uses clear separators between categories
- **THEN** command names are clearly distinguishable from descriptions
- **THEN** output fits standard terminal width (80-120 characters)

#### Scenario: Consistent information structure per command
- **WHEN** displaying a command
- **THEN** output follows structured format:
  - Command name (e.g., `npm run content:new`)
  - Brief one-line description
  - Detailed explanation of what the command does
  - When to use (usage scenarios)
  - Expected outcome or result
  - Prerequisites if any
- **THEN** each section is clearly labeled

#### Scenario: Alphabetical ordering within categories
- **WHEN** multiple commands exist in a category
- **THEN** commands are listed in alphabetical order
- **THEN** users can quickly scan for specific commands

#### Scenario: Category-level descriptions
- **WHEN** displaying a category
- **THEN** each category has a brief introduction explaining its purpose
- **THEN** AI can understand which category to look at based on user intent
- **THEN** examples:
  - Dev: "开发相关命令，用于本地开发和构建"
  - Content: "内容创作命令，用于创建和发布博客文章"
  - Deploy: "部署相关命令，用于服务器部署和维护"

### Requirement: Help command implementation
The system SHALL implement help as a standalone TypeScript script.

#### Scenario: Script location
- **WHEN** help command is executed via `npm run help`
- **THEN** system runs `tsx scripts/help.ts`
- **THEN** script reads command definitions from internal data structure
- **THEN** script outputs formatted help text to console

#### Scenario: No external dependencies for basic help
- **WHEN** implementing help command
- **THEN** system uses only Node.js built-in modules
- **THEN** no additional npm packages are required for basic functionality
- **THEN** optional: can use chalk for colored output if desired

### Requirement: AI-friendly command information
The system SHALL provide enough context in help output for AI assistants to autonomously select and execute appropriate commands.

#### Scenario: Intent-based command discovery
- **WHEN** AI reads help output to fulfill user request like "创建一篇新文章"
- **THEN** AI can identify that `content:new` is the correct command
- **THEN** AI understands the interactive workflow (提示输入主题 → AI生成 → 确认)
- **THEN** AI knows the expected result (创建文章文件并启动开发服务器)

#### Scenario: Context-aware command selection
- **WHEN** AI needs to perform deployment-related task
- **THEN** AI can read deploy category description to find relevant commands
- **THEN** AI understands when to use `deploy:build` vs `deploy:status`
- **THEN** AI can explain to user what will happen when command is executed

#### Scenario: Prerequisite understanding
- **WHEN** AI considers running `preview` command
- **THEN** help output clearly states prerequisite "需要先运行 npm run build"
- **THEN** AI can execute prerequisites first if needed
- **THEN** AI can inform user about dependencies between commands

### Requirement: Help command maintenance
The system SHALL make it easy to update command list when new commands are added.

#### Scenario: Centralized command registry
- **WHEN** developer adds a new command
- **THEN** command definition is added to help.ts data structure
- **THEN** help output automatically includes the new command
- **THEN** no separate documentation update needed

#### Scenario: Command definition structure
- **WHEN** defining commands in help.ts
- **THEN** each command has structured fields:
  - category: string
  - name: string
  - description: string
  - usageScenario: string
  - expectedResult: string
  - prerequisites?: string
- **THEN** structure is easy to read and modify
- **THEN** TypeScript provides type safety for command definitions
