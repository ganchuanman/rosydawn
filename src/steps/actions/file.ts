import { defineStep } from '../registry.js';
import fs from 'fs';
import path from 'path';

/**
 * 创建文件
 *
 * 根据模板创建新的文章 markdown 文件
 */
export const createFile = defineStep({
  type: 'action',
  name: 'createFile',
  description: '创建新的文章 markdown 文件',
  execute: async (ctx) => {
    // 从上下文获取文件路径（优先从 generateSlug step 获取）
    const filePath = ctx.params.filePath || ctx.steps.generateSlug?.filePath;
    const frontmatter = ctx.steps.buildFrontmatter?.frontmatter || '';
    const template = ctx.params.template;

    if (!filePath) {
      throw new Error('缺少必需参数: filePath');
    }

    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 准备文件内容
      let finalContent = frontmatter;

      // 如果提供了模板,使用模板内容
      if (template && fs.existsSync(template)) {
        const templateContent = fs.readFileSync(template, 'utf-8');
        finalContent = frontmatter + templateContent;
      } else {
        // 默认添加一个简单的 TODO 提示
        finalContent += '\n<!-- 在这里编写文章内容 -->\n';
      }

      // 写入文件（使用原子操作）
      const tempPath = filePath + '.tmp';
      fs.writeFileSync(tempPath, finalContent, 'utf-8');
      fs.renameSync(tempPath, filePath);

      return {
        success: true,
        filePath,
        created: true,
      };
    } catch (error) {
      throw new Error(
        `创建文件失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  },
});
