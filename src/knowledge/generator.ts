import fs from 'fs';
import path from 'path';
import type { Workflow } from '../workflow/types.js';
import type { KnowledgeBase, WorkflowMetadata, ParamSchema } from './types.js';

/**
 * 从 Workflow 定义提取元数据
 */
export function extractWorkflowMetadata(workflow: Workflow): WorkflowMetadata {
  const metadata: WorkflowMetadata = {
    name: workflow.name,
    description: workflow.description,
    intent: workflow.intent,
    params: [],
    examples: []
  };

  // 提取参数定义
  if (workflow.params) {
    const allParams = [
      ...(workflow.params.required || []).map((name) => ({
        name,
        required: true
      })),
      ...(workflow.params.optional || []).map((name) => ({
        name,
        required: false
      }))
    ];

    metadata.params = allParams.map((param) => ({
      name: param.name,
      type: 'string' as const, // 默认类型
      required: param.required,
      description: undefined
    }));
  }

  // 生成示例 (基于 intent 和参数)
  metadata.examples = generateExamples(workflow);

  return metadata;
}

/**
 * 生成使用示例
 */
function generateExamples(workflow: Workflow): string[] {
  const examples: string[] = [];

  // Mock Workflow 特殊标注
  const isMock = workflow.name.startsWith('mock-');
  const mockLabel = isMock ? ' (Mock)' : '';

  // 根据不同的 intent 生成示例
  switch (workflow.intent) {
    case 'mock_create_article':
      examples.push('创建一篇关于 WebSocket 的文章' + mockLabel);
      examples.push('帮我写一篇关于 Docker 的技术文章' + mockLabel);
      break;
    case 'mock_list_articles':
      examples.push('列出所有文章' + mockLabel);
      examples.push('查看文章列表' + mockLabel);
      break;
    case 'mock_publish':
      examples.push('发布文章' + mockLabel);
      examples.push('将文章发布到博客' + mockLabel);
      break;
    default:
      // 默认示例
      examples.push(`执行 ${workflow.name}` + mockLabel);
  }

  return examples;
}

/**
 * 加载静态知识
 */
export function loadStaticKnowledge(): string {
  const staticPath = path.join(process.cwd(), 'knowledge', 'static.md');

  try {
    if (fs.existsSync(staticPath)) {
      return fs.readFileSync(staticPath, 'utf-8');
    } else {
      console.log('⚠️  静态知识文件不存在，使用空字符串');
      return '';
    }
  } catch (error: any) {
    console.error('❌ 读取静态知识文件失败:', error.message);
    return '';
  }
}

/**
 * 生成知识库
 */
export function generateKnowledgeBase(workflows: Workflow[]): KnowledgeBase {
  console.log('🔄 正在生成知识库...');

  // 提取所有 Workflow 元数据
  const workflowMetadata = workflows.map(extractWorkflowMetadata);

  // 加载静态知识
  const staticKnowledge = loadStaticKnowledge();

  // 解析静态知识为规则和约束
  const projectRules = parseProjectRules(staticKnowledge);
  const constraints = parseConstraints(staticKnowledge);

  const knowledgeBase: KnowledgeBase = {
    workflows: workflowMetadata,
    projectRules,
    constraints,
    generatedAt: new Date().toISOString()
  };

  console.log(`✅ 知识库生成完成: ${workflowMetadata.length} 个 Workflows`);

  return knowledgeBase;
}

/**
 * 解析项目规则
 */
function parseProjectRules(staticKnowledge: string): string[] {
  const rules: string[] = [];

  // 提取项目背景相关内容
  const projectSection = extractSection(staticKnowledge, '项目背景', '部署流程');
  if (projectSection) {
    rules.push(projectSection);
  }

  // 提取使用注意事项
  const notesSection = extractSection(staticKnowledge, '使用注意事项', 'AI 交互示例');
  if (notesSection) {
    rules.push(notesSection);
  }

  return rules;
}

/**
 * 解析系统约束
 */
function parseConstraints(staticKnowledge: string): string[] {
  const constraints: string[] = [
    '只支持已注册的 Workflow',
    '必需参数不能为空',
    '参数格式必须正确'
  ];

  // 提取常见问题
  const faqSection = extractSection(staticKnowledge, '常见问题', '使用注意事项');
  if (faqSection) {
    constraints.push(faqSection);
  }

  return constraints;
}

/**
 * 提取 Markdown 章节
 */
function extractSection(content: string, startTitle: string, endTitle: string): string | null {
  const lines = content.split('\n');
  let inSection = false;
  const sectionLines: string[] = [];

  for (const line of lines) {
    // 检查是否进入目标章节
    if (line.includes(startTitle) || line.includes(`## ${startTitle}`)) {
      inSection = true;
      continue;
    }

    // 检查是否到达结束章节
    if (inSection && (line.includes(endTitle) || line.includes(`## ${endTitle}`))) {
      break;
    }

    // 收集章节内容
    if (inSection) {
      sectionLines.push(line);
    }
  }

  const section = sectionLines.join('\n').trim();
  return section || null;
}
