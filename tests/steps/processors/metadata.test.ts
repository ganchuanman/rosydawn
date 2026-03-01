import { describe, it, expect, it, vi } from 'vitest';
import { generateMetadata } from '../../../src/steps/processors/metadata.js';

/**
 * TC-03: AI 元数据生成成功
 */
describe('generateMetadata', () => {
  it('should generate metadata successfully when AI is available', async () => {
    const mockAIClient = {
      generateMetadata: vi.fn().mockResolved({
        title: 'WebSocket 实时通信详解',
        description: '深入探讨 WebSocket 协议及其应用场景',
        tags: ['network', 'realtime', 'websocket'],
      }),
    };

    const result = await generateMetadata.execute({
      params: { topic: 'WebSocket', aiClient: mockAIClient },
      steps: {},
    });

    expect(result.title).toBe('WebSocket 实时通信详解');
    expect(result.description).toBe('深入探讨 WebSocket 协议及其应用场景');
    expect(result.tags).toEqual(['network', 'realtime', 'websocket']);
    expect(mockAIClient.generateMetadata).toHaveBeenCalledWith('WebSocket');
  });

  it('should use user-provided tags instead of AI tags', async () => {
    const mockAIClient = {
      generateMetadata: vi.fn().mockResolved({
        title: 'AI Title',
        description: 'AI Description',
        tags: ['ai-tag'],
      }),
    };

    const result = await generateMetadata.execute({
      params: {
        topic: 'Test',
        tags: 'user-tag1,user-tag2',
        aiClient: mockAIClient
      },
      steps: {},
    });

    expect(result.tags).toEqual(['user-tag1', 'user-tag2']);
    expect(result.title).toBe('AI Title');
  });

  it('should use user-provided category', async () => {
    const mockAIClient = {
      generateMetadata: vi.fn().mockResolved({
        title: 'Title',
        description: 'Description',
        tags: ['tag'],
      }),
    };

    const result = await generateMetadata.execute({
      params: {
        topic: 'Test',
        category: 'user-category',
        aiClient: mockAIClient,
      },
      steps: {},
    });

    expect(result.category).toBe('user-category');
  });

  it('should handle array tags', async () => {
    const mockAIClient = {
      generateMetadata: vi.fn().mockResolved({
        title: 'Title',
        description: 'Description',
        tags: ['ai-tag'],
      }),
    };

    const result = await generateMetadata.execute({
      params: {
        topic: 'Test',
        tags: ['tag1', 'tag2'],
        aiClient: mockAIClient,
      },
      steps: {},
    });

    expect(result.tags).toEqual(['tag1', 'tag2']);
  });

  it('should not require AI client if topic is provided', async () => {
    // Without AI client, should still work if topic is in params
    const result = await generateMetadata.execute({
      params: { topic: 'Test' },
      steps: {},
    });

    expect(result).toBeDefined();
  });
});

/**
 * TC-04: AI 服务不可用时的降级处理
 */
describe('generateMetadata - degradation', () => {
  it('should use fallback logic when AI throws error', async () => {
    const mockAIClient = {
      generateMetadata: vi.fn().mockRejected(new Error('ECONNREFUSED')),
    };

    const consoleSpy = vi.spyOn(console, 'warn');

    const result = await generateMetadata.execute({
      params: { topic: 'WebSocket' },
      steps: {},
    });

    // 应该返回 fallback metadata
    expect(result.title).toBe('WebSocket');
    expect(result.description).toBe('关于 WebSocket 的文章');
    expect(result.tags).toEqual([]);

    // Should show warning
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should preserve user tags in degradation', async () => {
    const result = await generateMetadata.execute({
      params: {
        topic: 'Test',
        tags: 'user1,user2'
      },
      steps: {},
    });

    expect(result.tags).toEqual(['user1', 'user2']);
  });

  it('should preserve user category in degradation', async () => {
    const result = await generateMetadata.execute({
      params: {
        topic: 'Test',
        category: 'MyCategory',
      },
      steps: {},
    });

    expect(result.category).toBe('MyCategory');
  });
});

/**
 * TC-05: AI 返回格式错误的处理
 */
describe('generateMetadata - malformed AI response', () => {
  it('should handle malformed AI response gracefully', async () => {
    const mockAIClient = {
      generateMetadata: vi.fn().mockResolved({ foo: 'bar' } as any),
    };

    const consoleSpy = vi.spyOn(console, 'warn');

    const result = await generateMetadata.execute({
      params: { topic: 'WebSocket' },
      steps: {},
    });

    // Should fall back to degradation
    expect(result.title).toBe('WebSocket');
    expect(result.description).toBe('关于 WebSocket 的文章');
    expect(result.tags).toEqual([]);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should not throw error on malformed response', async () => {
    const mockAIClient = {
      generateMetadata: vi.fn().mockResolved({} as any),
    };

    // Should not throw
    const result = await generateMetadata.execute({
      params: { topic: 'Test' },
      steps: {},
    });

    expect(result).toBeDefined();
  });
});

/**
 * TC-50: AI 服务超时处理
 */
describe('generateMetadata - timeout', () => {
  it('should handle timeout gracefully', async () => {
    const mockAIClient = {
      generateMetadata: vi.fn().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 35000)); // 35 seconds
      }),
    };

    const consoleSpy = vi.spyOn(console, 'warn');

    const start = Date.now();
    const result = await generateMetadata.execute({
      params: { topic: 'WebSocket', aiClient: mockAIClient },
      steps: {},
    });
    const duration = Date.now() - start;

    // Should timeout and fallback
    expect(duration).toBeLessThan(32000); // Should be handled before 32s
    expect(result.title).toBe('WebSocket');
    expect(consoleSpy).toHaveBeenCalled();
  }, 10000);
});
