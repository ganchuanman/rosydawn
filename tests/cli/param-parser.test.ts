/**
 * 参数解析单元测试
 */

import { describe, it, expect } from 'vitest';
import { parseCommandArgs } from '../../src/cli/param-parser.js';
import type { CommandConfig } from '../../src/cli/command-registry.js';

describe('parseCommandArgs', () => {
  const testConfig: CommandConfig = {
    command: 'test:command',
    workflow: 'test-workflow',
    description: '测试命令',
    options: [
      { name: 'topic', type: 'string', required: true, description: '主题' },
      { name: 'category', type: 'string', required: false, description: '分类' },
      { name: 'dry-run', type: 'boolean', required: false, description: '模拟运行', default: false }
    ]
  };

  it('应该解析 --key value 格式', () => {
    const args = ['--topic', 'WebSocket'];
    const { params, errors } = parseCommandArgs(args, testConfig);

    expect(errors).toHaveLength(0);
    expect(params.topic).toBe('WebSocket');
  });

  it('应该解析布尔标志', () => {
    const args = ['--topic', 'Test', '--dry-run'];
    const { params, errors } = parseCommandArgs(args, testConfig);

    expect(errors).toHaveLength(0);
    expect(params.topic).toBe('Test');
    expect(params['dry-run']).toBe(true);
  });

  it('应该转换数字为字符串', () => {
    const args = ['--topic', '123'];
    const { params, errors } = parseCommandArgs(args, testConfig);

    expect(errors).toHaveLength(0);
    expect(params.topic).toBe('123');
    expect(typeof params.topic).toBe('string');
  });

  it('应该检测缺少的必填参数', () => {
    const args: string[] = [];
    const { errors } = parseCommandArgs(args, testConfig);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('topic');
  });

  it('应该填充默认值', () => {
    const args = ['--topic', 'Test'];
    const { params, errors } = parseCommandArgs(args, testConfig);

    expect(errors).toHaveLength(0);
    expect(params['dry-run']).toBe(false);
  });

  it('应该处理多个参数', () => {
    const args = ['--topic', 'WebSocket', '--category', 'Tech'];
    const { params, errors } = parseCommandArgs(args, testConfig);

    expect(errors).toHaveLength(0);
    expect(params.topic).toBe('WebSocket');
    expect(params.category).toBe('Tech');
  });

  it('应该跳过 --help 参数', () => {
    const args = ['--topic', 'Test', '--help'];
    const { params, errors } = parseCommandArgs(args, testConfig);

    expect(errors).toHaveLength(0);
    expect(params.topic).toBe('Test');
    expect(params.help).toBeUndefined();
  });

  it('应该处理参数别名', () => {
    const args = ['-t', 'WebSocket'];
    const { params, errors } = parseCommandArgs(args, testConfig);

    expect(errors).toHaveLength(0);
    expect(params.topic || params.t).toBe('WebSocket');
  });
});
