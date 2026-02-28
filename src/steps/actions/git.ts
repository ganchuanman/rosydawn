import { defineStep } from '../registry.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
