/**
 * 显示帮助信息
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
  console.log('  content new --topic <topic>        创建一篇新文章');
  console.log('    Options:');
  console.log('      --topic <topic>                (必需) 文章主题');
  console.log('      --tags <tags>                  (可选) 标签，逗号分隔');
  console.log('      --category <category>          (可选) 分类');
  console.log('');
  console.log('REPL MODE:');
  console.log('  启动 REPL 模式后，可以使用自然语言与 AI 对话：');
  console.log('');
  console.log('  示例:');
  console.log('    🤖 > 创建一篇关于 WebSocket 的文章');
  console.log('    🤖 > 列出所有文章');
  console.log('    🤖 > 发布最新文章');
  console.log('    🤖 > exit                        退出 REPL');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  # REPL 模式（推荐）');
  console.log('  $ rosydawn');
  console.log('  🤖 > 创建一篇关于 GraphQL 的文章');
  console.log('');
  console.log('  # 命令行模式');
  console.log('  $ rosydawn content new --topic "GraphQL 入门教程"');
  console.log('  $ rosydawn content new --topic "WebSocket" --tags "network,realtime"');
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
