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
  validateArticlesDirectory,
  checkPort,
  checkArticleStats,
  checkDeploymentStatus
} from './validators/index.js';

// Processors
import {
  generateMetadata,
  collectExistingTags,
  inputTopic,
  updateFrontmatter,
  buildFrontmatter,
  generateSlug,
  optimizeAssets,
} from './processors/index.js';

// Actions
import { createFile, commitAndPush, startDevServer, gitAdd, buildProject, executeDeploy, cleanDist } from './actions/index.js';

// Notifiers
import { confirmCreation, editConfirm, showSummary, confirmDeploy } from './notifiers/index.js';

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
  registerStep(checkPort);
  registerStep(checkArticleStats);
  registerStep(checkDeploymentStatus);

  // Processors
  registerStep(generateMetadata);
  registerStep(collectExistingTags);
  registerStep(inputTopic);
  registerStep(updateFrontmatter);
  registerStep(buildFrontmatter);
  registerStep(generateSlug);
  registerStep(optimizeAssets);

  // Actions
  registerStep(createFile);
  registerStep(commitAndPush);
  registerStep(startDevServer);
  registerStep(gitAdd);
  registerStep(buildProject);
  registerStep(executeDeploy);
  registerStep(cleanDist);

  // Notifiers
  registerStep(confirmCreation);
  registerStep(editConfirm);
  registerStep(showSummary);
  registerStep(confirmDeploy);
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
  checkPort,
  checkArticleStats,
  checkDeploymentStatus,
  // Processors
  generateMetadata,
  collectExistingTags,
  inputTopic,
  updateFrontmatter,
  buildFrontmatter,
  generateSlug,
  optimizeAssets,
  // Actions
  createFile,
  commitAndPush,
  startDevServer,
  gitAdd,
  buildProject,
  executeDeploy,
  cleanDist,
  // Notifiers
  confirmCreation,
  editConfirm,
  showSummary,
  confirmDeploy,
};
