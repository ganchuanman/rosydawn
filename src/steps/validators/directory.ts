import { defineStep } from '../registry.js';
import fs from 'fs';
import path from 'path';

/**
 * 验证文章目录结构
 *
 * 检查 src/content/posts/{year}/{month} 目录是否存在，不存在则创建
 */
export const validateArticlesDirectory = defineStep({
  type: 'validator',
  name: 'validateArticlesDirectory',
  description: '验证文章目录结构，不存在则自动创建',
  execute: async (ctx) => {
    // 从上下文获取日期信息
    const date = ctx.params.date ? new Date(ctx.params.date) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const dirPath = `src/content/posts/${year}/${month}`;

    try {
      // 检查目录是否存在
      if (fs.existsSync(dirPath)) {
        const stats = fs.statSync(dirPath);
        if (!stats.isDirectory()) {
          throw new Error(`路径 ${dirPath} 存在但不是目录`);
        }

        // 检查写入权限
        try {
          fs.accessSync(dirPath, fs.constants.W_OK);
        } catch {
          throw new Error(`目录 ${dirPath} 无写入权限，请检查权限设置`);
        }

        return {
          exists: true,
          created: false,
          path: dirPath,
          year,
          month,
        };
      }

      // 递归创建目录
      fs.mkdirSync(dirPath, { recursive: true });

      return {
        exists: true,
        created: true,
        path: dirPath,
        year,
        month,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`验证文章目录失败: ${String(error)}`);
    }
  },
});

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
