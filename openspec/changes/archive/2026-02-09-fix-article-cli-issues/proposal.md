## Why

`npm run new` 命令存在两个问题：
1. 生成的预览链接格式错误，打开后 404（应该是 `/blog/2026/02/{slug}` 而不是 `/blog/{slug}`）
2. AI 生成的 slug 过长，需要在提示词中限制

## What Changes

- 修复预览链接格式，使用完整路径 `/blog/{year}/{month}/{slug}`
- 更新 AI 提示词，限制 slug 长度为 3-5 个单词

## Capabilities

### New Capabilities

（无）

### Modified Capabilities

- `article-create-cli`: 修复预览链接格式，优化 slug 生成提示词

## Impact

- **修改文件**：
  - `scripts/new.ts` - 修复预览 URL 格式
  - `scripts/lib/ai.ts` - 优化 slug 生成提示词
