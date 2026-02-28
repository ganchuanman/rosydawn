import { defineStep } from '../registry.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * 编辑确认
 *
 * 打开编辑器让用户确认/修改生成的元数据
 */
export const editConfirm = defineStep({
  type: 'notifier',
  name: 'editConfirm',
  description: '打开编辑器让用户确认/修改生成的元数据',
  execute: async (ctx) => {
    const filePath = ctx.params.filePath || ctx.steps.createFile?.filePath;

    if (!filePath) {
      console.warn('编辑确认: 缺少文件路径,跳过编辑步骤');
      return {
        edited: false,
        reason: 'No file path provided',
      };
    }

    try {
      // 获取编辑器命令
      const editor =
        process.env.EDITOR ||
        process.env.VISUAL ||
        'code'; // 默认使用 VS Code

      // 打开编辑器
      console.log(`正在打开编辑器: ${editor} ${filePath}`);

      // 注意: 这里使用同步方式等待编辑器关闭
      // 在实际 REPL 实现中,可能需要异步处理
      await execAsync(`${editor} "${filePath}"`);

      return {
        edited: true,
        filePath,
        editor,
      };
    } catch (error) {
      // Notifier 失败不中断流程
      console.error('打开编辑器失败:', error);
      return {
        edited: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
