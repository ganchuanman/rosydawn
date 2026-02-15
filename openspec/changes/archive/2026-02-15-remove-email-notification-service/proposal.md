## Why

当前的邮件通知服务功能复杂度高,需要维护 SMTP 配置、邮件模板、错误处理等多个方面,但实际使用频率低,带来的价值有限。移除该功能可以简化部署脚本的复杂度,减少维护成本,并降低对第三方邮件服务的依赖。

## What Changes

**BREAKING** - 完全移除邮件通知服务相关功能:

- 删除 `scripts/lib/mail.mjs` 模块(包含邮件发送器和 HTML 邮件模板)
- 从 `scripts/lib/config.mjs` 中移除所有邮件相关配置(SMTP 配置、收件人配置等)
- 从 `scripts/lib/watch.mjs` 中移除所有 `sendDeployNotification` 调用
- 从 `scripts/lib/index.mjs` 中移除 mail 模块的导出
- 从 `.env.example` 中移除 SMTP 相关环境变量配置
- 从 `package.json` 中移除 `nodemailer` 依赖包

部署失败的通知将改用其他更轻量的方式(如日志文件),或让用户自行配置服务器级别的告警系统。

## Capabilities

### New Capabilities

无

### Modified Capabilities

无

注:这是移除功能而非修改现有能力,因此不需要创建或修改任何 spec 文件。部署脚本仍然可以正常工作,只是不再发送邮件通知。

## Impact

**受影响的文件:**
- `scripts/lib/mail.mjs` (将被删除)
- `scripts/lib/config.mjs` (移除 mail 配置项和环境变量处理)
- `scripts/lib/watch.mjs` (移除邮件通知调用)
- `scripts/lib/index.mjs` (移除 mail 模块导出)
- `.env.example` (移除 SMTP 配置示例)
- `package.json` (移除 nodemailer 依赖)

**API 变化:**
- `sendDeployNotification()` 函数将不再可用
- `createMailTransporter()` 函数将不再可用
- CONFIG.mail 配置对象将被移除

**向后兼容性:**
- 这是一个破坏性变更,依赖邮件通知的用户需要自行实现替代方案
- 建议用户使用服务器监控工具(如 Supervisor、systemd)配合日志文件实现告警

**依赖关系:**
- 移除 `nodemailer` npm 包,减少项目依赖数量
- 部署流程本身不受影响,只是移除了通知功能
