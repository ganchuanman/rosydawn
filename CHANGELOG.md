# 更新日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/),
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

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
