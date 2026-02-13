# Test Cases

## 1. Test Strategy

本次测试主要采用**手动 UI 测试**和**功能验证测试**，重点验证两个核心缺陷的修复：

1. **UTF-8 解码正确性**：验证包含中文字符的 PlantUML 代码在代码模式下正确显示
2. **视图切换功能**：验证图片和源码视图可以自由切换，包括动态创建的按钮

测试环境包括：
- 本地开发环境
- 暗色模式和亮色模式
- Astro View Transitions 导航场景

## 2. Environment & Preconditions

- 博客项目中至少有一个包含 PlantUML 代码块的 Markdown 文件
- PlantUML 代码块中包含中文字符或其他 UTF-8 字符
- 本地开发服务器运行正常（`npm run dev`）
- 浏览器开发者工具可用，用于检查 DOM 和事件绑定

## 3. Execution List

### TC-01: UTF-8 中文字符解码测试

- **Target**: `Requirement: 源码代码块生成 / Scenario: 解码 UTF-8 字符`
- **Type**: Manual
- **Preconditions**:
  - 准备一个包含中文字符的 PlantUML 代码块，例如：
    ```plantuml
    @startuml
    Alice -> Bob: 你好
    Bob --> Alice: 收到
    @enduml
    ```
- **Steps**:
  1. 启动开发服务器并访问包含该 PlantUML 的博客文章
  2. 点击图片右上角的代码图标按钮，切换到源码视图
  3. 检查代码块中的文本内容
- **Expected Result**:
  - 源码正确显示中文字符"你好"和"收到"
  - 无乱码、无问号、无奇怪的字符组合
  - 代码结构与普通代码块一致（包含工具栏、行号、复制按钮）

### TC-02: 图片切换到源码视图

- **Target**: `Requirement: 图片/源码切换功能 / Scenario: 点击切换到源码`
- **Type**: Manual
- **Preconditions**: 页面加载完成，PlantUML 图片正常显示
- **Steps**:
  1. 找到页面中的 PlantUML 图片
  2. 将鼠标悬停在图片区域，观察右上角按钮
  3. 点击右上角的代码图标按钮
- **Expected Result**:
  - 图片消失
  - 源码代码块显示
  - 容器的 `data-state` 属性变为 `"code"`
  - 代码块包含完整的工具栏、行号、复制按钮

### TC-03: 源码切换回图片视图（动态按钮事件绑定）

- **Target**: `Requirement: 图片/源码切换功能 / Scenario: 点击切换回图片` + `Scenario: 动态创建按钮的事件绑定`
- **Type**: Manual
- **Preconditions**:
  - 已完成 TC-02，当前处于源码视图
  - 工具栏中存在"图片"按钮
- **Steps**:
  1. 在源码视图中，找到工具栏右侧的"图片"按钮
  2. 点击"图片"按钮
  3. 观察页面变化
- **Expected Result**:
  - 源码代码块消失
  - PlantUML 图片重新显示
  - 容器的 `data-state` 属性变为 `"image"`
  - **关键验证**：点击事件成功触发（之前会失败，因为按钮是动态创建的）

### TC-04: 源码工具栏按钮顺序

- **Target**: `Requirement: 图片/源码切换功能 / Scenario: 源码工具栏按钮`
- **Type**: Manual
- **Preconditions**: 当前处于源码视图
- **Steps**:
  1. 检查源码代码块的工具栏右侧
  2. 确认按钮顺序
- **Expected Result**:
  - 工具栏右侧包含两个按钮："图片"按钮和"复制"按钮
  - "图片"按钮在左侧（在"复制"按钮前面）

### TC-05: 默认显示图片视图

- **Target**: `Requirement: 图片/源码切换功能 / Scenario: 默认显示图片`
- **Type**: Manual
- **Preconditions**: 无
- **Steps**:
  1. 清除浏览器缓存或使用无痕模式
  2. 访问包含 PlantUML 的博客文章
  3. 等待页面完全加载
- **Expected Result**:
  - PlantUML 容器默认显示图片视图
  - 图片正常加载并显示
  - 源码代码块处于隐藏状态
  - 容器的 `data-state` 属性为 `"image"`

### TC-06: View Transitions 导航后功能正常

- **Target**: `Requirement: 图片/源码切换功能 / Scenario: View Transitions 兼容`
- **Type**: Manual
- **Preconditions**:
  - 页面 A 包含 PlantUML 代码块
  - 页面 B 也包含 PlantUML 代码块
- **Steps**:
  1. 访问页面 A，测试图片 → 源码 → 图片的切换流程
  2. 点击页面中的链接导航到页面 B（触发 View Transitions）
  3. 在页面 B 上重复测试切换流程
- **Expected Result**:
  - 页面 B 上的切换功能正常工作
  - 不需要刷新页面即可正常切换
  - 事件绑定在新页面上仍然有效

### TC-07: 暗色模式下图片显示

- **Target**: `Requirement: 样式集成 / Scenario: 暗色模式兼容`（现有需求）
- **Type**: Manual
- **Preconditions**:
  - 页面支持暗色模式切换
  - PlantUML 图片已加载
- **Steps**:
  1. 切换到暗色模式
  2. 观察 PlantUML 图片的背景色
  3. 切换到源码视图，检查代码块样式
- **Expected Result**:
  - 图片保持白色背景（确保可读性）
  - 源码代码块样式与暗色模式一致
  - 切换功能在暗色模式下正常工作

### TC-08: 非 ASCII 字符解码测试

- **Target**: `Requirement: 源码代码块生成 / Scenario: 解码 UTF-8 字符`
- **Type**: Manual
- **Preconditions**:
  - 准备包含日文、韩文、emoji 等 UTF-8 字符的 PlantUML 代码块
- **Steps**:
  1. 访问包含非 ASCII 字符的 PlantUML 文章
  2. 切换到源码视图
  3. 检查所有特殊字符的显示
- **Expected Result**:
  - 所有 UTF-8 字符正确显示
  - 日文、韩文字符无乱码
  - Emoji 正确显示
  - 无字符丢失或转换错误

### TC-09: 事件委托性能测试

- **Target**: `Design Decision 2: 使用事件委托处理动态按钮`（设计文档中的技术决策）
- **Type**: Manual + Edge Case
- **Preconditions**:
  - 页面包含多个 PlantUML 代码块（至少 5 个）
- **Steps**:
  1. 打开浏览器开发者工具的 Performance 标签
  2. 快速连续点击多个 PlantUML 的切换按钮
  3. 观察页面响应速度和性能指标
- **Expected Result**:
  - 所有按钮响应及时，无明显延迟
  - 无内存泄漏或性能下降
  - 事件委托机制工作正常，不需要为每个按钮单独绑定事件

### TC-10: 页面刷新后状态重置

- **Target**: 回归测试（确保修复没有破坏现有功能）
- **Type**: Manual
- **Preconditions**:
  - 已切换到源码视图
- **Steps**:
  1. 在源码视图状态下刷新页面
  2. 等待页面加载完成
- **Expected Result**:
  - 页面重新加载后，PlantUML 容器恢复到默认状态（图片视图）
  - 切换功能仍然正常工作

### TC-11: 复杂 PlantUML 图表的切换

- **Target**: 边界测试（复杂场景）
- **Type**: Manual
- **Preconditions**:
  - 准备一个包含大量代码的 PlantUML 图表（超过 50 行）
- **Steps**:
  1. 访问包含复杂 PlantUML 的文章
  2. 在图片和源码视图之间来回切换多次
  3. 观察页面响应和内存使用
- **Expected Result**:
  - 切换流畅，无卡顿
  - 源码完整显示，无截断
  - 多次切换不会导致内存泄漏或页面崩溃

### TC-12: TextDecoder API 兼容性验证

- **Target**: `Design Decision 1: 使用 TextDecoder API`（设计文档中的技术决策）
- **Type**: Automated / Regression
- **Preconditions**:
  - 使用现代浏览器（Chrome 38+, Firefox 19+, Safari 10.1+）
- **Steps**:
  1. 在不同浏览器中访问包含中文 PlantUML 的文章
  2. 切换到源码视图，检查中文显示
- **Expected Result**:
  - Chrome、Firefox、Safari 等现代浏览器中功能正常
  - 中文解码正确
  - 控制台无 API 不支持的错误

## 4. Regression Test Summary

以下测试用例用于确保修复没有破坏现有功能：

- TC-02: 图片切换到源码视图（现有功能）
- TC-04: 源码工具栏按钮顺序（现有功能）
- TC-05: 默认显示图片视图（现有功能）
- TC-07: 暗色模式下图片显示（现有功能）
- TC-10: 页面刷新后状态重置（现有功能）

## 5. New Feature Verification

以下测试用例专门验证本次修复的新行为：

- **TC-01**: ✅ UTF-8 中文字符解码（修复乱码问题）
- **TC-03**: ✅ 动态按钮事件绑定（修复切换失效问题）
- **TC-08**: ✅ 非 ASCII 字符解码（扩展验证）
- **TC-09**: ✅ 事件委托性能（验证技术方案）
