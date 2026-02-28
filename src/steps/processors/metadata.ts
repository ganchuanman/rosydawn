import { defineStep } from '../registry.js';

/**
 * AI 客户端接口
 */
interface AIClient {
  generateMetadata(content: string): Promise<{
    title: string;
    description: string;
    tags: string[];
  }>;
}

/**
 * 生成元数据
 *
 * 调用 AI 生成文章的 title、description、tags
 */
export const generateMetadata = defineStep({
  type: 'processor',
  name: 'generateMetadata',
  description: '调用 AI 生成文章的 title、description、tags',
  execute: async (ctx) => {
    const content = ctx.params.content || ctx.steps.readFile?.content;

    if (!content) {
      throw new Error('缺少文章内容，无法生成元数据');
    }

    // 从上下文中获取 AI 客户端
    const aiClient = ctx.params.aiClient as AIClient | undefined;

    if (!aiClient) {
      throw new Error('AI 客户端未配置');
    }

    try {
      const metadata = await aiClient.generateMetadata(content);

      return {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
      };
    } catch (error) {
      throw new Error(
        `生成元数据失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
