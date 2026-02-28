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
    const filePath = ctx.params.filePath;
    const content = ctx.params.content || '';
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

      // 如果提供了模板,使用模板内容
      let finalContent = content;
      if (template && fs.existsSync(template)) {
        finalContent = fs.readFileSync(template, 'utf-8');
      }

      // 写入文件
      fs.writeFileSync(filePath, finalContent, 'utf-8');

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
