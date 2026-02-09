## Why

导航菜单代码（Header + Footer）在 6 个页面文件中完全重复，任何修改都需要同步更新 6 处。这违反了 DRY 原则，增加了维护成本和出错风险。提取为独立组件是改善代码质量的直接方案。

## What Changes

- 创建 `Header.astro` 组件，包含 logo、导航链接和暗黑模式切换按钮
- 创建 `Footer.astro` 组件，包含站点版权信息
- 更新 Footer 文案为 "developed with llm and [openspec](https://github.com/Fission-AI/OpenSpec)"
- 修复暗黑模式切换按钮与其他导航项的垂直对齐问题
- 重构 6 个页面文件，使用新组件替换重复代码

## Capabilities

### New Capabilities

- `shared-layout-components`: 定义可复用的 Header 和 Footer 组件规范，包括导航结构、样式要求和响应式行为

### Modified Capabilities

- `dark-mode`: 暗黑模式切换按钮的垂直居中对齐样式修正

## Impact

- **受影响页面**: 6 个页面文件需要重构
  - `src/pages/index.astro`
  - `src/pages/about.astro`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/blog/[...page].astro`
  - `src/pages/tags/index.astro`
  - `src/pages/tags/[tag].astro`
- **新增文件**: `src/components/Header.astro`, `src/components/Footer.astro`
- **样式变更**: 导航区域 CSS 需要调整以修复按钮对齐问题
- **无破坏性变更**: 用户体验保持不变，仅内部结构优化
