# Test Cases

## 1. Test Strategy

本测试计划采用以下测试策略：

- **单元测试**: 验证状态切换逻辑、超时机制、防抖功能等核心逻辑
- **集成测试**: 验证 HTML 结构生成、CSS 类名控制、JavaScript 事件处理
- **手动 UI 测试**: 验证视觉效果、动画流畅性、暗色模式兼容性
- **端到端测试**: 验证完整的加载流程、重试流程、View Transitions 兼容性

测试重点：
- 状态转换的正确性（loading → loaded/error）
- 超时机制的准确性
- 重试功能的可用性
- View Transitions 导航场景
- 暗色模式下的视觉一致性

## 2. Environment & Preconditions

### 测试环境要求
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）
- 支持暗色模式的操作系统或浏览器设置
- 网络 throttling 工具（Chrome DevTools 或类似）
- PlantUML 服务器可访问（或本地 mock 服务器）

### 测试前置条件
- 项目已正确构建，包含 PlantUML 插件
- 测试页面包含至少一个 PlantUML 代码块
- 浏览器支持 CSS 动画和 ES6+ JavaScript
- Astro View Transitions 已启用

### 测试数据准备
- 简单的 PlantUML 图表（快速加载）
- 复杂的 PlantUML 图表（慢速加载）
- 无效的 PlantUML URL（触发错误）
- 包含中文字符的 PlantUML 代码（测试 UTF-8 支持）

## 3. Execution List

### TC-01: 页面加载时显示 loading 状态
- **Target**: plantuml-loading-states - "页面加载时显示 loading 状态"
- **Type**: Manual / E2E
- **Preconditions**: 页面包含 PlantUML 图片，网络正常
- **Steps**:
  1. 在浏览器中打开包含 PlantUML 图片的页面
  2. 观察页面初始加载过程
  3. 检查 PlantUML 容器的初始状态
- **Expected Result**:
  - 页面加载时立即显示 loading 动画
  - loading 动画居中显示在图片容器内
  - 图片元素存在但不可见（opacity: 0 或 display: none）

### TC-02: Loading 动画样式验证
- **Target**: plantuml-loading-states - "Loading 动画样式"
- **Type**: Manual
- **Preconditions**: 页面处于 loading 状态
- **Steps**:
  1. 观察 loading 动画的视觉效果
  2. 使用浏览器开发者工具检查动画 CSS
  3. 验证没有外部资源请求（如 SVG、图片）
- **Expected Result**:
  - 显示旋转的 spinner 动画
  - 动画使用纯 CSS 实现（@keyframes）
  - 无额外的网络请求
  - 动画流畅，无明显卡顿

### TC-03: 图片加载成功状态切换
- **Target**: plantuml-loading-states - "图片加载成功"
- **Type**: Automated / E2E
- **Preconditions**: PlantUML 服务器可访问，网络正常
- **Steps**:
  1. 打开包含 PlantUML 图片的页面
  2. 等待图片加载完成
  3. 检查容器的 CSS 类名变化
  4. 检查 loading 动画是否消失
  5. 检查图片是否正常显示
- **Expected Result**:
  - 容器类名从 `.plantuml-loading` 变为 `.plantuml-loaded`
  - loading 动画隐藏
  - 图片正常显示且可见
  - 图片的 src 属性正确

### TC-04: loaded 状态下的切换按钮功能
- **Target**: plantuml-loading-states - "loaded 状态下的切换按钮"
- **Type**: Manual / E2E
- **Preconditions**: 图片已成功加载，处于 loaded 状态
- **Steps**:
  1. 鼠标悬停在图片区域
  2. 观察右上角的切换按钮
  3. 点击"切换到源码"按钮
  4. 验证切换功能正常工作
- **Expected Result**:
  - 右上角显示代码图标按钮
  - 按钮在 hover 时可见
  - 点击按钮后成功切换到源码视图
  - 切换功能不受 loading 状态影响

### TC-05: 网络错误导致加载失败
- **Target**: plantuml-loading-states - "网络错误导致加载失败"
- **Type**: Manual / E2E
- **Preconditions**:
  - PlantUML 服务器不可访问或网络断开
  - 页面包含 PlantUML 图片
- **Steps**:
  1. 使用 Chrome DevTools 设置网络离线模式
  2. 打开包含 PlantUML 图片的页面
  3. 等待图片加载失败
  4. 观察错误状态的显示
- **Expected Result**:
  - 容器类名变为 `.plantuml-error`
  - 显示错误图标（感叹号或错误符号）
  - 显示提示文字"图片加载失败，请检查网络连接后重试"
  - 显示"重新加载"按钮

### TC-06: 超时导致加载失败
- **Target**: plantuml-loading-states - "超时导致加载失败"
- **Type**: Manual / E2E
- **Preconditions**:
  - PlantUML 服务器响应极慢（使用 throttling 设置为 >30s）
  - 页面包含 PlantUML 图片
- **Steps**:
  1. 使用 Chrome DevTools 设置网络 throttling（Slow 3G）
  2. 打开包含复杂 PlantUML 图表的页面
  3. 等待 30 秒
  4. 观察超时错误的显示
- **Expected Result**:
  - 30 秒后容器类名变为 `.plantuml-error`
  - 显示超时错误提示
  - 显示"重新加载"按钮
  - 超时计时器被清除

### TC-07: 错误提示内容验证
- **Target**: plantuml-loading-states - "错误提示内容"
- **Type**: Manual
- **Preconditions**: 页面处于 error 状态
- **Steps**:
  1. 触发图片加载失败（网络错误或超时）
  2. 检查错误提示的视觉元素
  3. 验证文字内容
  4. 检查可读性
- **Expected Result**:
  - 错误图标清晰可见（SVG 或 CSS 实现）
  - 提示文字为"图片加载失败，请检查网络连接后重试"
  - 文字颜色与背景对比度良好
  - 布局居中且美观

### TC-08: 点击重试按钮
- **Target**: plantuml-loading-states - "点击重试按钮"
- **Type**: Automated / E2E
- **Preconditions**:
  - 页面处于 error 状态
  - 重试按钮可见且可用
- **Steps**:
  1. 点击"重新加载"按钮
  2. 观察状态变化
  3. 检查是否发起新的加载请求
  4. 等待加载结果
- **Expected Result**:
  - 容器类名从 `.plantuml-error` 变为 `.plantuml-loading`
  - loading 动画重新显示
  - 发起新的图片加载请求（Network tab 可见）
  - 无需刷新整个页面

### TC-09: 重试按钮样式验证
- **Target**: plantuml-loading-states - "重试按钮样式"
- **Type**: Manual
- **Preconditions**: 页面处于 error 状态
- **Steps**:
  1. 观察重试按钮的默认样式
  2. 鼠标悬停在按钮上
  3. 检查按钮的视觉样式
- **Expected Result**:
  - 按钮显示文字"重新加载"
  - 按钮有明显的背景色和边框
  - hover 状态下样式变化（如背景色加深、边框高亮）
  - 按钮尺寸适中，易于点击

### TC-10: 重试按钮的防抖机制
- **Target**: plantuml-loading-states - "重试按钮的防抖机制"
- **Type**: Automated / E2E
- **Preconditions**:
  - 页面处于 error 状态
  - 重试按钮可用
- **Steps**:
  1. 点击"重新加载"按钮
  2. 立即再次尝试点击按钮
  3. 等待 2 秒
  4. 再次尝试点击按钮
- **Expected Result**:
  - 点击后按钮立即变为禁用状态（灰色或半透明）
  - 2 秒内点击无效，不触发新的加载请求
  - 2 秒后按钮恢复可用状态
  - 可以再次点击触发重试

### TC-11: 重试成功
- **Target**: plantuml-loading-states - "重试成功"
- **Type**: Automated / E2E
- **Preconditions**:
  - 页面处于 error 状态
  - 重试按钮可用
  - 网络已恢复
- **Steps**:
  1. 点击"重新加载"按钮
  2. 等待图片加载完成
  3. 检查状态变化
- **Expected Result**:
  - 容器类名从 `.plantuml-loading` 变为 `.plantuml-loaded`
  - 图片正常显示
  - loading 动画隐藏
  - 图片/源码切换功能正常

### TC-12: 重试再次失败
- **Target**: plantuml-loading-states - "重试再次失败"
- **Type**: Automated / E2E
- **Preconditions**:
  - 页面处于 error 状态
  - 网络仍然不可用
- **Steps**:
  1. 点击"重新加载"按钮
  2. 等待图片加载再次失败
  3. 观察错误状态
  4. 等待防抖时间后检查按钮状态
- **Expected Result**:
  - 容器类名再次变为 `.plantuml-error`
  - 错误提示重新显示
  - 2 秒后重试按钮再次可用

### TC-13: 超时时间设置验证
- **Target**: plantuml-loading-states - "超时时间设置"
- **Type**: Automated / Unit
- **Preconditions**:
  - 页面包含 PlantUML 图片
  - 网络设置为 Slow 3G
- **Steps**:
  1. 开始加载图片
  2. 记录开始时间
  3. 等待超时触发
  4. 记录触发时间
  5. 计算时间差
- **Expected Result**:
  - 超时触发时间在 30 秒 ± 1 秒范围内
  - 超时计时器正确启动

### TC-14: 加载成功时取消计时器
- **Target**: plantuml-loading-states - "加载成功时取消计时器"
- **Type**: Automated / Unit
- **Preconditions**:
  - 页面包含简单的 PlantUML 图片（加载快）
  - 网络正常
- **Steps**:
  1. 开始加载图片
  2. 等待图片在 30 秒内加载完成
  3. 检查超时计时器是否被清除
  4. 等待超过 30 秒，观察是否仍触发超时
- **Expected Result**:
  - 图片加载成功后超时计时器被清除
  - 30 秒后不会触发超时错误
  - 容器状态为 `.plantuml-loaded`

### TC-15: View Transitions 页面切换
- **Target**: plantuml-loading-states - "View Transitions 页面切换"
- **Type**: E2E
- **Preconditions**:
  - Astro View Transitions 已启用
  - 网站有多个页面，部分页面包含 PlantUML 图片
- **Steps**:
  1. 在首页点击导航到包含 PlantUML 图片的页面
  2. 观察 View Transitions 动画
  3. 检查图片加载状态是否正常初始化
  4. 测试图片/源码切换功能
  5. 点击浏览器的后退和前进按钮
- **Expected Result**:
  - View Transitions 动画正常
  - 图片加载监听正确初始化
  - loading 状态正常显示
  - 所有状态切换功能正常工作
  - 前进/后退导航时功能正常

### TC-16: 页面切换时状态重置
- **Target**: plantuml-loading-states - "页面切换时状态重置"
- **Type**: Automated / E2E
- **Preconditions**:
  - 当前页面包含正在加载的 PlantUML 图片
  - 准备导航到其他页面
- **Steps**:
  1. 触发图片加载（loading 状态）
  2. 在图片加载完成前点击导航到其他页面
  3. 检查事件监听器是否被清理
  4. 检查超时计时器是否被清除
  5. 返回原页面，验证无内存泄漏
- **Expected Result**:
  - 导航离开时所有事件监听器被清理
  - 超时计时器被清除
  - 未完成的加载请求被取消
  - 无内存泄漏或控制台错误

### TC-17: 暗色模式下的 loading 动画
- **Target**: plantuml-loading-states - "暗色模式下的 loading 动画"
- **Type**: Manual
- **Preconditions**:
  - 浏览器或操作系统设置为暗色模式
  - 页面包含 PlantUML 图片
- **Steps**:
  1. 打开包含 PlantUML 图片的页面
  2. 观察暗色模式下的 loading 动画
  3. 检查动画颜色和对比度
  4. 验证动画清晰可见
- **Expected Result**:
  - loading 动画使用适合暗色背景的颜色
  - 动画与暗色背景对比度良好
  - 动画清晰可见，无视觉问题

### TC-18: 暗色模式下的错误提示
- **Target**: plantuml-loading-states - "暗色模式下的错误提示"
- **Type**: Manual
- **Preconditions**:
  - 浏览器或操作系统设置为暗色模式
  - 页面处于 error 状态
- **Steps**:
  1. 触发图片加载失败
  2. 观察暗色模式下的错误提示
  3. 检查错误图标和文字的颜色
  4. 检查重试按钮的样式
  5. 测试按钮的 hover 状态
- **Expected Result**:
  - 错误图标在暗色背景下清晰可见
  - 错误文字颜色与暗色背景对比度良好
  - 重试按钮在暗色背景下清晰可见
  - hover 状态正常工作

### TC-19: 暗色模式下的状态切换
- **Target**: plantuml-loading-states - "暗色模式下的状态切换"
- **Type**: Manual / E2E
- **Preconditions**:
  - 浏览器或操作系统设置为暗色模式
- **Steps**:
  1. 打开包含 PlantUML 图片的页面
  2. 观察 loading 状态
  3. 等待加载成功，观察 loaded 状态
  4. 触发加载失败，观察 error 状态
  5. 点击重试，观察状态切换
- **Expected Result**:
  - 所有状态切换时样式平滑过渡
  - 无闪烁或突兀的样式变化
  - 视觉效果保持一致
  - 暗色模式在所有状态下均正常工作

### TC-20: HTML 容器结构验证
- **Target**: plantuml-url-encoder - "容器结构生成"
- **Type**: Automated / Unit
- **Preconditions**: 页面包含 PlantUML 代码块
- **Steps**:
  1. 使用浏览器开发者工具检查 DOM 结构
  2. 验证 `.plantuml-container` 存在
  3. 验证包含 `.plantuml-image-wrapper`
  4. 验证包含源码占位符（data-plantuml-source 属性）
  5. 检查默认的 CSS 类名
- **Expected Result**:
  - DOM 结构正确，包含所有必需的容器
  - 源码正确编码并存储在 data-plantuml-source 属性中
  - 容器默认包含 `.plantuml-loading` 状态类

### TC-21: 状态容器结构验证
- **Target**: plantuml-url-encoder - "状态容器结构"
- **Type**: Automated / Unit
- **Preconditions**: 页面包含 PlantUML 图片
- **Steps**:
  1. 检查 `.plantuml-image-wrapper` 的子元素
  2. 验证存在三个状态容器
  3. 检查容器类名
  4. 验证布局空间占用
- **Expected Result**:
  - 包含 `.plantuml-loading-container`
  - 包含 `.plantuml-error-container`
  - 包含 `.plantuml-image`
  - 所有容器占据相同的布局空间

### TC-22: 默认状态验证
- **Target**: plantuml-url-encoder - "默认状态"
- **Type**: Automated / E2E
- **Preconditions**: 页面首次加载
- **Steps**:
  1. 打开包含 PlantUML 图片的页面
  2. 立即检查容器状态（不等待加载完成）
  3. 检查 CSS 类名
  4. 检查各容器的可见性
- **Expected Result**:
  - 容器默认显示 loading 状态
  - 图片元素存在但不可见
  - error 状态容器隐藏

### TC-23: Loading 状态类验证
- **Target**: plantuml-url-encoder - "Loading 状态类"
- **Type**: Automated / Unit
- **Preconditions**: 容器包含 `.plantuml-loading` 类
- **Steps**:
  1. 添加 `.plantuml-loading` 类到容器
  2. 检查各容器的可见性
  3. 验证 CSS 规则生效
- **Expected Result**:
  - `.plantuml-loading-container` 可见
  - `.plantuml-error-container` 隐藏
  - `.plantuml-image` 隐藏

### TC-24: Error 状态类验证
- **Target**: plantuml-url-encoder - "Error 状态类"
- **Type**: Automated / Unit
- **Preconditions**: 容器包含 `.plantuml-error` 类
- **Steps**:
  1. 添加 `.plantuml-error` 类到容器
  2. 检查各容器的可见性
  3. 验证 CSS 规则生效
- **Expected Result**:
  - `.plantuml-error-container` 可见
  - `.plantuml-loading-container` 隐藏
  - `.plantuml-image` 隐藏

### TC-25: Loaded 状态类验证
- **Target**: plantuml-url-encoder - "Loaded 状态类"
- **Type**: Automated / Unit
- **Preconditions**: 容器包含 `.plantuml-loaded` 类
- **Steps**:
  1. 添加 `.plantuml-loaded` 类到容器
  2. 检查各容器的可见性
  3. 验证 CSS 规则生效
- **Expected Result**:
  - `.plantuml-image` 可见
  - `.plantuml-loading-container` 隐藏
  - `.plantuml-error-container` 隐藏

### TC-26: 状态类互斥性验证
- **Target**: plantuml-url-encoder - "状态类互斥性"
- **Type**: Automated / Unit
- **Preconditions**: 容器当前处于 loading 状态
- **Steps**:
  1. 触发状态切换（如加载成功）
  2. 检查容器类名变化
  3. 验证旧类名被移除
  4. 验证只有一个状态类存在
- **Expected Result**:
  - 添加 `.plantuml-loaded` 时，自动移除 `.plantuml-loading` 和 `.plantuml-error`
  - 同一时刻只有一个状态类生效
  - 无类名冲突

### TC-27: 多个 PlantUML 图片的独立性
- **Target**: Edge Case - 多图片场景
- **Type**: E2E
- **Preconditions**: 页面包含多个 PlantUML 图片
- **Steps**:
  1. 打开包含多个 PlantUML 图片的页面
  2. 观察每个图片的加载状态
  3. 让其中一个图片加载失败
  4. 点击该图片的重试按钮
  5. 检查其他图片是否受影响
- **Expected Result**:
  - 每个图片的加载状态独立管理
  - 一个图片的失败不影响其他图片
  - 重试一个图片不影响其他图片的状态

### TC-28: 快速切换页面时的状态处理
- **Target**: Edge Case - 快速导航
- **Type**: E2E
- **Preconditions**: 网站有多个页面，部分包含 PlantUML 图片
- **Steps**:
  1. 打开包含 PlantUML 图片的页面 A
  2. 在图片加载完成前快速导航到页面 B
  3. 立即返回页面 A
  4. 观察图片加载状态
- **Expected Result**:
  - 快速导航不会导致错误或内存泄漏
  - 返回页面时加载状态正确重新初始化
  - 无控制台错误

### TC-29: 浏览器缓存影响
- **Target**: Edge Case - 缓存场景
- **Type**: E2E
- **Preconditions**:
  - 图片之前已成功加载
  - 浏览器缓存启用
- **Steps**:
  1. 首次加载页面，等待图片成功加载
  2. 刷新页面
  3. 观察图片加载状态
  4. 检查是否显示 loading 状态
- **Expected Result**:
  - 即使图片被缓存，仍显示短暂的 loading 状态
  - 缓存的图片快速切换到 loaded 状态
  - 状态切换逻辑正常工作

### TC-30: 无障碍访问（Accessibility）
- **Target**: Edge Case - 可访问性
- **Type**: Manual
- **Preconditions**:
  - 页面包含 PlantUML 图片
  - 屏幕阅读器可用
- **Steps**:
  1. 使用键盘导航到 PlantUML 容器
  2. 检查 loading 状态的可访问性标签
  3. 触发加载失败
  4. 检查错误提示和重试按钮的可访问性
  5. 使用键盘点击重试按钮
- **Expected Result**:
  - loading 状态有适当的 aria 标签（如 aria-busy="true"）
  - 错误提示可通过屏幕阅读器读取
  - 重试按钮可通过键盘访问和点击
  - 焦点管理正确
