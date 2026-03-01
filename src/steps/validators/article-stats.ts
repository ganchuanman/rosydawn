import { defineStep } from '../registry.js';
import { readdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

/**
 * 检查文章统计
 *
 * 统计文章数量、已发布/未发布数量
 */
export const checkArticleStats = defineStep({
  type: 'validator',
  name: 'checkArticleStats',
  description: '检查文章统计信息',
  execute: async (ctx) => {
    const contentDir = ctx.params.contentDir || 'src/content';

    try {
      const contentPath = join(process.cwd(), contentDir);
      const files = await readdir(contentPath, { recursive: true });
      const mdFiles = files.filter((file) =>
        typeof file === 'string' && (file.endsWith('.md') || file.endsWith('.mdx'))
      );

      let publishedCount = 0;
      let unpublishedCount = 0;

      // 读取每个文件的 frontmatter
      for (const file of mdFiles) {
        try {
          const filePath = join(contentPath, file);
          const { data } = matter.read(filePath);

          if (data.draft) {
            unpublishedCount++;
          } else {
            publishedCount++;
          }
        } catch {
          // 忽略无法读取的文件
        }
      }

      const total = mdFiles.length;

      console.log(`📊 文章统计:`);
      console.log(`   总数: ${total}`);
      console.log(`   已发布: ${publishedCount}`);
      console.log(`   未发布: ${unpublishedCount}`);

      return {
        success: true,
        total,
        published: publishedCount,
        unpublished: unpublishedCount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  无法读取文章目录: ${errorMessage}`);

      return {
        success: true,
        total: 0,
        published: 0,
        unpublished: 0,
        warning: errorMessage,
      };
    }
  },
});
