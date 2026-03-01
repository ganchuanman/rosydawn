import fs from 'fs';
import path from 'path';
import type { KnowledgeBase } from './types.js';
import { generateKnowledgeBase } from './generator.js';
import { workflowRegistry } from '../workflow/registry.js';

/**
 * 加载知识库
 *
 * 生产模式: 加载 dist/knowledge-base.json
 * 开发模式: 实时生成知识库
 */
export async function loadKnowledge(): Promise<KnowledgeBase> {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // 开发模式: 实时生成
    return await loadKnowledgeDev();
  } else {
    // 生产模式: 加载预构建
    return loadKnowledgeProd();
  }
}

/**
 * 开发模式: 实时生成知识库
 */
async function loadKnowledgeDev(): Promise<KnowledgeBase> {
  console.log('🔄 开发模式：实时生成知识库...');

  const startTime = Date.now();

  // 生成知识库（Workflows 应该在调用此函数前已注册）
  const workflowNames = workflowRegistry.getAllNames();
  const workflows = workflowNames
    .map((name) => workflowRegistry.getByName(name)!)
    .filter((wf) => wf !== undefined);

  const knowledgeBase = generateKnowledgeBase(workflows);

  const elapsed = Date.now() - startTime;

  // 性能提示
  if (elapsed > 2000) {
    console.log('⚠️  知识库生成较慢，耗时:', elapsed, 'ms');
  } else {
    console.log(`✅ 知识库已生成 (${elapsed}ms)`);
  }

  return knowledgeBase;
}

/**
 * 生产模式: 加载预构建的知识库
 */
function loadKnowledgeProd(): KnowledgeBase {
  const startTime = Date.now();
  const knowledgePath = path.join(process.cwd(), 'dist', 'knowledge-base.json');

  // 检查文件是否存在
  if (!fs.existsSync(knowledgePath)) {
    console.error('❌ 知识库不存在:', knowledgePath);
    console.error('');
    console.error('请先运行以下命令构建知识库:');
    console.error('  npm run build:knowledge');
    console.error('');
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(knowledgePath, 'utf-8');
    const knowledgeBase = JSON.parse(content) as KnowledgeBase;

    const elapsed = Date.now() - startTime;

    // 性能检查: 加载时间应 <1 秒
    if (elapsed > 1000) {
      console.warn('⚠️  知识库加载较慢:', elapsed, 'ms');
      console.warn('   建议: 检查 knowledge-base.json 文件大小');
    } else {
      console.log(`✅ 知识库已加载 (${elapsed}ms)`);
    }

    console.log(`   Workflows: ${knowledgeBase.workflows.length} 个`);
    console.log(`   生成时间: ${knowledgeBase.generatedAt}`);

    return knowledgeBase;
  } catch (error: any) {
    console.error('❌ 加载知识库失败:', error.message);
    process.exit(1);
  }
}
