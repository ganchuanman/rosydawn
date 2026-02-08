// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import plantuml from 'astro-plantuml';

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    plantuml(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'one-light',
      wrap: false,
    },
  },
  build: {
    format: 'directory', // 生成 /blog/post/index.html
  },
  trailingSlash: 'always', // URL 带尾部斜杠
});