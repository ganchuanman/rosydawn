import { describe, it, expect, vi } from 'vitest';
import { buildFrontmatter } from '../../../src/steps/processors/build-frontmatter.js';

describe('buildFrontmatter', () => {
  it('should build complete frontmatter with all fields', async () => {
    const result = await buildFrontmatter.execute({
      params: {},
      steps: {
        generateMetadata: {
          title: 'Test Title',
          description: 'Test Description',
          tags: ['tag1', 'tag2'],
          category: 'TestCategory',
        },
      },
    });

    expect(result.frontmatter).toContain('title: "Test Title"');
    expect(result.frontmatter).toContain('description: "Test Description"');
    expect(result.frontmatter).toContain('tags: ["tag1", "tag2"]');
    expect(result.frontmatter).toContain('category: "TestCategory"');
    expect(result.frontmatter).toMatch(/^---\n/);
    expect(result.frontmatter).toMatch(/\n---\n/);
    expect(result.title).toBe('Test Title');
    expect(result.category).toBe('TestCategory');
  });

  it('should use current date when not provided', async () => {
    vi.setSystemTime(new Date('2026-03-01'));

    const result = await buildFrontmatter.execute({
      params: {},
      steps: {
        generateMetadata: {
          title: 'Test',
          description: 'Description',
          tags: [],
        },
      },
    });

    expect(result.frontmatter).toContain('date: 2026-03-01');
    expect(result.date).toBe('2026-03-01');
  });

  it('should use custom date from params', async () => {
    const result = await buildFrontmatter.execute({
      params: { date: '2026-01-15' },
      steps: {
        generateMetadata: {
          title: 'Test',
          description: 'Description',
          tags: [],
        },
      },
    });

    expect(result.frontmatter).toContain('date: 2026-01-15');
    expect(result.date).toBe('2026-01-15');
  });

  it('should use category from metadata over params', async () => {
    const result = await buildFrontmatter.execute({
      params: { category: 'ParamCategory' },
      steps: {
        generateMetadata: {
          title: 'Test',
          description: 'Description',
          tags: [],
          category: 'MetadataCategory',
        },
      },
    });

    expect(result.frontmatter).toContain('category: "MetadataCategory"');
    expect(result.category).toBe('MetadataCategory');
  });

  it('should use param category when metadata category is missing', async () => {
    const result = await buildFrontmatter.execute({
      params: { category: 'ParamCategory' },
      steps: {
        generateMetadata: {
          title: 'Test',
          description: 'Description',
          tags: [],
        },
      },
    });

    expect(result.frontmatter).toContain('category: "ParamCategory"');
  });

  it('should handle empty tags', async () => {
    const result = await buildFrontmatter.execute({
      params: {},
      steps: {
        generateMetadata: {
          title: 'Test',
          description: 'Description',
          tags: [],
        },
      },
    });

    expect(result.frontmatter).toContain('tags: []');
  });

  it('should use fallback when metadata is missing', async () => {
    const result = await buildFrontmatter.execute({
      params: { topic: 'Fallback Topic', category: 'Test' },
      steps: {}, // No metadata
    });

    expect(result.title).toBe('Fallback Topic');
    expect(result.description).toBe('关于 Fallback Topic 的文章');
    expect(result.tags).toEqual([]);
  });
});
