#!/usr/bin/env node

// 加载环境变量 (必须在其他 imports 之前)
import dotenv from 'dotenv';
dotenv.config();

import { registerAllWorkflows } from '../workflows/index.js';
import { registerBuiltinSteps } from '../steps/builtin.js';
import { executeWorkflow } from '../workflow/engine.js';
import { getWorkflowByName } from '../workflow/registry.js';
import { showHelp } from './help.js';
import type { Workflow } from '../workflow/types.js';

/**
 * 命令到 Workflow 的映射表
 */
const COMMAND_WORKFLOW_MAP: Record<string, string> = {
  'content new': 'create-article',
  // 后续添加更多命令...
};

/**
 * 参数别名映射
 */
const PARAM_ALIASES: Record<string, string> = {
  '-t': '--topic',
  '-c': '--category',
};

/**
 * 解析命令行参数
 *
 * @param args - 命令行参数数组（不包含 node 和脚本路径）
 * @returns 解析结果 { command, params }
 */
function parseArgs(args: string[]): { command: string; params: Record<string, any> } {
  if (args.length === 0) {
    return { command: '', params: {} };
  }

  // 第一个参数是命令
  let command = args[0];
  const params: Record<string, any> = {};
  let i = 1;

  // 检查是否是多词命令 (如 "content new")
  if (args.length > 1 && !args[1].startsWith('-')) {
    command = `${args[0]} ${args[1]}`;
    i = 2;
  }

  // 解析参数
  while (i < args.length) {
    let arg = args[i];

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
    } else if (arg.startsWith('-')) {
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
      // 位置参数（暂不支持）
      i += 1;
    }
  }

  return { command, params };
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
  if (!isNaN(num)) return num;

  // 逗号分隔的数组
  if (value.includes(',')) {
    return value.split(',').map(v => v.trim());
  }

  // 字符串
  return value;
}

/**
 * 验证必填参数
 */
function validateRequiredParams(
  params: Record<string, any>,
  required: string[]
): { valid: boolean; missing: string[] } {
  const missing = required.filter(key => !(key in params) || params[key] === undefined);
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * 显示用法提示
 */
function showUsage(command: string, workflow: Workflow): void {
  console.log(`\nUsage: rosydawn ${command} [options]\n`);
  console.log(`Description: ${workflow.description || 'No description'}\n`);

  if (workflow.params?.required && workflow.params.required.length > 0) {
    console.log('Required options:');
    workflow.params.required.forEach(param => {
      console.log(`  --${param} <value>`);
    });
    console.log('');
  }

  if (workflow.params?.optional && workflow.params.optional.length > 0) {
    console.log('Optional options:');
    workflow.params.optional.forEach(param => {
      console.log(`  --${param} <value>`);
    });
    console.log('');
  }
}

/**
 * CLI 主入口
 */
async function main(): Promise<void> {
  // 获取命令行参数（排除 node 和脚本路径）
  const args = process.argv.slice(2);

  // 检查帮助标志
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    showHelp();
    process.exit(0);
  }

  // 注册 Steps 和 Workflows
  registerBuiltinSteps();
  registerAllWorkflows();

  // 解析参数
  const { command, params } = parseArgs(args);

  // 检查命令是否存在
  if (!command) {
    console.error('Error: No command specified');
    console.log('\nRun "rosydawn --help" for usage information');
    process.exit(1);
  }

  // 查找对应的 Workflow
  const workflowName = COMMAND_WORKFLOW_MAP[command];
  if (!workflowName) {
    console.error(`Error: Unknown command '${command}'`);
    console.log('\nAvailable commands:');
    Object.keys(COMMAND_WORKFLOW_MAP).forEach(cmd => {
      console.log(`  ${cmd}`);
    });
    process.exit(1);
  }

  // 获取 Workflow
  const workflow = getWorkflowByName(workflowName);
  if (!workflow) {
    console.error(`Error: Workflow '${workflowName}' not found`);
    process.exit(1);
  }

  // 验证必填参数
  if (workflow.params?.required) {
    const validation = validateRequiredParams(params, workflow.params.required);
    if (!validation.valid) {
      console.error(`Error: Missing required argument: ${validation.missing[0]}`);
      showUsage(command, workflow);
      process.exit(1);
    }
  }

  // 执行 Workflow
  try {
    // 设置执行模式为 CLI
    const metadata = { mode: 'cli' as const };
    await executeWorkflow(workflow, params, metadata);
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// 启动 CLI
main().catch((error) => {
  console.error('❌ CLI 启动失败:', error);
  process.exit(1);
});
