import { defineStep } from '../registry.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Git 添加文件到暂存区
 *
 * 将文件添加到 Git 暂存区
 */
export const gitAdd = defineStep({
  type: 'action',
  name: 'gitAdd',
  description: '将文件添加到 Git 暂存区',
  execute: async (ctx) => {
    const filePath = ctx.params.filePath || ctx.steps.createFile?.filePath;

    if (!filePath) {
      throw new Error('缺少文件路径参数');
    }

    try {
      await execAsync(`git add "${filePath}"`);

      console.log(`已添加到 Git: ${filePath}`);

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      // Git add 失败不中断流程，仅警告
      console.warn(`⚠️  警告: Git add 失败，请手动添加文件 ${filePath}`);
      console.warn(`    错误: ${error instanceof Error ? error.message : String(error)}`);

      return {
        success: false,
        filePath,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

/**
 * Git 提交和推送
 *
 * 执行 git add、commit、push 操作
 */
export const commitAndPush = defineStep({
  type: 'action',
  name: 'commitAndPush',
  description: '执行 Git 提交和推送',
  execute: async (ctx) => {
    const files = ctx.params.files || '.';
    const message = ctx.params.message || 'Update content';

    try {
      // git add
      await execAsync(`git add ${files}`);

      // git commit
      await execAsync(`git commit -m "${message}"`);

      // git push
      await execAsync('git push');

      return {
        success: true,
        committed: true,
        pushed: true,
        message,
      };
    } catch (error) {
      throw new Error(
        `Git 提交推送失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
