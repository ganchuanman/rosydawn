/**
 * 错误处理与降级
 */

/**
 * 错误级别
 */
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * 错误处理结果
 */
export interface HandleErrorResult {
  level: ErrorLevel;
  message: string;
  suggestion?: string;
  shouldExit?: boolean;
}

/**
 * 分级错误处理
 */
export function handleError(error: any): HandleErrorResult {
  // AI 超时错误
  if (isTimeoutError(error)) {
    return {
      level: ErrorLevel.WARNING,
      message: '⏱️  AI 服务响应超时',
      suggestion: '请稍后重试，或切换到手动模式'
    };
  }

  // AI 认证失败
  if (isAuthError(error)) {
    return {
      level: ErrorLevel.ERROR,
      message: '🔐 AI 服务认证失败',
      suggestion: '请检查 OPENAI_API_KEY 环境变量是否正确配置'
    };
  }

  // AI 服务不可用
  if (isServiceUnavailableError(error)) {
    return {
      level: ErrorLevel.WARNING,
      message: '🚫 AI 服务暂时不可用',
      suggestion: '可以使用传统命令行模式，或稍后重试'
    };
  }

  // 响应格式错误
  if (isResponseFormatError(error)) {
    return {
      level: ErrorLevel.INFO,
      message: '❓ 无法理解 AI 的响应格式',
      suggestion: '请换一种表达方式，或提供更明确的指令'
    };
  }

  // 用户取消操作
  if (isUserCancelled(error)) {
    return {
      level: ErrorLevel.INFO,
      message: '✋ 操作已取消'
    };
  }

  // 未知错误
  return {
    level: ErrorLevel.ERROR,
    message: `❌ 发生错误: ${error.message || error}`,
    suggestion: '如果问题持续，请检查日志或联系支持'
  };
}

/**
 * 判断是否为超时错误
 */
function isTimeoutError(error: any): boolean {
  return (
    error.code === 'ETIMEDOUT' ||
    error.code === 'ESOCKETTIMEDOUT' ||
    error.message?.includes('timeout') ||
    error.message?.includes('超时')
  );
}

/**
 * 判断是否为认证错误
 */
function isAuthError(error: any): boolean {
  return (
    error.status === 401 ||
    error.code === 401 ||
    error.message?.includes('API key') ||
    error.message?.includes('authentication') ||
    error.message?.includes('认证')
  );
}

/**
 * 判断是否为服务不可用错误
 */
function isServiceUnavailableError(error: any): boolean {
  return (
    error.status === 503 ||
    error.code === 503 ||
    error.message?.includes('unavailable') ||
    error.message?.includes('service unavailable') ||
    error.message?.includes('不可用')
  );
}

/**
 * 判断是否为响应格式错误
 */
function isResponseFormatError(error: any): boolean {
  return (
    error.message?.includes('parse') ||
    error.message?.includes('JSON') ||
    error.message?.includes('format') ||
    error.message?.includes('解析失败')
  );
}

/**
 * 判断是否为用户取消
 */
function isUserCancelled(error: any): boolean {
  return (
    error.message === 'USER_CANCELLED' ||
    error.message?.includes('cancel') ||
    error.message?.includes('取消')
  );
}

/**
 * 显示错误信息
 */
export function showError(result: HandleErrorResult): void {
  console.log('');

  switch (result.level) {
    case ErrorLevel.INFO:
      console.log(result.message);
      break;
    case ErrorLevel.WARNING:
      console.log('⚠️ ', result.message);
      break;
    case ErrorLevel.ERROR:
      console.log('❌', result.message);
      break;
    case ErrorLevel.FATAL:
      console.log('💥', result.message);
      break;
  }

  if (result.suggestion) {
    console.log('💡', result.suggestion);
  }

  console.log('');
}
