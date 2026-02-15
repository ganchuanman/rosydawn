## Why

当前项目的命令行工具分散在多个独立的脚本中（`new.ts`、`publish.ts`、`deploy.mjs`），缺乏统一的组织结构和命名规范。随着项目功能的增加，这种分散的结构导致命令难以发现、记忆和维护。现在需要建立一个清晰的命令分类体系，提升开发体验和工具的可维护性。

## What Changes

- **建立三大命令分类体系**：将所有命令按照用途分为开发（Development）、内容创作（Content）、部署（Deployment）三大类别
- **统一命令命名规范**：所有命令采用 `<category>:<action>` 的命名格式，提供一致的使用体验
- **重构现有命令结构**：
  - 将 `new` 命令替换为 `content:new`
  - 将 `publish` 命令替换为 `content:publish`
  - 将 `deploy:*` 系列命令统一整合到 `deploy` 类别下
- **添加 help 命令**：提供 `npm run help` 命令，显示所有可用命令及其说明
- **BREAKING**: 完全替换现有命令名称，不保留旧命令

## Capabilities

### New Capabilities
- `cli-category-system`: CLI 命令分类体系，定义三大类别（开发、内容、部署）及其包含的命令
- `unified-cli-interface`: 统一的命令行接口，包括命名规范、参数格式、帮助信息等
- `cli-help-system`: CLI 帮助系统，提供命令列表和详细说明

### Modified Capabilities
- `article-create-cli`: 现有的文章创建命令，需要从 `npm run new` 迁移到 `npm run content:new`
- `article-publish-cli`: 现有的文章发布命令，需要从 `npm run publish` 迁移到 `npm run content:publish`

## Impact

- **代码结构影响**：
  - 需要创建 help 命令脚本（`scripts/help.ts`）
  - 重构 `scripts/` 目录结构，按类别组织命令
  - 可能引入命令行框架（如 `commander.js`）以提供更好的命令管理

- **API 影响**：
  - package.json 中的 scripts 字段需要全面更新
  - 旧命令（`new`、`publish`）将被完全移除
  - 新增 `help` 命令

- **依赖影响**：
  - 可能需要新增 npm 依赖（命令行框架库，用于 help 命令）

- **文档影响**：
  - 需要更新 README 中的命令使用说明
  - 需要更新开发文档中的相关工作流描述
