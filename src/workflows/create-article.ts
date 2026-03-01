import type { Workflow } from '../workflow/types.js';
import {
  validateGitStatus,
  validateArticlesDirectory,
  inputTopic,
  generateMetadata,
  buildFrontmatter,
  generateSlug,
  confirmCreation,
  createFile,
  startDevServer,
  gitAdd,
  showSummary,
} from '../steps/builtin.js';

/**
 * 创建文章 Workflow
 *
 * 完整的文章创建流程，包含验证、元数据生成、文件创建、Git 操作等
 */
export const createArticleWorkflow: Workflow = {
  name: 'create-article',
  description: '创建一篇新文章',
  intent: 'create_article',
  params: {
    required: ['topic'],
    optional: ['tags', 'category', 'date'],
  },
  steps: [
    // 1. Validators - 验证前置条件
    validateGitStatus,
    validateArticlesDirectory,

    // 2. Processors - 数据处理和准备
    inputTopic,
    generateMetadata,
    buildFrontmatter,
    generateSlug,

    // 3. Notifier - 用户确认
    confirmCreation,

    // 4. Actions - 执行核心操作
    createFile,
    startDevServer,
    gitAdd,

    // 5. Notifier - 显示完成摘要
    showSummary,
  ],
};
