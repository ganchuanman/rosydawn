import { readFileSync, writeFileSync } from 'node:fs';

export interface Frontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
  [key: string]: unknown;
}

export interface ParsedArticle {
  frontmatter: Frontmatter;
  content: string;
  raw: string;
}

export function parseFrontmatter(filePath: string): ParsedArticle | null {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) return null;

    const [, frontmatterStr, content] = match;
    const frontmatter = parseYamlLike(frontmatterStr);

    return { frontmatter, content, raw };
  } catch {
    return null;
  }
}

function parseYamlLike(str: string): Frontmatter {
  const result: Record<string, unknown> = {
    title: '',
    date: '',
    description: '',
    tags: [],
  };

  const lines = str.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      if (arrayContent.trim() === '') {
        result[key] = [];
      } else {
        result[key] = arrayContent.split(',').map(item => {
          const trimmed = item.trim();
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return trimmed.slice(1, -1);
          }
          return trimmed;
        });
      }
    } else {
      result[key] = value;
    }
  }

  return result as Frontmatter;
}

export function updateFrontmatter(
  filePath: string,
  updates: Partial<Frontmatter>
): boolean {
  const parsed = parseFrontmatter(filePath);
  if (!parsed) return false;

  const updatedFrontmatter = { ...parsed.frontmatter, ...updates };
  const newFrontmatterStr = serializeFrontmatter(updatedFrontmatter);
  const newContent = `---\n${newFrontmatterStr}---\n${parsed.content}`;

  try {
    writeFileSync(filePath, newContent, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function serializeFrontmatter(fm: Frontmatter): string {
  const lines: string[] = [];

  if (fm.title) lines.push(`title: "${fm.title}"`);
  if (fm.date) lines.push(`date: ${fm.date}`);
  if (fm.description !== undefined) lines.push(`description: "${fm.description}"`);
  if (fm.tags) {
    const tagsStr = fm.tags.map(t => `"${t}"`).join(', ');
    lines.push(`tags: [${tagsStr}]`);
  }

  for (const [key, value] of Object.entries(fm)) {
    if (['title', 'date', 'description', 'tags'].includes(key)) continue;
    if (typeof value === 'string') {
      lines.push(`${key}: "${value}"`);
    } else if (Array.isArray(value)) {
      const arrStr = value.map(v => `"${v}"`).join(', ');
      lines.push(`${key}: [${arrStr}]`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  return lines.join('\n') + '\n';
}

export function createArticleSkeleton(title: string, date: string): string {
  return `---
title: "${title}"
date: ${date}
description: ""
tags: []
---

<!-- 在此开始写作 -->
`;
}

export function extractTitleFromFrontmatter(filePath: string): string | null {
  const parsed = parseFrontmatter(filePath);
  return parsed?.frontmatter.title || null;
}
