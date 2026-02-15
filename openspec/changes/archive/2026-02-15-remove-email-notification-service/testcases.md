# Test Cases

## 1. Test Strategy

本次变更主要是删除代码和配置,测试策略侧重于验证:

1. **回归测试**: 确保移除邮件通知后,部署脚本的核心功能仍然正常工作
2. **清理验证**: 确认所有邮件相关的代码、配置、依赖都已完全移除
3. **破坏性变更验证**: 验证没有遗留的邮件功能引用或配置

测试类型:
- **手动测试**: 验证部署脚本的完整流程
- **代码审查**: 确认所有邮件相关代码已移除
- **环境验证**: 确认配置文件和依赖已清理

## 2. Environment & Preconditions

- 测试环境具备 Git 仓库和 Node.js 环境
- 有可用的测试项目用于触发部署流程
- 备份当前代码,以便对比验证
- 确认 `.env` 文件中当前可能包含 SMTP 配置(用于验证清理效果)

## 3. Execution List

### TC-01: 验证邮件模块文件已删除
- **Target**: 验证 `scripts/lib/mail.mjs` 文件被完全删除
- **Type**: Manual
- **Preconditions**: 已完成代码变更
- **Steps**:
  1. 检查文件系统,确认 `scripts/lib/mail.mjs` 不存在
  2. 尝试访问该文件,确认返回"文件不存在"错误
- **Expected Result**: `scripts/lib/mail.mjs` 文件不存在

### TC-02: 验证 config.mjs 中邮件配置已移除
- **Target**: 验证 `CONFIG.mail` 配置对象及相关环境变量处理已删除
- **Type**: Manual
- **Preconditions**: 已完成代码变更
- **Steps**:
  1. 打开 `scripts/lib/config.mjs`
  2. 搜索 "mail"、"smtp"、"SMTP"、"NOTIFY_EMAIL" 等关键词
  3. 确认没有找到任何邮件相关的配置或环境变量处理
- **Expected Result**: `config.mjs` 中不存在任何邮件相关配置

### TC-03: 验证 watch.mjs 中邮件调用已移除
- **Target**: 验证 `sendDeployNotification` 导入和调用已删除
- **Type**: Manual
- **Preconditions**: 已完成代码变更
- **Steps**:
  1. 打开 `scripts/lib/watch.mjs`
  2. 搜索 "sendDeployNotification"、"mail"、"邮件" 等关键词
  3. 确认没有找到任何邮件相关的导入或函数调用
- **Expected Result**: `watch.mjs` 中不存在任何邮件相关代码

### TC-04: 验证 index.mjs 中邮件导出已移除
- **Target**: 验证 mail 模块的导出已删除
- **Type**: Manual
- **Preconditions**: 已完成代码变更
- **Steps**:
  1. 打开 `scripts/lib/index.mjs`
  2. 搜索 "mail"、"Mail"、"createMailTransporter"、"sendDeployNotification" 等关键词
  3. 确认没有找到任何邮件相关的导出
- **Expected Result**: `index.mjs` 中不存在邮件模块的导出

### TC-05: 验证 .env.example 中 SMTP 配置已移除
- **Target**: 验证 SMTP 相关环境变量示例已删除
- **Type**: Manual
- **Preconditions**: 已完成代码变更
- **Steps**:
  1. 打开 `.env.example`
  2. 搜索 "SMTP"、"smtp"、"MAIL"、"mail"、"NOTIFY" 等关键词
  3. 确认没有找到任何邮件相关的配置示例
- **Expected Result**: `.env.example` 中不存在 SMTP 配置

### TC-06: 验证 package.json 中 nodemailer 依赖已移除
- **Target**: 验证 `nodemailer` 包已从依赖中删除
- **Type**: Manual
- **Preconditions**: 已执行 `npm uninstall nodemailer`
- **Steps**:
  1. 打开 `package.json`
  2. 检查 `dependencies` 部分
  3. 确认 `nodemailer` 不在依赖列表中
  4. 检查 `package-lock.json`,确认 `nodemailer` 已被移除
- **Expected Result**: `package.json` 和 `package-lock.json` 中不存在 nodemailer

### TC-07: 验证部署脚本正常运行(部署成功场景)
- **Target**: 验证移除邮件通知后,部署脚本仍能正常完成部署
- **Type**: Manual
- **Preconditions**: 代码变更已完成,有新的提交可以部署
- **Steps**:
  1. 确保工作目录干净
  2. 运行 `npm run build`
  3. 检查构建是否成功
  4. 如有服务器环境,运行 `npm run deploy`
  5. 观察部署过程是否正常完成
- **Expected Result**: 构建和部署成功完成,没有邮件相关的错误

### TC-08: 验证部署脚本正常运行(部署失败场景)
- **Target**: 验证部署失败时不会尝试发送邮件
- **Type**: Edge Case
- **Preconditions**: 代码变更已完成
- **Steps**:
  1. 故意引入一个构建错误(如语法错误)
  2. 运行 `npm run build`
  3. 确认构建失败并显示错误信息
  4. 检查错误日志中没有邮件相关的错误
- **Expected Result**: 构建失败,错误信息正常显示,没有邮件相关错误

### TC-09: 验证日志记录功能仍然正常
- **Target**: 验证部署日志记录功能不受影响
- **Type**: Manual
- **Preconditions**: 代码变更已完成
- **Steps**:
  1. 运行一次部署(或模拟部署)
  2. 检查 `logs/deploy.log` 文件
  3. 确认日志正常记录部署过程
- **Expected Result**: 日志文件正常记录部署信息,内容完整

### TC-10: 验证代码中无邮件功能的残留引用
- **Target**: 确保整个项目中没有邮件功能的遗留引用
- **Type**: Manual
- **Preconditions**: 已完成代码变更
- **Steps**:
  1. 在项目根目录运行: `grep -r "nodemailer" --exclude-dir=node_modules --exclude-dir=.git`
  2. 在项目根目录运行: `grep -r "sendDeployNotification" --exclude-dir=node_modules --exclude-dir=.git`
  3. 在项目根目录运行: `grep -r "createMailTransporter" --exclude-dir=node_modules --exclude-dir=.git`
  4. 确认没有找到任何匹配结果(除了 openspec 变更文档中的引用)
- **Expected Result**: 项目代码中没有邮件功能的残留引用

### TC-11: 验证 npm install 正常执行
- **Target**: 验证移除 nodemailer 后,依赖安装仍然正常
- **Type**: Manual
- **Preconditions**: 已从 package.json 中移除 nodemailer
- **Steps**:
  1. 删除 `node_modules` 目录和 `package-lock.json`
  2. 运行 `npm install`
  3. 确认安装过程没有错误
  4. 确认 `node_modules` 中不存在 nodemailer 目录
- **Expected Result**: npm install 成功完成,没有安装 nodemailer

### TC-12: 验证环境变量不再影响脚本
- **Target**: 验证即使设置了 SMTP 环境变量,脚本也不会尝试发送邮件
- **Type**: Edge Case
- **Preconditions**: 代码变更已完成
- **Steps**:
  1. 在 `.env` 文件中设置 SMTP_USER 和 SMTP_PASS(如果存在)
  2. 运行部署脚本
  3. 确认脚本不读取这些环境变量,也不尝试发送邮件
- **Expected Result**: SMTP 环境变量被忽略,脚本正常运行
