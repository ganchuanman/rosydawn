import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createFile } from '../../../src/steps/actions/file.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TC-08: 文件创建测试
 */
describe('createFile', () => {
  const testDir = path.join(process.cwd(), 'test-temp-files');

  beforeEach(async () => {
    // Create test directory
    await fs.promises.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.promises.rm(testDir, { recursive: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should create file successfully', async () => {
    const filePath = path.join(testDir, 'test-article', 'index.md');
    const frontmatter = '---\ntitle: "Test"\n---';
    const expectedContent = frontmatter + '\n<!-- 在这里编写文章内容 -->\n';

    await createFile.execute({
      params: {},
      steps: {
        generateSlug: { filePath },
        buildFrontmatter: { frontmatter },
      },
    });

    expect(fs.existsSync(filePath)).toBe(true);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    expect(fileContent).toBe(expectedContent);
  });

  it('should create nested directories if needed', async () => {
    const filePath = path.join(testDir, 'deeply', 'nested', 'path', 'article.md');
    const frontmatter = '---\ntitle: "Test"\n---';

    await createFile.execute({
      params: {},
      steps: {
        generateSlug: { filePath },
        buildFrontmatter: { frontmatter },
      },
    });

    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('should throw error when filePath is missing', async () => {
    await expect(createFile.execute({
      params: {},
      steps: {},
    })).rejects.toThrow('缺少必需参数: filePath');
  });

  it('should use custom template if provided', async () => {
    // Create a template file
    const templatePath = path.join(testDir, 'template.md');
    const templateContent = '\n## Custom Template\n';
    await fs.promises.writeFile(templatePath, templateContent);

    const filePath = path.join(testDir, 'article-with-template.md');
    const frontmatter = '---\ntitle: "Test"\n---';
    const expectedContent = frontmatter + templateContent;

    await createFile.execute({
      params: { template: templatePath },
      steps: {
        generateSlug: { filePath },
        buildFrontmatter: { frontmatter },
      },
    });

    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    expect(fileContent).toBe(expectedContent);
  });
});
