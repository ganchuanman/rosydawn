/**
 * CommandRegistry 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry } from '../../src/cli/command-registry.js';

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  describe('register', () => {
    it('应该成功注册命令', () => {
      const config = {
        command: 'test:command',
        workflow: 'test-workflow',
        description: '测试命令'
      };

      expect(() => registry.register(config)).not.toThrow();
    });

    it('应该拒绝重复注册', () => {
      const config = {
        command: 'test:command',
        workflow: 'test-workflow',
        description: '测试命令'
      };

      registry.register(config);

      expect(() => registry.register(config)).toThrow('已注册');
    });
  });

  describe('alias', () => {
    it('应该成功注册别名', () => {
      registry.register({
        command: 'content:new',
        workflow: 'create-article',
        description: '创建文章'
      });

      expect(() => registry.alias('new', 'content:new')).not.toThrow();
    });

    it('应该拒绝与现有命令冲突的别名', () => {
      registry.register({
        command: 'test',
        workflow: 'test-workflow',
        description: '测试'
      });

      expect(() => registry.alias('test', 'other:command')).toThrow('冲突');
    });

    it('应该拒绝重复的别名', () => {
      registry.register({
        command: 'content:new',
        workflow: 'create-article',
        description: '创建文章'
      });

      registry.alias('new', 'content:new');

      expect(() => registry.alias('new', 'content:new')).toThrow('已存在');
    });
  });

  describe('resolve', () => {
    it('应该解析已注册的命令', () => {
      registry.register({
        command: 'content:new',
        workflow: 'create-article',
        description: '创建文章'
      });

      const config = registry.resolve('content:new');

      expect(config).toBeDefined();
      expect(config?.command).toBe('content:new');
      expect(config?.workflow).toBe('create-article');
    });

    it('应该通过别名解析命令', () => {
      registry.register({
        command: 'content:new',
        workflow: 'create-article',
        description: '创建文章'
      });

      registry.alias('new', 'content:new');

      const config = registry.resolve('new');

      expect(config).toBeDefined();
      expect(config?.command).toBe('content:new');
    });

    it('应该对未知命令返回 null', () => {
      const config = registry.resolve('unknown:command');

      expect(config).toBeNull();
    });
  });

  describe('getHelp', () => {
    it('应该生成全局帮助', () => {
      registry.register({
        command: 'content:new',
        workflow: 'create-article',
        description: '创建文章',
        category: 'content'
      });

      const help = registry.getHelp();

      expect(help).toContain('Rosydawn');
      expect(help).toContain('content:new');
      expect(help).toContain('创建文章');
    });

    it('应该生成命令帮助', () => {
      registry.register({
        command: 'content:new',
        workflow: 'create-article',
        description: '创建文章',
        options: [
          { name: 'topic', type: 'string', required: true, description: '文章主题' }
        ]
      });

      const help = registry.getHelp('content:new');

      expect(help).toContain('content:new');
      expect(help).toContain('创建文章');
      expect(help).toContain('--topic');
    });
  });

  describe('validateCompleteness', () => {
    it('应该检测未映射的 workflow', () => {
      registry.register({
        command: 'test:command',
        workflow: 'test-workflow',
        description: '测试'
      });

      const warnings = registry.validateCompleteness(['test-workflow', 'unmapped-workflow']);

      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('unmapped-workflow');
    });

    it('应该在所有 workflow 都映射时返回空数组', () => {
      registry.register({
        command: 'test:command',
        workflow: 'test-workflow',
        description: '测试'
      });

      const warnings = registry.validateCompleteness(['test-workflow']);

      expect(warnings).toHaveLength(0);
    });
  });
});
