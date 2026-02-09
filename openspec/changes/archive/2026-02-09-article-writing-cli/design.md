## Context

Rosydawn 是一个基于 Astro 的静态博客框架。当前文章存放在 `src/content/posts/{year}/{month}/{slug}/index.mdx` 目录结构中，使用 Astro Content Collections 管理。

现有技术栈：
- Astro 5.17.x（ESM、TypeScript）
- 已有 `scripts/` 目录存放部署脚本（`.mjs` 格式）
- 无现有 AI 集成或交互式 CLI 依赖

需要新增两个 CLI 命令来自动化文章写作流程，同时保持与现有项目结构的一致性。

## Goals / Non-Goals

**Goals:**
- 提供 `npm run new` 命令，通过交互式问答创建文章
- 提供 `npm run publish` 命令，自动生成元信息并发布
- 集成 OpenAI 协议兼容的 AI 服务
- AI 服务不可用时优雅降级为手动输入
- 保持与现有 scripts 目录结构一致

**Non-Goals:**
- 不实现文章编辑器或富文本功能
- 不实现图片上传或资源管理
- 不实现多语言支持
- 不实现定时发布或草稿管理
- 不修改现有的 Astro 配置或构建流程

## Decisions

### 1. 脚本格式：TypeScript + tsx

**选择**：使用 TypeScript 编写脚本，通过 `tsx` 运行

**理由**：
- 项目已配置 TypeScript（`tsconfig.json` 存在）
- TypeScript 提供类型安全，减少运行时错误
- `tsx` 是零配置的 TS 执行器，无需编译步骤
- 现有脚本为 `.mjs`，但新脚本复杂度更高，TypeScript 更合适

**替代方案**：
- 纯 JavaScript (.mjs)：简单但缺乏类型安全
- 编译后运行：增加构建步骤，开发体验差

### 2. 交互式 CLI 库：@inquirer/prompts

**选择**：使用 `@inquirer/prompts`

**理由**：
- 现代 ESM 原生支持
- 单独导入各类 prompt，tree-shaking 友好
- TypeScript 类型支持良好
- 活跃维护，社区成熟

**替代方案**：
- inquirer (v9+)：功能全面但包体积较大
- prompts：轻量但功能较少，类型支持一般

### 3. AI 服务封装：OpenAI SDK

**选择**：使用官方 `openai` SDK

**理由**：
- 官方维护，API 兼容性保证
- 支持自定义 baseURL，兼容 Azure OpenAI、Ollama 等
- 内置重试、超时处理
- TypeScript 原生支持

**替代方案**：
- 直接 fetch：需要自行处理流式响应、重试、错误处理
- ai-sdk：功能更多但对于简单场景过于复杂

### 4. 配置管理：环境变量优先

**选择**：优先读取环境变量，可选支持 `rosydawn.config.js`

**理由**：
- 环境变量是敏感信息（API Key）的标准管理方式
- `.env` 文件已在 `.gitignore` 中
- 配置文件作为可选扩展，不强制要求

**配置优先级**：
1. 环境变量 (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`)
2. `rosydawn.config.js` 中的 `ai` 配置
3. 默认值（model: `gpt-4o-mini`）

### 5. 文件格式：.md 而非 .mdx

**选择**：新建文章默认使用 `.md` 格式

**理由**：
- 大多数文章不需要 MDX 的组件功能
- `.md` 兼容性更好，编辑器支持更广
- 用户可手动改为 `.mdx` 如需组件

**注意**：现有示例文章使用 `.mdx`，但这是因为包含特殊组件。普通文章使用 `.md` 更简洁。

### 6. 开发服务器启动策略

**选择**：检测端口占用，复用或新启动

**实现**：
1. 检查 4321 端口是否被占用
2. 如已占用，假设 dev server 已运行，直接输出预览链接
3. 如未占用，执行 `npm run dev` 并等待启动完成

**理由**：避免重复启动，保持幂等性

### 7. Git 操作封装

**选择**：使用 Node.js 原生 `child_process` 执行 git 命令

**理由**：
- git 命令简单，无需引入额外库
- 避免 simple-git 等库的额外依赖
- 更透明，便于调试

**替代方案**：
- simple-git：抽象层增加复杂度
- isomorphic-git：纯 JS 实现，但对于简单场景过重

### 8. Tags 推荐策略

**选择**：读取现有文章构建标签词库，AI 优先从中选择

**实现**：
1. 扫描 `src/content/posts/` 下所有文章的 frontmatter
2. 提取所有 tags 构建词库
3. 将词库作为上下文传递给 AI
4. AI 返回时优先使用已有标签

**理由**：保持标签体系一致性，避免同义标签泛滥

## Risks / Trade-offs

**[风险] AI 服务延迟或不可用**
→ 实现超时机制（10 秒），超时后降级为手动输入。用户可重试或直接手动填写。

**[风险] AI 生成内容质量不稳定**
→ 始终展示预览并要求用户确认。提供编辑选项（e）允许用户修改。

**[风险] Git push 失败（网络问题或冲突）**
→ 保留本地 commit，提示错误信息，用户可手动解决后重试。

**[权衡] TypeScript 增加依赖（tsx）**
→ 接受这个权衡，类型安全的收益大于额外依赖的成本。tsx 是轻量级工具。

**[权衡] 不支持 dry-run 模式**
→ 通过确认步骤（Y/n）实现类似效果，首版不实现完整的 dry-run。

## Migration Plan

无需迁移。这是新功能，不影响现有文章或工作流程。

**部署步骤**：
1. 安装新依赖：`npm install @inquirer/prompts openai tsx`
2. 添加环境变量：`OPENAI_API_KEY`
3. 新命令即可使用

**回滚**：移除 scripts 中的新文件和 package.json 中的新 scripts 即可。
