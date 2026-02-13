# Review Synthesis

## 1. TL;DR

将 PlantUML 图片从"构建时请求服务器"改为"构建时编码 URL + 浏览器延迟加载"。同时新增图片/源码切换功能，让用户可以查看原始 PlantUML 代码。这样做可以加速构建、减小 HTML 体积、支持离线构建，并提升用户学习体验。

## 2. Core Changes

| 变更 | 说明 |
|------|------|
| **新增 remark 插件** | `remark-plantuml-url.mjs` 替代 `astro-plantuml` |
| **URL 编码** | 构建时将 PlantUML 代码编码为 URL，不发起网络请求 |
| **输出格式** | 从嵌入式 base64 PNG 改为外链 SVG |
| **交互功能** | 每个图上添加"查看源码"按钮，支持图片/源码切换 |
| **配置选项** | 支持自定义服务器地址和输出格式 |

## 3. Technical Highlights

### 编码算法
- 使用 **Node.js 内置 zlib** 进行 Deflate 压缩，无需新增依赖
- 自定义 Base64 字符集确保 URL 安全

### HTML 结构设计
- 图片和源码**同时存在于 DOM**，通过 CSS 控制显隐
- 初始状态由 HTML `data-state` 属性决定，无需等待 JS 加载

### View Transitions 兼容
- 使用 `astro:page-load` 事件重新初始化切换功能
- 确保 SPA 导航后交互仍然正常

## 4. Quality Assurance Overview

| 类型 | 数量 | 覆盖范围 |
|------|------|----------|
| Automated | 16 | 编码算法、HTML 结构、配置选项 |
| Manual/E2E | 3 | 交互功能、视觉效果 |
| Edge Case | 2 | 超长代码、服务器不可用 |

**重点测试区域：**
- TC-04/05: 编码算法正确性（与官方工具对比）
- TC-10~13: 图片/源码切换交互
- TC-20/21: 边界情况处理

## 5. Impact & Risks

- **BREAKING CHANGES**: 无。现有 `plantuml` 代码块语法完全兼容。

- **依赖变更**:
  - 移除: `astro-plantuml`
  - 新增: 无（使用 Node.js 内置模块）

- **风险及缓解**:

| 风险 | 缓解措施 |
|------|----------|
| PlantUML 服务器不可用 | 用户可切换查看源码；支持配置备用服务器 |
| 超长代码 URL 过长 | Deflate 压缩大幅减小体积；极端情况显示警告 |
| View Transitions 事件丢失 | 监听 `astro:page-load` 重新绑定 |

## 6. Review Focus

请重点审查以下内容：

- [ ] **编码算法**: 是否需要与 PlantUML 官方编码器对齐测试？
- [ ] **HTML 结构**: `data-state` 属性控制方案是否合理？有无更简洁的实现？
- [ ] **配置选项**: 目前仅支持 `server` 和 `format`，是否需要更多配置（如 `alt` 文本模板）？
- [ ] **边界情况**: TC-20 超长代码测试的阈值（10000 字符）是否合适？
- [ ] **样式集成**: 暗色模式下保持白色背景是否为最佳方案？是否考虑 SVG 内联样式适配？
