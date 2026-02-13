## Context

当前 PlantUML URL 编码功能已在生产环境运行，但存在两个严重的客户端缺陷：

1. **乱码问题**：在 `src/pages/blog/[...slug].astro:191` 中，使用 `atob(base64Source)` 解码 Base64 源码时出现乱码
2. **切换失效**：在代码模式下，点击图片无法切换回图片预览视图

**根本原因分析**：

- **乱码问题**：`atob()` 函数返回的是二进制字符串（Latin-1 编码），而不是 UTF-8 字符串。当源码包含中文字符或其他非 ASCII 字符时，直接使用 `atob()` 会导致乱码。正确的做法是使用 `TextDecoder` 将二进制字符串转换为 UTF-8。
- **切换失效**：根据 `src/layouts/Layout.astro:86-96`，切换按钮的点击事件处理器只在 `initPlantUMLToggle()` 函数执行时绑定到已存在的 DOM 元素。但是代码块是由 `src/pages/blog/[...slug].astro:185-227` 动态创建的，这些动态创建的按钮在事件绑定时还不存在，导致点击无响应。

**约束条件**：
- 必须兼容现有的代码块样式系统
- 必须支持 Astro View Transitions
- 不能影响构建时的编码逻辑

## Goals / Non-Goals

**Goals:**
- 修复客户端 Base64 解码逻辑，正确处理 UTF-8 字符
- 修复动态创建按钮的事件绑定问题，确保两种视图可以自由切换
- 保持与现有代码块样式和功能的一致性
- 确保 View Transitions 导航后功能正常

**Non-Goals:**
- 不修改服务端编码逻辑（`plantuml-encoder.mjs` 和 `remark-plantuml-url.mjs`）
- 不修改 HTML 结构或 CSS 样式
- 不添加新的功能特性

## Decisions

### 决策 1：使用 TextDecoder API 替代 atob() 直接解码

**选择**：使用 `TextDecoder` + `Uint8Array` 正确处理 UTF-8 解码

**理由**：
- `atob()` 返回的是二进制字符串（每个字符占 1 字节），无法正确表示多字节 UTF-8 字符
- `TextDecoder` API 是现代浏览器标准，可以正确处理 UTF-8 编码
- 兼容性好：所有现代浏览器都支持

**实现方案**：
```javascript
// 旧代码（有乱码问题）
const sourceCode = atob(base64Source);

// 新代码（正确处理 UTF-8）
const binaryString = atob(base64Source);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}
const sourceCode = new TextDecoder('utf-8').decode(bytes);
```

**备选方案**：
- 方案 A：使用 `decodeURIComponent(escape(atob(base64Source)))` - 已弃用，不推荐
- 方案 B：使用第三方库（如 `js-base64`）- 增加依赖，不必要

### 决策 2：使用事件委托（Event Delegation）处理动态按钮

**选择**：在 `Layout.astro` 中使用事件委托，将点击事件绑定到 `document` 级别

**理由**：
- 动态创建的按钮在事件绑定时不存在，无法直接绑定
- 事件委托可以处理当前和未来创建的所有按钮
- 减少事件监听器数量，提升性能
- 自动兼容 View Transitions（不需要在每次导航后重新绑定）

**实现方案**：
```javascript
// 旧代码：直接绑定到元素（无法处理动态创建的按钮）
document.querySelectorAll('.plantuml-toggle-to-image').forEach(function(btn) {
  btn.addEventListener('click', function() { ... });
});

// 新代码：使用事件委托
document.addEventListener('click', function(e) {
  if (e.target.closest('.plantuml-toggle-to-image')) {
    const container = e.target.closest('.plantuml-container');
    if (container) {
      container.setAttribute('data-state', 'image');
    }
  }
});
```

**备选方案**：
- 方案 A：在动态创建代码块后手动调用 `initPlantUMLToggle()` - 需要协调两个文件的执行顺序，容易出错
- 方案 B：使用 MutationObserver 监听 DOM 变化 - 过于复杂，性能开销大

## Risks / Trade-offs

### 风险 1：旧浏览器不支持 TextDecoder API

**风险描述**：IE11 和旧版浏览器不支持 `TextDecoder` API

**缓解措施**：
- 项目已经使用现代 JavaScript 特性（如箭头函数、模板字符串等），说明不考虑 IE11 兼容性
- TextDecoder 在所有现代浏览器（Chrome 38+, Firefox 19+, Safari 10.1+）中都已支持
- 如果需要兼容，可以添加 polyfill：`text-encoding` 库

**影响评估**：低风险，现代浏览器覆盖率已足够

### 风险 2：事件委托可能误捕获其他点击事件

**风险描述**：document 级别的事件监听器可能影响页面其他交互

**缓解措施**：
- 使用 `closest()` 精确匹配目标元素，避免误判
- 只在点击匹配特定 class 的元素时才执行逻辑
- 不阻止事件冒泡，不影响其他监听器

**影响评估**：极低风险，`closest()` 匹配足够精确

### 风险 3：与现有代码的耦合

**风险描述**：修改涉及两个文件（`Layout.astro` 和 `[...slug].astro`），需要协调

**缓解措施**：
- 解码逻辑只修改一处（`[...slug].astro:191`）
- 事件绑定逻辑只修改一处（`Layout.astro`）
- 两处修改相互独立，无执行顺序依赖
- 可以分别测试两个修复点

**影响评估**：低风险，修改范围可控

## Migration Plan

**部署步骤**：
1. 修改 `src/pages/blog/[...slug].astro:191` 的解码逻辑
2. 修改 `src/layouts/Layout.astro:71-96` 的事件绑定逻辑
3. 本地测试：
   - 测试包含中文的 PlantUML 代码块
   - 测试图片 → 代码 → 图片的切换流程
   - 测试 View Transitions 导航后的功能
4. 提交代码并部署

**回滚策略**：
- Git revert 即可，无数据迁移
- 两个修改独立，可以单独回滚

**测试检查清单**：
- [ ] 包含中文的 PlantUML 代码块在代码模式下正常显示
- [ ] 点击图片右上角的代码图标可以切换到代码视图
- [ ] 在代码视图点击"图片"按钮可以切换回图片视图
- [ ] 页面刷新后功能正常
- [ ] View Transitions 导航后功能正常
- [ ] 暗色模式下显示正常

## Open Questions

无待解决的问题。技术方案明确，可以直接实施。
