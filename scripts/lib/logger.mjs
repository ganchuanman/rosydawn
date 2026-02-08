/**
 * ============================================
 * 日志模块 - 彩色终端输出
 * ============================================
 */

// ==================== 颜色定义 ====================

export const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

// ==================== 颜色工具 ====================

/**
 * 给文本添加颜色
 * @param {string} color - 颜色名称
 * @param {string} text - 文本内容
 */
export function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

// ==================== 日志函数 ====================

/**
 * 输出带级别的日志
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 */
function log(level, message) {
  const levelColors = {
    INFO: 'blue',
    SUCCESS: 'green',
    WARN: 'yellow',
    ERROR: 'red',
  };

  const coloredLevel = colorize(levelColors[level] || 'reset', `[${level}]`);
  console.log(`${coloredLevel} ${message}`);
}

// ==================== Logger 对象 ====================

export const logger = {
  info: (msg) => log('INFO', msg),
  success: (msg) => log('SUCCESS', msg),
  warn: (msg) => log('WARN', msg),
  error: (msg) => log('ERROR', msg),
};
