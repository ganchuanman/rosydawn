import type { Workflow } from '../workflow/types.js';
import { checkPort, startDevServer } from '../steps/builtin.js';

/**
 * 启动开发服务器 Workflow
 *
 * 检查端口可用性后启动开发服务器
 */
export const startDevWorkflow: Workflow = {
  name: 'start-dev',
  description: '启动本地开发服务器',
  intent: 'start_dev',
  params: {
    required: [],
    optional: ['port'],
  },
  steps: [
    // 1. Validators - 检查端口可用性
    checkPort,

    // 2. Actions - 启动开发服务器
    startDevServer,
  ],
};
