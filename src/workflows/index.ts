import { registerWorkflow } from '../workflow/registry.js';
import { createArticleWorkflow } from './create-article.js';
import { mockListArticlesWorkflow } from './mock-list-articles.js';
import { mockPublishWorkflow } from './mock-publish.js';

/**
 * 注册所有 Workflows
 *
 * 在 REPL 启动时调用此函数，注册所有 Workflows
 */
export function registerAllWorkflows(): void {
  // 注册真实的 Workflows
  registerWorkflow(createArticleWorkflow);

  // 注册 Mock Workflows（用于测试）
  registerWorkflow(mockListArticlesWorkflow);
  registerWorkflow(mockPublishWorkflow);

  console.log('✅ 已注册 3 个 Workflows (1 real, 2 mock)');
}

/**
 * 导出所有 Workflows 供测试使用
 */
export {
  createArticleWorkflow,
  mockListArticlesWorkflow,
  mockPublishWorkflow
};
