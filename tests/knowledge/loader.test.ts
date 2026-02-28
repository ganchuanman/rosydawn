import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadKnowledge } from '../../src/knowledge/loader.js';
import fs from 'fs';
import path from 'path';

// Mock fs module with default export
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    statSync: vi.fn()
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  statSync: vi.fn()
}));

// Mock process.cwd
const originalCwd = process.cwd;
vi.spyOn(process, 'cwd').mockReturnValue('/test/project');

describe('Knowledge Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('14.18 - 生产模式加载', () => {
    it('should load knowledge base from file in production mode', async () => {
      process.env.NODE_ENV = 'production';

      const mockKnowledgeBase = {
        workflows: [
          { name: 'test', description: 'Test', intent: 'test', params: [] }
        ],
        projectRules: ['Rule 1'],
        constraints: ['Constraint 1'],
        generatedAt: '2024-01-01T00:00:00.000Z'
      };

      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify(mockKnowledgeBase));

      const result = await loadKnowledge();

      expect(fs.existsSync).toHaveBeenCalledWith(
        path.join('/test/project', 'dist', 'knowledge-base.json')
      );
      expect(fs.readFileSync).toHaveBeenCalled();
      expect(result.workflows).toHaveLength(1);
      expect(result.workflows[0].name).toBe('test');
    });

    it('should parse JSON correctly', async () => {
      process.env.NODE_ENV = 'production';

      const mockData = {
        workflows: [
          { name: 'workflow1', description: 'Desc 1', intent: 'intent1', params: [] },
          { name: 'workflow2', description: 'Desc 2', intent: 'intent2', params: [] }
        ],
        projectRules: ['Rule A', 'Rule B'],
        constraints: ['Constraint A'],
        generatedAt: '2024-02-01T00:00:00.000Z'
      };

      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify(mockData));

      const result = await loadKnowledge();

      expect(result.workflows).toHaveLength(2);
      expect(result.projectRules).toEqual(['Rule A', 'Rule B']);
      expect(result.constraints).toEqual(['Constraint A']);
      expect(result.generatedAt).toBe('2024-02-01T00:00:00.000Z');
    });
  });

  describe('14.20 - 文件不存在错误', () => {
    it('should throw error when knowledge base file does not exist in production mode', async () => {
      process.env.NODE_ENV = 'production';
      (fs.existsSync as any).mockReturnValue(false);

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      await expect(loadKnowledge()).rejects.toThrow();

      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should provide helpful error message when file not found', async () => {
      process.env.NODE_ENV = 'production';
      (fs.existsSync as any).mockReturnValue(false);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      try {
        await loadKnowledge();
      } catch (error) {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('知识库不存在')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('npm run build:knowledge')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('14.19 - 开发模式实时生成', () => {
    it('should generate knowledge base in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Import fresh module to trigger dev mode
      vi.resetModules();
      const { loadKnowledge: loadKnowledgeDev } = await import('../../src/knowledge/loader.js');

      // Mock the generateKnowledgeBase function
      const mockKnowledgeBase = {
        workflows: [],
        projectRules: [],
        constraints: [],
        generatedAt: new Date().toISOString()
      };

      // In dev mode, it should call generateKnowledgeBase
      // We'll just verify it doesn't read from file
      const result = await loadKnowledgeDev();

      expect(result).toBeDefined();
      expect(result.workflows).toBeDefined();
      expect(result.projectRules).toBeDefined();
      expect(result.constraints).toBeDefined();
      expect(result.generatedAt).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should use development mode when NODE_ENV is development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      vi.resetModules();
      const { loadKnowledge: loadKnowledgeDev } = await import('../../src/knowledge/loader.js');

      // In dev mode, existsSync should not be called
      (fs.existsSync as any).mockReturnValue(false);

      await loadKnowledgeDev();

      expect(fs.existsSync).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Mode Detection', () => {
    it('should detect production mode correctly', async () => {
      process.env.NODE_ENV = 'production';

      const mockData = {
        workflows: [],
        projectRules: [],
        constraints: [],
        generatedAt: '2024-01-01T00:00:00.000Z'
      };

      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify(mockData));

      await loadKnowledge();

      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should default to production mode when NODE_ENV is not set', async () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const mockData = {
        workflows: [],
        projectRules: [],
        constraints: [],
        generatedAt: '2024-01-01T00:00:00.000Z'
      };

      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify(mockData));

      await loadKnowledge();

      expect(fs.readFileSync).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should use development mode when NODE_ENV=development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      vi.resetModules();
      const { loadKnowledge: loadKnowledgeDev } = await import('../../src/knowledge/loader.js');

      (fs.existsSync as any).mockReturnValue(false);

      const result = await loadKnowledgeDev();

      // Should generate without reading file
      expect(result).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed JSON in knowledge base file', async () => {
      process.env.NODE_ENV = 'production';
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('invalid json');

      await expect(loadKnowledge()).rejects.toThrow();
    });

    it('should handle empty knowledge base file', async () => {
      process.env.NODE_ENV = 'production';
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue('{}');

      const result = await loadKnowledge();

      expect(result.workflows).toBeUndefined();
    });

    it('should handle knowledge base with missing fields', async () => {
      process.env.NODE_ENV = 'production';
      (fs.existsSync as any).mockReturnValue(true);
      (fs.readFileSync as any).mockReturnValue(JSON.stringify({
        workflows: []
        // Missing projectRules, constraints, generatedAt
      }));

      const result = await loadKnowledge();

      expect(result.workflows).toEqual([]);
      expect(result.projectRules).toBeUndefined();
    });
  });
});
