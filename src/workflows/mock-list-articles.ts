import type { Workflow } from '../workflow/types.js';

/**
 * Mock 列出文章 Workflow
 *
 * 用于测试 REPL 和 AI 意图识别功能，不执行真实操作
 */
export const mockListArticlesWorkflow: Workflow = {
  name: 'mock-list-articles',
  description: '[Mock] 列出所有文章（仅用于测试，不执行真实操作）',
  intent: 'mock_list_articles',
  params: {
    optional: ['category', 'limit']
  },
  steps: [
    {
      type: 'processor',
      name: 'prepare-params',
      description: '准备参数',
      execute: async (context) => {
        const { category, limit } = context.params;
        return {
          category: category || 'all',
          limit: limit || 10
        };
      }
    },
    {
      type: 'action',
      name: 'mock-list',
      description: 'Mock 列出文章',
      execute: async (context) => {
        const { category, limit } = context.steps['prepare-params'];

        console.log('\n✅ Mock Workflow 执行结果:');
        console.log(`   Intent: mock_list_articles`);
        console.log(`   参数: { category: "${category}", limit: ${limit} }`);
        console.log('   结果: [] (空列表)');
        console.log('   (当前为 Mock Workflow，未执行真实操作)\n');

        return {
          success: true,
          articles: [],
          message: `Mock: 找到 0 篇文章 (category: ${category}, limit: ${limit})`
        };
      }
    }
  ]
};
