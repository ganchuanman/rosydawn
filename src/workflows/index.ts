import { registerWorkflow } from '../workflow/registry.js';
import { mockCreateArticleWorkflow } from './mock-create-article.js';
import { mockListArticlesWorkflow } from './mock-list-articles.js';
import { mockPublishWorkflow } from './mock-publish.js';

/**
 * 注册所有 Mock Workflows
 *
 * 在 REPL 启动时调用此函数，注册测试用的 Mock Workflows
 */
export function registerMockWorkflows(): void {
  registerWorkflow(mockCreateArticleWorkflow);
  registerWorkflow(mockListArticlesWorkflow);
  registerWorkflow(mockPublishWorkflow);

  console.log('✅ 已注册 3 个 Mock Workflows');
}

/**
 * 导出所有 Mock Workflows 供测试使用
 */
export {
  mockCreateArticleWorkflow,
  mockListArticlesWorkflow,
  mockPublishWorkflow
};
