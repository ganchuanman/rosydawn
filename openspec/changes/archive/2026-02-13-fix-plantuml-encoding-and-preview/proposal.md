## Why

当前已归档的 plantuml-url-encoding 功能存在两个严重缺陷：在代码模式下 PlantUML 代码块会出现乱码，且点击图片无法切回图片预览。这两个问题严重影响了用户体验，导致用户无法正常查看 PlantUML 源码和切换视图。需要立即修复这些问题以确保功能的完整可用性。

## What Changes

- 修复代码模式下 PlantUML 代码块的乱码问题
- 修复代码模式下点击图片无法切换回图片预览的交互问题
- 确保 Base64 解码和编码过程正确处理 UTF-8 字符
- 确保切换按钮在两种视图模式下都能正常工作

## Capabilities

### New Capabilities

无新增能力。

### Modified Capabilities

- `plantuml-url-encoder`: 修复源码解码和视图切换功能的缺陷，确保 PlantUML 代码在代码模式下正确显示，且能在图片和代码视图间自由切换。

## Impact

- **受影响代码**:
  - PlantUML 客户端 JavaScript 代码（Base64 解码逻辑）
  - 视图切换交互逻辑
- **API 依赖**: 无变更
- **系统影响**: 仅影响 PlantUML 功能的前端展示层，不影响构建时编码逻辑
