## Context

当前导航代码（Header + Footer）在 6 个页面文件中完全重复。每个页面都包含相同的 `<header class="site-header">` 和 `<footer class="site-footer">` 结构，以及相同的 scoped CSS 样式。这导致：

1. 任何导航变更需要手动同步 6 个文件
2. 样式规则在每个文件中重复定义
3. 暗黑模式切换按钮的功能依赖 `Layout.astro` 中的全局脚本和样式

现有结构：
- **Header**: logo + nav 链接 + theme-toggle 按钮
- **Footer**: "built with astro · developed with llm" 文案
- **Theme Toggle**: 32x32px 按钮，样式定义在 `Layout.astro`

## Goals / Non-Goals

**Goals:**
- 创建可复用的 `Header.astro` 和 `Footer.astro` 组件
- 消除 6 个页面文件中的导航代码重复
- 修复 theme-toggle 按钮的垂直居中对齐问题
- 更新 Footer 文案并添加 OpenSpec GitHub 链接
- 保持现有视觉外观和功能不变

**Non-Goals:**
- 不改变 Layout.astro 中的主题切换逻辑
- 不重构 CSS 变量系统
- 不添加新的导航项或功能
- 不改变响应式断点设计

## Decisions

### Decision 1: 组件放置在 `src/components/` 目录

**选择**: 将 Header.astro 和 Footer.astro 放在 `src/components/` 目录

**理由**:
- 符合 Astro 项目的标准约定
- 与未来可能添加的其他组件保持一致
- 清晰的目录结构便于维护

**备选方案**:
- 放在 `src/layouts/` 目录 — 被否决，因为这些不是布局包装器

### Decision 2: 样式内聚到组件内部

**选择**: 将 Header 和 Footer 相关的 CSS 移入各自组件的 `<style>` 块

**理由**:
- Astro 的 scoped style 确保样式隔离
- 组件自包含，便于复用和维护
- 消除跨文件的样式重复

**备选方案**:
- 使用全局 CSS 文件 — 被否决，违背组件化原则
- 保留在 Layout.astro — 被否决，组件应自包含样式

### Decision 3: Theme Toggle 按钮对齐修复

**选择**: 在 `.nav` 容器上添加 `align-items: center`

**理由**:
- 根本原因是 nav 容器缺少垂直对齐规则
- nav 链接是文本元素，theme-toggle 是 32x32 的按钮
- flexbox 的 `align-items: center` 可以统一垂直对齐

**备选方案**:
- 调整按钮 margin — 被否决，不够健壮
- 使用 line-height 匹配 — 被否决，难以维护

### Decision 4: Theme Toggle 样式保留在 Layout.astro

**选择**: `.theme-toggle` 样式继续定义在 Layout.astro 的全局样式中

**理由**:
- theme-toggle 的功能脚本在 Layout.astro 中
- 样式与脚本保持在同一位置便于维护
- Header 组件只负责渲染按钮元素，不定义样式

**备选方案**:
- 将样式移入 Header.astro — 被否决，会造成样式与脚本分离

### Decision 5: 活跃链接状态通过 props 传递

**选择**: Header 组件接收 `currentPath` prop 来判断活跃链接

**理由**:
- 避免在组件内部使用 `Astro.url`（虽然可行，但 prop 更明确）
- 页面可以精确控制哪个链接高亮
- 简化组件逻辑

**备选方案**:
- 在组件内部使用 `Astro.url.pathname` — 也是可行方案，可能更简洁

## Risks / Trade-offs

**[Risk] 样式重复** → Header/Footer 组件的 scoped 样式在每个页面的 CSS bundle 中重复
- **Mitigation**: Astro 的构建优化会处理这个问题，且样式量很小

**[Risk] Theme toggle 样式与组件分离** → 修改 theme-toggle 样式需要同时关注 Layout.astro 和 Header.astro
- **Mitigation**: 添加代码注释说明依赖关系

**[Trade-off] 组件 props vs 自动检测** → 使用 prop 传递 currentPath 增加了使用复杂度
- **Accept**: 明确性优于魔法，代价可接受
