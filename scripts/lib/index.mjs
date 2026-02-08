/**
 * ============================================
 * 模块统一导出
 * ============================================
 */

// 配置
export { CONFIG, PROJECT_ROOT } from './config.mjs';

// 日志
export { logger, colorize, colors } from './logger.mjs';

// 工具函数
export { 
  getProjectDir,
  execStream,
  commandExists,
  getNodeMajorVersion,
  getUserGroup,
  countFiles,
  getDirSize,
  formatSize,
  checkEnvironment,
} from './utils.mjs';

// SSL 管理
export {
  checkSSLCertificate,
  getSSLCertificateInfo,
  checkCertbot,
  showCertbotInstallGuide,
  obtainSSLCertificate,
  renewSSLCertificate,
  setupAutoRenewal,
  showSSLStatus,
} from './ssl.mjs';

// Nginx 管理
export {
  getNginxPaths,
  getExistingNginxConfigPath,
  generateNginxConfigHTTP,
  generateNginxConfigHTTPS,
  generateNginxConfig,
  setupNginx,
  showNginxStatus,
  showSSLStatusInNginx,
} from './nginx.mjs';

// 邮件通知
export {
  createMailTransporter,
  sendDeployNotification,
} from './mail.mjs';

// 自动部署监控
export {
  writeLog,
  getLocalCommitHash,
  getRemoteCommitHash,
  getCommitInfo,
  pullLatestCode,
  checkAndDeploy,
  startWatch,
} from './watch.mjs';
