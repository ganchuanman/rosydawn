# Test Cases

## 1. Test Strategy

本测试计划覆盖 PlantUML URL 编码功能的完整验证：

- **单元测试**：验证编码算法的正确性（Deflate + Base64）
- **集成测试**：验证 remark 插件与 Astro 构建管道的集成
- **端到端测试**：验证浏览器中的 HTML 渲染和交互功能
- **手动测试**：验证视觉效果和用户体验

## 2. Environment & Preconditions

- Node.js 18+ 运行环境
- Astro 5.x 项目已配置
- 测试用 Markdown 文件包含 PlantUML 代码块
- 网络连接可访问 `https://www.plantuml.com/plantuml`（仅端到端测试需要）

## 3. Execution List

### TC-01: 标准 PlantUML 代码块转换
- **Target**: PlantUML 代码块编码 / 标准 PlantUML 代码块转换
- **Type**: Automated
- **Preconditions**: 准备包含 `plantuml` 代码块的 Markdown 文件
- **Steps**:
  1. 创建测试 Markdown 文件，包含 `plantuml` 语言标识的代码块
  2. 运行 Astro 构建命令
  3. 检查生成的 HTML 文件
- **Expected Result**: HTML 包含 `.plantuml-container` 容器，内含图片和源码元素

### TC-02: 自动添加 PlantUML 包装标记
- **Target**: PlantUML 代码块编码 / 自动添加 PlantUML 包装
- **Type**: Automated
- **Preconditions**: 准备不含 `@startuml`/`@enduml` 的代码块
- **Steps**:
  1. 创建代码块内容：`Alice -> Bob: Hello`（无包装）
  2. 运行构建
  3. 检查生成的 URL 编码
- **Expected Result**: 编码后的 URL 能正确解码为包含 `@startuml` 和 `@enduml` 的完整代码

### TC-03: 保留已有包装标记
- **Target**: PlantUML 代码块编码 / 保留已有包装
- **Type**: Automated
- **Preconditions**: 准备已包含 `@startuml`/`@enduml` 的代码块
- **Steps**:
  1. 创建代码块内容：`@startuml\nAlice -> Bob: Hello\n@enduml`
  2. 运行构建
  3. 检查生成的 URL 编码
- **Expected Result**: 编码后的 URL 解码结果与原始代码一致，无重复包装

### TC-04: Deflate 压缩编码正确性
- **Target**: URL 编码算法 / Deflate 压缩编码
- **Type**: Automated
- **Preconditions**: 准备已知输入输出的测试数据
- **Steps**:
  1. 使用已知的 PlantUML 代码作为输入
  2. 调用编码函数
  3. 与 PlantUML 官方工具生成的编码结果对比
- **Expected Result**: 编码结果与官方工具一致

### TC-05: 自定义 Base64 字符集验证
- **Target**: URL 编码算法 / 自定义 Base64 字符集
- **Type**: Automated
- **Preconditions**: 无
- **Steps**:
  1. 对多组测试数据进行编码
  2. 检查编码结果中的字符
- **Expected Result**: 编码结果仅包含字符集 `0-9A-Za-z-_` 中的字符

### TC-06: 完整 URL 格式生成
- **Target**: URL 编码算法 / 生成完整 URL
- **Type**: Automated
- **Preconditions**: 无
- **Steps**:
  1. 使用默认配置编码 PlantUML 代码
  2. 检查生成的完整 URL
- **Expected Result**: URL 格式为 `https://www.plantuml.com/plantuml/svg/{encoded}`

### TC-07: HTML 容器结构验证
- **Target**: HTML 输出结构 / 容器结构生成
- **Type**: Automated
- **Preconditions**: 完成构建
- **Steps**:
  1. 解析生成的 HTML
  2. 查找 `.plantuml-container` 元素
  3. 验证内部结构
- **Expected Result**: 容器包含 `.plantuml-toolbar`、`.plantuml-content`、`.plantuml-image`、`.plantuml-source`

### TC-08: 图片元素属性验证
- **Target**: HTML 输出结构 / 图片元素属性
- **Type**: Automated
- **Preconditions**: 完成构建
- **Steps**:
  1. 查找 `.plantuml-image` 元素
  2. 检查 `src`、`alt`、`class` 属性
- **Expected Result**:
  - `class="plantuml-image"`
  - `src` 包含正确的 PlantUML URL
  - `alt="PlantUML Diagram"`

### TC-09: 源码元素内容验证
- **Target**: HTML 输出结构 / 源码元素内容
- **Type**: Automated
- **Preconditions**: 完成构建
- **Steps**:
  1. 查找 `.plantuml-source` 元素
  2. 检查内部结构和内容
- **Expected Result**: 包含 `<pre class="plantuml-source"><code>` 结构，内容为原始 PlantUML 代码

### TC-10: 默认显示图片视图
- **Target**: 图片/源码切换功能 / 默认显示图片
- **Type**: Manual / E2E
- **Preconditions**: 浏览器打开包含 PlantUML 的页面
- **Steps**:
  1. 加载包含 PlantUML 图的页面
  2. 观察初始显示状态
- **Expected Result**: 图片可见，源码隐藏，按钮显示"查看源码"

### TC-11: 点击切换到源码视图
- **Target**: 图片/源码切换功能 / 点击切换到源码
- **Type**: Manual / E2E
- **Preconditions**: 页面处于图片视图状态
- **Steps**:
  1. 点击"查看源码"按钮
  2. 观察视图变化
- **Expected Result**: 图片隐藏，源码显示，按钮文字变为"显示图片"

### TC-12: 点击切换回图片视图
- **Target**: 图片/源码切换功能 / 点击切换回图片
- **Type**: Manual / E2E
- **Preconditions**: 页面处于源码视图状态
- **Steps**:
  1. 点击"显示图片"按钮
  2. 观察视图变化
- **Expected Result**: 源码隐藏，图片显示，按钮文字变为"查看源码"

### TC-13: View Transitions 导航后功能正常
- **Target**: 图片/源码切换功能 / View Transitions 兼容
- **Type**: Manual / E2E
- **Preconditions**: 项目启用 Astro View Transitions
- **Steps**:
  1. 从其他页面通过链接导航到包含 PlantUML 的页面
  2. 点击切换按钮
- **Expected Result**: 切换功能正常工作

### TC-14: 自定义服务器地址配置
- **Target**: 插件配置选项 / 自定义服务器地址
- **Type**: Automated
- **Preconditions**: 在配置中指定自定义 `server` 选项
- **Steps**:
  1. 配置 `server: 'https://custom.plantuml.server/plantuml'`
  2. 运行构建
  3. 检查生成的图片 URL
- **Expected Result**: URL 使用自定义服务器地址

### TC-15: 自定义输出格式 PNG
- **Target**: 插件配置选项 / 自定义输出格式
- **Type**: Automated
- **Preconditions**: 在配置中指定 `format: 'png'`
- **Steps**:
  1. 配置 `format: 'png'`
  2. 运行构建
  3. 检查生成的图片 URL
- **Expected Result**: URL 路径包含 `/png/` 而非 `/svg/`

### TC-16: 默认配置验证
- **Target**: 插件配置选项 / 默认配置
- **Type**: Automated
- **Preconditions**: 不提供任何配置选项
- **Steps**:
  1. 使用默认配置运行插件
  2. 检查生成的图片 URL
- **Expected Result**: URL 为 `https://www.plantuml.com/plantuml/svg/{encoded}`

### TC-17: 响应式图片显示
- **Target**: 样式集成 / 响应式图片
- **Type**: Manual
- **Preconditions**: 在不同屏幕尺寸的设备或模拟器上测试
- **Steps**:
  1. 在桌面浏览器全屏查看
  2. 缩小浏览器窗口至移动端尺寸
  3. 观察图片尺寸变化
- **Expected Result**: 图片自适应容器宽度，不超出屏幕

### TC-18: 源码样式验证
- **Target**: 样式集成 / 源码样式
- **Type**: Manual
- **Preconditions**: 切换到源码视图
- **Steps**:
  1. 点击"查看源码"切换到源码视图
  2. 观察源码样式
- **Expected Result**: 源码使用等宽字体，有合适的内边距和边框

### TC-19: 暗色模式图片背景
- **Target**: 样式集成 / 暗色模式兼容
- **Type**: Manual
- **Preconditions**: 页面切换到暗色模式
- **Steps**:
  1. 切换页面到暗色模式
  2. 观察 PlantUML 图片显示
- **Expected Result**: 图片保持白色背景，内容清晰可读

### TC-20: 超长代码 URL 边界测试
- **Target**: 设计风险 / 超长代码导致 URL 过长
- **Type**: Edge Case
- **Preconditions**: 准备超长的 PlantUML 代码（>10000 字符）
- **Steps**:
  1. 创建包含大量元素的复杂 PlantUML 图
  2. 运行构建
  3. 在浏览器中加载
- **Expected Result**: 如果 URL 过长，系统应能处理（压缩或显示警告）

### TC-21: PlantUML 服务器不可用时的降级
- **Target**: 设计风险 / PlantUML 服务器不可用
- **Type**: Edge Case
- **Preconditions**: 模拟 PlantUML 服务器不可访问
- **Steps**:
  1. 断开网络或配置无效服务器地址
  2. 加载包含 PlantUML 的页面
  3. 点击"查看源码"按钮
- **Expected Result**: 图片加载失败时，用户可切换查看源码
