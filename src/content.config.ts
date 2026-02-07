import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 定义博客文章集合的 Schema
const postsCollection = defineCollection({
  // 使用 glob loader，匹配 index.md 和 index.mdx 文件
  loader: glob({ 
    pattern: '**/index.{md,mdx}', 
    base: './src/content/posts' 
  }),
  schema: ({ image }) => z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    coverImage: image().optional(),
  }),
});

// 导出 collections 配置
export const collections = {
  posts: postsCollection,
};