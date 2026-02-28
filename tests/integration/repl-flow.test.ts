import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all external dependencies
vi.mock('@inquirer/prompts', () => ({
  input: vi.fn()
}));

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }))
}));

vi.mock('../../src/workflow/registry.js', () => ({
  workflowRegistry: {
    getByName: vi.fn().mockReturnValue({
      name: 'mock-create-article',
      description: 'Test workflow',
      intent: 'mock_create_article',
      steps: [
        {
          type: 'processor',
          name: 'prepare',
          execute: async (ctx: any) => ({ topic: ctx.params.topic })
        },
        {
          type: 'action',
          name: 'execute',
          execute: async () => {
            console.log('✅ Mock Workflow executed');
            return { success: true };
          }
        }
      ]
    }),
    getAllNames: vi.fn().mockReturnValue(['mock-create-article'])
  }
}));

import { input } from '@inquirer/prompts';
import { recognizeIntent } from '../../src/ai/intent-recognizer.js';
import { loadKnowledge } from '../../src/knowledge/loader.js';
import type { KnowledgeBase } from '../../src/knowledge/types.js';

describe('Integration Tests - REPL Flow', () => {
  let mockConsoleLog: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  describe('15.2 - REPL 启动 → 输入 → 意图识别 → 结果输出', () => {
    it('should complete full flow: load knowledge → recognize intent → display result', async () => {
      // Setup: Mock knowledge base
      const mockKnowledge: KnowledgeBase = {
        workflows: [
          {
            name: 'mock-create-article',
            description: 'Create article',
            intent: 'mock_create_article',
            params: [
              { name: 'topic', type: 'string', required: true, description: 'Topic' }
            ],
            examples: ['创建文章']
          }
        ],
        projectRules: [],
        constraints: [],
        generatedAt: new Date().toISOString()
      };

      // Step 1: Load knowledge
      const knowledge = await loadKnowledge();
      expect(knowledge).toBeDefined();
      expect(knowledge.workflows).toBeDefined();

      // Step 2: User input
      const userInput = '创建一篇关于 WebSocket 的文章';

      // Step 3: Recognize intent (mocked)
      const mockAIClient = {
        chat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            intent: 'mock_create_article',
            params: { topic: 'WebSocket' },
            missing_params: [],
            confidence: 0.95,
            reasoning: 'User wants to create an article about WebSocket'
          }),
          model: 'test-model',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
      };

      const intentResult = await recognizeIntent(userInput, mockKnowledge, mockAIClient);

      // Step 4: Verify result
      expect(intentResult.type).toBe('success');
      if (intentResult.type === 'success') {
        expect(intentResult.result.intent).toBe('mock_create_article');
        expect(intentResult.result.params.topic).toBe('WebSocket');
        expect(intentResult.result.confidence).toBeGreaterThan(0.7);
      }
    });

    it('should handle low confidence intent', async () => {
      const mockKnowledge: KnowledgeBase = {
        workflows: [
          {
            name: 'mock-create-article',
            description: 'Create article',
            intent: 'mock_create_article',
            params: [],
            examples: []
          }
        ],
        projectRules: [],
        constraints: [],
        generatedAt: new Date().toISOString()
      };

      const mockAIClient = {
        chat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            intent: 'mock_create_article',
            params: {},
            missing_params: ['topic'],
            confidence: 0.5,
            reasoning: 'Ambiguous input'
          }),
          model: 'test-model',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
      };

      const result = await recognizeIntent('test', mockKnowledge, mockAIClient);

      expect(result.type).toBe('clarification_needed');
      if (result.type === 'clarification_needed') {
        expect(result.message).toContain('mock_create_article');
      }
    });
  });

  describe('15.3 - 多轮参数收集流程', () => {
    it('should collect missing parameters in multiple rounds', async () => {
      const mockInput = input as any;

      // First round: missing topic
      mockInput.mockResolvedValueOnce('WebSocket 实战指南');

      const { collectMissingParams } = await import('../../src/ai/param-collector.js');

      const missingParams = ['topic'];
      const paramSchemas = [
        { name: 'topic', type: 'string', required: true, description: '文章主题' }
      ];

      const collected = await collectMissingParams(missingParams, paramSchemas);

      expect(collected.topic).toBe('WebSocket 实战指南');
      expect(mockInput).toHaveBeenCalledTimes(1);
    });

    it('should collect multiple parameters sequentially', async () => {
      const mockInput = input as any;

      mockInput
        .mockResolvedValueOnce('TypeScript 高级技巧')
        .mockResolvedValueOnce('typescript, advanced, tutorial');

      const { collectMissingParams } = await import('../../src/ai/param-collector.js');

      const missingParams = ['topic', 'tags'];
      const paramSchemas = [
        { name: 'topic', type: 'string', required: true, description: '文章主题' },
        { name: 'tags', type: 'array', required: false, description: '标签' }
      ];

      const collected = await collectMissingParams(missingParams, paramSchemas);

      expect(collected.topic).toBe('TypeScript 高级技巧');
      expect(collected.tags).toHaveLength(3);
      expect(mockInput).toHaveBeenCalledTimes(2);
    });
  });

  describe('15.4 - AI 调用失败降级', () => {
    it('should handle AI timeout gracefully', async () => {
      const mockKnowledge: KnowledgeBase = {
        workflows: [],
        projectRules: [],
        constraints: [],
        generatedAt: new Date().toISOString()
      };

      const mockAIClient = {
        chat: vi.fn().mockRejectedValue(new Error('Request timed out'))
      };

      const result = await recognizeIntent('test', mockKnowledge, mockAIClient);

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.message).toContain('超时');
        expect(result.fallback).toBe('manual_mode');
      }
    });

    it('should handle authentication failure', async () => {
      const mockKnowledge: KnowledgeBase = {
        workflows: [],
        projectRules: [],
        constraints: [],
        generatedAt: new Date().toISOString()
      };

      const authError = new Error('Unauthorized') as any;
      authError.status = 401;

      const mockAIClient = {
        chat: vi.fn().mockRejectedValue(authError)
      };

      const result = await recognizeIntent('test', mockKnowledge, mockAIClient);

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.message).toContain('认证失败');
      }
    });

    it('should handle service unavailable', async () => {
      const mockKnowledge: KnowledgeBase = {
        workflows: [],
        projectRules: [],
        constraints: [],
        generatedAt: new Date().toISOString()
      };

      const serviceError = new Error('Service Unavailable') as any;
      serviceError.status = 503;

      const mockAIClient = {
        chat: vi.fn().mockRejectedValue(serviceError)
      };

      const result = await recognizeIntent('test', mockKnowledge, mockAIClient);

      expect(result.type).toBe('error');
      if (result.type === 'error') {
        expect(result.message).toContain('不可用');
        expect(result.fallback).toBe('manual_mode');
      }
    });
  });

  describe('15.5 - 知识库加载 → 意图识别完整链路', () => {
    it('should load knowledge and perform intent recognition end-to-end', async () => {
      // Step 1: Load knowledge
      const knowledge = await loadKnowledge();

      expect(knowledge).toBeDefined();
      expect(knowledge.workflows).toBeDefined();
      expect(Array.isArray(knowledge.workflows)).toBe(true);
      expect(knowledge.projectRules).toBeDefined();
      expect(knowledge.constraints).toBeDefined();
      expect(knowledge.generatedAt).toBeDefined();

      // Step 2: Setup AI client
      const mockAIClient = {
        chat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            intent: 'mock_create_article',
            params: { topic: 'Test' },
            missing_params: [],
            confidence: 0.9,
            reasoning: 'Test'
          }),
          model: 'test-model',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
      };

      // Step 3: Recognize intent
      const result = await recognizeIntent('创建文章', knowledge, mockAIClient);

      expect(result.type).toBe('success');
      expect(mockAIClient.chat).toHaveBeenCalled();
    });

    it('should handle complete workflow with parameters', async () => {
      const knowledge = await loadKnowledge();

      const mockAIClient = {
        chat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            intent: 'mock_create_article',
            params: { topic: 'WebSocket' },
            missing_params: ['tags'],
            confidence: 0.85,
            reasoning: 'User wants to create article with topic but missing tags'
          }),
          model: 'test-model',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
      };

      const result = await recognizeIntent('创建一篇关于 WebSocket 的文章', knowledge, mockAIClient);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.result.intent).toBe('mock_create_article');
        expect(result.result.params.topic).toBe('WebSocket');
        expect(result.result.missing_params).toContain('tags');
      }
    });

    it('should validate knowledge base structure', async () => {
      const knowledge = await loadKnowledge();

      // Verify all required fields exist
      expect(knowledge).toHaveProperty('workflows');
      expect(knowledge).toHaveProperty('projectRules');
      expect(knowledge).toHaveProperty('constraints');
      expect(knowledge).toHaveProperty('generatedAt');

      // Verify types
      expect(Array.isArray(knowledge.workflows)).toBe(true);
      expect(Array.isArray(knowledge.projectRules)).toBe(true);
      expect(Array.isArray(knowledge.constraints)).toBe(true);
      expect(typeof knowledge.generatedAt).toBe('string');

      // Verify generatedAt is valid ISO date
      const generatedDate = new Date(knowledge.generatedAt);
      expect(generatedDate).toBeInstanceOf(Date);
      expect(generatedDate.getTime()).not.toBeNaN();
    });
  });

  describe('End-to-End Scenarios', () => {
    it('should handle "创建文章" scenario from start to finish', async () => {
      // 1. Load knowledge
      const knowledge = await loadKnowledge();
      expect(knowledge.workflows.length).toBeGreaterThanOrEqual(0);

      // 2. Recognize intent
      const mockAIClient = {
        chat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            intent: 'mock_create_article',
            params: { topic: 'WebSocket' },
            missing_params: [],
            confidence: 0.95,
            reasoning: 'Clear intent to create article'
          }),
          model: 'test-model',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
      };

      const intentResult = await recognizeIntent('创建一篇关于 WebSocket 的文章', knowledge, mockAIClient);

      expect(intentResult.type).toBe('success');
      if (intentResult.type === 'success') {
        // 3. Verify workflow can be retrieved
        expect(intentResult.result.intent).toBe('mock_create_article');
        expect(intentResult.result.params).toHaveProperty('topic');
        expect(intentResult.result.confidence).toBeGreaterThanOrEqual(0.7);
      }
    });

    it('should handle "列出文章" scenario', async () => {
      const knowledge = await loadKnowledge();

      const mockAIClient = {
        chat: vi.fn().mockResolvedValue({
          content: JSON.stringify({
            intent: 'mock_list_articles',
            params: {},
            missing_params: [],
            confidence: 0.92,
            reasoning: 'User wants to list articles'
          }),
          model: 'test-model',
          usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 }
        })
      };

      const result = await recognizeIntent('显示所有文章', knowledge, mockAIClient);

      expect(result.type).toBe('success');
      if (result.type === 'success') {
        expect(result.result.intent).toBe('mock_list_articles');
        expect(result.result.confidence).toBeGreaterThanOrEqual(0.7);
      }
    });
  });
});
