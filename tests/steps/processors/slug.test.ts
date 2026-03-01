import { describe, it, expect, it, vi } from 'vitest';
import { generateSlug } from '../../../src/steps/processors/slug.js';

/**
 * TC-06: Slug 生成规则验证
 */
describe('generateSlug', () => {
  it('should generate correct slug for Chinese titles', async () => {
    const result = await generateSlug.execute({
      params: { topic: 'WebSocket 实时通信' },
      steps: {
        generateMetadata: { title: 'WebSocket 实时通信' },
      },
    });

    expect(result.slug).toMatch(/^[a-z0-9-]+$/);
    expect(result.slug).toContain('websocket');
    expect(result.slug).not.toContain('--'); // No consecutive hyphens
  });

  it('should generate correct slug for Node.js title', async () => {
    const result = await generateSlug.execute({
      params: { topic: 'Node.js 性能优化' },
      steps: {
        generateMetadata: { title: 'Node.js 性能优化' },
      },
    });

    expect(result.slug).toMatch(/^[a-z0-9-]+$/);
    expect(result.slug).toContain('node');
    expect(result.slug).not.toMatch(/-$/); // Not start or end with hyphen
  });

  it('should generate correct slug for React title', async () => {
    const result = await generateSlug.execute({
      params: { topic: 'React 18 新特性' },
      steps: {
        generateMetadata: { title: 'React 18 新特性' },
      },
    });

    expect(result.slug).toMatch(/^[a-z0-9-]+$/);
    expect(result.slug).toContain('react');
    expect(result.slug).toContain('18');
  });

  it('should only contain lowercase letters, numbers, and hyphens', async () => {
    const result = await generateSlug.execute({
      params: { topic: 'Test@Title#123' },
      steps: {
        generateMetadata: { title: 'Test@Title#123' },
      },
    });

    expect(result.slug).toMatch(/^[a-z0-9-]+$/);
    expect(result.slug).not.toContain('@');
    expect(result.slug).not.toContain('#');
  });

  it('should use topic when metadata is missing', async () => {
    const result = await generateSlug.execute({
      params: { topic: 'Fallback Topic' },
      steps: {}, // No generateMetadata
    });

    expect(result.slug).toContain('fallback');
  });
});

/**
 * TC-07: 文件路径生成规则
 */
describe('generateSlug - file path generation', () => {
  it('should generate correct file path with current date', async () => {
    vi.setSystemTime(new Date('2026-02-28'));

    const result = await generateSlug.execute({
      params: { topic: 'Test Article' },
      steps: {
        generateMetadata: { title: 'Test Article' },
      },
    });

    expect(result.filePath).toBe('src/content/posts/2026/02/test-article/index.md');
    expect(result.urlPath).toBe('/blog/2026/02/test-article');
    expect(result.year).toBe(2026);
    expect(result.month).toBe('02');
  });

  it('should use custom date when provided', async () => {
    const result = await generateSlug.execute({
      params: {
        topic: 'Test Article',
        date: '2026-03-15',
      },
      steps: {
        generateMetadata: { title: 'Test Article' },
      },
    });

    expect(result.filePath).toBe('src/content/posts/2026/03/test-article/index.md');
    expect(result.urlPath).toBe('/blog/2026/03/test-article');
    expect(result.year).toBe(2026);
    expect(result.month).toBe('03');
  });

  it('should throw error when title is missing', async () => {
    await expect(generateSlug.execute({
      params: {},
      steps: {},
    })).rejects.toThrow('缺少标题');
  });
});

/**
 * TC-48: 超长主题处理
 */
describe('generateSlug - long topics', () => {
  it('should handle very long topics gracefully', async () => {
    const longTopic = '这是一个非常非常非常非常非常长的主题用于测试超长标题的处理能力是否会正常工作';
    const result = await generateSlug.execute({
      params: { topic: longTopic },
      steps: {
        generateMetadata: { title: longTopic },
      },
    });

    expect(result.slug).toBeDefined();
    expect(result.slug.length).toBeLessThan(200); // Reasonable length
    expect(result.filePath.length).toBeLessThan(255); // File path limit
  });

  it('should not create consecutive hyphens in long slugs', async () => {
    const result = await generateSlug.execute({
      params: { topic: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z' },
      steps: {
        generateMetadata: { title: 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z' },
      },
    });

    expect(result.slug).not.toMatch(/--+/); // No consecutive hyphens
  });
});
