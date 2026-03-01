import type { Workflow } from '../workflow/types.js';
import { cleanDist, buildProject, optimizeAssets } from '../steps/builtin.js';

/**
 * 构建 Workflow
 *
 * 清理、构建并优化项目
 */
export const buildWorkflow: Workflow = {
  name: 'build',
  description: '构建项目',
  intent: 'build',
  params: {
    required: [],
    optional: ['buildCommand', 'distDir'],
  },
  steps: [
    // 1. Actions - 清理构建目录
    cleanDist,

    // 2. Actions - 构建项目
    buildProject,

    // 3. Processors - 优化资源
    optimizeAssets,
  ],
};
