// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkPlantUMLUrl from './src/plugins/remark-plantuml-url.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
  ],
  markdown: {
    remarkPlugins: [
      [remarkPlantUMLUrl, { format: 'svg' }],
    ],
    shikiConfig: {
      themes: {
        light: 'one-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },
  build: {
    format: 'file', // 生成 /blog/post.html 而非 /blog/post/index.html
  },
  trailingSlash: 'never', // URL 不带尾部斜杠，消除 301 重定向
});