/**
 * Demo Workflow
 *
 * 演示如何使用 Workflow 引擎定义和执行工作流
 */

import { defineWorkflow, executeWorkflow, registerWorkflow } from '../workflow/index.js';

// 定义一个简单的 demo workflow
export const demoWorkflow = defineWorkflow({
  name: 'demo',
  description: 'A simple demo workflow',
  intent: 'demo',
  params: {
    required: ['topic'],
    optional: ['dryRun'],
  },
  steps: [
    {
      type: 'validator',
      name: 'checkInput',
      description: '检查输入参数',
      execute: async (ctx) => {
        const topic = ctx.params.topic;
        if (!topic || topic.trim() === '') {
          throw new Error('Topic is required');
        }
        return { topic: topic.trim() };
      },
    },
    {
      type: 'processor',
      name: 'processTopic',
      description: '处理主题',
      execute: async (ctx) => {
        const { topic } = ctx.steps.checkInput as { topic: string };
        return {
          processedTopic: topic.toUpperCase(),
          timestamp: new Date().toISOString(),
        };
      },
    },
    {
      type: 'action',
      name: 'executeAction',
      description: '执行动作',
      execute: async (ctx) => {
        const { processedTopic, timestamp } = ctx.steps.processTopic as {
          processedTopic: string;
          timestamp: string;
        };

        console.log(`Executing action for topic: ${processedTopic}`);
        console.log(`Timestamp: ${timestamp}`);

        return {
          success: true,
          message: `Action completed for ${processedTopic}`,
        };
      },
    },
    {
      type: 'notifier',
      name: 'notifyCompletion',
      description: '通知完成',
      execute: async (ctx) => {
        const result = ctx.steps.executeAction as { success: boolean; message: string };
        console.log(`\n=== Workflow Complete ===`);
        console.log(result.message);
        console.log('========================\n');
        return { notified: true };
      },
    },
  ],
});

// 注册 workflow
registerWorkflow(demoWorkflow);

// 执行 demo
async function runDemo() {
  console.log('Starting demo workflow...\n');

  const result = await executeWorkflow(demoWorkflow, {
    topic: 'AI Workflow Engine',
  });

  console.log('\n=== Final Result ===');
  console.log('Success:', result.success);
  console.log('Data:', JSON.stringify(result.data, null, 2));
  if (result.error) {
    console.log('Error:', result.error);
  }
  console.log('Metadata:', JSON.stringify(result.metadata, null, 2));
}

// 运行 demo
runDemo().catch(console.error);
