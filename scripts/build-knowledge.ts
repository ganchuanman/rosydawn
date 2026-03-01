#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { registerAllWorkflows } from '../src/workflows/index.js';
import { registerBuiltinSteps } from '../src/steps/builtin.js';
import { workflowRegistry } from '../src/workflow/registry.js';
import { generateKnowledgeBase } from '../src/knowledge/generator.js';

/**
 * 构建 Knowledge Base
 */
async function buildKnowledge(): Promise<void> {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Knowledge Base Builder                ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  try {
    // 1. 注册 Steps 和 Workflows
    console.log('📦 Step 1: 注册 Steps 和 Workflows...');
    registerBuiltinSteps();
    registerAllWorkflows();

    // 获取所有已注册的 Workflows
    const workflowNames = workflowRegistry.getAllNames();
    console.log(`   找到 ${workflowNames.length} 个 Workflows`);

    // 2. 生成知识库
    console.log('\n🔨 Step 2: 生成知识库...');
    const workflows = workflowNames
      .map((name) => workflowRegistry.getByName(name)!)
      .filter((wf) => wf !== undefined);

    const knowledgeBase = generateKnowledgeBase(workflows);

    // 3. 写入文件
    console.log('\n💾 Step 3: 写入文件...');
    const distPath = path.join(process.cwd(), 'dist');
    const outputPath = path.join(distPath, 'knowledge-base.json');

    // 确保 dist 目录存在
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(knowledgeBase, null, 2), 'utf-8');

    // 4. 检查文件大小
    const stats = fs.statSync(outputPath);
    const sizeKB = stats.size / 1024;

    console.log(`\n✅ 知识库已生成: ${outputPath}`);
    console.log(`   文件大小: ${sizeKB.toFixed(2)} KB`);
    console.log(`   Workflows: ${knowledgeBase.workflows.length} 个`);
    console.log(`   生成时间: ${knowledgeBase.generatedAt}`);

    // 文件大小警告
    if (sizeKB > 50) {
      console.log('\n⚠️  警告: 知识库较大 (>50KB)，可能影响 AI 性能');
      console.log('   建议: 减少静态知识内容或优化 Workflow 元数据');
    }

    console.log('\n🎉 构建完成！\n');
  } catch (error: any) {
    console.error('\n❌ 构建失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行构建
buildKnowledge();
