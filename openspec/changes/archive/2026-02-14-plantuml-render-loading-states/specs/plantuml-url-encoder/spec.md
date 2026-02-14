## MODIFIED Requirements

### Requirement: HTML 输出结构

系统 SHALL 生成包含图片、源码数据和状态容器的 HTML 结构，支持切换显示和加载状态管理。

#### Scenario: 容器结构生成
- **WHEN** 转换 PlantUML 代码块
- **THEN** 系统生成包含 `.plantuml-container` 容器、图片包装器和源码占位符的 HTML 结构
- **AND** 源码以 Base64 编码存储在 `data-plantuml-source` 属性中
- **AND** 容器 SHALL 默认包含 `.plantuml-loading` 状态类

#### Scenario: 图片元素属性
- **WHEN** 生成图片元素
- **THEN** 图片元素 SHALL 包含 `class="plantuml-image"`、正确的 `src` URL、`alt="PlantUML Diagram"` 和 `loading="lazy"` 属性
- **AND** 图片无边框包裹，直接显示
- **AND** 图片元素 SHALL 被 loading 状态容器包裹

#### Scenario: 切换按钮（图片模式）
- **WHEN** 显示图片视图
- **THEN** 右上角 SHALL 有一个悬浮的代码图标按钮
- **AND** 按钮默认透明，hover 时显示

#### Scenario: 状态容器结构
- **WHEN** 生成图片包装器 `.plantuml-image-wrapper`
- **THEN** 包装器内 SHALL 包含三个状态容器：
  - `.plantuml-loading-container` 用于显示 loading 动画
  - `.plantuml-error-container` 用于显示错误提示和重试按钮
  - `.plantuml-image` 实际的图片元素
- **AND** 所有状态容器 SHALL 占据相同的布局空间（使用绝对定位或相同尺寸）

#### Scenario: 默认状态
- **WHEN** 页面首次加载 PlantUML 容器
- **THEN** 容器 SHALL 默认显示 loading 状态
- **AND** 图片元素 SHALL 存在但不可见
- **AND** error 状态 SHALL 隐藏

## ADDED Requirements

### Requirement: 状态容器样式类

系统 SHALL 通过 CSS 类名控制不同加载状态的显示。

#### Scenario: Loading 状态类
- **WHEN** 容器包含 `.plantuml-loading` 类
- **THEN** `.plantuml-loading-container` SHALL 可见
- **AND** `.plantuml-error-container` SHALL 隐藏
- **AND** `.plantuml-image` SHALL 隐藏

#### Scenario: Error 状态类
- **WHEN** 容器包含 `.plantuml-error` 类
- **THEN** `.plantuml-error-container` SHALL 可见
- **AND** `.plantuml-loading-container` SHALL 隐藏
- **AND** `.plantuml-image` SHALL 隐藏

#### Scenario: Loaded 状态类
- **WHEN** 容器包含 `.plantuml-loaded` 类
- **THEN** `.plantuml-image` SHALL 可见
- **AND** `.plantuml-loading-container` SHALL 隐藏
- **AND** `.plantuml-error-container` SHALL 隐藏

#### Scenario: 状态类互斥性
- **WHEN** 系统添加某个状态类（如 `.plantuml-loaded`）
- **THEN** 系统 SHALL 同时移除其他状态类（`.plantuml-loading`、`.plantuml-error`）
- **AND** 确保同一时刻只有一个状态类生效
