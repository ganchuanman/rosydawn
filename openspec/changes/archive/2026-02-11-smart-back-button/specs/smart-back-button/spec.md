## ADDED Requirements

### Requirement: 智能返回按钮组件
系统 SHALL 提供一个可复用的 `BackButton.astro` 组件，根据页面来源动态显示返回文案并导航到正确的源页面。

#### Scenario: 从首页进入文章
- **WHEN** 用户从首页点击文章进入文章详情页
- **THEN** 返回按钮 SHALL 显示"返回首页"
- **AND** 点击后 SHALL 导航到 `/`

#### Scenario: 从文章列表页进入文章
- **WHEN** 用户从文章列表页（如 `/blog/2`）点击文章进入文章详情页
- **THEN** 返回按钮 SHALL 显示"返回文章列表"
- **AND** 点击后 SHALL 导航到来源页面路径

#### Scenario: 从标签详情页进入文章
- **WHEN** 用户从标签详情页（如 `/tags/vue`）点击文章进入文章详情页
- **THEN** 返回按钮 SHALL 显示"返回 #vue"（使用实际标签名）
- **AND** 点击后 SHALL 导航到来源标签详情页

#### Scenario: 直接访问文章（无来源）
- **WHEN** 用户直接访问文章详情页 URL（无 `from` 参数）
- **THEN** 返回按钮 SHALL 显示"返回首页"
- **AND** 点击后 SHALL 导航到 `/`

### Requirement: 来源信息传递机制
入口页面（首页、文章列表页、标签列表页、标签详情页）在生成链接时 SHALL 通过 URL Query Parameter 传递来源信息。

#### Scenario: 首页文章链接
- **WHEN** 首页渲染文章列表
- **THEN** 每篇文章的链接 SHALL 为 `/blog/<slug>?from=home`

#### Scenario: 文章列表页文章链接
- **WHEN** 文章列表页（如 `/blog/2`）渲染文章列表
- **THEN** 每篇文章的链接 SHALL 为 `/blog/<slug>?from=blog-list&ref=/blog/2`

#### Scenario: 标签详情页文章链接
- **WHEN** 标签详情页（如 `/tags/vue`）渲染文章列表
- **THEN** 每篇文章的链接 SHALL 为 `/blog/<slug>?from=tag-detail&ref=/tags/vue`

#### Scenario: 标签列表页标签链接
- **WHEN** 标签列表页渲染标签列表
- **THEN** 每个标签的链接 SHALL 为 `/tags/<tag>?from=tag-list`

### Requirement: 来源类型定义
系统 SHALL 支持以下来源类型标识：

#### Scenario: 来源类型映射
- **WHEN** 解析 URL 中的 `from` 参数
- **THEN** 系统 SHALL 识别以下值：
  - `home`: 首页，返回到 `/`
  - `blog-list`: 文章列表页，返回到 `ref` 参数指定的路径
  - `tag-list`: 标签列表页，返回到 `/tags`
  - `tag-detail`: 标签详情页，返回到 `ref` 参数指定的路径

### Requirement: 组件降级行为
当客户端 JavaScript 未加载或执行失败时，返回按钮 SHALL 提供可用的降级行为。

#### Scenario: 无 JavaScript 降级
- **WHEN** 页面渲染但 JavaScript 未执行
- **THEN** 返回按钮 SHALL 显示默认文案"返回首页"
- **AND** 点击后 SHALL 导航到 `/`

### Requirement: 标签详情页返回按钮
标签详情页的返回按钮 SHALL 使用智能返回组件。

#### Scenario: 从标签列表进入标签详情
- **WHEN** 用户从标签列表页点击标签进入标签详情页
- **THEN** 返回按钮 SHALL 显示"返回标签列表"
- **AND** 点击后 SHALL 导航到 `/tags`

#### Scenario: 直接访问标签详情页
- **WHEN** 用户直接访问标签详情页 URL（无 `from` 参数）
- **THEN** 返回按钮 SHALL 显示"返回标签列表"
- **AND** 点击后 SHALL 导航到 `/tags`
