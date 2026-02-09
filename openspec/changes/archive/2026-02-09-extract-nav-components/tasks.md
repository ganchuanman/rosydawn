## 1. 创建组件文件

- [x] 1.1 创建 `src/components/Header.astro` 文件，包含 logo、导航链接和 theme-toggle 按钮
- [x] 1.2 创建 `src/components/Footer.astro` 文件，包含更新后的 attribution 文案
- [x] 1.3 在 Header 组件中添加 `currentPath` prop 用于活跃链接高亮
- [x] 1.4 将 header 相关样式（.site-header, .logo, .nav 等）移入 Header.astro
- [x] 1.5 将 footer 相关样式（.site-footer）移入 Footer.astro

## 2. 修复 Theme Toggle 对齐

- [x] 2.1 在 Header.astro 的 `.nav` 样式中添加 `align-items: center`

## 3. 更新 Footer 文案

- [x] 3.1 更新 Footer 文案为 "built with astro · developed with llm and openspec"
- [x] 3.2 添加 openspec 链接指向 `https://github.com/Fission-AI/OpenSpec`，设置 `target="_blank" rel="noopener"`

## 4. 重构页面文件

- [x] 4.1 重构 `src/pages/index.astro`：导入 Header/Footer 组件，移除内联 header/footer 代码和样式
- [x] 4.2 重构 `src/pages/about.astro`：导入 Header/Footer 组件，移除内联 header/footer 代码和样式
- [x] 4.3 重构 `src/pages/blog/[...slug].astro`：导入 Header/Footer 组件，移除内联 header/footer 代码和样式
- [x] 4.4 重构 `src/pages/blog/[...page].astro`：导入 Header/Footer 组件，移除内联 header/footer 代码和样式
- [x] 4.5 重构 `src/pages/tags/index.astro`：导入 Header/Footer 组件，移除内联 header/footer 代码和样式
- [x] 4.6 重构 `src/pages/tags/[tag].astro`：导入 Header/Footer 组件，移除内联 header/footer 代码和样式

## 5. 验证

- [x] 5.1 运行 `npm run build` 确保构建通过
- [x] 5.2 手动验证各页面导航功能正常
- [x] 5.3 验证 theme-toggle 按钮垂直居中对齐
- [x] 5.4 验证 Footer 中 openspec 链接正确跳转
