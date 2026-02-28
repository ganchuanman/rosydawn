import { defineStep } from '../registry.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

/**
 * 检测文章变更
 *
 * 扫描内容目录中的文章变更（新增或修改的 markdown 文件）
 */
export const getChangedArticles = defineStep({
  type: 'validator',
  name: 'getChangedArticles',
  description: '检测文章变更（新增或修改的 markdown 文件）',
  execute: async (ctx) => {
    const contentDir = ctx.params.contentDir || 'src/content';

    try {
      // 获取未提交的文件变更
      const { stdout } = await execAsync('git status --porcelain');
      const changedFiles = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => line.substring(3)) // 移除状态标记 (e.g., "M ", "A ", "??")
        .filter((file) => {
          // 只保留 markdown 文件
          const ext = path.extname(file);
          return ext === '.md' || ext === '.mdx';
        })
        .filter((file) => {
          // 只保留内容目录下的文件
          return file.startsWith(contentDir);
        });

      if (changedFiles.length === 0) {
        throw new Error('没有找到未发布的文章变更');
      }

      // 验证文件是否存在
      const existingFiles = changedFiles.filter((file) => {
        try {
          return fs.existsSync(file);
        } catch {
          return false;
        }
      });

      return {
        hasChanges: true,
        articles: existingFiles,
        articleCount: existingFiles.length,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not a git repository')) {
        throw new Error('当前目录不是 Git 仓库');
      }
      throw error;
    }
  },
});
