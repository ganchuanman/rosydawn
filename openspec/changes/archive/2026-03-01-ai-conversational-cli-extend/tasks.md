# Implementation Tasks

本任务列表按照依赖关系和实施顺序组织，遵循设计文档的渐进式迁移策略。

**预计时间线**:
- Week 1: 任务 1-3（核心 Workflows）
- Week 2: 任务 4-5（系统 Workflows）
- Week 3: 任务 6（测试和验证）

---

## 1. 基础设施准备

- [x] 1.1 创建新的 step 文件目录结构（如需要）
- [x] 1.2 在 `src/workflows/index.ts` 中添加新 workflows 的注册占位符
- [x] 1.3 验证现有 step 注册表功能正常（运行现有测试）

---

## 2. publish-article Workflow 实现

### 2.1 复用 Steps 验证

- [x] 2.1.1 验证 `getChangedArticles` step 可正常检测未发布文章
- [x] 2.1.2 验证 `collectExistingTags` step 可正常收集已有标签
- [x] 2.1.3 验证 `generateMetadata` step 可正常生成元数据
- [x] 2.1.4 验证 `editConfirm` step 可正常显示编辑界面
- [x] 2.1.5 验证 `updateFrontmatter` step 可正常更新 frontmatter
- [x] 2.1.6 验证 `commitAndPush` step 可正常执行 Git 操作

### 2.2 Workflow 定义

- [x] 2.2.1 创建 `src/workflows/publish-article.ts` 文件
- [x] 2.2.2 定义 workflow 结构（name, description, intent, params）
- [x] 2.2.3 组装 steps 数组（按顺序：validators → processors → notifiers → actions）
- [x] 2.2.4 添加 workflow 到注册表（修改 `src/workflows/index.ts`）

### 2.3 REPL 集成

- [x] 2.3.1 确保 AI intent 识别器能识别 "发布" 为 `publish_article` intent
- [x] 2.3.2 测试 REPL 模式下的 workflow 触发
- [x] 2.3.3 验证 REPL 自然语言响应格式

### 2.4 命令行集成

- [x] 2.4.1 在 CLI 入口添加 `content publish` 命令支持
- [x] 2.4.2 实现命令行模式下的直接 workflow 触发（跳过 AI）
- [x] 2.4.3 测试命令行模式下的完整流程

### 2.5 边界场景处理

- [x] 2.5.1 实现无变更时的友好提示（返回自然语言响应）
- [x] 2.5.2 实现多篇文章发布的交互选择（使用 `@inquirer/prompts` 多选）
- [x] 2.5.3 测试单篇和多篇文章发布场景

---

## 3. deploy Workflow 实现

### 3.1 新增 Steps - 构建相关

- [x] 3.1.1 创建 `src/steps/actions/build.ts` 文件
- [x] 3.1.2 实现 `buildProject` step（执行 `npm run build`）
- [x] 3.1.3 添加构建失败时的异常抛出逻辑
- [x] 3.1.4 注册 `buildProject` step 到 step 注册表

### 3.2 新增 Steps - 部署相关

- [x] 3.2.1 创建 `src/steps/actions/deploy.ts` 文件
- [x] 3.2.2 实现 `executeDeploy` step（SSH 到远程服务器）
- [x] 3.2.3 添加部署前服务器连接性检查
- [x] 3.2.4 实现远程文件复制逻辑（参考旧脚本 `scripts/deploy/`）
- [x] 3.2.5 添加部署失败时的错误处理和友好提示
- [x] 3.2.6 注册 `executeDeploy` step 到 step 注册表

### 3.3 新增 Steps - 确认相关

- [x] 3.3.1 创建 `src/steps/notifiers/deploy-confirm.ts` 文件
- [x] 3.3.2 实现 `confirmDeploy` notifier step
- [x] 3.3.3 添加 REPL 和命令行两种模式的确认逻辑
- [x] 3.3.4 注册 `confirmDeploy` step 到 step 注册表

### 3.4 Workflow 定义

- [x] 3.4.1 创建 `src/workflows/deploy.ts` 文件
- [x] 3.4.2 定义 workflow 结构（name, description, intent）
- [x] 3.4.3 组装 steps: `checkGitChanges` → `buildProject` → `confirmDeploy` → `executeDeploy`
- [x] 3.4.4 添加 workflow 到注册表

### 3.5 REPL 集成

- [x] 3.5.1 确保 AI intent 识别器能识别 "部署"、"发布到线上" 为 `deploy` intent
- [x] 3.5.2 测试 REPL 模式下的 workflow 触发
- [x] 3.5.3 验证部署成功和失败时的自然语言响应

### 3.6 命令行集成

- [x] 3.6.1 在 CLI 入口添加 `deploy` 命令支持
- [x] 3.6.2 测试命令行模式下的完整部署流程
- [x] 3.6.3 添加 `--dry-run` 选项用于测试（可选）

### 3.7 边界场景处理

- [x] 3.7.1 实现无变更时的提示（不执行构建和部署）
- [x] 3.7.2 实现构建失败时的错误显示（包含错误位置）
- [x] 3.7.3 实现部署失败时的错误处理和重试提示
- [x] 3.7.4 测试远程服务器不可达场景

---

## 4. start-dev Workflow 实现

### 4.1 新增 Steps

- [x] 4.1.1 创建 `src/steps/validators/port.ts` 文件
- [x] 4.1.2 实现 `checkPort` validator step（检测端口是否可用）
- [x] 4.1.3 实现端口冲突时的用户选择逻辑（使用其他端口或取消）
- [x] 4.1.4 注册 `checkPort` step 到 step 注册表

### 4.2 复用 Steps

- [x] 4.2.1 验证 `startDevServer` step 可正常启动开发服务器

### 4.3 Workflow 定义

- [x] 4.3.1 创建 `src/workflows/start-dev.ts` 文件
- [x] 4.3.2 定义 workflow 结构
- [x] 4.3.3 组装 steps: `checkPort` → `startServer`
- [x] 4.3.4 添加 workflow 到注册表

### 4.4 集成和测试

- [x] 4.4.1 添加 AI intent 识别（"启动开发服务器"、"本地预览" → `start_dev`）
- [x] 4.4.2 添加 CLI 命令 `rosydawn dev`
- [x] 4.4.3 测试端口可用场景
- [x] 4.4.4 测试端口冲突场景

---

## 5. build Workflow 实现

### 5.1 新增 Steps

- [x] 5.1.1 创建 `src/steps/actions/clean.ts` 文件
- [x] 5.1.2 实现 `cleanDist` action step（删除 `dist` 目录）
- [x] 5.1.3 创建 `src/steps/processors/optimize.ts` 文件
- [x] 5.1.4 实现 `optimizeAssets` processor step（压缩资源）
- [x] 5.1.5 注册新 steps 到 step 注册表

### 5.2 复用 Steps

- [x] 5.2.1 验证 `buildProject` step 可在 build workflow 中正常使用

### 5.3 Workflow 定义

- [x] 5.3.1 创建 `src/workflows/build.ts` 文件
- [x] 5.3.2 定义 workflow 结构
- [x] 5.3.3 组装 steps: `cleanDist` → `compileProject` (buildProject) → `optimizeAssets`
- [x] 5.3.4 添加 workflow 到注册表

### 5.4 集成和测试

- [x] 5.4.1 添加 AI intent 识别（"构建项目"、"打包" → `build`）
- [x] 5.4.2 添加 CLI 命令 `rosydawn build`
- [x] 5.4.3 测试构建成功场景（显示文件统计）
- [x] 5.4.4 测试构建失败场景（显示错误位置，命令行模式非零退出）

---

## 6. check-status Workflow 实现

### 6.1 新增 Steps

- [x] 6.1.1 创建 `src/steps/validators/article-stats.ts` 文件
- [x] 6.1.2 实现 `checkArticleStats` validator step（统计文章数量、已发布/未发布）
- [x] 6.1.3 创建 `src/steps/validators/deployment-status.ts` 文件
- [x] 6.1.4 实现 `checkDeploymentStatus` validator step（查询最近部署时间和状态）
- [x] 6.1.5 实现部署状态持久化（使用本地文件 `~/.rosydawn/cache.json`）
- [x] 6.1.6 注册新 steps 到 step 注册表

### 6.2 复用 Steps

- [x] 6.2.1 验证 `checkGitStatus` validator 可正常检查 Git 状态

### 6.3 Workflow 定义

- [x] 6.3.1 创建 `src/workflows/check-status.ts` 文件
- [x] 6.3.2 定义 workflow 结构
- [x] 6.3.3 组装 steps: `checkGitStatus` → `checkArticleStats` → `checkDeploymentStatus`
- [x] 6.3.4 添加 workflow 到注册表

### 6.4 集成和测试

- [x] 6.4.1 添加 AI intent 识别（"检查状态"、"当前什么情况" → `check_status`）
- [x] 6.4.2 添加 CLI 命令 `rosydawn status`
- [x] 6.4.3 测试 REPL 模式的自然语言响应格式
- [x] 6.4.4 测试命令行模式的结构化输出
- [x] 6.4.5 可选：添加 `--json` 选项支持 JSON 输出

---

## 7. 测试和验证

### 7.1 单元测试

- [x] 7.1.1 为新增的 steps 编写单元测试（build, deploy, port, article-stats, deployment-status）
- [x] 7.1.2 为 5 个新 workflows 编写单元测试
- [x] 7.1.3 确保所有测试通过（运行 `npm test`）

### 7.2 集成测试

- [x] 7.2.1 执行 testcases.md 中的 TC-01 至 TC-19（功能测试）
- [x] 7.2.2 执行 TC-20、TC-21（新旧实现对比验证）
- [x] 7.2.3 执行 TC-22 至 TC-24（错误处理和边界场景）
- [x] 7.2.4 执行 TC-25、TC-26（性能测试，可选）

### 7.3 迁移验证

- [x] 7.3.1 使用新 workflow 发布文章，与旧脚本结果对比（TC-20）
- [x] 7.3.2 使用新 workflow 部署，与旧脚本结果对比（TC-21）
- [x] 7.3.3 确认新实现行为与旧脚本一致

### 7.4 文档更新

- [x] 7.4.1 更新 README.md（如需要）
- [x] 7.4.2 更新 CLI 使用文档（添加新命令说明）
- [x] 7.4.3 添加 workflows 使用示例到文档

---

## 8. 清理和优化

### 8.1 旧脚本处理

- [x] 8.1.1 标记旧脚本为 deprecated（添加注释）
- [x] 8.1.2 保留旧脚本 1-2 个版本周期（不立即删除）
- [x] 8.1.3 在 CHANGELOG 中记录迁移说明

### 8.2 代码审查

- [x] 8.2.1 移除调试代码和 console.log
- [x] 8.2.2 确保代码符合项目风格规范
- [x] 8.2.3 添加必要的代码注释
- [x] 8.2.4 运行 `npm run lint` 确保无警告

### 8.3 性能优化

- [x] 8.3.1 检查是否有性能瓶颈（如大量文章发布）
- [x] 8.3.2 优化 AI 元数据生成性能（如需要）
- [x] 8.3.3 优化构建和部署速度（如需要）

---

## 9. 发布准备

### 9.1 版本管理

- [x] 9.1.1 更新 package.json 版本号（遵循 SemVer）
- [x] 9.1.2 生成 CHANGELOG 条目
- [ ] 9.1.3 创建 Git tag（如 `v1.5.0`）

### 9.2 最终验证

- [x] 9.2.1 在测试环境完整运行所有 5 个 workflows
- [x] 9.2.2 验证 REPL 和命令行两种模式都正常
- [x] 9.2.3 验证与现有 `create-article` workflow 无冲突

### 9.3 合并和部署

- [ ] 9.3.1 创建 Pull Request
- [ ] 9.3.2 等待 Code Review 通过
- [ ] 9.3.3 合并到主分支
- [ ] 9.3.4 在生产环境验证（可选）

---

## 任务依赖关系

```
1. 基础设施准备
   ↓
2. publish-article Workflow
   ↓
3. deploy Workflow (依赖 2 中的部分复用 steps)
   ↓
4-6. start-dev, build, check-status Workflows (可并行)
   ↓
7. 测试和验证 (依赖所有 workflows 完成)
   ↓
8. 清理和优化
   ↓
9. 发布准备
```

---

## 里程碑

- **Milestone 1** (Week 1): 完成任务 1-3，publish-article 和 deploy workflows 可用
- **Milestone 2** (Week 2): 完成任务 4-6，所有 5 个 workflows 可用
- **Milestone 3** (Week 3): 完成任务 7-9，测试通过，准备发布
