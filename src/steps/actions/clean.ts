import { defineStep } from '../registry.js';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * 清理构建目录
 *
 * 删除 dist 目录以进行干净的构建
 */
export const cleanDist = defineStep({
  type: 'action',
  name: 'cleanDist',
  description: '清理构建输出目录',
  execute: async (ctx) => {
    const distDir = ctx.params.distDir || 'dist';
    const projectRoot = process.cwd();
    const distPath = path.join(projectRoot, distDir);

    console.log(`🧹 清理构建目录: ${distDir}`);

    try {
      if (existsSync(distPath)) {
        await rm(distPath, { recursive: true, force: true });
        console.log('✅ 构建目录已清理');
      } else {
        console.log('ℹ️  构建目录不存在，跳过清理');
      }

      return {
        success: true,
        distDir,
        cleaned: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`清理构建目录失败: ${errorMessage}`);
    }
  },
});
