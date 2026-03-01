#!/usr/bin/env node

// 加载环境变量 (必须在其他 imports 之前)
import dotenv from 'dotenv';
dotenv.config();

import { registerAllWorkflows } from '../workflows/index.js';
import { registerBuiltinSteps } from '../steps/builtin.js';
import { executeWorkflow } from '../workflow/engine.js';
import { getWorkflowByName } from '../workflow/registry.js';
import { showGlobalHelp, showCommandHelp } from './help.js';
import { CommandRegistry } from './command-registry.js';
import { setupCommands, getRegisteredWorkflows } from './command-setup.js';
import { parseCommandArgs, showParamErrors } from './param-parser.js';
import type { Workflow } from '../workflow/types.js';

// 初始化 CommandRegistry
const registry = new CommandRegistry();
setupCommands(registry);

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

  // 注册 Steps 和 Workflows
  registerBuiltinSteps();
  registerAllWorkflows();

  // 验证命令映射完整性
  const warnings = registry.validateCompleteness(getRegisteredWorkflows());
  if (warnings.length > 0) {
    console.warn('⚠️  命令映射警告:');
    warnings.forEach(w => console.warn(`   ${w}`));
  }

  // 检查无参数 - 显示全局帮助
  if (args.length === 0) {
    showGlobalHelp(registry);
    process.exit(0);
  }

  // 提取命令和参数
  let commandInput = args[0];
  let commandArgs = args.slice(1);

  // 检查是否是多词命令 (如 "content new")
  if (args.length > 1 && !args[1].startsWith('-')) {
    commandInput = `${args[0]} ${args[1]}`;
    commandArgs = args.slice(2);
  }

  // 检查全局帮助标志
  if ((args[0] === '--help' || args[0] === '-h') && args.length === 1) {
    showGlobalHelp(registry);
    process.exit(0);
  }

  // 检查命令帮助请求
  if (commandArgs.includes('--help') || commandArgs.includes('-h')) {
    showCommandHelp(registry, commandInput);
    process.exit(0);
  }

  // 解析命令
  const config = registry.resolve(commandInput);
  if (!config) {
    console.error(`❌ 未知命令: ${commandInput}`);
    console.error('');
    console.error('运行 "rosydawn --help" 查看所有可用命令');
    process.exit(1);
  }

  // 解析参数
  const { params, errors } = parseCommandArgs(commandArgs, config);

  // 显示参数错误
  if (errors.length > 0) {
    showParamErrors(errors, config);
    process.exit(1);
  }

  // 获取 Workflow
  const workflow = getWorkflowByName(config.workflow);
  if (!workflow) {
    console.error(`❌ Workflow 未找到: ${config.workflow}`);
    process.exit(1);
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
