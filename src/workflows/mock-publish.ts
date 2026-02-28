import type { Workflow } from '../workflow/types.js';

/**
 * Mock 发布文章 Workflow
 *
 * 用于测试 REPL 和 AI 意图识别功能，不执行真实操作
 */
export const mockPublishWorkflow: Workflow = {
  name: 'mock-publish',
  description: '[Mock] 发布文章（仅用于测试，不执行真实操作）',
  intent: 'mock_publish',
  params: {
    required: ['articleId'],
    optional: ['platform']
  },
  steps: [
    {
      type: 'processor',
      name: 'prepare-params',
      description: '准备参数',
      execute: async (context) => {
        const { articleId, platform } = context.params;
        return {
          articleId,
          platform: platform || 'blog'
        };
      }
    },
    {
      type: 'action',
      name: 'mock-publish',
      description: 'Mock 发布文章',
      execute: async (context) => {
        const { articleId, platform } = context.steps['prepare-params'];

        console.log('\n✅ Mock Workflow 执行结果:');
        console.log(`   Intent: mock_publish`);
        console.log(`   参数: { articleId: "${articleId}", platform: "${platform}" }`);
        console.log('   (当前为 Mock Workflow，未执行真实操作)\n');

        return {
          success: true,
          message: `Mock: 已发布文章 ${articleId} 到 ${platform}`
        };
      }
    }
  ]
};
