import { defineStep } from '../registry.js';
import { confirm } from '@inquirer/prompts';

/**
 * 确认部署
 *
 * 在部署前向用户确认
 */
export const confirmDeploy = defineStep({
  type: 'notifier',
  name: 'confirmDeploy',
  description: '确认部署操作',
  execute: async (ctx) => {
    // 如果是命令行模式，自动确认
    if (ctx.mode === 'cli') {
      console.log('准备部署到服务器...');
      return { confirmed: true };
    }

    // REPL 模式下询问确认
    const confirmed = await confirm({
      message: '确认要部署到服务器吗？',
      default: true,
    });

    if (!confirmed) {
      throw new Error('用户取消部署');
    }

    return { confirmed: true };
  },
});
