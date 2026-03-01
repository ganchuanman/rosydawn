# Specs Index

本 change 实现以下来自父 change 的 specs：

## 引用的 Specs

### 1. article-publish-cli
**路径**: [../ai-conversational-cli/specs/article-publish-cli/spec.md](../ai-conversational-cli/specs/article-publish-cli/spec.md)

**说明**: 文章发布 Workflow，检测文章变更、生成元数据、Git 推送

**本 change 的实现范围**:
- ✅ 完整实现所有需求
- 复用 steps: `getChangedArticles`, `collectExistingTags`, `generateMetadata`, `editConfirm`, `updateFrontmatter`, `commitAndPush`

---

### 2. deploy-workflow
**路径**: [../ai-conversational-cli/specs/deploy-workflow/spec.md](../ai-conversational-cli/specs/deploy-workflow/spec.md)

**说明**: 部署 Workflow，构建并部署到服务器

**本 change 的实现范围**:
- ✅ 完整实现所有需求
- 新增 steps: `buildProject`, `confirmDeploy`, `executeDeploy`
- 复用 steps: `checkGitChanges`

---

### 3. system-workflows
**路径**: [../ai-conversational-cli/specs/system-workflows/spec.md](../ai-conversational-cli/specs/system-workflows/spec.md)

**说明**: 系统 Workflows，包括 start-dev、build、check-status

**本 change 的实现范围**:
- ✅ 完整实现所有需求
- 新增 steps: `checkPort`, `cleanDist`, `compileProject`, `optimizeAssets`, `checkArticleStats`, `checkDeploymentStatus`
- 复用 steps: `startDevServer`, `buildProject`

---

## 实现说明

本 change 不定义新的 specs，而是实现父 change `ai-conversational-cli` 中已规划的 3 个 specs。

所有的需求详情请参考上述引用的 spec 文件。
