import { input } from '@inquirer/prompts';
import type { ParamSchema } from '../knowledge/types.js';

/**
 * 收集缺失的参数
 */
export async function collectMissingParams(
  missingParams: string[],
  paramSchemas?: ParamSchema[]
): Promise<Record<string, any>> {
  const collected: Record<string, any> = {};

  // 如果没有参数 Schema，使用简单文本收集
  if (!paramSchemas || paramSchemas.length === 0) {
    for (const paramName of missingParams) {
      const value = await input({
        message: `📝 请输入 ${paramName}:`,
        validate: (input) => {
          if (!input.trim()) {
            return `${paramName} 不能为空`;
          }
          return true;
        }
      });

      // 检查取消操作
      if (value.toLowerCase() === 'cancel' || value === '取消') {
        throw new Error('USER_CANCELLED');
      }

      collected[paramName] = value.trim();
    }
    return collected;
  }

  // 使用参数 Schema 进行更智能的收集
  for (const paramName of missingParams) {
    const schema = paramSchemas.find((p) => p.name === paramName);

    if (!schema) {
      // 如果找不到 Schema，使用默认收集
      const value = await input({
        message: `📝 请输入 ${paramName}:`
      });

      if (value.toLowerCase() === 'cancel' || value === '取消') {
        throw new Error('USER_CANCELLED');
      }

      collected[paramName] = value.trim();
      continue;
    }

    // 使用 Schema 信息生成更好的提示
    const message = generateParamPrompt(schema);
    const value = await input({
      message,
      default: schema.default?.toString(),
      validate: (input) => validateParam(input, schema)
    });

    if (value.toLowerCase() === 'cancel' || value === '取消') {
      throw new Error('USER_CANCELLED');
    }

    // 类型转换
    collected[paramName] = convertParamType(value, schema.type);
  }

  return collected;
}

/**
 * 生成参数提示
 */
function generateParamPrompt(schema: ParamSchema): string {
  let prompt = `📝 请输入 ${schema.name}`;

  if (schema.description) {
    prompt += ` (${schema.description})`;
  }

  if (schema.default !== undefined) {
    prompt += ` [默认: ${schema.default}]`;
  }

  prompt += ':';

  return prompt;
}

/**
 * 验证参数
 */
function validateParam(input: string, schema: ParamSchema): boolean | string {
  // 检查空值
  if (schema.required && !input.trim()) {
    return `${schema.name} 是必需参数，不能为空`;
  }

  // 允许取消
  if (input.toLowerCase() === 'cancel' || input === '取消') {
    return true;
  }

  // 类型验证
  switch (schema.type) {
    case 'number': {
      const num = Number(input);
      if (isNaN(num)) {
        return `${schema.name} 必须是数字`;
      }
      break;
    }
    case 'boolean': {
      const validValues = ['true', 'false', '1', '0', 'yes', 'no', '是', '否'];
      if (!validValues.includes(input.toLowerCase())) {
        return `${schema.name} 必须是布尔值 (true/false)`;
      }
      break;
    }
    case 'array': {
      // 数组类型允许自由输入，后续处理时分割
      break;
    }
    // string 和其他类型不需要额外验证
  }

  return true;
}

/**
 * 转换参数类型
 */
function convertParamType(value: string, type: string): any {
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean': {
      const truthyValues = ['true', '1', 'yes', '是'];
      return truthyValues.includes(value.toLowerCase());
    }
    case 'array':
      // 支持逗号分隔的数组
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item);
    case 'object':
      // 尝试解析 JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    case 'string':
    default:
      return value;
  }
}
