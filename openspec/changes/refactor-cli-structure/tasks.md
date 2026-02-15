# 实施任务清单

## 1. 准备工作

- [x] 1.1 确认当前 Git 分支状态，确保工作区干净
- [x] 1.2 备份当前 package.json 文件（以防需要回滚）
- [x] 1.3 确认项目依赖已安装（npm install）

## 2. 创建 Help 命令脚本

- [x] 2.1 创建 `scripts/help.ts` 文件
- [x] 2.2 定义 Command 接口（包含 name, description, usageScenario, expectedResult, prerequisites 字段）
- [x] 2.3 创建分类数据结构（dev, content, deploy, help）
- [x] 2.4 实现 dev 类别的命令列表（dev, build, preview）
- [x] 2.5 实现 content 类别的命令列表（content:new, content:publish）
- [x] 2.6 实现 deploy 类别的命令列表（8 个部署命令）
- [x] 2.7 实现格式化输出函数（使用清晰的视觉分隔）
- [x] 2.8 添加分类级别的描述信息
- [x] 2.9 测试 `tsx scripts/help.ts` 执行是否正常
- [x] 2.10 验证输出格式和内容的完整性

## 3. 更新 package.json Scripts

- [x] 3.1 添加 `content:new` 命令（指向 `tsx scripts/new.ts`）
- [x] 3.2 添加 `content:publish` 命令（指向 `tsx scripts/publish.ts`）
- [x] 3.3 添加 `help` 命令（指向 `tsx scripts/help.ts`）
- [x] 3.4 删除旧的 `new` 命令
- [x] 3.5 删除旧的 `publish` 命令
- [x] 3.6 验证 package.json 的 JSON 格式正确性
- [ ] 3.7 保存并提交 package.json 变更

## 4. 更新文档

- [x] 4.1 打开 README.md 文件
- [x] 4.2 找到或创建"命令使用"章节
- [x] 4.3 添加分类标题和描述（开发命令、内容创作命令、部署命令）
- [x] 4.4 列出 dev 类别命令及其说明
- [x] 4.5 列出 content 类别命令及其说明
- [x] 4.6 列出 deploy 类别命令及其说明
- [x] 4.7 添加 help 命令说明和示例
- [x] 4.8 移除所有对旧命令的引用（`npm run new`, `npm run publish`）
- [x] 4.9 添加 Breaking Change 说明和迁移指南
- [x] 4.10 检查其他文档文件是否需要更新（如 CONTRIBUTING.md）

## 5. 验证命令功能

- [x] 5.1 测试 `npm run help` 命令执行成功
- [x] 5.2 验证 help 输出包含所有命令
- [x] 5.3 验证 help 输出包含详细描述、使用场景、预期结果
- [x] 5.4 测试 `npm run content:new` 命令执行成功
- [x] 5.5 验证 content:new 功能与原 new 命令一致
- [x] 5.6 测试 `npm run content:publish` 命令执行成功
- [x] 5.7 验证 content:publish 功能与原 publish 命令一致
- [x] 5.8 确认旧命令 `npm run new` 不再可用
- [x] 5.9 确认旧命令 `npm run publish` 不再可用

## 6. AI 理解能力测试

- [x] 6.1 执行 `npm run help` 并保存输出
- [x] 6.2 测试 AI 能根据"创建新文章"意图选择 content:new 命令
- [x] 6.3 测试 AI 能理解 preview 命令需要先运行 build
- [x] 6.4 测试 AI 能区分不同 deploy 命令的使用场景
- [x] 6.5 记录 AI 理解测试结果，必要时优化 help 输出

## 7. 回归测试

- [x] 7.1 运行 `npm run dev` 确认开发服务器正常启动
- [ ] 7.2 运行 `npm run build` 确认构建流程正常
- [ ] 7.3 测试完整的文章创建和发布流程
- [ ] 7.4 测试 AI 服务不可用时的降级处理
- [ ] 7.5 验证所有 deploy 命令仍然正常工作

## 8. 代码质量检查

- [x] 8.1 检查 scripts/help.ts 代码格式
- [x] 8.2 确保 TypeScript 类型定义正确
- [x] 8.3 添加必要的代码注释
- [x] 8.4 检查是否有未使用的导入或变量

## 9. 提交变更

- [ ] 9.1 使用 `git status` 检查所有变更文件
- [ ] 9.2 使用 `git diff` 审查代码变更
- [ ] 9.3 暂存所有相关文件（package.json, scripts/help.ts, README.md）
- [ ] 9.4 创建符合 Conventional Commits 格式的 commit message
- [ ] 9.5 Commit message 示例：`refactor(cli): 重组命令行结构为三大类别并添加 help 命令`
- [ ] 9.6 在 commit body 中列出 breaking changes
- [ ] 9.7 推送到远程分支

## 10. 后续工作

- [ ] 10.1 创建 Pull Request 或 Merge Request
- [ ] 10.2 在 PR 描述中引用相关文档（proposal, design, specs）
- [ ] 10.3 通知团队成员评审 review.md
- [ ] 10.4 收集评审反馈并处理
- [ ] 10.5 合并到主分支
- [ ] 10.6 更新 CHANGELOG.md 记录此次 breaking change
- [ ] 10.7 通知所有项目使用者关于命令变更

## 预计时间

- 任务 1-3（准备工作 + Help 脚本 + package.json）：45-60 分钟
- 任务 4（更新文档）：20-30 分钟
- 任务 5-7（验证和测试）：30-45 分钟
- 任务 8-9（质量检查和提交）：15-20 分钟
- 任务 10（后续工作）：根据团队流程而定

**总计：约 2-3 小时**
