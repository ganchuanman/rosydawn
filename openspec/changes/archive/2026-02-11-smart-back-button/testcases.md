# Test Cases

## 1. Test Strategy

本变更的测试策略采用分层测试方法：

- **手动 UI 测试**：验证返回按钮文案、导航行为、用户交互流程
- **链接生成验证**：检查各入口页面生成的文章链接是否包含正确的来源参数
- **边缘情况测试**：无来源参数、JavaScript 禁用、页面刷新等场景
- **回归测试**：确保上一篇/下一篇导航功能不受影响

## 2. Environment & Preconditions

- Astro 开发服务器运行中（`npm run dev`）
- 至少 3 篇已发布的文章用于测试上一篇/下一篇导航
- 至少 2 个标签，每个标签下至少有 1 篇文章
- 浏览器开发者工具可用（用于禁用 JavaScript 测试）

## 3. Execution List

### TC-01: 从首页进入文章 - 返回按钮显示
- **Target**: 智能返回按钮组件 / Scenario: 从首页进入文章
- **Type**: Manual
- **Preconditions**: 首页有文章列表
- **Steps**:
  1. 访问首页 `/`
  2. 点击任意一篇文章
  3. 观察文章详情页的返回按钮
- **Expected Result**: 返回按钮显示"返回首页"

### TC-02: 从首页进入文章 - 返回导航
- **Target**: 智能返回按钮组件 / Scenario: 从首页进入文章
- **Type**: Manual
- **Preconditions**: 已从首页进入文章详情页
- **Steps**:
  1. 点击返回按钮
- **Expected Result**: 浏览器导航到 `/`

### TC-03: 从文章列表页进入文章 - 返回按钮显示
- **Target**: 智能返回按钮组件 / Scenario: 从文章列表页进入文章
- **Type**: Manual
- **Preconditions**: 文章数量超过 5 篇（有分页）
- **Steps**:
  1. 访问文章列表第 2 页 `/blog/2`
  2. 点击任意一篇文章
  3. 观察文章详情页的返回按钮
- **Expected Result**: 返回按钮显示"返回文章列表"

### TC-04: 从文章列表页进入文章 - 返回导航
- **Target**: 智能返回按钮组件 / Scenario: 从文章列表页进入文章
- **Type**: Manual
- **Preconditions**: 已从 `/blog/2` 进入文章详情页
- **Steps**:
  1. 点击返回按钮
- **Expected Result**: 浏览器导航到 `/blog/2`

### TC-05: 从标签详情页进入文章 - 返回按钮显示
- **Target**: 智能返回按钮组件 / Scenario: 从标签详情页进入文章
- **Type**: Manual
- **Preconditions**: 标签 "vue" 下有文章
- **Steps**:
  1. 访问标签详情页 `/tags/vue`
  2. 点击任意一篇文章
  3. 观察文章详情页的返回按钮
- **Expected Result**: 返回按钮显示"返回 #vue"

### TC-06: 从标签详情页进入文章 - 返回导航
- **Target**: 智能返回按钮组件 / Scenario: 从标签详情页进入文章
- **Type**: Manual
- **Preconditions**: 已从 `/tags/vue` 进入文章详情页
- **Steps**:
  1. 点击返回按钮
- **Expected Result**: 浏览器导航到 `/tags/vue`

### TC-07: 直接访问文章 - 默认返回行为
- **Target**: 智能返回按钮组件 / Scenario: 直接访问文章（无来源）
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 直接在浏览器地址栏输入文章 URL（不带 `from` 参数）
  2. 观察返回按钮
  3. 点击返回按钮
- **Expected Result**: 返回按钮显示"返回首页"，点击后导航到 `/`

### TC-08: 首页文章链接格式
- **Target**: 来源信息传递机制 / Scenario: 首页文章链接
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 访问首页 `/`
  2. 右键点击任意文章链接，选择"复制链接地址"
  3. 检查链接格式
- **Expected Result**: 链接格式为 `/blog/<slug>?from=home`

### TC-09: 文章列表页文章链接格式
- **Target**: 来源信息传递机制 / Scenario: 文章列表页文章链接
- **Type**: Manual
- **Preconditions**: 文章数量超过 5 篇
- **Steps**:
  1. 访问 `/blog/2`
  2. 右键点击任意文章链接，选择"复制链接地址"
  3. 检查链接格式
- **Expected Result**: 链接格式为 `/blog/<slug>?from=blog-list&ref=/blog/2`

### TC-10: 标签详情页文章链接格式
- **Target**: 来源信息传递机制 / Scenario: 标签详情页文章链接
- **Type**: Manual
- **Preconditions**: 标签 "vue" 存在
- **Steps**:
  1. 访问 `/tags/vue`
  2. 右键点击任意文章链接，选择"复制链接地址"
  3. 检查链接格式
- **Expected Result**: 链接格式为 `/blog/<slug>?from=tag-detail&ref=/tags/vue`

### TC-11: 标签列表页标签链接格式
- **Target**: 来源信息传递机制 / Scenario: 标签列表页标签链接
- **Type**: Manual
- **Preconditions**: 至少有一个标签
- **Steps**:
  1. 访问 `/tags`
  2. 右键点击任意标签链接，选择"复制链接地址"
  3. 检查链接格式
- **Expected Result**: 链接格式为 `/tags/<tag>?from=tag-list`

### TC-12: 来源类型映射 - home
- **Target**: 来源类型定义 / Scenario: 来源类型映射
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 访问 `/blog/any-post?from=home`
  2. 观察返回按钮文案和点击行为
- **Expected Result**: 显示"返回首页"，点击导航到 `/`

### TC-13: 来源类型映射 - blog-list
- **Target**: 来源类型定义 / Scenario: 来源类型映射
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 访问 `/blog/any-post?from=blog-list&ref=/blog/3`
  2. 观察返回按钮文案和点击行为
- **Expected Result**: 显示"返回文章列表"，点击导航到 `/blog/3`

### TC-14: 来源类型映射 - tag-list
- **Target**: 来源类型定义 / Scenario: 来源类型映射
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 访问 `/tags/vue?from=tag-list`
  2. 观察返回按钮文案和点击行为
- **Expected Result**: 显示"返回标签列表"，点击导航到 `/tags`

### TC-15: 来源类型映射 - tag-detail
- **Target**: 来源类型定义 / Scenario: 来源类型映射
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 访问 `/blog/any-post?from=tag-detail&ref=/tags/vue`
  2. 观察返回按钮文案和点击行为
- **Expected Result**: 显示"返回 #vue"，点击导航到 `/tags/vue`

### TC-16: 无 JavaScript 降级
- **Target**: 组件降级行为 / Scenario: 无 JavaScript 降级
- **Type**: Manual / Edge Case
- **Preconditions**: 浏览器开发者工具可用
- **Steps**:
  1. 打开浏览器开发者工具
  2. 禁用 JavaScript
  3. 访问 `/blog/any-post?from=tag-detail&ref=/tags/vue`
  4. 观察返回按钮
  5. 点击返回按钮
- **Expected Result**: 返回按钮显示"返回首页"，点击导航到 `/`

### TC-17: 标签详情页返回 - 从标签列表进入
- **Target**: 标签详情页返回按钮 / Scenario: 从标签列表进入标签详情
- **Type**: Manual
- **Preconditions**: 标签列表页有标签
- **Steps**:
  1. 访问 `/tags`
  2. 点击任意标签
  3. 观察标签详情页的返回按钮
  4. 点击返回按钮
- **Expected Result**: 返回按钮显示"返回标签列表"，点击导航到 `/tags`

### TC-18: 标签详情页返回 - 直接访问
- **Target**: 标签详情页返回按钮 / Scenario: 直接访问标签详情页
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 直接访问 `/tags/vue`（不带 `from` 参数）
  2. 观察返回按钮
  3. 点击返回按钮
- **Expected Result**: 返回按钮显示"返回标签列表"，点击导航到 `/tags`

### TC-19: 上一篇/下一篇 - 来源信息保持
- **Target**: Previous and next article links / Scenario: 来源信息保持
- **Type**: Manual
- **Preconditions**: 至少 3 篇文章
- **Steps**:
  1. 从标签详情页 `/tags/vue` 进入中间的一篇文章
  2. 点击"下一篇"链接
  3. 观察新页面的返回按钮
  4. 再次点击"下一篇"链接
  5. 观察返回按钮
- **Expected Result**: 所有文章详情页的返回按钮始终显示"返回 #vue"，点击后都导航到 `/tags/vue`

### TC-20: 上一篇/下一篇 - 链接格式验证
- **Target**: Previous and next article links / Scenario: 来源信息保持
- **Type**: Manual
- **Preconditions**: 从 `/tags/vue` 进入文章
- **Steps**:
  1. 右键点击"上一篇"或"下一篇"链接
  2. 复制链接地址
  3. 检查链接格式
- **Expected Result**: 链接包含 `?from=tag-detail&ref=/tags/vue`

### TC-21: 上一篇/下一篇 - 无来源时的切换
- **Target**: Previous and next article links / Scenario: 无来源时的切换
- **Type**: Manual
- **Preconditions**: 至少 2 篇文章
- **Steps**:
  1. 直接访问文章详情页（不带 `from` 参数）
  2. 点击"下一篇"链接
  3. 检查新页面的 URL
  4. 观察返回按钮
- **Expected Result**: URL 不包含来源参数，返回按钮显示"返回首页"

### TC-22: 页面刷新后来源保持
- **Target**: Design Decision 1: 来源信息传递机制
- **Type**: Edge Case
- **Preconditions**: 无
- **Steps**:
  1. 从 `/tags/vue` 进入文章
  2. 刷新页面 (F5)
  3. 观察返回按钮
- **Expected Result**: 返回按钮仍显示"返回 #vue"

### TC-23: 分享链接行为
- **Target**: Design Risk: 分享链接包含来源信息
- **Type**: Edge Case
- **Preconditions**: 无
- **Steps**:
  1. 从 `/tags/vue` 进入文章
  2. 复制完整 URL
  3. 在新的浏览器标签页/隐身窗口中打开该 URL
  4. 观察返回按钮
- **Expected Result**: 返回按钮显示"返回 #vue"，点击导航到 `/tags/vue`

### TC-24: 未知 from 值处理
- **Target**: 来源类型定义 / Edge Case
- **Type**: Edge Case
- **Preconditions**: 无
- **Steps**:
  1. 访问 `/blog/any-post?from=unknown-type`
  2. 观察返回按钮
- **Expected Result**: 返回按钮显示"返回首页"，点击导航到 `/`
