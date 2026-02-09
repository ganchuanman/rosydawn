import 'dotenv/config';
import { input, confirm } from '@inquirer/prompts';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { resolve } from 'node:path';
import { loadConfig, validateAIConfig } from './lib/config.js';
import { generateArticleMetadata } from './lib/ai.js';
import { createArticleSkeleton } from './lib/frontmatter.js';

const POSTS_DIR = 'src/content/posts';
const DEV_PORT = 4321;

async function main() {
  console.log('\n🖊️  创建新文章\n');

  const topicDescription = await input({
    message: '这篇文章的核心主题是什么？',
  });

  if (!topicDescription.trim()) {
    console.log('❌ 主题描述不能为空');
    process.exit(1);
  }

  const config = await loadConfig();
  const validation = validateAIConfig(config);

  let title: string;
  let slug: string;

  if (validation.valid) {
    console.log('\n⏳ 正在生成文章信息...\n');

    const result = await generateArticleMetadata(config.ai, topicDescription);

    if (result.success) {
      title = result.data.title;
      slug = result.data.slug;
    } else {
      console.log(`⚠️  ${result.error}`);
      console.log('降级为手动输入模式\n');
      ({ title, slug } = await manualInput());
    }
  } else {
    console.log(`⚠️  ${validation.error}`);
    console.log('降级为手动输入模式\n');
    ({ title, slug } = await manualInput());
  }

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const date = `${year}-${month}-${now.getDate().toString().padStart(2, '0')}`;

  const articleDir = resolve(process.cwd(), POSTS_DIR, year, month, slug);
  const articleFile = resolve(articleDir, 'index.md');

  console.log('📁 文章信息预览：');
  console.log(`   标题: ${title}`);
  console.log(`   目录: ${POSTS_DIR}/${year}/${month}/${slug}/`);
  console.log(`   文件: index.md\n`);

  if (existsSync(articleDir)) {
    console.log(`⚠️  目录已存在: ${articleDir}`);
    const useNewSlug = await confirm({
      message: '是否使用其他 slug？',
      default: true,
    });

    if (useNewSlug) {
      slug = await input({ message: '请输入新的 slug：' });
      const newDir = resolve(process.cwd(), POSTS_DIR, year, month, slug);
      if (existsSync(newDir)) {
        console.log('❌ 新目录也已存在，请手动处理');
        process.exit(1);
      }
    } else {
      console.log('❌ 已取消创建');
      process.exit(0);
    }
  }

  const confirmed = await confirm({
    message: '确认创建？',
    default: true,
  });

  if (!confirmed) {
    console.log('❌ 已取消创建');
    process.exit(0);
  }

  const finalDir = resolve(process.cwd(), POSTS_DIR, year, month, slug);
  const finalFile = resolve(finalDir, 'index.md');

  mkdirSync(finalDir, { recursive: true });
  writeFileSync(finalFile, createArticleSkeleton(title, date), 'utf-8');

  console.log('\n✓ 文章已创建');

  const isPortInUse = await checkPort(DEV_PORT);

  if (isPortInUse) {
    console.log('✓ 开发服务器已在运行');
  } else {
    console.log('✓ 开发服务器启动中...');
    startDevServer();
  }

  console.log('\n🚀 准备就绪！');
  console.log(`   编辑文章: ${POSTS_DIR}/${year}/${month}/${slug}/index.md`);
  console.log(`   实时预览: http://localhost:${DEV_PORT}/blog/${year}/${month}/${slug}`);
  console.log('\n   完成写作后，运行 npm run publish 发布文章\n');
}

async function manualInput(): Promise<{ title: string; slug: string }> {
  const title = await input({ message: '请输入文章标题：' });
  const slug = await input({ message: '请输入 slug（英文，用连字符连接）：' });

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  return { title, slug: cleanSlug };
}

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port }, () => {
      socket.end();
      resolve(true);
    });

    socket.on('error', () => {
      resolve(false);
    });
  });
}

function startDevServer(): void {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: process.cwd(),
    detached: true,
    stdio: 'ignore',
  });

  child.unref();
}

main().catch((error) => {
  console.error('❌ 发生错误:', error.message);
  process.exit(1);
});
