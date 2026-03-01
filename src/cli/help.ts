/**
 * 帮助系统
 *
 * 提供命令行模式的帮助信息生成
 */

import type { CommandRegistry } from './command-registry.js';

/**
 * 显示全局帮助
 */
export function showGlobalHelp(registry: CommandRegistry): void {
  console.log(registry.getHelp());
}

/**
 * 显示命令帮助
 */
export function showCommandHelp(registry: CommandRegistry, command: string): void {
  console.log(registry.getHelp(command));
}

/**
 * 显示旧版帮助（向后兼容）
 */
export function showHelp(): void {
  console.log('');
  console.log('Rosydawn - AI 驱动的博客管理工具');
  console.log('');
  console.log('USAGE:');
  console.log('  rosydawn                           启动 REPL 模式（AI 对话）');
  console.log('  rosydawn <command> [options]       命令行模式');
  console.log('  rosydawn --help                    显示帮助信息');
  console.log('');
  console.log('COMMANDS:');
  console.log('  new, content:new        创建新文章');
  console.log('  publish, content:publish 发布文章');
  console.log('  deploy, deploy:apply    部署博客');
  console.log('  dev, dev:start          启动开发服务器');
  console.log('  build, build:run        构建站点');
  console.log('  status, status:check    检查状态');
  console.log('');
  console.log('REPL MODE:');
  console.log('  启动 REPL 模式后，可以使用自然语言与 AI 对话：');
  console.log('');
  console.log('  示例:');
  console.log('    🤖 > 怎么创建文章？');
  console.log('    🤖 > 如何部署？');
  console.log('    🤖 > 能做什么？');
  console.log('    🤖 > exit                        退出 REPL');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  # REPL 模式（推荐）');
  console.log('  $ rosydawn');
  console.log('  🤖 > 创建一篇关于 WebSocket 的文章');
  console.log('');
  console.log('  # 命令行模式');
  console.log('  $ rosydawn new --topic "WebSocket 实战"');
  console.log('  $ rosydawn publish --slug "2026/03/my-article"');
  console.log('  $ rosydawn deploy');
  console.log('');
  console.log('CONFIGURATION:');
  console.log('  创建 .env 文件并配置以下环境变量：');
  console.log('  OPENAI_API_KEY=your-api-key        OpenAI API Key');
  console.log('  OPENAI_BASE_URL=http://...         (可选) 自定义 API 端点');
  console.log('');
  console.log('MORE INFO:');
  console.log('  GitHub: https://github.com/yourusername/rosydawn');
  console.log('  Docs:   https://github.com/yourusername/rosydawn#readme');
  console.log('');
}
