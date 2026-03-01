/**
 * 帮助知识加载器
 *
 * 从 knowledge/ 目录加载 Markdown 格式的帮助文档
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 加载静态帮助知识
 */
export function loadStaticHelpKnowledge(): string {
  const staticPath = path.join(__dirname, 'static.md');

  try {
    return fs.readFileSync(staticPath, 'utf-8');
  } catch (error) {
    console.warn('⚠️  无法加载静态帮助知识');
    return '';
  }
}

/**
 * 加载 workflow 帮助知识
 */
export function loadWorkflowHelpKnowledge(workflowName: string): string {
  const workflowPath = path.join(__dirname, 'workflows', `${workflowName}.md`);

  try {
    return fs.readFileSync(workflowPath, 'utf-8');
  } catch (error) {
    return '';
  }
}

/**
 * 加载所有帮助知识
 */
export function loadAllHelpKnowledge(): string {
  const parts: string[] = [];

  // 加载静态知识
  const staticKnowledge = loadStaticHelpKnowledge();
  if (staticKnowledge) {
    parts.push('=== 系统知识 ===\n' + staticKnowledge);
  }

  // 加载所有 workflow 知识
  const workflowsDir = path.join(__dirname, 'workflows');
  try {
    if (fs.existsSync(workflowsDir)) {
      const files = fs.readdirSync(workflowsDir);
      const workflowFiles = files.filter(f => f.endsWith('.md'));

      if (workflowFiles.length > 0) {
        parts.push('\n=== Workflow 知识 ===');

        for (const file of workflowFiles) {
          const workflowName = file.replace('.md', '');
          const content = loadWorkflowHelpKnowledge(workflowName);
          if (content) {
            parts.push(`\n--- ${workflowName} ---\n${content}`);
          }
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  无法读取 workflows 目录');
  }

  return parts.join('\n');
}

/**
 * 构建帮助系统的 AI 上下文
 */
export function buildHelpSystemContext(): string {
  const helpKnowledge = loadAllHelpKnowledge();

  return `
你是一个帮助系统助手，专门帮助用户使用 Rosydawn 博客系统。

以下是系统的帮助知识库：

${helpKnowledge}

---

**回答规则**:
1. 当用户询问如何使用系统时，提供清晰的描述
2. 给出具体的命令示例（使用代码块）
3. 说明参数的含义和是否必填
4. 如果有相关文档，提到文件名或链接

**回答格式示例**:
"""
**描述**: [简要说明功能]

**使用方法**:
\`\`\`bash
rosydawn new --topic "主题"
\`\`\`

**参数说明**:
- \`--topic\`: 文章主题（必填）
- \`--category\`: 文章分类（可选）

**相关文档**: 查看 knowledge/workflows/create-article.md 了解更多
"""

请用简洁、友好的语言回答用户问题。
`;
}
