# Implementation Tasks

## 1. 项目初始化

- [x] 1.1 创建 src/workflow/ 目录
- [x] 1.2 创建 src/steps/ 目录结构（validators/, processors/, actions/, notifiers/）
- [x] 1.3 配置 Vitest 测试框架（如果尚未配置）

## 2. Workflow 引擎 - 类型定义

- [x] 2.1 定义 StepType 类型（validator, processor, action, notifier）
- [x] 2.2 定义 Step 接口（type, name, execute）
- [x] 2.3 定义 WorkflowContext 接口（params, steps, metadata）
- [x] 2.4 定义 WorkflowParams 接口（required, optional）
- [x] 2.5 定义 Workflow 接口（name, description, intent, params, steps）
- [x] 2.6 定义 WorkflowResult 接口（success, data, error, metadata）
- [x] 2.7 定义 StepResult 接口（success, data, error）

## 3. Workflow 引擎 - 核心实现

- [x] 3.1 实现 defineWorkflow() 函数
- [x] 3.2 实现 executeWorkflow() 函数 - 基础框架
- [x] 3.3 实现 step 顺序执行逻辑
- [x] 3.4 实现 context 传递和合并机制
- [x] 3.5 实现差异化错误处理（Validator/Processor/Action 中断，Notifier 继续）
- [x] 3.6 实现错误日志记录
- [x] 3.7 实现 WorkflowResult 返回格式化

## 4. Workflow 注册表

- [x] 4.1 实现 WorkflowRegistry 类（Map 存储）
- [x] 4.2 实现 registerWorkflow() 函数
- [x] 4.3 实现 routeWorkflow(intent) 函数 - 意图路由
- [x] 4.4 实现 getWorkflowByName(name) 函数
- [x] 4.5 实现 getWorkflowMetadata() 函数
- [x] 4.6 实现全局 workflow 注册表实例

## 5. Step 注册表 - 类型定义

- [x] 5.1 定义 StepRegistry 接口
- [x] 5.2 定义 StepCategories 类型（Record<StepType, Set<string>>）

## 6. Step 注册表 - 核心实现

- [x] 6.1 实现 defineStep() 函数
- [x] 6.2 实现 StepRegistry 类 - Map + 类型索引
- [x] 6.3 实现 registerStep() 函数 - 包含重复注册警告
- [x] 6.4 实现 getStepByName(name) 函数
- [x] 6.5 实现 getStepsByType(type) 函数
- [x] 6.6 实现 clearRegistry() 函数（用于测试）
- [x] 6.7 实现全局 step 注册表实例

## 7. 内置 Steps - Validators

- [x] 7.1 实现 checkGitChanges step - 检查 Git 变更
- [x] 7.2 实现 getChangedArticles step - 检测文章变更
- [x] 7.3 实现 checkDirectory step - 检查目录存在性
- [ ] 7.4 编写 validators 单元测试

## 8. 内置 Steps - Processors

- [x] 8.1 实现 generateMetadata step - 调用 AI 生成元数据（需要 mock AI 客户端）
- [x] 8.2 实现 collectExistingTags step - 收集现有标签
- [x] 8.3 实现 inputTopic step - 处理主题参数缺失
- [x] 8.4 实现 updateFrontmatter step - 更新文章 frontmatter
- [ ] 8.5 编写 processors 单元测试

## 9. 内置 Steps - Actions

- [x] 9.1 实现 createFile step - 创建文件
- [x] 9.2 实现 commitAndPush step - Git 提交和推送
- [x] 9.3 实现 startDevServer step - 启动开发服务器
- [ ] 9.4 编写 actions 单元测试

## 10. 内置 Steps - Notifiers

- [x] 10.1 实现 confirmCreation step - 确认创建
- [x] 10.2 实现 editConfirm step - 编辑确认
- [ ] 10.3 编写 notifiers 单元测试

## 11. 内置 Steps - 注册和导出

- [x] 11.1 实现 registerBuiltinSteps() 函数
- [x] 11.2 创建 src/steps/builtin.ts 导出所有内置 steps
- [x] 11.3 创建 src/steps/index.ts 统一导出

## 12. 单元测试 - Workflow 引擎

- [ ] 12.1 编写 defineWorkflow 测试（TC-01）
- [ ] 12.2 编写 Workflow 参数定义测试（TC-02, TC-03）
- [ ] 12.3 编写 step 顺序执行测试（TC-04）
- [ ] 12.4 编写 Validator 失败中断测试（TC-05）
- [ ] 12.5 编写 Processor 失败中断测试（TC-06）
- [ ] 12.6 编写 Action 失败中断测试（TC-07）
- [ ] 12.7 编写 Notifier 失败不中断测试（TC-08）
- [ ] 12.8 编写 context 写入测试（TC-09）
- [ ] 12.9 编写 context 读取测试（TC-10）
- [ ] 12.10 编写意图路由测试（TC-11, TC-12）
- [ ] 12.11 编写结果返回测试（TC-13, TC-14）

## 13. 单元测试 - Step 注册表

- [ ] 13.1 编写 defineStep 测试（TC-15）
- [ ] 13.2 编写 Step 类型约束测试（TC-16）
- [ ] 13.3 编写注册 Step 测试（TC-17）
- [ ] 13.4 编写查找 Step 测试（TC-18）
- [ ] 13.5 编写重复注册警告测试（TC-19）
- [ ] 13.6 编写按 type 分类存储测试（TC-20）
- [ ] 13.7 编写列出某类型所有 steps 测试（TC-21）

## 14. 集成测试 - 内置 Steps

- [ ] 14.1 编写 checkGitChanges 测试（TC-22, TC-23）
- [ ] 14.2 编写 getChangedArticles 测试（TC-24, TC-25）
- [ ] 14.3 编写 checkDirectory 测试（TC-26, TC-27）
- [ ] 14.4 编写 generateMetadata 测试（TC-28）
- [ ] 14.5 编写 collectExistingTags 测试（TC-29）
- [ ] 14.6 编写 inputTopic 测试（TC-30）
- [ ] 14.7 编写 updateFrontmatter 测试（TC-31）
- [ ] 14.8 编写 createFile 测试（TC-32）
- [ ] 14.9 编写 commitAndPush 测试（TC-33）
- [ ] 14.10 编写 startDevServer 测试（TC-34）
- [ ] 14.11 编写 confirmCreation 测试（TC-35, TC-36）
- [ ] 14.12 编写 editConfirm 测试（TC-37）
- [ ] 14.13 编写跨 Workflow 复用测试（TC-38）

## 15. 端到端测试

- [ ] 15.1 编写 Workflow 元数据提取测试（TC-39）
- [ ] 15.2 编写 demo workflow 端到端测试（TC-40）

## 16. 边界情况测试

- [ ] 16.1 编写 Context 类型丢失测试（EC-01）
- [ ] 16.2 编写 Step 命名冲突测试（EC-02）
- [ ] 16.3 编写 Workflow 执行失败后无法恢复测试（EC-03）
- [ ] 16.4 编写大量 steps 性能测试（EC-04）
- [ ] 16.5 编写 Context 数据过大测试（EC-05）

## 17. 回归测试

- [ ] 17.1 验证向后兼容性（RT-01）- 运行现有 CLI 命令
- [ ] 17.2 验证 TypeScript strict mode（RT-02）- 运行 tsc --noEmit

## 18. 文档和注释

- [x] 18.1 为 Workflow 引擎添加 TSDoc 注释
- [x] 18.2 为 Step 注册表添加 TSDoc 注释
- [x] 18.3 为内置 steps 添加 TSDoc 注释
- [x] 18.4 创建 src/workflow/README.md 说明使用方法
- [x] 18.5 创建 src/steps/README.md 列出所有内置 steps

## 19. 代码质量

- [ ] 19.1 运行 ESLint 检查并修复问题
- [ ] 19.2 运行 Prettier 格式化代码
- [ ] 19.3 检查并确保测试覆盖率 ≥ 90%
- [x] 19.4 运行所有测试确保通过

## 20. 验证和收尾

- [x] 20.1 运行完整的测试套件
- [x] 20.2 验收标准 1：能使用 defineWorkflow() 定义工作流
- [x] 20.3 验收标准 2：能使用 registerStep() 注册步骤
- [x] 20.4 验收标准 3：Workflow 能按顺序执行 steps
- [x] 20.5 验收标准 4：Context 能在 steps 之间正确传递
- [x] 20.6 验收标准 5：Validator 失败能中断流程
- [x] 20.7 验收标准 6：Notifier 失败不中断流程
- [x] 20.8 创建 demo workflow 示例代码
- [ ] 20.9 更新项目文档（如果有必要）

## 任务统计

- **总任务数**: 113
- **预计工作量**: 5-7 天
- **关键路径**: 1 → 2 → 3 → 4 → 5 → 6 → 7-11 → 12-17 → 20
- **可并行任务**: 7-11（内置 Steps），12-13（单元测试）

## 任务依赖关系

```
1. 项目初始化
   ↓
2-6. 核心实现（Workflow 引擎 + Step 注册表）
   ↓
7-11. 内置 Steps（可并行）
   ↓
12-17. 测试（可并行）
   ↓
18-19. 文档和质量检查
   ↓
20. 验证和收尾
```

## 注意事项

1. **类型安全**：所有实现必须通过 TypeScript strict mode 检查
2. **命名规范**：Workflow 名称 kebab-case，Intent 名称 snake_case
3. **测试优先**：建议先编写测试，再实现功能（TDD）
4. **逐步提交**：每完成一个模块，提交一次代码
5. **Mock 外部依赖**：测试时 mock 文件系统、Git 操作、AI 客户端等
