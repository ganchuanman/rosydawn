## Context

Rosydawn 项目当前包含一个邮件通知系统,用于在自动部署过程中发送部署成功/失败的通知邮件。该系统基于 `nodemailer` 库实现,支持多种 SMTP 服务商(Gmail、163、QQ邮箱等)。

**当前状态:**
- 邮件模块位于 `scripts/lib/mail.mjs`,包含邮件发送器和 HTML 模板
- 配置分散在多个环境变量中(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_EMAIL)
- 在部署成功和失败时都会发送通知邮件
- 邮件包含详细的部署信息(提交哈希、提交信息、错误详情等)

**移除原因:**
- 功能复杂度高,维护成本大
- 实际使用频率低,价值有限
- 用户可以通过日志文件或服务器监控工具获取部署状态
- 简化项目依赖和配置复杂度

## Goals / Non-Goals

**Goals:**
- 完全移除邮件通知相关的代码、配置和依赖
- 保持部署脚本的核心功能不受影响
- 确保移除后代码库更简洁、更易维护
- 提供清晰的日志记录,方便用户通过其他方式监控部署状态

**Non-Goals:**
- 不提供邮件通知的替代实现(如 Webhook、Slack 通知等)
- 不修改部署流程的核心逻辑
- 不改变现有的日志记录机制

## Decisions

### 1. 完全移除 vs 可选禁用

**决定:** 完全移除邮件通知功能

**备选方案:**
- 方案 A: 保留代码但默认禁用(CONFIG.mail.enabled = false)
- 方案 B: 完全移除所有邮件相关代码

**选择方案 B 的理由:**
- 如果用户真正需要邮件通知,可以自行集成第三方服务
- 保留代码会增加维护负担,即使用户不使用
- 完全移除可以彻底清理配置和依赖,避免混淆

### 2. 日志记录的保留

**决定:** 保留现有的日志记录机制不变

**理由:**
- `logs/deploy.log` 已经记录了部署的详细过程
- 用户可以通过 `tail -f logs/deploy.log` 或配置日志监控系统获取部署状态
- 日志文件比邮件更轻量、更可靠

### 3. 依赖清理策略

**决定:** 从 package.json 中移除 `nodemailer` 依赖

**理由:**
- 移除邮件功能后,`nodemailer` 不再被任何代码使用
- 减少项目依赖数量,降低安全风险和维护成本
- 减小 node_modules 体积

## Risks / Trade-offs

### 风险 1: 用户依赖邮件通知获取部署失败信息

**风险描述:** 部分用户可能依赖邮件通知来及时发现部署失败

**缓解措施:**
- 部署日志仍然完整记录所有信息
- 建议用户使用系统级监控工具(如 Supervisor、systemd)配合日志文件
- 可以配置 cron 任务定期检查部署日志中的错误
- 在 README 中提供监控部署状态的建议方案

### 风险 2: 破坏性变更影响现有用户

**风险描述:** 已经配置了 SMTP 的用户升级后会失去邮件通知功能

**缓解措施:**
- 在 CHANGELOG 中明确标注这是一个破坏性变更
- 提供迁移指南,说明如何通过其他方式实现部署通知
- 建议用户自行实现基于 Webhook 或其他通知方式

### 权衡: 简洁性 vs 功能性

**权衡:** 移除邮件通知会降低开箱即用的通知功能,但大幅提升代码简洁性

**决策依据:**
- 项目定位是轻量级的博客系统,复杂的邮件通知不是核心功能
- 大多数用户更倾向于使用统一的监控方案,而非单独的邮件通知
- 维护成本与功能价值不成正比

## Migration Plan

### 步骤 1: 代码清理
1. 删除 `scripts/lib/mail.mjs` 文件
2. 从 `scripts/lib/config.mjs` 中移除:
   - `CONFIG.mail` 配置对象
   - 相关的环境变量处理逻辑
3. 从 `scripts/lib/watch.mjs` 中移除:
   - `import { sendDeployNotification }` 语句
   - 所有 `sendDeployNotification()` 调用
   - 邮件配置检查逻辑
4. 从 `scripts/lib/index.mjs` 中移除 mail 模块的导出
5. 更新 `.env.example`,删除 SMTP 相关配置项

### 步骤 2: 依赖清理
1. 运行 `npm uninstall nodemailer`
2. 更新 `package.json` 和 `package-lock.json`

### 步骤 3: 文档更新
1. 更新 README,移除邮件配置相关说明
2. 添加监控部署状态的替代方案建议
3. 在 CHANGELOG 中记录破坏性变更

### 回滚策略
如果需要恢复邮件通知功能:
1. 从 Git 历史中恢复 `scripts/lib/mail.mjs`
2. 恢复 config.mjs 中的邮件配置
3. 恢复 watch.mjs 中的通知调用
4. 重新安装 nodemailer: `npm install nodemailer`

## Open Questions

无。此变更目标明确,实现路径清晰,不需要额外的技术决策。
