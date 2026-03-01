import type { Workflow } from '../workflow/types.js';
import {
  checkGitChanges,
  buildProject,
  confirmDeploy,
  executeDeploy,
} from '../steps/builtin.js';

/**
 * 部署 Workflow
 *
 * 构建项目并部署到服务器
 */
export const deployWorkflow: Workflow = {
  name: 'deploy',
  description: '构建并部署到服务器',
  intent: 'deploy',
  params: {
    required: [],
    optional: ['buildCommand', 'deployConfig'],
  },
  steps: [
    // 1. Validators - 检查 Git 状态
    checkGitChanges,

    // 2. Actions - 构建项目
    buildProject,

    // 3. Notifier - 用户确认
    confirmDeploy,

    // 4. Actions - 执行部署
    executeDeploy,
  ],
};
