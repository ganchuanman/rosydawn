import { defineStep } from '../registry.js';
import fs from 'fs';

/**
 * 更新文章 frontmatter
 *
 * 将生成的元数据更新到文章的 frontmatter 中
 */
export const updateFrontmatter = defineStep({
  type: 'processor',
  name: 'updateFrontmatter',
  description: '更新文章的 frontmatter',
  execute: async (ctx) => {
    const filePath = ctx.params.filePath || ctx.steps.createFile?.filePath;
    const metadata = ctx.steps.generateMetadata;

    if (!filePath) {
      throw new Error('缺少文件路径');
    }

    if (!metadata) {
      throw new Error('缺少元数据');
    }

    try {
      let content = fs.readFileSync(filePath, 'utf-8');

      // 检查是否已有 frontmatter
      const hasFrontmatter = content.startsWith('---\n');

      if (hasFrontmatter) {
        // 移除现有的 frontmatter
        const endIndex = content.indexOf('---', 4);
        if (endIndex > 0) {
          content = content.substring(endIndex + 3).trimStart();
        }
      }

      // 生成新的 frontmatter
      const frontmatter = [
        '---',
        `title: "${metadata.title}"`,
        `description: "${metadata.description}"`,
        `date: ${new Date().toISOString().split('T')[0]}`,
        `tags: [${metadata.tags.map((tag: string) => `"${tag}"`).join(', ')}]`,
        '---',
        '',
      ].join('\n');

      // 组合新内容
      const newContent = frontmatter + content;

      // 写回文件
      fs.writeFileSync(filePath, newContent, 'utf-8');

      return {
        success: true,
        filePath,
        metadata,
      };
    } catch (error) {
      throw new Error(
        `更新 frontmatter 失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
