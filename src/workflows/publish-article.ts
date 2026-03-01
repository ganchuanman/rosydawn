import type { Workflow } from '../workflow/types.js';
import {
  getChangedArticles,
  collectExistingTags,
  generateMetadata,
  editConfirm,
  updateFrontmatter,
  commitAndPush,
} from '../steps/builtin.js';

/**
 * 发布文章 Workflow
 *
 * 检测未发布的文章变更，生成元数据，确认后推送到 Git 仓库
 */
export const publishArticleWorkflow: Workflow = {
  name: 'publish-article',
  description: '发布文章到 Git 仓库',
  intent: 'publish_article',
  params: {
    required: [],
    optional: ['contentDir', 'message'],
  },
  steps: [
    // 1. Validators - 检测文章变更
    getChangedArticles,

    // 2. Processors - 生成元数据
    collectExistingTags,
    generateMetadata,

    // 3. Notifier - 用户确认和编辑
    editConfirm,

    // 4. Processors - 更新 frontmatter
    updateFrontmatter,

    // 5. Actions - Git 提交和推送
    commitAndPush,
  ],
};
