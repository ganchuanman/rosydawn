# 更新日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/),
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 新增

#### AI 对话式 CLI MVP

**日期**: 2026-03-01

**功能概述**:
实现了基于 Step 架构的 AI 对话式 CLI,支持通过自然语言或命令行创建博客文章。

**新增功能**:

1. **双模式 CLI**
   - REPL 模式: 通过自然语言与 AI 交互创建文章
   - 命令行模式: 使用传统命令行参数创建文章
   - 自动模式切换: 无参数启动 REPL,有参数执行命令

2. **Step 架构**
   - Validators: Git 状态验证、目录结构验证
   - Processors: 主题输入、元数据生成、Frontmatter 构建、Slug 生成
   - Notifiers: 用户确认、完成摘要显示
   - Actions: 文件创建、开发服务器管理、Git 操作

3. **create-article Workflow**
   - 11 步完整文章创建流程
   - 支持参数: `topic` (必填), `tags`, `category`, `date` (可选)
   - 中文标题自动转拼音 slug
   - 自动添加 Git 暂存区
   - 自动启动开发服务器

4. **命令行接口**
   ```bash
   # REPL 模式
   rosydawn

   # 命令行模式
   rosydawn content new --topic "文章标题" --tags "标签1,标签2" --category "分类" --date "2026-03-01"

   # 帮助
   rosydawn --help
   ```

5. **AI 集成**
   - 意图识别: 自动识别用户意图并路由到对应 Workflow
   - 参数提取: 从自然语言中提取 topic、tags、category 等参数
   - 元数据生成: AI 生成文章标题、描述和标签
   - 降级处理: AI 服务不可用时使用基础模板

**技术特性**:
- TypeScript + ESM 模块
- 完整的错误处理和用户反馈
- 原子操作避免半成品状态
- 参数验证和类型推断
- 工作流引擎支持顺序执行和上下文传递

**文件变更**:
- 新增 `bin/rosydawn` - CLI 入口
- 新增 `src/cli/cli.ts` - 命令行模式
- 新增 `src/cli/repl.ts` - REPL 模式
- 新增 `src/cli/help.ts` - 帮助系统
- 新增 `src/workflows/create-article.ts` - 文章创建工作流
- 新增 `src/steps/` - Step 架构实现
- 更新 `package.json` - 添加 bin 字段和 pinyin 依赖

---

### 移除

#### ⚠️ 破坏性变更: 移除邮件通知服务

**日期**: 2026-02-15

**影响范围**:
- 完全移除了邮件通知功能及其所有相关代码
- 移除了 `nodemailer` npm 依赖
- 移除了所有 SMTP 相关的配置项

**被移除的功能**:
- `scripts/lib/mail.mjs` - 邮件发送模块
- `CONFIG.mail` - 邮件配置对象
- `sendDeployNotification()` - 部署通知函数
- `createMailTransporter()` - 邮件发送器创建函数
- 环境变量: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`

**迁移指南**:

如果您之前依赖邮件通知来监控部署状态,现在可以通过以下方式实现:

1. **查看日志文件**:
   ```bash
   tail -f logs/deploy.log
   ```

2. **使用系统监控工具**:
   - 配置 Supervisor 或 systemd 监控部署进程
   - 使用日志监控工具如 Logwatch 或 Logrotate

3. **自定义通知方案**:
   - 实现基于 Webhook 的通知
   - 集成 Slack、钉钉等即时通讯工具
   - 使用服务器监控服务

**原因**:
邮件通知服务功能复杂但使用频率低,移除后可以简化项目结构,降低维护成本。

---

## 版本历史

待发布版本...
