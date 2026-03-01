/**
 * 参数解析和验证工具
 *
 * 负责解析命令行参数、类型转换和验证
 */

import type { CommandConfig, CommandOption } from './command-registry.js';

/**
 * 解析结果
 */
export interface ParsedParams {
  params: Record<string, any>;
  errors: string[];
}

/**
 * 参数别名映射
 */
const PARAM_ALIASES: Record<string, string> = {
  '-t': '--topic',
  '-c': '--category',
  '-s': '--slug',
};

/**
 * 解析命令行参数
 *
 * @param args - 命令行参数数组（不包含命令本身）
 * @param config - 命令配置（用于参数验证）
 * @returns 解析结果
 */
export function parseCommandArgs(
  args: string[],
  config?: CommandConfig
): ParsedParams {
  const params: Record<string, any> = {};
  const errors: string[] = [];
  let i = 0;

  // 解析参数
  while (i < args.length) {
    let arg = args[i];

    // 跳过 --help 和 -h
    if (arg === '--help' || arg === '-h') {
      i++;
      continue;
    }

    // 处理参数别名
    if (arg in PARAM_ALIASES) {
      arg = PARAM_ALIASES[arg];
    }

    if (arg.startsWith('--')) {
      // --key value 或 --key (布尔值)
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        // --key value
        params[key] = parseValue(nextArg);
        i += 2;
      } else {
        // --key (布尔值)
        params[key] = true;
        i += 1;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      // -k value 或 -k (布尔值)
      const key = arg.slice(1);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        params[key] = parseValue(nextArg);
        i += 2;
      } else {
        params[key] = true;
        i += 1;
      }
    } else {
      // 未知参数格式
      errors.push(`未知参数格式: ${arg}`);
      i += 1;
    }
  }

  // 如果提供了命令配置，进行验证和类型转换
  if (config) {
    const validationResult = validateAndTransform(params, config);
    return {
      params: validationResult.params,
      errors: [...errors, ...validationResult.errors]
    };
  }

  return { params, errors };
}

/**
 * 解析参数值（类型推断）
 */
function parseValue(value: string): any {
  // 布尔值
  if (value === 'true') return true;
  if (value === 'false') return false;

  // 数字
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;

  // 逗号分隔的数组
  if (value.includes(',')) {
    return value.split(',').map(v => v.trim());
  }

  // 字符串
  return value;
}

/**
 * 验证参数并转换类型
 */
function validateAndTransform(
  params: Record<string, any>,
  config: CommandConfig
): { params: Record<string, any>; errors: string[] } {
  const result: Record<string, any> = {};
  const errors: string[] = [];
  const options = config.options || [];

  // 创建选项映射
  const optionMap = new Map<string, CommandOption>();
  for (const option of options) {
    optionMap.set(option.name, option);
  }

  // 处理所有已提供的参数
  for (const [key, value] of Object.entries(params)) {
    const option = optionMap.get(key);

    if (!option) {
      // 未知参数（允许通过，但可以警告）
      result[key] = value;
      continue;
    }

    // 类型转换
    result[key] = transformType(value, option);
  }

  // 填充默认值
  for (const option of options) {
    if (!(option.name in result)) {
      if (option.default !== undefined) {
        result[option.name] = option.default;
      } else if (option.required) {
        errors.push(`缺少必填参数: --${option.name}`);
      }
    }
  }

  return { params: result, errors };
}

/**
 * 类型转换
 */
function transformType(value: any, option: CommandOption): any {
  // 如果已经是目标类型，直接返回
  if (typeof value === option.type) {
    return value;
  }

  // 根据目标类型转换
  switch (option.type) {
    case 'string':
      return String(value);

    case 'number':
      const num = Number(value);
      return isNaN(num) ? 0 : num;

    case 'boolean':
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
      }
      return Boolean(value);

    default:
      return value;
  }
}

/**
 * 显示参数错误和用法
 */
export function showParamErrors(errors: string[], config: CommandConfig): void {
  console.error('\n参数错误:\n');
  errors.forEach(error => {
    console.error(`  ❌ ${error}`);
  });

  console.error(`\n用法: rosydawn ${config.command} [options]\n`);

  if (config.options && config.options.length > 0) {
    console.error('Options:\n');
    config.options.forEach(opt => {
      const required = opt.required ? ' (必填)' : '';
      const defaultVal = opt.default !== undefined ? ` [默认: ${opt.default}]` : '';
      console.error(`  --${opt.name.padEnd(15)} ${opt.description}${required}${defaultVal}`);
    });
  }

  console.error('');
}
