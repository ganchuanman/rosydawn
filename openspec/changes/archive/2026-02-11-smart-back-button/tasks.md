## 1. 创建智能返回按钮组件

- [x] 1.1 创建 `src/components/BackButton.astro` 组件文件
- [x] 1.2 实现组件 Props 接口（fallbackHref, fallbackLabel）
- [x] 1.3 实现服务端渲染默认返回链接（返回首页）
- [x] 1.4 实现客户端脚本读取 URL Query Parameter（from, ref）
- [x] 1.5 实现根据 from 类型更新返回文案的逻辑
- [x] 1.6 实现根据 from 类型和 ref 更新返回链接的逻辑
- [x] 1.7 添加组件样式（复用现有 back-link 样式）

## 2. 修改入口页面添加来源参数

- [x] 2.1 修改 `src/pages/index.astro` 文章链接，添加 `?from=home`
- [x] 2.2 修改 `src/pages/blog/[...page].astro` 文章链接，添加 `?from=blog-list&ref=<当前路径>`
- [x] 2.3 修改 `src/pages/tags/index.astro` 标签链接，添加 `?from=tag-list`
- [x] 2.4 修改 `src/pages/tags/[tag].astro` 文章链接，添加 `?from=tag-detail&ref=<当前路径>`

## 3. 替换文章详情页返回按钮

- [x] 3.1 在 `src/pages/blog/[...slug].astro` 导入 BackButton 组件
- [x] 3.2 替换文章头部的内联返回按钮为 BackButton 组件
- [x] 3.3 替换文章底部的内联返回按钮为 BackButton 组件
- [x] 3.4 删除原有的 back-link 内联样式（如已移至组件）

## 4. 替换标签详情页返回按钮

- [x] 4.1 在 `src/pages/tags/[tag].astro` 导入 BackButton 组件
- [x] 4.2 替换内联返回按钮为 BackButton 组件（fallbackHref="/tags", fallbackLabel="返回标签列表"）
- [x] 4.3 删除原有的 back-link 相关内联样式

## 5. 修改上一篇/下一篇导航保持来源

- [x] 5.1 在 `src/pages/blog/[...slug].astro` 添加客户端脚本
- [x] 5.2 实现读取当前页面 URL 的 from 和 ref 参数
- [x] 5.3 实现动态修改上一篇链接 href 添加来源参数
- [x] 5.4 实现动态修改下一篇链接 href 添加来源参数

## 6. 测试与验证

- [x] 6.1 验证从首页进入文章的返回按钮行为
- [x] 6.2 验证从文章列表页进入文章的返回按钮行为
- [x] 6.3 验证从标签详情页进入文章的返回按钮行为
- [x] 6.4 验证上一篇/下一篇切换后来源保持
- [x] 6.5 验证直接访问文章的默认返回行为
- [x] 6.6 验证标签详情页返回按钮行为
- [x] 6.7 验证禁用 JavaScript 时的降级行为
