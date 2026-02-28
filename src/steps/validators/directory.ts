import { defineStep } from '../registry.js';
import fs from 'fs';
import path from 'path';

/**
 * 检查目录存在性
 *
 * 如果目录不存在则创建
 */
export const checkDirectory = defineStep({
  type: 'validator',
  name: 'checkDirectory',
  description: '检查目标目录是否存在，不存在则创建',
  execute: async (ctx) => {
    const dirPath = ctx.params.directory;

    if (!dirPath) {
      throw new Error('缺少必需参数: directory');
    }

    try {
      // 检查目录是否存在
      if (fs.existsSync(dirPath)) {
        const stats = fs.statSync(dirPath);
        if (!stats.isDirectory()) {
          throw new Error(`路径 ${dirPath} 存在但不是目录`);
        }

        return {
          exists: true,
          created: false,
          path: dirPath,
        };
      }

      // 递归创建目录
      fs.mkdirSync(dirPath, { recursive: true });

      return {
        exists: true,
        created: true,
        path: dirPath,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`检查目录失败: ${String(error)}`);
    }
  },
});
