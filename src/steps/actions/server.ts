import { defineStep } from '../registry.js';
import { spawn } from 'child_process';

/**
 * 启动开发服务器
 *
 * 启动本地开发服务器
 */
export const startDevServer = defineStep({
  type: 'action',
  name: 'startDevServer',
  description: '启动本地开发服务器',
  execute: async (ctx) => {
    const port = ctx.params.port || 4321;
    const command = ctx.params.command || 'npm run dev';

    try {
      // 在后台启动服务器
      const serverProcess = spawn(command, [], {
        shell: true,
        detached: true,
        stdio: 'ignore',
      });

      // 让子进程在父进程退出后继续运行
      serverProcess.unref();

      // 等待一下让服务器启动
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const url = `http://localhost:${port}`;

      return {
        success: true,
        started: true,
        url,
        pid: serverProcess.pid,
      };
    } catch (error) {
      throw new Error(
        `启动开发服务器失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
