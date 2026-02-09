## Why

博客文章写作涉及大量重复性工作：创建目录结构、填写 frontmatter、生成 description 和 tags、编写 commit message 等。这些琐事增加了写作的心智负担，降低了创作效率。通过 CLI 工具和 AI 辅助，可以让作者专注于内容本身，形成从创建到发布的完整闭环。

## What Changes

- 新增 `npm run new` 命令：通过交互式问答创建新文章，AI 自动生成标题和 slug，自动创建目录结构并启动开发服务器
- 新增 `npm run publish` 命令：检测文章变更，AI 生成 description、推荐 tags、生成 commit message，自动完成 git 提交和推送
- 新增 AI 服务集成：支持 OpenAI 协议兼容的模型服务（包括 Azure OpenAI、本地 Ollama 等）
- 新增配置支持：环境变量和 `rosydawn.config.js` 配置文件
- 优雅降级：AI 服务不可用时，核心功能仍可手动完成

## Capabilities

### New Capabilities

- `article-create-cli`: 交互式创建文章命令，包含主题输入、AI 元信息生成、目录创建、开发服务器启动
- `article-publish-cli`: 发布文章命令，包含变更检测、AI 内容分析、frontmatter 更新、git 操作
- `ai-service-integration`: OpenAI 协议兼容的 AI 服务调用，支持配置和优雅降级

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **新增文件**：
  - `scripts/new.ts` - 创建文章命令入口
  - `scripts/publish.ts` - 发布文章命令入口
  - `scripts/lib/ai.ts` - AI 服务封装
  - `scripts/lib/prompts.ts` - AI 提示词模板
  - `scripts/lib/git.ts` - Git 操作封装
  - `scripts/lib/config.ts` - 配置加载
- **修改文件**：
  - `package.json` - 添加 `new` 和 `publish` scripts
- **新增依赖**：
  - 交互式 CLI 库（如 `@inquirer/prompts`）
  - OpenAI SDK（`openai`）
- **环境变量**：
  - `OPENAI_API_KEY`（必填）
  - `OPENAI_BASE_URL`（可选）
  - `OPENAI_MODEL`（可选）
