## ADDED Requirements

### Requirement: Loading 状态显示

系统 SHALL 在 PlantUML 图片加载过程中显示 loading 动画，为用户提供明确的视觉反馈。

#### Scenario: 页面加载时显示 loading 状态
- **WHEN** PlantUML 图片容器初始化
- **THEN** 系统 SHALL 显示 loading 动画
- **AND** loading 动画 SHALL 居中显示在图片容器内

#### Scenario: Loading 动画样式
- **WHEN** 显示 loading 状态
- **THEN** 系统 SHALL 显示旋转的 spinner 动画
- **AND** 动画 SHALL 使用纯 CSS 实现，不依赖外部资源

#### Scenario: Loading 状态时图片不可见
- **WHEN** 图片处于 loading 状态
- **THEN** 实际的图片元素 SHALL 隐藏
- **AND** 仅显示 loading 动画和占位空间

### Requirement: 加载成功状态切换

系统 SHALL 在图片成功加载后自动切换到 loaded 状态，隐藏 loading 动画并显示图片。

#### Scenario: 图片加载成功
- **WHEN** 图片成功加载完成
- **THEN** 系统 SHALL 移除 loading 状态
- **AND** 系统 SHALL 添加 loaded 状态
- **AND** 图片 SHALL 正常显示

#### Scenario: loaded 状态下的切换按钮
- **WHEN** 图片处于 loaded 状态
- **THEN** 右上角的"切换到源码"按钮 SHALL 可用
- **AND** 图片/源码切换功能 SHALL 正常工作

### Requirement: 加载失败状态显示

系统 SHALL 在图片加载失败时显示错误提示界面，明确告知用户加载失败的原因。

#### Scenario: 网络错误导致加载失败
- **WHEN** 图片加载因网络错误失败
- **THEN** 系统 SHALL 显示错误状态
- **AND** 系统 SHALL 显示错误图标和提示文字
- **AND** 系统 SHALL 显示重试按钮

#### Scenario: 超时导致加载失败
- **WHEN** 图片加载超过 30 秒未完成
- **THEN** 系统 SHALL 触发超时错误
- **AND** 系统 SHALL 显示超时错误提示
- **AND** 系统 SHALL 显示重试按钮

#### Scenario: 错误提示内容
- **WHEN** 显示错误状态
- **THEN** 系统 SHALL 显示错误图标（如感叹号或错误符号）
- **AND** 系统 SHALL 显示提示文字"图片加载失败，请检查网络连接后重试"
- **AND** 提示文字 SHALL 清晰可读

### Requirement: 重试功能

系统 SHALL 提供重试按钮，允许用户在加载失败后手动重新加载图片，无需刷新整个页面。

#### Scenario: 点击重试按钮
- **WHEN** 用户在错误状态下点击重试按钮
- **THEN** 系统 SHALL 清除错误状态
- **AND** 系统 SHALL 重新显示 loading 状态
- **AND** 系统 SHALL 重新发起图片加载请求

#### Scenario: 重试按钮样式
- **WHEN** 显示错误状态
- **THEN** 重试按钮 SHALL 显示文字"重新加载"
- **AND** 按钮 SHALL 有明显的视觉样式（如背景色、边框）
- **AND** 按钮 SHALL 支持 hover 状态变化

#### Scenario: 重试按钮的防抖机制
- **WHEN** 用户点击重试按钮后
- **THEN** 按钮 SHALL 在 2 秒内不可再次点击
- **AND** 按钮 SHALL 显示禁用状态（如灰色或半透明）

#### Scenario: 重试成功
- **WHEN** 重试后图片加载成功
- **THEN** 系统 SHALL 切换到 loaded 状态
- **AND** 图片 SHALL 正常显示

#### Scenario: 重试再次失败
- **WHEN** 重试后图片仍然加载失败
- **THEN** 系统 SHALL 再次显示错误状态
- **AND** 重试按钮 SHALL 再次可用（在防抖时间后）

### Requirement: 超时处理

系统 SHALL 实现 30 秒超时机制，避免用户无限等待。

#### Scenario: 超时时间设置
- **WHEN** 开始加载图片
- **THEN** 系统 SHALL 启动 30 秒的倒计时计时器

#### Scenario: 超时触发
- **WHEN** 图片加载时间超过 30 秒
- **THEN** 系统 SHALL 取消当前加载请求
- **AND** 系统 SHALL 显示超时错误状态
- **AND** 系统 SHALL 显示重试按钮

#### Scenario: 加载成功时取消计时器
- **WHEN** 图片在 30 秒内加载成功
- **THEN** 系统 SHALL 取消超时计时器
- **AND** 系统 SHALL 切换到 loaded 状态

### Requirement: View Transitions 兼容性

系统 SHALL 确保加载状态功能在 Astro View Transitions 导航场景下正常工作。

#### Scenario: View Transitions 页面切换
- **WHEN** 页面通过 Astro View Transitions 导航到包含 PlantUML 图片的新页面
- **THEN** 系统 SHALL 重新初始化图片加载监听
- **AND** loading 状态 SHALL 正常显示
- **AND** 所有状态切换功能 SHALL 正常工作

#### Scenario: 页面切换时状态重置
- **WHEN** 用户从包含 PlantUML 图片的页面导航离开
- **THEN** 系统 SHALL 清理所有事件监听器
- **AND** 系统 SHALL 取消未完成的加载请求
- **AND** 系统 SHALL 清除超时计时器

### Requirement: 暗色模式支持

系统 SHALL 确保加载状态在暗色模式下有良好的视觉效果。

#### Scenario: 暗色模式下的 loading 动画
- **WHEN** 页面处于暗色模式
- **THEN** loading 动画 SHALL 使用适合暗色背景的颜色
- **AND** 动画 SHALL 清晰可见

#### Scenario: 暗色模式下的错误提示
- **WHEN** 页面处于暗色模式且显示错误状态
- **THEN** 错误图标和文字 SHALL 使用适合暗色背景的颜色
- **AND** 重试按钮 SHALL 在暗色背景下清晰可见
- **AND** 按钮 hover 状态 SHALL 正常工作

#### Scenario: 暗色模式下的状态切换
- **WHEN** 页面在 loading、error、loaded 状态间切换
- **THEN** 样式 SHALL 平滑过渡
- **AND** 视觉效果 SHALL 保持一致
