## MODIFIED Requirements

### Requirement: Previous and next article links
系统 SHALL 根据用户来源决定是否在文章详情页底部显示上一篇/下一篇导航链接。导航链接基于全局发布时间顺序排列。当显示导航时，导航链接 SHALL 在切换文章时保持原始来源信息。

#### Scenario: Article with both neighbors
- **WHEN** the current article has both a newer and an older article
- **AND** 导航处于显示状态
- **THEN** the navigation SHALL display "上一篇" (previous/older) on the left and "下一篇" (next/newer) on the right
- **AND** each link SHALL show the target article's title

#### Scenario: First article (oldest)
- **WHEN** the current article is the oldest (no older articles exist)
- **AND** 导航处于显示状态
- **THEN** the "上一篇" position SHALL be empty
- **AND** only "下一篇" SHALL be displayed on the right

#### Scenario: Last article (newest)
- **WHEN** the current article is the newest (no newer articles exist)
- **AND** 导航处于显示状态
- **THEN** the "下一篇" position SHALL be empty
- **AND** only "上一篇" SHALL be displayed on the left

#### Scenario: 从首页进入显示导航
- **WHEN** 用户从首页点击文章进入文章详情页
- **AND** URL 中包含 `from=home` 参数
- **THEN** 系统 SHALL 显示上一篇/下一篇导航

#### Scenario: 从文章列表页进入显示导航
- **WHEN** 用户从文章列表页（如 `/blog/2`）点击文章进入文章详情页
- **AND** URL 中包含 `from=blog-list` 参数
- **THEN** 系统 SHALL 显示上一篇/下一篇导航

#### Scenario: 从标签详情页进入隐藏导航
- **WHEN** 用户从标签详情页（如 `/tags/astro`）点击文章进入文章详情页
- **AND** URL 中包含 `from=tag-detail` 参数
- **THEN** 系统 SHALL 隐藏上一篇/下一篇导航
- **AND** 页面底部仅显示返回按钮

#### Scenario: 无来源参数时默认显示导航
- **WHEN** 用户直接访问文章详情页 URL（无 `from` 参数）
- **OR** URL 中的 `from` 参数值无法识别
- **THEN** 系统 SHALL 显示上一篇/下一篇导航

#### Scenario: 来源信息保持
- **WHEN** 用户通过"上一篇"或"下一篇"链接切换文章
- **AND** 当前页面有来源参数（`from` 和可选的 `ref`）
- **THEN** 目标文章链接 SHALL 携带相同的来源参数
- **AND** 返回按钮 SHALL 始终指向最初的入口页面

#### Scenario: 无来源时的切换
- **WHEN** 用户通过"上一篇"或"下一篇"链接切换文章
- **AND** 当前页面没有来源参数
- **THEN** 目标文章链接 SHALL 不添加来源参数
- **AND** 返回按钮 SHALL 默认返回首页
