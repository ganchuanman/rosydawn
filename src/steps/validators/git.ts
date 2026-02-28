import { defineStep } from '../registry.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 检查 Git 变更
 *
 * @returns 变更文件列表或抛出错误
 */
export const checkGitChanges = defineStep({
  type: 'validator',
  name: 'checkGitChanges',
  description: '检查是否存在未提交的 Git 变更',
  execute: async (ctx) => {
    try {
      const { stdout } = await execAsync('git status --porcelain');

      if (!stdout || stdout.trim() === '') {
        throw new Error('没有找到未提交的 Git 变更');
      }

      const changes = stdout
        .trim()
        .split('\n')
        .map((line) => line.trim());

      return {
        hasChanges: true,
        changes,
        changeCount: changes.length,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not a git repository')) {
        throw new Error('当前目录不是 Git 仓库');
      }
      throw error;
    }
  },
});
