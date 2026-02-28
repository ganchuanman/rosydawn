import { defineStep } from '../registry.js';

/**
 * 确认创建
 *
 * 显示即将创建的文章信息,请求用户确认
 */
export const confirmCreation = defineStep({
  type: 'notifier',
  name: 'confirmCreation',
  description: '显示即将创建的文章信息,请求用户确认',
  execute: async (ctx) => {
    const metadata = ctx.steps.generateMetadata;
    const filePath = ctx.params.filePath || ctx.steps.createFile?.filePath;

    // 显示信息
    console.log('\n=== 即将创建新文章 ===');
    if (metadata) {
      console.log(`标题: ${metadata.title}`);
      console.log(`描述: ${metadata.description}`);
      console.log(`标签: ${metadata.tags.join(', ')}`);
    }
    if (filePath) {
      console.log(`文件路径: ${filePath}`);
    }
    console.log('========================\n');

    // 注意: 实际的用户确认逻辑需要在 REPL 层实现
    // 这里只是显示信息,不会中断流程
    // 如果需要用户确认,可以在上下文中设置标记

    return {
      displayed: true,
      needsConfirmation: ctx.params.requireConfirmation !== false,
    };
  },
});
