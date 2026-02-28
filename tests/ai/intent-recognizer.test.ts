import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recognizeIntent } from '../../src/ai/intent-recognizer.js';
import type { KnowledgeBase, AIClient, IntentResponse } from '../../src/ai/types.js';

// Mock AI Client
const createMockAIClient = (response: string): AIClient => ({
  chat: vi.fn().mockResolvedValue({
    content: response,
    model: 'test-model',
    usage: {
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150
    }
  })
});

// Mock Knowledge Base
const mockKnowledge: KnowledgeBase = {
  workflows: [
    {
      name: 'mock-create-article',
      description: '[Mock] 创建一篇新文章',
      intent: 'mock_create_article',
      params: [
        { name: 'topic', type: 'string', required: true, description: '文章主题' },
        { name: 'tags', type: 'array', required: false, description: '标签列表' }
      ],
      examples: ['创建一篇关于 WebSocket 的文章']
    },
    {
      name: 'mock-list-articles',
      description: '[Mock] 列出所有文章',
      intent: 'mock_list_articles',
      params: [],
      examples: ['显示所有文章', '列出文章']
    }
  ],
  projectRules: ['文章必须有标题', '标签不能超过 10 个'],
  constraints: ['单次操作超时 5 秒'],
  generatedAt: new Date().toISOString()
};

describe('Intent Recognizer', () => {
  describe('14.5 - JSON 响应解析 (标准格式)', () => {
    it('should parse standard JSON response', async () => {
      const aiResponse = JSON.stringify({
        intent: 'mock_create_article',
        params: { topic: 'WebSocket' },
        missing_params: [],
        confidence: 0.95,
        reasoning: '用户想要创建关于 WebSocket 的文章'
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('创建一篇关于 WebSocket 的文章', mockKnowledge, mockClient);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.result.intent).toBe('mock_create_article');
        expect(result.result.params.topic).toBe('WebSocket');
        expect(result.result.confidence).toBe(0.95);
      }
    });

    it('should handle missing optional fields', async () => {
      const aiResponse = JSON.stringify({
        intent: 'mock_list_articles',
        params: {},
        confidence: 0.9
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('显示所有文章', mockKnowledge, mockClient);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.result.intent).toBe('mock_list_articles');
        expect(result.result.missing_params).toEqual([]);
      }
    });
  });

  describe('14.6 - JSON 代码块提取', () => {
    it('should extract JSON from ```json code block', async () => {
      const aiResponse = `\`\`\`json
{
  "intent": "mock_create_article",
  "params": { "topic": "TypeScript" },
  "missing_params": [],
  "confidence": 0.88,
  "reasoning": "Test"
}
\`\`\``;

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('创建文章', mockKnowledge, mockClient);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.result.intent).toBe('mock_create_article');
        expect(result.result.params.topic).toBe('TypeScript');
      }
    });

    it('should extract JSON from ``` code block (without json marker)', async () => {
      const aiResponse = `{
  "intent": "mock_list_articles",
  "params": {},
  "missing_params": [],
  "confidence": 0.92,
  "reasoning": "Test"
}`;

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('列出文章', mockKnowledge, mockClient);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.result.intent).toBe('mock_list_articles');
      }
    });
  });

  describe('14.7 - Markdown 格式清理', () => {
    it('should clean markdown formatting from response', async () => {
      const aiResponse = JSON.stringify({
        intent: 'mock_create_article',
        params: { topic: '**WebSocket** 实战指南' },
        missing_params: [],
        confidence: 0.9,
        reasoning: '用户想要创建关于 **WebSocket** 的文章'
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('创建文章', mockKnowledge, mockClient);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        // Markdown should be cleaned
        expect(result.result.params.topic).toBe('WebSocket 实战指南');
        expect(result.result.reasoning).toBe('用户想要创建关于 WebSocket 的文章');
      }
    });

    it('should handle inline code formatting', async () => {
      const aiResponse = JSON.stringify({
        intent: 'mock_create_article',
        params: { topic: 'Using \`async/await\` in TypeScript' },
        missing_params: [],
        confidence: 0.85,
        reasoning: 'Test'
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('创建文章', mockKnowledge, mockClient);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.result.params.topic).toBe('Using async/await in TypeScript');
      }
    });
  });

  describe('14.8 - 置信度判断逻辑', () => {
    it('should accept high confidence (>= 0.7) intent', async () => {
      const aiResponse = JSON.stringify({
        intent: 'mock_create_article',
        params: { topic: 'Test' },
        missing_params: [],
        confidence: 0.75,
        reasoning: 'High confidence test'
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('创建文章', mockKnowledge, mockClient);

      expect(result.type).toBe('success');
    });

    it('should request clarification for low confidence (< 0.7)', async () => {
      const aiResponse = JSON.stringify({
        intent: 'mock_create_article',
        params: {},
        missing_params: ['topic'],
        confidence: 0.65,
        reasoning: 'Ambiguous input'
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('test', mockKnowledge, mockClient);

      expect(result.type).toBe('clarification_needed');
      if (result.type === 'clarification_needed') {
        expect(result.message).toContain('mock_create_article');
        expect(result.possibleIntents).toContain('mock_create_article');
      }
    });

    it('should handle confidence = 0 (unknown intent)', async () => {
      const aiResponse = JSON.stringify({
        intent: 'unknown',
        params: {},
        missing_params: [],
        confidence: 0,
        reasoning: 'Cannot understand user intent'
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('random gibberish', mockKnowledge, mockClient);

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.message).toContain('无法理解');
      }
    });

    it('should handle confidence threshold edge case (exactly 0.7)', async () => {
      const aiResponse = JSON.stringify({
        intent: 'mock_list_articles',
        params: {},
        missing_params: [],
        confidence: 0.7,
        reasoning: 'Edge case test'
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('test', mockKnowledge, mockClient);

      expect(result.type).toBe('success');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON response', async () => {
      const mockClient = createMockAIClient('This is not JSON');
      const result = await recognizeIntent('test', mockKnowledge, mockClient);

      expect(result.type).toBe('error');
    });

    it('should handle missing intent field', async () => {
      const aiResponse = JSON.stringify({
        params: {},
        confidence: 0.9
      });

      const mockClient = createMockAIClient(aiResponse);
      const result = await recognizeIntent('test', mockKnowledge, mockClient);

      expect(result.type).toBe('error');
    });

    it('should handle AI client timeout', async () => {
      const mockClient: AIClient = {
        chat: vi.fn().mockRejectedValue(new Error('Request timed out'))
      };

      const result = await recognizeIntent('test', mockKnowledge, mockClient);

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.message).toContain('超时');
        expect(result.fallback).toBe('manual_mode');
      }
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Unauthorized') as any;
      error.status = 401;
      const mockClient: AIClient = {
        chat: vi.fn().mockRejectedValue(error)
      };

      const result = await recognizeIntent('test', mockKnowledge, mockClient);

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.message).toContain('认证失败');
      }
    });
  });
});
