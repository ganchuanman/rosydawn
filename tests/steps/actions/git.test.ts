import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gitAdd } from '../../../src/steps/actions/git.js';
import { execSync } from 'child_process';

/**
 * TC-17: Git 自动添加文件
 */
describe('gitAdd', () => {
  it('should successfully add file to Git staging area', async () => {
    const testFile = 'test-git-add.txt';
    const testContent = 'test content';

    // Create test file
    const fs = await import('fs');
    await fs.promises.writeFile(testFile, testContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await gitAdd.execute({
      params: {},
      steps: {
        generateSlug: { filePath: testFile },
        createFile: { filePath: testFile },
      },
    });

    // Verify console output
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('已添加到 Git'));

    // Verify file is staged
    const status = execSync('git status --porcelain').toString();
    expect(status).toContain(testFile);

    // Clean up
    execSync(`git reset HEAD ${testFile}`);
    await fs.promises.unlink(testFile);
  });

  it('should handle files in subdirectories', async () => {
    const testFile = 'src/content/posts/2026/03/test-git-add/index.md';
    const testContent = 'test content';

    // Create test file
    const fs = await import('fs');
    await fs.promises.mkdir(path.dirname(testFile), { recursive: true });
    await fs.promises.writeFile(testFile, testContent);

    const consoleSpy = vi.spyOn(console, 'log');

    await gitAdd.execute({
      params: {},
      steps: {
        generateSlug: { filePath: testFile },
        createFile: { filePath: testFile },
      },
    });

    expect(consoleSpy).toHaveBeenCalled();

    // Clean up
    execSync(`git reset HEAD ${testFile}`);
    await fs.promises.unlink(testFile);
  });
});

/**
 * TC-18: Git 命令失败的警告处理
 */
describe('gitAdd - error handling', () => {
  it('should show warning when git command fails', async () => {
    // Use a file path outside of any git repository
    const originalCwd = process.cwd();
    const tempDir = '/tmp/test-no-git-' + Date.now();

    const fs = await import('fs');
    const { exec } = await import('child_process');

    try {
      // Create temp directory outside of git
      await fs.promises.mkdir(tempDir, { recursive: true });
      process.chdir(tempDir);

      const testFile = 'test-file.txt';
      await fs.promises.writeFile(testFile, 'content');

      const consoleSpy = vi.spyOn(console, 'warn');

      await gitAdd.execute({
        params: {},
        steps: {
          generateSlug: { filePath: testFile },
          createFile: { filePath: testFile },
        },
      });

      // Should show warning
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('警告')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('手动添加')
      );

      // Clean up
      await fs.promises.rm(tempDir, { recursive: true });
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should not throw error when git fails', async () => {
    const testFile = 'non-existent-file.txt';

    const consoleSpy = vi.spyOn(console, 'warn');

    // Should not throw even if file doesn't exist
    const result = await gitAdd.execute({
      params: {},
      steps: {
        generateSlug: { filePath: testFile },
      },
    });

    // Should complete successfully (with warning)
    expect(result).toBeDefined();
  });
});
