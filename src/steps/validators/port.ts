import { defineStep } from '../registry.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { confirm, input } from '@inquirer/prompts';

const execAsync = promisify(exec);

/**
 * 检查端口
 *
 * 检测端口是否可用，如果被占用则提示用户选择其他端口
 */
export const checkPort = defineStep({
  type: 'validator',
  name: 'checkPort',
  description: '检查端口是否可用',
  execute: async (ctx) => {
    let port = ctx.params.port || 4321;

    try {
      // 检查端口是否被占用
      const { stdout } = await execAsync(`lsof -i :${port}`);
      const isOccupied = stdout.trim().length > 0;

      if (!isOccupied) {
        return {
          success: true,
          port,
          available: true,
        };
      }

      // 端口被占用，询问用户
      console.log(`⚠️  端口 ${port} 已被占用`);

      // 如果是命令行模式，自动尝试下一个端口
      if (ctx.mode === 'cli') {
        const newPort = port + 1;
        console.log(`尝试使用端口 ${newPort}...`);
        return {
          success: true,
          port: newPort,
          available: true,
          originalPort: port,
        };
      }

      // REPL 模式下询问用户
      const useDifferentPort = await confirm({
        message: '是否使用其他端口？',
        default: true,
      });

      if (!useDifferentPort) {
        return {
          success: false,
          message: `端口 ${port} 已被占用，操作取消`,
        };
      }

      // 让用户输入新端口
      const newPortStr = await input({
        message: '请输入新的端口号:',
        default: String(port + 1),
        validate: (value) => {
          const num = parseInt(value);
          if (isNaN(num) || num < 1 || num > 65535) {
            return '请输入有效的端口号 (1-65535)';
          }
          return true;
        },
      });

      const newPort = parseInt(newPortStr);

      // 检查新端口
      const { stdout: checkNew } = await execAsync(`lsof -i :${newPort}`);
      if (checkNew.trim().length > 0) {
        return {
          success: false,
          message: `端口 ${newPort} 也被占用`,
        };
      }

      return {
        success: true,
        port: newPort,
        available: true,
        originalPort: port,
      };
    } catch (error) {
      // lsof 命令失败通常意味着端口未被占用
      return {
        success: true,
        port,
        available: true,
      };
    }
  },
});
