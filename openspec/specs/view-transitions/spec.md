### Requirement: 页面切换过渡动画
系统 SHALL 在页面切换时提供平滑的过渡动画效果，使用 Astro 内置的 View Transitions API。

#### Scenario: 正常页面导航
- **WHEN** 用户点击站内链接导航到另一个页面
- **THEN** 页面内容以淡入淡出动画过渡，而非硬切换

#### Scenario: 浏览器不支持 View Transitions
- **WHEN** 用户使用不支持 View Transitions API 的浏览器
- **THEN** 系统回退到传统页面导航，功能不受影响

### Requirement: 脚本在页面切换后正确初始化
系统 SHALL 确保页面切换后所有客户端脚本正确重新初始化。

#### Scenario: TOC 高亮在页面切换后工作
- **WHEN** 用户通过 View Transitions 导航到文章页面
- **THEN** TOC 目录高亮功能正常工作

#### Scenario: 代码块功能在页面切换后工作
- **WHEN** 用户通过 View Transitions 导航到包含代码块的文章
- **THEN** 代码块的复制按钮、行号、展开收起功能正常工作

### Requirement: 阅读进度条在页面切换后重置
系统 SHALL 在页面切换后重置阅读进度条状态。

#### Scenario: 导航到新文章后进度条重置
- **WHEN** 用户从一篇文章导航到另一篇文章
- **THEN** 阅读进度条从 0% 开始，反映新页面的滚动位置
