/**
 * Built-in Steps
 *
 * 注册所有内置步骤
 */

import { registerStep } from './registry.js';

// Validators
import {
  checkGitChanges,
  getChangedArticles,
  checkDirectory,
  validateGitStatus,
  checkWorkingDirectory,
  validateArticlesDirectory
} from './validators/index.js';

// Processors
import {
  generateMetadata,
  collectExistingTags,
  inputTopic,
  updateFrontmatter,
  buildFrontmatter,
  generateSlug,
} from './processors/index.js';

// Actions
import { createFile, commitAndPush, startDevServer, gitAdd } from './actions/index.js';

// Notifiers
import { confirmCreation, editConfirm, showSummary } from './notifiers/index.js';

/**
 * 注册所有内置步骤
 *
 * @example
 * ```typescript
 * // 在 CLI 入口调用
 * import { registerBuiltinSteps } from './steps/builtin.js';
 *
 * registerBuiltinSteps();
 * ```
 */
export function registerBuiltinSteps(): void {
  // Validators
  registerStep(checkGitChanges);
  registerStep(getChangedArticles);
  registerStep(checkDirectory);
  registerStep(validateGitStatus);
  registerStep(checkWorkingDirectory);
  registerStep(validateArticlesDirectory);

  // Processors
  registerStep(generateMetadata);
  registerStep(collectExistingTags);
  registerStep(inputTopic);
  registerStep(updateFrontmatter);
  registerStep(buildFrontmatter);
  registerStep(generateSlug);

  // Actions
  registerStep(createFile);
  registerStep(commitAndPush);
  registerStep(startDevServer);
  registerStep(gitAdd);

  // Notifiers
  registerStep(confirmCreation);
  registerStep(editConfirm);
  registerStep(showSummary);
}

// 导出所有内置步骤,便于单独使用
export {
  // Validators
  checkGitChanges,
  getChangedArticles,
  checkDirectory,
  validateGitStatus,
  checkWorkingDirectory,
  validateArticlesDirectory,
  // Processors
  generateMetadata,
  collectExistingTags,
  inputTopic,
  updateFrontmatter,
  buildFrontmatter,
  generateSlug,
  // Actions
  createFile,
  commitAndPush,
  startDevServer,
  gitAdd,
  // Notifiers
  confirmCreation,
  editConfirm,
  showSummary,
};
