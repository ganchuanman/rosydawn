/**
 * 输入验证和清理工具
 *
 * 用于处理用户输入的边缘情况，防止注入攻击和异常输入
 */

/**
 * 输入验证结果
 */
export interface ValidationResult {
  valid: boolean;
  sanitized: string;
  error?: string;
}

/**
 * 输入验证配置
 */
const CONFIG = {
  maxLength: 1000, // 最大输入长度
  minLength: 1, // 最小输入长度
  forbiddenPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script 标签
    /javascript:/gi, // JavaScript 协议
    /on\w+\s*=/gi, // 事件处理器
  ]
};

/**
 * 验证和清理用户输入
 */
export function validateAndSanitizeInput(input: string): ValidationResult {
  // 检查空输入
  if (!input || input.trim().length === 0) {
    return {
      valid: false,
      sanitized: '',
      error: '输入不能为空'
    };
  }

  // 检查最小长度
  if (input.trim().length < CONFIG.minLength) {
    return {
      valid: false,
      sanitized: '',
      error: `输入太短，最少需要 ${CONFIG.minLength} 个字符`
    };
  }

  // 检查最大长度
  if (input.length > CONFIG.maxLength) {
    return {
      valid: false,
      sanitized: '',
      error: `输入太长，最多允许 ${CONFIG.maxLength} 个字符 (当前: ${input.length})`
    };
  }

  // 检查禁止的模式
  for (const pattern of CONFIG.forbiddenPatterns) {
    if (pattern.test(input)) {
      return {
        valid: false,
        sanitized: '',
        error: '输入包含不允许的内容'
      };
    }
  }

  // 清理输入
  const sanitized = sanitizeInput(input);

  return {
    valid: true,
    sanitized
  };
}

/**
 * 清理输入（移除潜在危险内容）
 */
function sanitizeInput(input: string): string {
  let sanitized = input;

  // 移除控制字符（保留换行和制表符）
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 标准化空白字符
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // 移除潜在的 HTML 标签
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // 转义特殊字符（防止注入）
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return sanitized;
}

/**
 * 验证参数值
 */
export function validateParamValue(value: any, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string' && value.length > 0;

    case 'number':
      const num = Number(value);
      return !isNaN(num) && isFinite(num);

    case 'boolean':
      return (
        value === true ||
        value === false ||
        value === 'true' ||
        value === 'false' ||
        value === 1 ||
        value === 0
      );

    case 'array':
      return Array.isArray(value);

    default:
      return true;
  }
}

/**
 * 检测可疑输入模式
 */
export function detectSuspiciousPatterns(input: string): string[] {
  const warnings: string[] = [];

  // 检测超长重复字符
  if (/(.)\1{10,}/.test(input)) {
    warnings.push('检测到重复字符模式');
  }

  // 检测大量特殊字符
  const specialCharCount = (input.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  if (specialCharCount > input.length * 0.5) {
    warnings.push('输入包含大量特殊字符');
  }

  // 检测潜在的 SQL 注入模式
  if (/('|")\s*(OR|AND)\s*('|")/i.test(input)) {
    warnings.push('检测到潜在的注入模式');
  }

  return warnings;
}
