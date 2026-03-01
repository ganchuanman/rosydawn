import { defineStep } from '../registry.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

/**
 * 部署状态接口
 */
interface DeploymentStatus {
  lastDeployedAt?: string;
  lastDeployStatus?: 'success' | 'failed';
  deployCount?: number;
}

/**
 * 检查部署状态
 *
 * 查询最近部署时间和状态
 */
export const checkDeploymentStatus = defineStep({
  type: 'validator',
  name: 'checkDeploymentStatus',
  description: '检查部署状态',
  execute: async (ctx) => {
    const cacheDir = join(homedir(), '.rosydawn');
    const cacheFile = join(cacheDir, 'cache.json');

    try {
      // 确保缓存目录存在
      if (!existsSync(cacheDir)) {
        await mkdir(cacheDir, { recursive: true });
      }

      // 读取缓存文件
      let status: DeploymentStatus = {};

      if (existsSync(cacheFile)) {
        try {
          const content = await readFile(cacheFile, 'utf-8');
          status = JSON.parse(content);
        } catch {
          // 缓存文件损坏，使用空对象
        }
      }

      // 显示部署状态
      if (status.lastDeployedAt) {
        const deployDate = new Date(status.lastDeployedAt);
        const now = new Date();
        const daysSinceLastDeploy = Math.floor((now.getTime() - deployDate.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`🚀 部署状态:`);
        console.log(`   最近部署: ${deployDate.toLocaleString('zh-CN')}`);
        console.log(`   部署状态: ${status.lastDeployStatus === 'success' ? '✅ 成功' : '❌ 失败'}`);
        console.log(`   距今: ${daysSinceLastDeploy} 天`);
        console.log(`   总部署次数: ${status.deployCount || 0}`);
      } else {
        console.log(`🚀 部署状态:`);
        console.log(`   暂无部署记录`);
      }

      return {
        success: true,
        ...status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`⚠️  无法读取部署状态: ${errorMessage}`);

      return {
        success: true,
        warning: errorMessage,
      };
    }
  },
});
