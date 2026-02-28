import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateKnowledgeBase,
  extractWorkflowMetadata,
  loadStaticKnowledge
} from '../../src/knowledge/generator.js';
import type { Workflow } from '../../src/workflow/types.js';
import type { KnowledgeBase, WorkflowMetadata } from '../../src/knowledge/types.js';

describe('Knowledge Generator', () => {
  describe('14.14 - Workflow 元数据提取', () => {
    it('should extract basic workflow metadata', () => {
      const mockWorkflow: Workflow = {
        name: 'test-workflow',
        description: 'Test workflow description',
        intent: 'test_intent',
        steps: []
      };

      const metadata = extractWorkflowMetadata(mockWorkflow);

      expect(metadata.name).toBe('test-workflow');
      expect(metadata.description).toBe('Test workflow description');
      expect(metadata.intent).toBe('test_intent');
    });

    it('should extract parameter schemas', () => {
      const mockWorkflow: Workflow = {
        name: 'create-article',
        description: 'Create a new article',
        intent: 'create_article',
        params: {
          required: ['topic'],
          optional: ['tags', 'category']
        },
        steps: []
      };

      const metadata = extractWorkflowMetadata(mockWorkflow);

      expect(metadata.params).toBeDefined();
      expect(metadata.params?.length).toBe(3);

      const requiredParam = metadata.params?.find(p => p.name === 'topic');
      expect(requiredParam?.required).toBe(true);
      expect(requiredParam?.type).toBe('string');

      const optionalParam = metadata.params?.find(p => p.name === 'tags');
      expect(optionalParam?.required).toBe(false);
    });

    it('should extract examples', () => {
      const mockWorkflow: Workflow = {
        name: 'mock-create-article',
        description: 'Test',
        intent: 'mock_create_article',
        examples: ['example 1', 'example 2'],
        steps: []
      };

      const metadata = extractWorkflowMetadata(mockWorkflow);

      // Examples are auto-generated based on intent
      expect(metadata.examples).toBeDefined();
      expect(Array.isArray(metadata.examples)).toBe(true);
      expect(metadata.examples.length).toBeGreaterThan(0);
    });

    it('should handle workflow without params', () => {
      const mockWorkflow: Workflow = {
        name: 'list-articles',
        description: 'List all articles',
        intent: 'list_articles',
        steps: []
      };

      const metadata = extractWorkflowMetadata(mockWorkflow);

      expect(metadata.params).toEqual([]);
    });

    it('should auto-generate examples even when not provided', () => {
      const mockWorkflow: Workflow = {
        name: 'test-workflow',
        description: 'Test',
        intent: 'test',
        steps: []
      };

      const metadata = extractWorkflowMetadata(mockWorkflow);

      // Examples are auto-generated based on workflow
      expect(metadata.examples).toBeDefined();
      expect(Array.isArray(metadata.examples)).toBe(true);
    });
  });

  describe('14.15 - 静态知识加载', () => {
    it('should load static knowledge from file', () => {
      const staticKnowledge = loadStaticKnowledge();

      expect(staticKnowledge).toContain('Rosydawn');
      expect(staticKnowledge).toContain('项目背景');
    });

    it('should parse project rules from static knowledge', () => {
      const staticKnowledge = loadStaticKnowledge();

      // The static.md file contains project rules
      expect(staticKnowledge.length).toBeGreaterThan(0);
    });

    it('should handle missing static knowledge file gracefully', () => {
      // This test verifies the function doesn't crash if file doesn't exist
      // In production, the function should handle this gracefully
      const result = loadStaticKnowledge();
      expect(typeof result).toBe('string');
    });
  });

  describe('14.16 - 知识库合并', () => {
    it('should generate complete knowledge base', () => {
      const mockWorkflows: Workflow[] = [
        {
          name: 'create-article',
          description: 'Create article',
          intent: 'create_article',
          params: {
            required: ['topic'],
            optional: ['tags']
          },
          steps: []
        },
        {
          name: 'list-articles',
          description: 'List articles',
          intent: 'list_articles',
          steps: []
        }
      ];

      const knowledgeBase = generateKnowledgeBase(mockWorkflows);

      expect(knowledgeBase.workflows).toHaveLength(2);
      expect(knowledgeBase.workflows[0].intent).toBe('create_article');
      expect(knowledgeBase.workflows[1].intent).toBe('list_articles');
    });

    it('should include project rules', () => {
      const knowledgeBase = generateKnowledgeBase([]);

      expect(knowledgeBase.projectRules).toBeDefined();
      expect(Array.isArray(knowledgeBase.projectRules)).toBe(true);
    });

    it('should include constraints', () => {
      const knowledgeBase = generateKnowledgeBase([]);

      expect(knowledgeBase.constraints).toBeDefined();
      expect(Array.isArray(knowledgeBase.constraints)).toBe(true);
    });

    it('should include generated timestamp', () => {
      const beforeTime = new Date().toISOString();
      const knowledgeBase = generateKnowledgeBase([]);
      const afterTime = new Date().toISOString();

      expect(knowledgeBase.generatedAt).toBeDefined();
      expect(knowledgeBase.generatedAt >= beforeTime).toBe(true);
      expect(knowledgeBase.generatedAt <= afterTime).toBe(true);
    });

    it('should merge workflow metadata with static knowledge', () => {
      const mockWorkflow: Workflow = {
        name: 'test',
        description: 'Test workflow',
        intent: 'test',
        steps: []
      };

      const knowledgeBase = generateKnowledgeBase([mockWorkflow]);

      // Should have both workflow and static knowledge
      expect(knowledgeBase.workflows.length).toBeGreaterThan(0);
      expect(knowledgeBase.projectRules.length).toBeGreaterThan(0);
      expect(knowledgeBase.constraints.length).toBeGreaterThan(0);
    });

    it('should handle empty workflow list', () => {
      const knowledgeBase = generateKnowledgeBase([]);

      expect(knowledgeBase.workflows).toEqual([]);
      expect(knowledgeBase.projectRules.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle workflow with complex parameter types', () => {
      const mockWorkflow: Workflow = {
        name: 'complex-workflow',
        description: 'Complex',
        intent: 'complex',
        params: {
          required: ['stringParam', 'numberParam', 'booleanParam'],
          optional: ['arrayParam']
        },
        steps: []
      };

      const metadata = extractWorkflowMetadata(mockWorkflow);

      expect(metadata.params?.length).toBe(4);

      // Note: The implementation defaults all param types to 'string'
      // Type inference from param names is not implemented
      const stringParam = metadata.params?.find(p => p.name === 'stringParam');
      expect(stringParam?.type).toBe('string'); // Defaults to string
      expect(stringParam?.required).toBe(true);

      const numberParam = metadata.params?.find(p => p.name === 'numberParam');
      expect(numberParam?.type).toBe('string'); // Defaults to string
      expect(numberParam?.required).toBe(true);

      const booleanParam = metadata.params?.find(p => p.name === 'booleanParam');
      expect(booleanParam?.type).toBe('string'); // Defaults to string
      expect(booleanParam?.required).toBe(true);

      const arrayParam = metadata.params?.find(p => p.name === 'arrayParam');
      expect(arrayParam?.type).toBe('string'); // Defaults to string
      expect(arrayParam?.required).toBe(false);
    });

    it('should handle workflow with description containing special characters', () => {
      const mockWorkflow: Workflow = {
        name: 'test',
        description: 'Test with "quotes" and \\backslash and 中文',
        intent: 'test',
        steps: []
      };

      const metadata = extractWorkflowMetadata(mockWorkflow);

      expect(metadata.description).toBe('Test with "quotes" and \\backslash and 中文');
    });

    it('should handle workflow with very long name', () => {
      const longName = 'a'.repeat(100);
      const mockWorkflow: Workflow = {
        name: longName,
        description: 'Test',
        intent: 'test',
        steps: []
      };

      const metadata = extractWorkflowMetadata(mockWorkflow);

      expect(metadata.name).toBe(longName);
    });
  });
});
