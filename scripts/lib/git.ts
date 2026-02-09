import { execSync, exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface ChangedFile {
  status: 'new' | 'modified';
  path: string;
}

export interface GitResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function runGit(command: string): string {
  return execSync(command, { encoding: 'utf-8', cwd: process.cwd() }).trim();
}

async function runGitAsync(command: string): Promise<{ stdout: string; stderr: string }> {
  return execAsync(command, { cwd: process.cwd() });
}

export function getCurrentBranch(): string {
  return runGit('git branch --show-current');
}

export function getChangedFiles(path: string): ChangedFile[] {
  const output = runGit(`git status --porcelain "${path}"`);
  if (!output) return [];

  const files: ChangedFile[] = [];
  const lines = output.split('\n').filter(Boolean);

  for (const line of lines) {
    const statusCode = line.substring(0, 2);
    const filePath = line.substring(3);

    if (statusCode.includes('?') || statusCode.includes('A')) {
      files.push({ status: 'new', path: filePath });
    } else if (statusCode.includes('M')) {
      files.push({ status: 'modified', path: filePath });
    }
  }

  return files;
}

export function getDiffSummary(files: string[]): string {
  if (files.length === 0) return '';

  try {
    const stagedDiff = runGit('git diff --cached --stat');
    const unstagedDiff = runGit(`git diff --stat -- ${files.map(f => `"${f}"`).join(' ')}`);
    return [stagedDiff, unstagedDiff].filter(Boolean).join('\n');
  } catch {
    return '';
  }
}

export function stageFiles(files: string[]): GitResult<void> {
  try {
    for (const file of files) {
      runGit(`git add "${file}"`);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'git add 失败',
    };
  }
}

export function commit(message: string): GitResult<void> {
  try {
    runGit(`git commit -m "${message.replace(/"/g, '\\"')}"`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'git commit 失败',
    };
  }
}

export async function push(): Promise<GitResult<void>> {
  try {
    const branch = getCurrentBranch();
    await runGitAsync(`git push origin ${branch}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'git push 失败',
    };
  }
}

export function hasUncommittedChanges(): boolean {
  const output = runGit('git status --porcelain');
  return output.length > 0;
}
