## 1. 代码清理

- [x] 1.1 删除 `scripts/lib/mail.mjs` 文件
- [x] 1.2 从 `scripts/lib/config.mjs` 中移除 `CONFIG.mail` 配置对象
- [x] 1.3 从 `scripts/lib/config.mjs` 中移除 SMTP 相关环境变量处理逻辑
- [x] 1.4 从 `scripts/lib/watch.mjs` 中移除 `sendDeployNotification` 导入语句
- [x] 1.5 从 `scripts/lib/watch.mjs` 中移除所有 `sendDeployNotification()` 函数调用
- [x] 1.6 从 `scripts/lib/watch.mjs` 中移除邮件配置检查逻辑
- [x] 1.7 从 `scripts/lib/index.mjs` 中移除 mail 模块的导出

## 2. 配置文件清理

- [x] 2.1 从 `.env.example` 中移除 SMTP 服务器配置部分
- [x] 2.2 从 `.env.example` 中移除邮件通知配置部分
- [x] 2.3 从 `.env.example` 中移除监控配置中的邮件相关说明

## 3. 依赖清理

- [x] 3.1 运行 `npm uninstall nodemailer` 移除依赖包
- [x] 3.2 验证 `package.json` 中 nodemailer 已被移除
- [x] 3.3 验证 `package-lock.json` 中 nodemailer 已被移除

## 4. 测试验证

- [x] 4.1 验证所有邮件相关文件已删除(TC-01)
- [x] 4.2 验证所有邮件相关配置已清理(TC-02, TC-05)
- [x] 4.3 验证所有邮件相关代码已移除(TC-03, TC-04)
- [x] 4.4 验证依赖清理完成(TC-06, TC-11)
- [x] 4.5 运行 `npm run build` 验证构建正常(TC-07)
- [x] 4.6 验证构建失败时不出现邮件相关错误(TC-08)
- [x] 4.7 验证日志记录功能正常(TC-09)
- [x] 4.8 验证项目中无邮件功能残留引用(TC-10)
- [x] 4.9 验证环境变量不再影响脚本(TC-12)
- [x] 4.10 验证 `npm install` 正常执行(TC-11)

## 5. 文档更新

- [x] 5.1 更新 README.md,移除邮件配置相关说明
- [x] 5.2 在 README.md 中添加部署监控的替代方案建议
- [x] 5.3 更新 CHANGELOG.md,记录破坏性变更
- [x] 5.4 如有必要,更新其他相关文档

## 6. 最终验证

- [x] 6.1 在干净环境中运行 `npm install`,确认无错误
- [x] 6.2 运行完整的构建流程,确认成功
- [x] 6.3 检查是否有遗漏的邮件相关内容
- [x] 6.4 确认所有测试用例通过
