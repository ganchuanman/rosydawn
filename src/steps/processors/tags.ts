import { defineStep } from '../registry.js';
import fs from 'fs';
import path from 'path';

/**
 * 简单的 frontmatter 解析器
 */
function parseFrontmatter(content: string): Record<string, any> | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter: Record<string, any> = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      // 简单的数组解析 (YAML 格式)
      if (value.startsWith('[') && value.endsWith(']')) {
        frontmatter[key] = value
          .substring(1, value.length - 1)
          .split(',')
          .map((item) => item.trim().replace(/^["']|["']$/g, ''));
      } else {
        frontmatter[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  return frontmatter;
}

/**
 * 收集现有标签
 *
 * 扫描已发布文章,收集所有已使用的标签
 */
export const collectExistingTags = defineStep({
  type: 'processor',
  name: 'collectExistingTags',
  description: '扫描已发布文章,收集所有已使用的标签',
  execute: async (ctx) => {
    const contentDir = ctx.params.contentDir || 'src/content';

    if (!fs.existsSync(contentDir)) {
      return {
        tags: [],
        tagCount: 0,
      };
    }

    try {
      const tags = new Set<string>();

      // 递归读取所有 markdown 文件
      function readDirectory(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            readDirectory(fullPath);
          } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const frontmatter = parseFrontmatter(content);

            if (frontmatter && Array.isArray(frontmatter.tags)) {
              frontmatter.tags.forEach((tag: string) => tags.add(tag));
            }
          }
        }
      }

      readDirectory(contentDir);

      return {
        tags: Array.from(tags).sort(),
        tagCount: tags.size,
      };
    } catch (error) {
      throw new Error(
        `收集标签失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
