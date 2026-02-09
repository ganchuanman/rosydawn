import 'dotenv/config';
import { input, confirm, select } from '@inquirer/prompts';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { loadConfig, validateAIConfig } from './lib/config.js';
import { generatePublishMetadata, type PublishMetadata } from './lib/ai.js';
import {
  getChangedFiles,
  getDiffSummary,
  stageFiles,
  commit,
  push,
  getCurrentBranch,
  type ChangedFile,
} from './lib/git.js';
import {
  parseFrontmatter,
  updateFrontmatter,
  extractTitleFromFrontmatter,
} from './lib/frontmatter.js';

const POSTS_DIR = 'src/content/posts';

interface ArticleChange {
  file: ChangedFile;
  title: string;
  content: string;
  isNew: boolean;
}

async function main() {
  console.log('\n📝 发布文章\n');

  const changedFiles = getChangedFiles(POSTS_DIR);
  const articleChanges = changedFiles.filter(
    (f) => f.path.endsWith('.md') || f.path.endsWith('.mdx')
  );

  if (articleChanges.length === 0) {
    console.log('没有待发布的文章\n');
    process.exit(0);
  }

  console.log('检测到以下文章变更：\n');

  const articles: ArticleChange[] = [];

  for (const file of articleChanges) {
    const fullPath = resolve(process.cwd(), file.path);
    const title = extractTitleFromFrontmatter(fullPath) || file.path;
    const content = readFileSync(fullPath, 'utf-8');
    const statusLabel = file.status === 'new' ? '[新增]' : '[修改]';

    console.log(`   ${statusLabel} ${title}`);
    console.log(`          ${file.path}\n`);

    articles.push({
      file,
      title,
      content,
      isNew: file.status === 'new',
    });
  }

  const config = await loadConfig();
  const validation = validateAIConfig(config);

  const existingTags = collectExistingTags();

  let metadata: PublishMetadata;

  if (validation.valid) {
    console.log('⏳ 正在分析文章内容...\n');

    const combinedContent = articles.map((a) => a.content).join('\n\n---\n\n');
    const isNew = articles.every((a) => a.isNew);
    const result = await generatePublishMetadata(
      config.ai,
      combinedContent,
      existingTags,
      isNew
    );

    if (result.success) {
      metadata = result.data;
    } else {
      console.log(`⚠️  ${result.error}`);
      console.log('降级为手动输入模式\n');
      metadata = await manualInput();
    }
  } else {
    console.log(`⚠️  ${validation.error}`);
    console.log('降级为手动输入模式\n');
    metadata = await manualInput();
  }

  let confirmed = false;

  while (!confirmed) {
    console.log('📋 生成的元信息：\n');
    console.log(`   description: ${metadata.description}\n`);
    console.log(`   tags: [${metadata.tags.join(', ')}]\n`);
    console.log(`   commit: ${metadata.commitMessage}\n`);

    const choice = await select({
      message: '确认以上信息？',
      choices: [
        { name: 'Y - 确认并发布', value: 'confirm' },
        { name: 'n - 取消', value: 'cancel' },
        { name: 'e - 编辑修改', value: 'edit' },
      ],
    });

    if (choice === 'confirm') {
      confirmed = true;
    } else if (choice === 'cancel') {
      console.log('\n❌ 已取消发布\n');
      process.exit(0);
    } else if (choice === 'edit') {
      metadata = await editMetadata(metadata);
    }
  }

  console.log('\n✓ 正在更新 frontmatter...');

  for (const article of articles) {
    const fullPath = resolve(process.cwd(), article.file.path);
    const success = updateFrontmatter(fullPath, {
      description: metadata.description,
      tags: metadata.tags,
    });

    if (!success) {
      console.log(`⚠️  更新 ${article.file.path} 失败`);
    }
  }

  console.log('✓ frontmatter 已更新');

  const filesToCommit = articles.map((a) => a.file.path);
  const diffSummary = getDiffSummary(filesToCommit);

  console.log('\n📋 即将提交的变更：\n');
  console.log(`   Commit: ${metadata.commitMessage}\n`);
  console.log('   变更文件：');
  for (const file of filesToCommit) {
    console.log(`     - ${file}`);
  }
  if (diffSummary) {
    console.log('\n   变更摘要：');
    console.log(diffSummary.split('\n').map((l) => `     ${l}`).join('\n'));
  }
  console.log(`\n   共 ${articles.length} 篇文章\n`);

  const finalConfirm = await confirm({
    message: '确认提交并推送？',
    default: true,
  });

  if (!finalConfirm) {
    console.log('\n已取消发布，文件变更已保留\n');
    process.exit(0);
  }

  console.log('\n✓ 正在提交...');

  const stageResult = stageFiles(filesToCommit);
  if (!stageResult.success) {
    console.log(`❌ git add 失败: ${stageResult.error}`);
    process.exit(1);
  }

  const commitResult = commit(metadata.commitMessage);
  if (!commitResult.success) {
    console.log(`❌ git commit 失败: ${commitResult.error}`);
    process.exit(1);
  }

  console.log(`✓ 已提交: ${metadata.commitMessage}`);

  const branch = getCurrentBranch();
  console.log(`✓ 正在推送到 origin/${branch}...`);

  const pushResult = await push();
  if (!pushResult.success) {
    console.log(`\n⚠️  git push 失败: ${pushResult.error}`);
    console.log('本地 commit 已保留，请手动解决后重试 git push\n');
    process.exit(1);
  }

  console.log(`✓ 已推送到 origin/${branch}`);
  console.log('\n🎉 文章发布成功！\n');
}

async function manualInput(): Promise<PublishMetadata> {
  const description = await input({
    message: '请输入文章摘要（100-150 字）：',
  });

  const tagsInput = await input({
    message: '请输入标签（用逗号分隔）：',
  });

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const commitMessage = await input({
    message: '请输入 commit message：',
  });

  return { description, tags, commitMessage };
}

async function editMetadata(current: PublishMetadata): Promise<PublishMetadata> {
  const description = await input({
    message: '文章摘要：',
    default: current.description,
  });

  const tagsInput = await input({
    message: '标签（用逗号分隔）：',
    default: current.tags.join(', '),
  });

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const commitMessage = await input({
    message: 'Commit message：',
    default: current.commitMessage,
  });

  return { description, tags, commitMessage };
}

function collectExistingTags(): string[] {
  const tags = new Set<string>();
  const postsPath = resolve(process.cwd(), POSTS_DIR);

  try {
    collectTagsRecursively(postsPath, tags);
  } catch {
    // ignore errors
  }

  return Array.from(tags);
}

function collectTagsRecursively(dir: string, tags: Set<string>): void {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      collectTagsRecursively(fullPath, tags);
    } else if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
      const parsed = parseFrontmatter(fullPath);
      if (parsed?.frontmatter.tags) {
        for (const tag of parsed.frontmatter.tags) {
          tags.add(tag);
        }
      }
    }
  }
}

main().catch((error) => {
  console.error('❌ 发生错误:', error.message);
  process.exit(1);
});
