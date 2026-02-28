import type { Workflow } from '../workflow/types.js';

/**
 * Mock 创建文章 Workflow
 *
 * 用于测试 REPL 和 AI 意图识别功能，不执行真实操作
 */
export const mockCreateArticleWorkflow: Workflow = {
  name: 'mock-create-article',
  description: '[Mock] 创建一篇新文章（仅用于测试，不执行真实操作）',
  intent: 'mock_create_article',
  params: {
    required: ['topic'],
    optional: ['tags', 'category']
  },
  steps: [
    {
      type: 'processor',
      name: 'prepare-params',
      description: '准备和验证参数',
      execute: async (context) => {
        const { topic, tags, category } = context.params;
        return {
          topic,
          tags: tags || [],
          category: category || 'default'
        };
      }
    },
    {
      type: 'action',
      name: 'mock-create',
      description: 'Mock 创建文章',
      execute: async (context) => {
        const { topic, tags, category } = context.steps['prepare-params'];

        console.log('\n✅ Mock Workflow 执行结果:');
        console.log(`   Intent: mock_create_article`);
        console.log(`   参数: { topic: "${topic}", tags: ${JSON.stringify(tags)}, category: "${category}" }`);
        console.log('   (当前为 Mock Workflow，未执行真实操作)\n');

        return {
          success: true,
          message: `Mock: 已创建关于 "${topic}" 的文章`
        };
      }
    }
  ]
};
