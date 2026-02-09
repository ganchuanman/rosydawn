## 1. 项目配置

- [x] 1.1 安装依赖：`@inquirer/prompts`、`openai`、`tsx`
- [x] 1.2 更新 package.json 添加 `new` 和 `publish` scripts
- [x] 1.3 更新 .env.example 添加 OPENAI_API_KEY、OPENAI_BASE_URL、OPENAI_MODEL 示例

## 2. 基础模块

- [x] 2.1 创建 scripts/lib/config.ts - 配置加载模块（环境变量 + rosydawn.config.js）
- [x] 2.2 创建 scripts/lib/ai.ts - OpenAI SDK 封装（含超时、错误处理、降级逻辑）
- [x] 2.3 创建 scripts/lib/prompts.ts - AI 提示词模板（创建文章、发布文章）
- [x] 2.4 创建 scripts/lib/git.ts - Git 操作封装（status、add、commit、push）
- [x] 2.5 创建 scripts/lib/frontmatter.ts - Frontmatter 解析和更新工具

## 3. npm run new 命令

- [x] 3.1 创建 scripts/new.ts 入口文件
- [x] 3.2 实现交互式主题输入提示
- [x] 3.3 实现 AI 调用生成 title 和 slug
- [x] 3.4 实现元信息预览和确认流程（Y/n）
- [x] 3.5 实现目录结构创建（src/content/posts/{year}/{month}/{slug}/）
- [x] 3.6 实现 index.md 骨架生成（frontmatter + placeholder）
- [x] 3.7 实现 slug 冲突检测和处理
- [x] 3.8 实现端口检测（4321）判断 dev server 状态
- [x] 3.9 实现 dev server 启动逻辑
- [x] 3.10 实现完成摘要输出（文件路径、预览 URL）
- [x] 3.11 实现 AI 降级为手动输入 title 和 slug

## 4. npm run publish 命令

- [x] 4.1 创建 scripts/publish.ts 入口文件
- [x] 4.2 实现 git status 变更检测（src/content/posts/ 下）
- [x] 4.3 实现变更文章列表展示（新增/修改）
- [x] 4.4 实现现有文章 tags 词库构建
- [x] 4.5 实现 AI 调用生成 description、tags、commit message
- [x] 4.6 实现元信息预览和确认流程（Y/n/e）
- [x] 4.7 实现编辑模式（e 选项）允许用户修改
- [x] 4.8 实现 frontmatter 更新（写入 description 和 tags）
- [x] 4.9 实现最终确认展示（commit message、变更文件列表、diff 摘要）
- [x] 4.10 实现最终确认提示（Y/n），用户同意后才执行 git 操作
- [x] 4.11 实现 git add、commit、push 流程
- [x] 4.12 实现 push 失败错误处理（保留本地 commit）
- [x] 4.13 实现批量文章处理（多篇文章单次 commit）
- [x] 4.14 实现 AI 降级为手动输入 description、tags、commit message
- [x] 4.15 实现无变更时的提示信息
- [x] 4.16 实现用户取消最终确认时保留文件变更但不提交

## 5. 测试验证

> **测试环境**：使用 DeepSeek 作为 AI 服务进行测试
> **前置条件**：开始 AI 相关测试前，需向用户询问 DeepSeek 的 API Key 和 Base URL

- [x] 5.1 向用户获取 DeepSeek API Key 和 Base URL，配置到 .env
- [x] 5.2 测试 npm run new 完整流程（AI 可用）
- [x] 5.3 测试 npm run new 降级流程（AI 不可用）
- [x] 5.4 测试 npm run publish 完整流程（AI 可用）
- [x] 5.5 测试 npm run publish 降级流程（AI 不可用）
- [x] 5.6 测试 slug 冲突场景
- [x] 5.7 测试 dev server 已运行场景
- [x] 5.8 测试 git push 失败场景
- [x] 5.9 测试用户取消最终确认场景（文件变更保留但不提交）
