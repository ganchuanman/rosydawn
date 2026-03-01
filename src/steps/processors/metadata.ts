import { defineStep } from '../registry.js';

/**
 * AI 客户端接口
 */
interface AIClient {
  generateMetadata(topic: string): Promise<{
    title: string;
    description: string;
    tags: string[];
  }>;
}

/**
 * 生成元数据
 *
 * 调用 AI 生成文章的 title、description、tags
 * 如果 AI 服务不可用，使用降级逻辑
 */
export const generateMetadata = defineStep({
  type: 'processor',
  name: 'generateMetadata',
  description: '调用 AI 生成文章的 title、description、tags',
  execute: async (ctx) => {
    // 从上下文获取 topic
    const topic = ctx.steps.inputTopic?.topic || ctx.params.topic;

    if (!topic) {
      throw new Error('缺少主题，无法生成元数据');
    }

    // 从上下文获取用户提供的 tags 和 category
    const userTags = ctx.params.tags;
    const userCategory = ctx.params.category;

    // 从上下文中获取 AI 客户端（可选）
    const aiClient = ctx.params.aiClient as AIClient | undefined;

    // 如果有 AI 客户端，尝试调用 AI
    if (aiClient) {
      try {
        const metadata = await aiClient.generateMetadata(topic);

        return {
          title: metadata.title,
          description: metadata.description,
          // 如果用户提供了 tags，优先使用用户的，否则使用 AI 生成的
          tags: userTags ? parseTags(userTags) : metadata.tags,
          category: userCategory || undefined,
        };
      } catch (error) {
        console.warn('⚠️  AI 生成元数据失败，使用降级逻辑');
        console.warn(`   错误: ${error instanceof Error ? error.message : String(error)}`);
        // 继续执行降级逻辑
      }
    }

    // 降级逻辑：使用基础模板，保留用户提供的参数
    return {
      title: topic,
      description: `关于 ${topic} 的文章`,
      tags: userTags ? parseTags(userTags) : [],
      category: userCategory || undefined,
    };
  },
});

/**
 * 解析 tags 参数
 *
 * 支持字符串（逗号分隔）或数组格式
 */
function parseTags(tags: any): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
  return [];
}
