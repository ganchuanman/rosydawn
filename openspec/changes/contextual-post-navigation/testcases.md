# Test Cases

## 1. Test Strategy

本次测试主要采用**手动 UI 验证**策略，原因是：
- 该功能为纯前端展示逻辑，通过客户端 JavaScript 控制导航可见性
- 涉及用户交互和视觉反馈，适合手动测试
- 测试环境易于搭建（本地开发服务器即可）

测试覆盖范围：
- 功能测试：验证不同来源下导航的显示/隐藏行为
- 回归测试：确保现有功能（导航链接、来源参数传递）不受影响
- 边界测试：验证无参数和未知参数的降级行为
- 降级测试：验证 JavaScript 未加载时的行为

## 2. Environment & Preconditions

- **测试环境**:
  - 本地开发服务器（`npm run dev`）
  - 浏览器：Chrome/Firefox/Safari 最新版本
  - 可选：浏览器开发者工具（用于禁用 JavaScript）

- **数据准备**:
  - 至少 3 篇已发布的文章（用于测试上下篇导航）
  - 至少 1 个标签下有 2 篇以上文章
  - 文章应有不同的发布日期（用于验证时间顺序）

- **前置条件**:
  - 项目已运行 `npm install`
  - 开发服务器正常启动
  - 测试文章数据已存在

## 3. Execution List

### TC-01: 从首页进入文章显示导航
- **Target**: Spec Scenario "从首页进入显示导航"
- **Type**: Manual / Functional
- **Preconditions**: 首页有至少 3 篇文章链接
- **Steps**:
  1. 打开首页（`/`）
  2. 点击任意一篇文章标题进入文章详情页
  3. 滚动到页面底部
- **Expected Result**:
  - 文章详情页底部显示"返回首页"按钮
  - 显示"上一篇"和"下一篇"导航区域
  - 导航链接显示正确的文章标题
  - URL 包含 `?from=home` 参数

### TC-02: 从文章列表页进入显示导航
- **Target**: Spec Scenario "从文章列表页进入显示导航"
- **Type**: Manual / Functional
- **Preconditions**: 文章列表页（`/blog/1` 或 `/blog/2`）有文章链接
- **Steps**:
  1. 打开文章列表页（`/blog/1`）
  2. 点击任意一篇文章进入详情页
  3. 滚动到页面底部
- **Expected Result**:
  - 显示"返回文章列表"按钮
  - 显示"上一篇"和"下一篇"导航
  - URL 包含 `?from=blog-list&ref=/blog/1` 参数

### TC-03: 从标签详情页进入隐藏导航
- **Target**: Spec Scenario "从标签详情页进入隐藏导航"
- **Type**: Manual / Functional
- **Preconditions**: 标签详情页（如 `/tags/astro`）有至少 1 篇文章
- **Steps**:
  1. 打开标签列表页（`/tags`）
  2. 点击任意一个标签进入标签详情页
  3. 在标签详情页点击一篇文章进入详情页
  4. 滚动到页面底部
- **Expected Result**:
  - 显示"返回 #<标签名>"按钮
  - **不显示**"上一篇"和"下一篇"导航区域
  - 页面底部只有返回按钮
  - URL 包含 `?from=tag-detail&ref=/tags/<标签名>` 参数

### TC-04: 直接访问文章 URL 显示导航（默认行为）
- **Target**: Spec Scenario "无来源参数时默认显示导航"
- **Type**: Manual / Edge Case
- **Preconditions**: 知道某篇文章的 slug
- **Steps**:
  1. 直接在浏览器地址栏输入文章 URL（如 `/blog/my-article`，不带任何查询参数）
  2. 页面加载完成后滚动到底部
- **Expected Result**:
  - 显示"返回首页"按钮
  - 显示"上一篇"和"下一篇"导航（默认行为）
  - URL 不包含 `from` 参数

### TC-05: 未知来源参数显示导航
- **Target**: Spec Scenario "无来源参数时默认显示导航"
- **Type**: Manual / Edge Case
- **Preconditions**: 无
- **Steps**:
  1. 在浏览器地址栏输入文章 URL，并附带未知 `from` 参数（如 `/blog/my-article?from=unknown`）
  2. 页面加载完成后滚动到底部
- **Expected Result**:
  - 显示导航（降级到默认行为）
  - 容错处理正常，不出现错误

### TC-06: 第一篇文章（最旧）的导航
- **Target**: Spec Scenario "First article (oldest)"
- **Type**: Manual / Functional
- **Preconditions**: 识别出时间最早的文章
- **Steps**:
  1. 从首页进入时间最早的文章详情页
  2. 检查页面底部导航
- **Expected Result**:
  - "上一篇"位置为空（不显示链接）
  - 只显示"下一篇"链接
  - "下一篇"链接指向第二早的文章

### TC-07: 最后一篇文章（最新）的导航
- **Target**: Spec Scenario "Last article (newest)"
- **Type**: Manual / Functional
- **Preconditions**: 识别出时间最新的文章
- **Steps**:
  1. 从首页进入时间最新的文章详情页
  2. 检查页面底部导航
- **Expected Result**:
  - "下一篇"位置为空（不显示链接）
  - 只显示"上一篇"链接
  - "上一篇"链接指向第二新的文章

### TC-08: 通过导航切换文章时保持来源参数
- **Target**: Spec Scenario "来源信息保持"
- **Type**: Manual / Regression
- **Preconditions**: 从首页进入某篇文章，URL 包含 `?from=home`
- **Steps**:
  1. 从首页进入中间位置的文章（如第二篇）
  2. 点击"上一篇"或"下一篇"链接
  3. 观察新页面的 URL 和导航
- **Expected Result**:
  - 新页面 URL 仍包含 `?from=home` 参数
  - 返回按钮仍然显示"返回首页"并指向 `/`
  - 导航继续显示

### TC-09: 从标签页进入后导航隐藏，且无法通过导航切换
- **Target**: Design - 客户端可见性控制逻辑
- **Type**: Manual / Edge Case
- **Preconditions**: 从标签详情页进入文章
- **Steps**:
  1. 从标签详情页（如 `/tags/astro`）进入文章
  2. 确认导航已隐藏
  3. 点击返回按钮回到标签详情页
  4. 再点击另一篇文章
- **Expected Result**:
  - 每次从标签页进入文章，导航都保持隐藏
  - 返回按钮正常工作
  - 状态一致性良好

### TC-10: JavaScript 未加载时的降级行为
- **Target**: Design - Risk "JavaScript 未加载时的降级行为"
- **Type**: Manual / Degradation
- **Preconditions**: 浏览器开发者工具
- **Steps**:
  1. 打开浏览器开发者工具，禁用 JavaScript
  2. 从标签详情页进入文章详情页
  3. 观察页面底部
  4. 重新启用 JavaScript 并刷新页面
- **Expected Result**:
  - 禁用 JS 时：导航仍然显示（降级到默认行为，可接受）
  - 启用 JS 后：导航正确隐藏
  - 页面无错误提示

### TC-11: 导航布局和样式验证
- **Target**: Spec - "Navigation layout" 和 "Navigation styling"
- **Type**: Manual / Visual Regression
- **Preconditions**: 从首页进入文章
- **Steps**:
  1. 从首页进入有上下篇的文章
  2. 检查导航的布局、字体、间距
  3. 鼠标悬停在导航链接上
- **Expected Result**:
  - 导航使用两列 flex 布局
  - 左侧左对齐，右侧右对齐
  - 标签（"← 上一篇" / "下一篇 →"）使用等宽字体
  - 文章标题显示在标签下方
  - 鼠标悬停时标题颜色变化

### TC-12: 移动端响应式布局
- **Target**: Design - 响应式考虑（隐含在现有代码中）
- **Type**: Manual / Responsive
- **Preconditions**: 浏览器开发者工具的设备模拟器
- **Steps**:
  1. 打开开发者工具，切换到移动设备视图（如 iPhone 12）
  2. 从首页进入文章详情页
  3. 观察导航布局
- **Expected Result**:
  - 导航变为垂直堆叠布局（上下排列）
  - "下一篇"在上方，"上一篇"在下方（或反之，根据现有样式）
  - 布局不拥挤，易于点击

### TC-13: 导航点击后页面加载性能
- **Target**: Design - 静态生成性能
- **Type**: Manual / Performance
- **Preconditions**: 从首页进入文章
- **Steps**:
  1. 从首页进入某篇文章
  2. 点击"下一篇"导航
  3. 观察页面加载速度和网络请求
- **Expected Result**:
  - 页面快速加载（静态 HTML）
  - 无额外的 API 请求获取导航数据
  - 导航数据已嵌入 HTML

### TC-14: 浏览器前进/后退按钮的行为
- **Target**: Design - 客户端状态一致性
- **Type**: Manual / Edge Case
- **Preconditions**: 完成以下路径：首页 → 文章 A（显示导航）→ 标签页 → 文章 B（隐藏导航）
- **Steps**:
  1. 从首页进入文章 A（导航显示）
  2. 点击标签，从标签页进入文章 B（导航隐藏）
  3. 点击浏览器"后退"按钮回到文章 A
  4. 点击"前进"按钮再次进入文章 B
- **Expected Result**:
  - 每次页面加载后，导航的显示/隐藏状态与来源参数一致
  - 后退/前进不会导致状态错乱
  - `astro:page-load` 事件正确触发

### TC-15: URL 参数手动修改后的行为
- **Target**: Edge Case - 用户手动篡改 URL
- **Type**: Manual / Edge Case
- **Preconditions**: 从标签页进入文章，URL 为 `/blog/article?from=tag-detail&ref=/tags/astro`
- **Steps**:
  1. 手动修改 URL 中的 `from` 参数为 `home`
  2. 刷新页面
  3. 观察导航状态
- **Expected Result**:
  - 导航变为显示状态（根据新的 `from` 值）
  - 返回按钮文案变为"返回首页"
  - 行为与新来源一致，无错误
