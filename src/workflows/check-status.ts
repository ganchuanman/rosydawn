import type { Workflow } from '../workflow/types.js';
import {
  checkGitChanges,
  checkArticleStats,
  checkDeploymentStatus,
} from '../steps/builtin.js';

/**
 * 检查状态 Workflow
 *
 * 显示 Git 状态、文章统计和部署状态
 */
export const checkStatusWorkflow: Workflow = {
  name: 'check-status',
  description: '检查项目状态',
  intent: 'check_status',
  params: {
    required: [],
    optional: ['contentDir'],
  },
  steps: [
    // 1. Validators - 检查 Git 状态
    checkGitChanges,

    // 2. Validators - 检查文章统计
    checkArticleStats,

    // 3. Validators - 检查部署状态
    checkDeploymentStatus,
  ],
};
