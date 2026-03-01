import { defineStep } from '../registry.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 构建项目
 *
 * 执行 npm run build 构建项目
 */
export const buildProject = defineStep({
  type: 'action',
  name: 'buildProject',
  description: '构建项目（执行 npm run build）',
  execute: async (ctx) => {
    const buildCommand = ctx.params.buildCommand || 'npm run build';

    console.log('🔨 开始构建项目...');

    try {
      const { stdout, stderr } = await execAsync(buildCommand, {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      // 输出构建日志
      if (stdout) {
        console.log(stdout);
      }

      return {
        success: true,
        outputDir: 'dist',
        buildCommand,
        stdout,
        stderr,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // 构建失败，抛出异常
      throw new Error(`构建失败: ${errorMessage}`);
    }
  },
});
