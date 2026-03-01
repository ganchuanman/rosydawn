import { defineStep } from '../registry.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * 部署配置
 */
interface DeployConfig {
  webRoot?: string;
  buildOutput?: string;
  domain?: string;
}

/**
 * 执行部署
 *
 * 将构建产物复制到 Nginx 目录
 */
export const executeDeploy = defineStep({
  type: 'action',
  name: 'executeDeploy',
  description: '部署构建产物到服务器',
  execute: async (ctx) => {
    const config: DeployConfig = ctx.params.deployConfig || {};
    const webRoot = config.webRoot || '/var/www/rosydawn';
    const buildOutput = config.buildOutput || 'dist';
    const projectRoot = process.cwd();
    const distDir = path.join(projectRoot, buildOutput);

    console.log('🚀 开始部署...');

    // 检查构建产物是否存在
    if (!existsSync(distDir)) {
      throw new Error(`构建输出目录不存在: ${distDir}`);
    }

    try {
      // 确保目标目录存在
      console.log(`确保目标目录存在: ${webRoot}`);
      await execAsync(`sudo mkdir -p ${webRoot}`);

      // 清空目标目录
      console.log(`清空目标目录: ${webRoot}`);
      await execAsync(`sudo rm -rf ${webRoot}/*`);

      // 复制文件
      console.log(`复制文件到 ${webRoot}...`);
      await execAsync(`sudo cp -r ${distDir}/* ${webRoot}/`);

      // 设置权限
      const user = process.env.USER || process.env.LOGNAME || 'www-data';
      console.log(`设置权限: ${user}:${user}`);
      await execAsync(`sudo chown -R ${user}:${user} ${webRoot}`);
      await execAsync(`sudo chmod -R 755 ${webRoot}`);

      console.log('✅ 部署完成');

      return {
        success: true,
        webRoot,
        buildOutput,
        deployedAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`部署失败: ${errorMessage}`);
    }
  },
});
