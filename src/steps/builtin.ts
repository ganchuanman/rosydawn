/**
 * Built-in Steps
 *
 * 注册所有内置步骤
 */

import { registerStep } from './registry.js';

// Validators
import { checkGitChanges, getChangedArticles, checkDirectory } from './validators/index.js';

// Processors
import {
  generateMetadata,
  collectExistingTags,
  inputTopic,
  updateFrontmatter,
} from './processors/index.js';

// Actions
import { createFile, commitAndPush, startDevServer } from './actions/index.js';

// Notifiers
import { confirmCreation, editConfirm } from './notifiers/index.js';

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

  // Processors
  registerStep(generateMetadata);
  registerStep(collectExistingTags);
  registerStep(inputTopic);
  registerStep(updateFrontmatter);

  // Actions
  registerStep(createFile);
  registerStep(commitAndPush);
  registerStep(startDevServer);

  // Notifiers
  registerStep(confirmCreation);
  registerStep(editConfirm);
}

// 导出所有内置步骤,便于单独使用
export {
  // Validators
  checkGitChanges,
  getChangedArticles,
  checkDirectory,
  // Processors
  generateMetadata,
  collectExistingTags,
  inputTopic,
  updateFrontmatter,
  // Actions
  createFile,
  commitAndPush,
  startDevServer,
  // Notifiers
  confirmCreation,
  editConfirm,
};
