import { describe, it, expect, vi } from 'vitest';
import { validateGitStatus } from '../../../src/steps/validators/git.js';
import { validateArticlesDirectory } from '../../../src/steps/validators/directory.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * TC-09: Git 仓库检查
 */
describe('validateGitStatus', () => {
  it('should return success when in a Git repository', async () => {
    // 在项目根目录执行（本身就是 Git 仓库)
    const result = await validateGitStatus.execute({
      params: {},
      steps: {},
    });

    expect(result.success).toBe(true);
    expect(result.isGitRepo).toBe(true);
  });

  it('should throw error when not in a Git repository', async () => {
    // 创建临时目录
    const tempDir = fs.mkdtempSync(path.join(process.cwd(), 'test-non-git-repo'));

    try {
      // 尝试验在非 Git 目录执行 validateGitStatus
      process.chdir(tempDir);
      const result = await validateGitStatus.execute({
        params: {},
        steps: {},
      });

      expect(result.success).toBe(false);
    } finally {
      // 清理
      process.chdir(process.cwd());
      fs.rmdirSync(tempDir, { recursive: true });
    }
  });
});

/**
 * TC-10: 工作目录不干净的警告
 */
describe('validateGitStatus', () => {
  it('should show warning but working directory has uncommitted changes', async () => {
    // 创建临时文件
    const tempFile = path.join(process.cwd(), 'temp-uncommitted.txt');
    await fs.writeFile(tempFile, 'test content');

    const consoleSpy = vi.spyOn(console, 'warn');

    const result = await validateGitStatus.execute({
      params: {},
      steps: {},
    });

    // 避免警告但不终止 Workflow
    expect(result.success).toBe(true);
    expect(result.isGitRepo).toBe(true);
    expect(result.workingDirectoryClean).toBe(false);

    // 验证警告消息
    expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('未提交')
      );

    // 清理
    await fs.unlink(tempFile);
    consoleSpy.mockRestore();
  });
});

/**
 * TC-11: 文章目录自动创建
 */
describe('validateArticlesDirectory', () => {
  it('should create directory when it does not exist', async () => {
    const year = '2026';
    const month = '02';
    const expectedDir = `src/content/posts/${year}/${month}`;

    // 稡拟日期
    vi.setSystemTime(new Date('2026-02-15'));

    const result = await validateArticlesDirectory.execute({
      params: {},
      steps: {},
    });

    expect(result.success).toBe(true);
    expect(fs.existsSync(expectedDir)).toBe(true);

    // 清理
    await fs.rmdir(expectedDir, { recursive: true });
    vi.useRealTimers();
  });

  it('should use existing directory when it already exists', async () => {
    const year = '2026';
    const month = '02';
    const existingDir = `src/content/posts/${year}/${month}`;

    // 创建目录
    await fs.mkdirSync(existingDir, { recursive: true });

    // 模拟日期
    vi.setSystemTime(new Date('2026-02-15'));

    const result = await validateArticlesDirectory.execute({
      params: {},
      steps: {},
    });

    expect(result.success).toBe(true);
    expect(fs.existsSync(existingDir)).toBe(true);

    // 清理
    await fs.rmdir(existingDir, { recursive: true });
    vi.useRealTimers();
  });

  it('should throw error when permission denied', async () => {
    const year = '2026';
    const month = '02';
    const protectedDir = `src/content/posts/${year}/${month}`;

    // 创建目录
    await fs.mkdirSync(protectedDir, { recursive: true });

    // 移除写权限
    await fs.chmodSync(protectedDir, 0o444);

    try {
      await validateArticlesDirectory.execute({
        params: {},
        steps: {},
      });

      expect(() => {}).toThrow();
    } finally {
      // 恢复权限
      await fs.chmodSync(protectedDir, 0o755);
      await fs.rmdirSync(protectedDir, { recursive: true });
    }
  });
});
