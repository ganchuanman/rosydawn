## Why

当前文章详情页的返回按钮使用 `history.back()` 实现，存在以下问题：
1. 返回文案固定为"返回"，无法根据来源页面显示更有意义的文案（如"返回文章列表"、"返回标签详情"）
2. 用户在文章间通过"上一篇/下一篇"切换时，`history.back()` 会回到上一篇文章而非最初进入的列表页
3. 各页面返回按钮代码重复，维护成本高

## What Changes

- 创建统一的智能返回按钮组件 `BackButton.astro`，替换所有页面的内联返回按钮
- 引入来源追踪机制：入口页面（首页、文章列表页、标签列表页、标签详情页）在跳转时传递来源标识
- 文章详情页作为叶子节点，在切换上一篇/下一篇时保持原始来源不变
- 返回按钮根据来源标识显示对应文案并路由到正确页面

## Capabilities

### New Capabilities
- `smart-back-button`: 智能返回按钮组件，根据页面来源动态显示返回文案并导航到正确的源页面

### Modified Capabilities
- `prev-next-nav`: 上一篇/下一篇导航需要在切换文章时保持来源标识不变

## Impact

- **受影响的组件**：
  - `src/pages/blog/[...slug].astro` - 文章详情页，替换返回按钮、修改上下篇导航链接
  - `src/pages/tags/[tag].astro` - 标签详情页，替换返回按钮、添加来源标识到文章链接
  - `src/pages/index.astro` - 首页，添加来源标识到文章链接
  - `src/pages/blog/[...page].astro` - 文章列表页，添加来源标识到文章链接
  - `src/pages/tags/index.astro` - 标签列表页，添加来源标识到标签详情链接
- **新增组件**：
  - `src/components/BackButton.astro` - 智能返回按钮组件
- **技术方案**：使用 URL query parameter（如 `?from=tag-detail&ref=/tags/vue`）传递来源信息，客户端读取并决定返回行为
