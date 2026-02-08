/**
 * ============================================
 * 工具函数模块
 * ============================================
 */

import { execSync, spawn } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { CONFIG, PROJECT_ROOT } from './config.mjs';
import { logger, colorize } from './logger.mjs';

// ==================== 项目路径 ====================

/**
 * 获取项目根目录
 */
export function getProjectDir() {
  return PROJECT_ROOT;
}

// ==================== 命令执行 ====================

/**
 * 执行命令并实时输出
 * @param {string} command - 命令
 * @param {string[]} args - 参数
 * @param {object} options - 选项
 */
export function execStream(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      cwd: options.cwd,
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令执行失败，退出码: ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

/**
 * 检查命令是否存在
 * @param {string} cmd - 命令名
 */
export function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// ==================== Node.js 版本 ====================

/**
 * 获取 Node.js 主版本号
 */
export function getNodeMajorVersion() {
  const version = process.version.replace('v', '');
  return parseInt(version.split('.')[0], 10);
}

// ==================== 用户/权限 ====================

/**
 * 获取当前用户的主用户组
 * macOS: staff
 * Linux: 通常与用户名相同
 */
export function getUserGroup() {
  try {
    // 使用 id -gn 获取当前用户的主组名
    return execSync('id -gn', { encoding: 'utf-8' }).trim();
  } catch {
    // 降级处理：macOS 默认 staff，Linux 默认用户名
    return process.platform === 'darwin' ? 'staff' : process.env.USER;
  }
}

// ==================== 文件统计 ====================

/**
 * 递归计算目录文件数
 * @param {string} dir - 目录路径
 */
export function countFiles(dir) {
  let count = 0;
  if (!existsSync(dir)) return 0;

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isFile()) {
      count++;
    } else if (stat.isDirectory()) {
      count += countFiles(fullPath);
    }
  }
  return count;
}

/**
 * 获取目录大小（字节）
 * @param {string} dir - 目录路径
 */
export function getDirSize(dir) {
  let size = 0;
  if (!existsSync(dir)) return 0;

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    if (stat.isFile()) {
      size += stat.size;
    } else if (stat.isDirectory()) {
      size += getDirSize(fullPath);
    }
  }
  return size;
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 */
export function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ==================== 环境检查 ====================

/**
 * 检查部署环境
 */
export function checkEnvironment() {
  console.log('');
  logger.info('检查部署环境...');

  // 检查 Node.js 版本
  const nodeVersion = getNodeMajorVersion();
  if (nodeVersion < CONFIG.nodeVersionRequired) {
    throw new Error(`Node.js 版本过低: v${nodeVersion}，需要 v${CONFIG.nodeVersionRequired}+`);
  }
  console.log(`  ${colorize('green', '✓')} Node.js ${process.version}`);

  // 检查 npm
  if (!commandExists('npm')) {
    throw new Error('npm 未安装');
  }
  const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
  console.log(`  ${colorize('green', '✓')} npm v${npmVersion}`);

  // 检查 Nginx
  if (!commandExists('nginx')) {
    logger.warn('Nginx 未安装（部署时需要）');
    console.log(`  ${colorize('yellow', '!')} Nginx 未检测到`);
  } else {
    console.log(`  ${colorize('green', '✓')} Nginx 已安装`);
  }

  console.log('');
}
