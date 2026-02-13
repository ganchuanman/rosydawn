## MODIFIED Requirements

### Requirement: 图片/源码切换功能

系统 SHALL 提供交互式切换功能，允许用户在图片和源码视图之间切换。

#### Scenario: 默认显示图片
- **WHEN** 页面加载完成
- **THEN** 容器 SHALL 显示图片视图，隐藏源码视图

#### Scenario: 点击切换到源码
- **WHEN** 用户点击图片右上角的代码图标按钮
- **THEN** 系统隐藏图片、显示源码代码块

#### Scenario: 点击切换回图片
- **WHEN** 用户在源码视图点击工具栏的"图片"按钮
- **THEN** 系统隐藏源码、显示图片

#### Scenario: 源码工具栏按钮
- **WHEN** 显示源码视图
- **THEN** 工具栏右侧 SHALL 包含"图片"按钮和"复制"按钮
- **AND** "图片"按钮在"复制"按钮前面

#### Scenario: View Transitions 兼容
- **WHEN** 页面通过 Astro View Transitions 导航
- **THEN** 切换功能 SHALL 重新初始化并正常工作

#### Scenario: 动态创建按钮的事件绑定
- **WHEN** 客户端 JavaScript 动态创建源码代码块和"图片"按钮
- **THEN** 系统 SHALL 使用事件委托机制确保动态创建的"图片"按钮点击事件能正确触发
- **AND** 点击"图片"按钮 SHALL 成功切换回图片视图

### Requirement: 源码代码块生成

系统 SHALL 在客户端将 Base64 编码的源码正确解码并生成代码块。

#### Scenario: 解码 UTF-8 字符
- **WHEN** 源码包含 UTF-8 编码的中文字符或其他非 ASCII 字符
- **THEN** 系统 SHALL 使用 TextDecoder API 正确解码 Base64 字符串为 UTF-8 文本
- **AND** 解码后的源码 SHALL 正确显示中文字符，不出现乱码

#### Scenario: 代码块结构生成
- **WHEN** 页面加载时
- **THEN** 客户端 JS SHALL 将源码占位符替换为与现有代码块一致的结构
- **AND** 代码块 SHALL 包含工具栏、行号、复制按钮
