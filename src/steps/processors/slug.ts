import { pinyin } from 'pinyin';
import { defineStep } from '../registry.js';

/**
 * 将中文标题转换为拼音 slug
 *
 * @param text - 中文文本
 * @returns 拼音 slug
 */
function toPinyinSlug(text: string): string {
  // 使用 pinyin 库转换
  const pinyinArray = pinyin(text, {
    style: 'NORMAL', // 普通风格,不带声调
    heteronym: false, // 不考虑多音字
  });

  // 拼接拼音
  const slug = (pinyinArray as string[][])
    .map((arr) => arr[0]) // 取每个字的第一个拼音
    .join('-')
    .toLowerCase();

  return slug;
}

/**
 * 清理 slug 字符串
 *
 * 仅保留小写字母、数字和连字符
 *
 * @param slug - 原始 slug
 * @returns 清理后的 slug
 */
function cleanSlug(slug: string): string {
  return slug
    .replace(/[^a-z0-9-]/g, '-') // 非法字符替换为连字符
    .replace(/-+/g, '-') // 多个连续连字符合并为一个
    .replace(/^-|-$/g, ''); // 移除开头和结尾的连字符
}

/**
 * 生成 Slug
 *
 * 根据标题生成 URL slug 和文件路径
 */
export const generateSlug = defineStep({
  type: 'processor',
  name: 'generateSlug',
  description: '根据标题生成 URL slug 和文件路径',
  execute: async (ctx) => {
    // 从上下文获取标题
    const title = ctx.steps.generateMetadata?.title || ctx.params.topic;

    if (!title) {
      throw new Error('缺少标题，无法生成 slug');
    }

    // 生成拼音 slug
    const rawSlug = toPinyinSlug(title);
    const slug = cleanSlug(rawSlug);

    // 获取日期（使用当前日期或从上下文获取）
    const date = ctx.params.date ? new Date(ctx.params.date) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    // 生成文件路径
    const filePath = `src/content/posts/${year}/${month}/${slug}/index.md`;

    // 生成 URL 路径 (博客文章的 URL 格式)
    const urlPath = `/blog/${year}/${month}/${slug}`;

    return {
      slug,
      filePath,
      urlPath,
      year,
      month,
    };
  },
});
