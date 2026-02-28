import { defineStep } from '../registry.js';

/**
 * 处理主题参数缺失
 *
 * 将参数缺失标记写入上下文,触发 REPL 追问
 */
export const inputTopic = defineStep({
  type: 'processor',
  name: 'inputTopic',
  description: '处理主题参数缺失,触发 REPL 追问',
  execute: async (ctx) => {
    const topic = ctx.params.topic;

    if (!topic || topic.trim() === '') {
      // 标记需要用户输入
      return {
        needsInput: true,
        paramName: 'topic',
        prompt: '请输入文章主题:',
        reason: '缺少必需参数: topic',
      };
    }

    // 主题已提供
    return {
      needsInput: false,
      topic: topic.trim(),
    };
  },
});
