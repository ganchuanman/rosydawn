import { defineStep } from '../registry.js';

/**
 * 显示完成摘要
 *
 * 在 REPL 模式和命令行模式下显示不同的摘要格式
 */
export const showSummary = defineStep({
  type: 'notifier',
  name: 'showSummary',
  description: '显示文章创建完成的摘要信息',
  execute: async (ctx) => {
    const title = ctx.steps.generateMetadata?.title || ctx.params.topic;
    const filePath = ctx.steps.generateSlug?.filePath || ctx.steps.createFile?.filePath;
    const urlPath = ctx.steps.generateSlug?.urlPath;
    const devServerStarted = ctx.steps.startDevServer?.started;
    const gitAdded = ctx.steps.gitAdd?.success;

    // 判断是否为 REPL 模式（通过检查上下文中的标记）
    const isReplMode = ctx.metadata.mode === 'repl';

    if (isReplMode) {
      // REPL 模式：自然语言响应
      console.log('\n✅ 已创建文章《' + title + '》\n');
      console.log('📄 文件路径: ' + filePath);

      if (urlPath && devServerStarted !== false) {
        console.log('🔗 预览地址: http://localhost:4321' + urlPath);
      }

      if (gitAdded) {
        console.log('\n💡 提示: 文件已添加到 Git 暂存区，可使用 git commit 提交');
      }

      if (devServerStarted === false) {
        console.log('\n⚠️  开发服务器启动失败，请手动运行 npm run dev');
      }

      console.log('');
    } else {
      // 命令行模式：结构化输出
      console.log('Created: ' + title);
      console.log('Path: ' + filePath);

      if (urlPath) {
        console.log('URL: http://localhost:4321' + urlPath);
      }

      if (gitAdded) {
        console.log('Git: Added to staging area');
      }

      if (devServerStarted === false) {
        console.log('Warning: Dev server failed to start');
      }
    }

    return {
      displayed: true,
      mode: isReplMode ? 'repl' : 'cli',
    };
  },
});
