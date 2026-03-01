/**
 * 命令注册配置
 *
 * 统一注册所有可用命令及其别名、参数和帮助信息
 */

import { CommandRegistry } from './command-registry.js';

/**
 * 初始化并配置 CommandRegistry
 */
export function setupCommands(registry: CommandRegistry): void {
  // === Content 类命令 ===

  registry.register({
    command: 'content:new',
    workflow: 'create-article',
    description: '创建新的博客文章',
    category: 'content',
    aliases: ['new'],
    options: [
      {
        name: 'topic',
        type: 'string',
        required: true,
        description: '文章主题'
      },
      {
        name: 'category',
        type: 'string',
        required: false,
        description: '文章分类'
      }
    ],
    examples: [
      'rosydawn new --topic "WebSocket 实战指南"',
      'rosydawn content:new --topic "TypeScript 高级技巧" --category "技术"'
    ]
  });

  registry.register({
    command: 'content:publish',
    workflow: 'publish-article',
    description: '发布文章到博客',
    category: 'content',
    aliases: ['publish'],
    options: [
      {
        name: 'slug',
        type: 'string',
        required: true,
        description: '文章标识符（目录名）'
      }
    ],
    examples: [
      'rosydawn publish --slug "2026/03/my-article"',
      'rosydawn content:publish --slug "2026/02/websocket-guide"'
    ]
  });

  // === Deploy 类命令 ===

  registry.register({
    command: 'deploy:apply',
    workflow: 'deploy',
    description: '部署博客到生产环境',
    category: 'deploy',
    aliases: ['deploy'],
    options: [
      {
        name: 'dry-run',
        type: 'boolean',
        required: false,
        description: '模拟部署（不实际执行）',
        default: false
      }
    ],
    examples: [
      'rosydawn deploy',
      'rosydawn deploy:apply --dry-run'
    ]
  });

  // === System 类命令 ===

  registry.register({
    command: 'dev:start',
    workflow: 'start-dev',
    description: '启动开发服务器',
    category: 'system',
    aliases: ['dev'],
    options: [],
    examples: [
      'rosydawn dev',
      'rosydawn dev:start'
    ]
  });

  registry.register({
    command: 'build:run',
    workflow: 'build',
    description: '构建生产版本',
    category: 'system',
    aliases: ['build'],
    options: [
      {
        name: 'preview',
        type: 'boolean',
        required: false,
        description: '构建后启动预览服务器',
        default: false
      }
    ],
    examples: [
      'rosydawn build',
      'rosydawn build:run --preview'
    ]
  });

  registry.register({
    command: 'status:check',
    workflow: 'check-status',
    description: '检查系统状态',
    category: 'system',
    aliases: ['status'],
    options: [],
    examples: [
      'rosydawn status',
      'rosydawn status:check'
    ]
  });
}

/**
 * 获取所有已注册的 workflow 名称
 */
export function getRegisteredWorkflows(): string[] {
  return [
    'create-article',
    'publish-article',
    'deploy',
    'start-dev',
    'build',
    'check-status'
  ];
}
