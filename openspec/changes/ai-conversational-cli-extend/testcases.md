# Test Cases

## 1. Test Strategy

本测试计划覆盖 5 个新增 Workflow 的端到端验证，采用分层测试策略：

### 测试类型
- **单元测试（Automated）**: 每个 step 的独立功能测试
- **集成测试（Automated）**: Workflow 端到端流程测试
- **手动测试（Manual）**: REPL 自然语言交互验证
- **边界测试（Edge Case）**: 异常场景和边界条件

### 测试重点
1. **Step 复用性验证**: 确保 `getChangedArticles`、`checkGitChanges` 等复用 steps 在新 workflows 中正常工作
2. **双模式兼容性**: REPL 和命令行两种触发方式都需验证
3. **错误处理**: Validator 中断和 Action 异常的正确处理
4. **迁移一致性**: 新实现与旧脚本逻辑结果一致

### 测试工具
- 单元/集成测试: Vitest
- REPL 交互测试: 手动测试脚本
- 构建验证: `npm run build`
- 部署验证: SSH 远程连接检查

## 2. Environment & Preconditions

### 环境要求
- Node.js 18+ 运行环境
- Git 仓库处于干净状态（测试前）
- 已配置 OPENAI_API_KEY 环境变量（用于 AI 功能）
- 已配置远程服务器 SSH 访问权限（用于部署测试）

### 测试数据准备
- 至少 2 篇已创建但未发布的文章（Markdown 文件）
- 至少 1 篇已发布的文章（用于测试无变更场景）
- 远程服务器测试环境（非生产环境）

### 全局前置条件
- 已运行 `npm install` 安装依赖
- 已运行 `npm run build` 确保项目可构建
- 已启动 REPL 环境（`rosydawn` 命令可用）

## 3. Execution List

---

## Workflow 1: publish-article（发布文章）

### TC-01: REPL 模式 - 单篇文章发布
- **Target**: article-publish-cli / REPL 模式 - AI 识别发布意图
- **Type**: Automated + Manual
- **Preconditions**:
  - 有 1 篇未发布的文章（frontmatter 未更新）
  - REPL 环境已启动
- **Steps**:
  1. 在 REPL 中输入 "发布"
  2. AI 识别 intent 为 `publish_article`
  3. Workflow 自动触发
  4. 系统检测到 1 篇未发布文章
  5. 自动生成元数据（title、description、tags）
  6. 显示编辑确认界面（`editConfirm` step）
  7. 用户确认元数据
  8. 系统更新 frontmatter
  9. 显示最终确认提示："确认提交并推送？"
  10. 用户输入 "是"
  11. 系统执行 `git add`、`git commit`、`git push`
- **Expected Result**:
  - Git 仓库有新的 commit，包含 frontmatter 更新
  - REPL 显示成功消息："文章已发布到 Git 仓库"
  - 远程仓库可见新的 commit

### TC-02: REPL 模式 - 无变更时的友好提示
- **Target**: article-publish-cli / 无变更 - REPL 响应
- **Type**: Automated
- **Preconditions**:
  - 所有文章都已发布（Git 状态干净）
  - REPL 环境已启动
- **Steps**:
  1. 在 REPL 中输入 "发布"
  2. AI 识别 intent 为 `publish_article`
  3. Workflow 执行 `getChangedArticles` validator
  4. Validator 检测到无变更文章
  5. Validator 返回 `{ success: false, message: "没有找到未发布的文章变更" }`
- **Expected Result**:
  - Workflow 中断，不执行后续步骤
  - REPL 显示自然语言响应："没有找到未发布的文章变更，你是要部署吗？"
  - Git 状态保持干净

### TC-03: 命令行模式 - 单篇文章发布
- **Target**: article-publish-cli / 命令行模式
- **Type**: Automated
- **Preconditions**:
  - 有 1 篇未发布的文章
- **Steps**:
  1. 执行命令 `rosydawn content publish`
  2. 系统不调用 AI，直接触发 workflow
  3. 检测到 1 篇未发布文章
  4. 生成元数据并显示确认
  5. 使用 `@inquirer/prompts` 显示确认对话框
  6. 用户选择 "Yes"
  7. 系统执行 Git 操作
- **Expected Result**:
  - 行为与 REPL 模式一致（除触发方式）
  - 使用命令行交互式确认（而非 REPL 输入）
  - Git commit 成功创建并推送

### TC-04: 多篇文章发布的交互选择
- **Target**: article-publish-cli / Workflow 步骤执行（边界场景）
- **Type**: Manual
- **Preconditions**:
  - 有 3 篇未发布的文章
- **Steps**:
  1. 在 REPL 中输入 "发布"
  2. 系统检测到 3 篇未发布文章
  3. 使用 `@inquirer/prompts` 多选界面
  4. 用户选择其中 2 篇文章
  5. 系统只为选中的 2 篇生成元数据
  6. 逐篇确认并更新 frontmatter
  7. 一次性提交并推送
- **Expected Result**:
  - 用户可选择发布部分文章
  - 未选中的文章保持不变
  - Git commit 包含选中的 2 篇文章更新

### TC-05: Step 复用验证
- **Target**: article-publish-cli / Step 复用
- **Type**: Automated
- **Preconditions**:
  - 已完成 TC-01（单篇文章发布）
- **Steps**:
  1. 检查 `getChangedArticles` step 调用日志
  2. 验证该 step 与 `deploy` workflow 使用同一实例
  3. 检查 step 注册表中只有一个 `getChangedArticles` 注册记录
- **Expected Result**:
  - `getChangedArticles` 在两个 workflows 中行为一致
  - Step 只注册一次，被多个 workflows 复用

---

## Workflow 2: deploy（部署到服务器）

### TC-06: REPL 模式 - 完整部署流程
- **Target**: deploy-workflow / REPL 模式 - AI 识别部署意图
- **Type**: Manual
- **Preconditions**:
  - 有未部署的 Git 变更
  - 远程服务器可访问
- **Steps**:
  1. 在 REPL 中输入 "部署到服务器"
  2. AI 识别 intent 为 `deploy`
  3. Workflow 执行 `checkGitChanges` validator
  4. Validator 检测到未推送的 commits
  5. 执行 `buildProject` step（`npm run build`）
  6. 构建成功，生成 `dist` 目录
  7. 显示确认提示："即将部署到服务器，确认继续？"
  8. 用户输入 "是"
  9. 执行 `executeDeploy` step（SSH 到远程服务器）
  10. 远程复制 `dist` 目录到 Nginx 目录
  11. 显示成功消息
- **Expected Result**:
  - 构建产物成功生成到 `dist` 目录
  - 远程服务器收到新的静态文件
  - REPL 显示："部署完成！网站已上线"
  - 响应包含网站访问 URL（如 https://example.com）

### TC-07: REPL 模式 - 无变更时的提示
- **Target**: deploy-workflow / 无变更 - REPL 响应
- **Type**: Automated
- **Preconditions**:
  - Git 状态干净（无未推送的变更）
- **Steps**:
  1. 在 REPL 中输入 "发布到线上"
  2. AI 识别 intent 为 `deploy`
  3. `checkGitChanges` validator 检测到无变更
  4. Validator 返回 `{ success: false, message: "当前没有需要部署的变更" }`
- **Expected Result**:
  - Workflow 中断
  - REPL 显示："当前没有需要部署的变更"
  - 不执行构建和部署操作

### TC-08: 命令行模式 - 部署
- **Target**: deploy-workflow / 命令行模式
- **Type**: Automated
- **Preconditions**:
  - 有未部署的变更
- **Steps**:
  1. 执行命令 `rosydawn deploy`
  2. 直接触发 workflow（不调用 AI）
  3. 执行完整部署流程
  4. 使用 `@inquirer/prompts` 显示确认对话框
- **Expected Result**:
  - 行为与 REPL 模式一致
  - 部署成功完成

### TC-09: 构建失败时的错误处理
- **Target**: deploy-workflow / 显示部署结果（错误场景）
- **Type**: Automated（Edge Case）
- **Preconditions**:
  - 项目代码有语法错误（故意引入）
- **Steps**:
  1. 触发 deploy workflow
  2. `buildProject` step 执行 `npm run build`
  3. 构建失败，抛出异常
  4. Workflow 引擎捕获异常
  5. 显示错误信息
- **Expected Result**:
  - 显示详细的构建错误信息（包含错误位置）
  - 系统不崩溃，用户可重试
  - 不执行部署操作

### TC-10: 部署失败时的错误处理
- **Target**: deploy-workflow / 显示部署结果（错误场景）
- **Type**: Manual（Edge Case）
- **Preconditions**:
  - 远程服务器不可达（模拟网络故障）
- **Steps**:
  1. 触发 deploy workflow
  2. 构建成功
  3. `executeDeploy` step 尝试 SSH 连接
  4. 连接失败，抛出异常
  5. Workflow 引擎捕获异常
  6. 显示错误信息和解决方案
- **Expected Result**:
  - 显示错误："无法连接到远程服务器"
  - 提示可能的解决方案（检查网络、SSH 配置）
  - 系统不崩溃，用户可重试

---

## Workflow 3: start-dev（启动开发服务器）

### TC-11: REPL 模式 - 启动开发服务器
- **Target**: system-workflows / 启动开发服务器 Workflow - REPL 模式
- **Type**: Manual
- **Preconditions**:
  - 端口 4321 未被占用
- **Steps**:
  1. 在 REPL 中输入 "启动开发服务器"
  2. AI 识别 intent 为 `start_dev`
  3. Workflow 执行 `checkPort` step
  4. 检测端口 4321 可用
  5. 执行 `startServer` step
  6. 启动 `npm run dev`
  7. 服务器在后台运行
- **Expected Result**:
  - REPL 显示："开发服务器已启动"
  - 响应包含本地访问 URL（http://localhost:4321）
  - 服务器在后台持续运行

### TC-12: 端口被占用时的处理
- **Target**: system-workflows / 启动开发服务器 Workflow - Workflow 步骤执行
- **Type**: Automated（Edge Case）
- **Preconditions**:
  - 端口 4321 已被其他进程占用
- **Steps**:
  1. 触发 start-dev workflow
  2. `checkPort` step 检测到端口被占用
  3. 显示提示："端口 4321 已被占用"
  4. 使用 `@inquirer/prompts` 让用户选择：
     - 选项 1: 使用其他端口（如 4322）
     - 选项 2: 取消操作
  5. 用户选择使用其他端口
  6. 在新端口启动服务器
- **Expected Result**:
  - 服务器在新端口启动（如 http://localhost:4322）
  - REPL 显示新端口的访问 URL

### TC-13: 命令行模式 - 启动开发服务器
- **Target**: system-workflows / 启动开发服务器 Workflow - 命令行模式
- **Type**: Automated
- **Preconditions**:
  - 端口可用
- **Steps**:
  1. 执行命令 `rosydawn dev`
  2. 直接触发 workflow
  3. 启动开发服务器
- **Expected Result**:
  - 行为与 REPL 模式一致
  - 服务器成功启动

---

## Workflow 4: build（构建项目）

### TC-14: REPL 模式 - 构建项目
- **Target**: system-workflows / 构建项目 Workflow - REPL 模式
- **Type**: Manual
- **Preconditions**:
  - 项目代码无错误
- **Steps**:
  1. 在 REPL 中输入 "构建项目"
  2. AI 识别 intent 为 `build`
  3. Workflow 执行 `cleanDist` step（删除旧的 `dist` 目录）
  4. 执行 `compileProject` step（`npm run build`）
  5. 执行 `optimizeAssets` step（压缩资源）
  6. 构建完成
- **Expected Result**:
  - REPL 显示："构建完成"
  - 响应包含：
    - 输出目录路径：`dist/`
    - 文件大小统计（如 "总大小: 2.3 MB"）
    - 文件数量（如 "共生成 45 个文件"）

### TC-15: 构建失败时的错误显示
- **Target**: system-workflows / 构建项目 Workflow - 构建失败
- **Type**: Automated（Edge Case）
- **Preconditions**:
  - 项目代码有语法错误
- **Steps**:
  1. 触发 build workflow
  2. `compileProject` step 执行失败
  3. 捕获错误信息
  4. 显示详细的错误位置
- **Expected Result**:
  - 显示错误信息，包含文件名和行号
  - 命令行模式以非零状态码退出
  - REPL 模式显示错误但不崩溃

### TC-16: 命令行模式 - 构建项目
- **Target**: system-workflows / 构建项目 Workflow - 命令行模式
- **Type**: Automated
- **Preconditions**:
  - 项目可构建
- **Steps**:
  1. 执行命令 `rosydawn build`
  2. 直接触发 workflow
  3. 执行完整构建流程
- **Expected Result**:
  - 行为与 REPL 模式一致
  - 构建成功完成

---

## Workflow 5: check-status（检查状态）

### TC-17: REPL 模式 - 检查状态
- **Target**: system-workflows / 检查状态 Workflow - REPL 模式
- **Type**: Manual
- **Preconditions**:
  - Git 仓库有未提交的变更（测试用）
  - 至少有 5 篇已发布的文章
  - 最近一周内有部署记录
- **Steps**:
  1. 在 REPL 中输入 "检查状态"
  2. AI 识别 intent 为 `check_status`
  3. Workflow 执行 `checkGitStatus` step
  4. 执行 `checkArticleStats` step
  5. 执行 `checkDeploymentStatus` step
  6. 汇总所有状态信息
- **Expected Result**:
  - REPL 以自然语言显示状态摘要：
    - "Git 状态: 2 个文件未提交"
    - "文章统计: 共 5 篇文章，其中 3 篇已发布"
    - "最近部署: 2026-02-14 10:30"
  - 信息清晰易读

### TC-18: 命令行模式 - 检查状态
- **Target**: system-workflows / 检查状态 Workflow - 命令行模式
- **Type**: Automated
- **Preconditions**:
  - 同 TC-17
- **Steps**:
  1. 执行命令 `rosydawn status`
  2. 直接触发 workflow
  3. 执行所有状态检查 steps
- **Expected Result**:
  - 以结构化格式显示状态（便于脚本解析）
  - 可选的 JSON 输出格式（如 `rosydawn status --json`）

### TC-19: 无部署记录时的状态显示
- **Target**: system-workflows / 检查状态 Workflow（边界场景）
- **Type**: Manual
- **Preconditions**:
  - 从未执行过部署
- **Steps**:
  1. 触发 check-status workflow
  2. `checkDeploymentStatus` step 查询部署历史
  3. 未找到部署记录
- **Expected Result**:
  - 显示："最近部署: 尚未部署"
  - 不显示部署时间和 URL

---

## 迁移一致性验证

### TC-20: 发布文章 - 新旧实现结果对比
- **Target**: design.md / Decision 2（迁移策略）
- **Type**: Automated
- **Preconditions**:
  - 旧脚本 `scripts/content/publish.js` 仍然存在
  - 新 workflow 已实现
- **Steps**:
  1. 使用旧脚本发布 1 篇文章
  2. 记录 Git commit 内容、frontmatter 格式
  3. 回退 Git 状态
  4. 使用新 workflow 发布同一篇文章
  5. 对比两次结果
- **Expected Result**:
  - Git commit 内容一致
  - Frontmatter 格式一致
  - 元数据内容一致

### TC-21: 部署 - 新旧实现结果对比
- **Target**: design.md / Decision 2（迁移策略）
- **Type**: Manual
- **Preconditions**:
  - 旧部署脚本仍然存在
  - 新 workflow 已实现
  - 有测试服务器可用
- **Steps**:
  1. 使用旧脚本执行一次部署
  2. 记录远程服务器文件列表、大小
  3. 使用新 workflow 执行部署
  4. 对比远程服务器文件
- **Expected Result**:
  - 文件列表一致
  - 文件大小和内容一致
  - Nginx 配置不变

---

## 错误处理和边界条件

### TC-22: Workflow 引擎异常捕获
- **Target**: design.md / Decision 5（错误处理策略）
- **Type**: Automated
- **Preconditions**:
  - 任一 workflow
- **Steps**:
  1. 在 workflow 执行过程中故意制造错误（如删除必要文件）
  2. Action step 抛出异常
  3. Workflow 引擎捕获异常
  4. 显示错误堆栈
  5. 清理上下文
- **Expected Result**:
  - 系统不崩溃
  - 显示友好的错误信息
  - 用户可重试或执行其他操作

### TC-23: Validator 中断流程
- **Target**: design.md / Decision 5（错误处理策略）
- **Type**: Automated
- **Preconditions**:
  - Validator 检测到不满足前置条件
- **Steps**:
  1. 触发 workflow
  2. Validator step 返回 `{ success: false }`
  3. Workflow 引擎检测到失败
  4. 中断后续 steps 执行
  5. 显示 validator 返回的消息
- **Expected Result**:
  - 后续 steps 不执行
  - 显示友好的中断原因
  - 系统状态保持一致

### TC-24: 并发 Workflow 执行
- **Target**: Edge Case
- **Type**: Manual
- **Preconditions**:
  - REPL 环境已启动
- **Steps**:
  1. 在 REPL 中启动 start-dev workflow
  2. 开发服务器在后台运行
  3. 在同一 REPL 中触发 build workflow
  4. 两个 workflows 同时运行
- **Expected Result**:
  - 两个 workflows 互不干扰
  - 各自独立完成
  - 上下文隔离，不共享状态

---

## 性能和稳定性

### TC-25: 大量文章发布的性能
- **Target**: Edge Case
- **Type**: Manual
- **Preconditions**:
  - 有 10 篇未发布的文章
- **Steps**:
  1. 触发 publish-article workflow
  2. 选择发布所有 10 篇文章
  3. 记录执行时间
- **Expected Result**:
  - 总执行时间 < 30 秒（含 AI 元数据生成）
  - 内存使用正常（无内存泄漏）
  - 用户可看到进度提示

### TC-26: 构建大型项目的性能
- **Target**: Edge Case
- **Type**: Automated
- **Preconditions**:
  - 项目包含 50+ 篇文章
- **Steps**:
  1. 触发 build workflow
  2. 执行完整构建
  3. 记录构建时间
- **Expected Result**:
  - 构建时间 < 60 秒
  - 生成的 `dist` 目录大小合理（< 50 MB）
  - 无内存溢出错误
