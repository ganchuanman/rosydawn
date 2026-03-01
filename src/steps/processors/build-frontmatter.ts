import { defineStep } from '../registry.js';

/**
 * 构建 Frontmatter
 *
 * 组装 YAML frontmatter 字符串
 */
export const buildFrontmatter = defineStep({
  type: 'processor',
  name: 'buildFrontmatter',
  description: '组装 YAML frontmatter',
  execute: async (ctx) => {
    const metadata = ctx.steps.generateMetadata;
    const topic = ctx.steps.inputTopic?.topic || ctx.params.topic;

    // 如果没有 metadata，使用降级逻辑
    const title = metadata?.title || topic;
    const description = metadata?.description || `关于 ${topic} 的文章`;
    const tags = metadata?.tags || [];
    const category = metadata?.category || ctx.params.category;

    // 处理日期：优先使用用户指定的日期，否则使用当前日期
    let date: string;
    if (ctx.params.date) {
      // 如果用户提供了日期，直接使用或格式化
      const dateObj = new Date(ctx.params.date);
      date = dateObj.toISOString().split('T')[0];
    } else {
      date = new Date().toISOString().split('T')[0];
    }

    // 构建 frontmatter
    const frontmatterLines = [
      '---',
      `title: "${title}"`,
      `description: "${description}"`,
      `date: ${date}`,
    ];

    // 添加 tags 字段
    if (tags.length > 0) {
      frontmatterLines.push(`tags: [${tags.map((tag: string) => `"${tag}"`).join(', ')}]`);
    } else {
      frontmatterLines.push('tags: []');
    }

    // 添加 category 字段（如果提供）
    if (category) {
      frontmatterLines.push(`category: "${category}"`);
    }

    // 结束 frontmatter
    frontmatterLines.push('---');
    frontmatterLines.push('');

    const frontmatter = frontmatterLines.join('\n');

    return {
      frontmatter,
      title,
      description,
      tags,
      category,
      date,
    };
  },
});
