## 1. UTF-8 解码逻辑修复

- [x] 1.1 修改 `src/pages/blog/[...slug].astro` 第 191 行，使用 TextDecoder API 替代 atob() 直接解码
- [x] 1.2 测试包含中文字符的 PlantUML 代码块在代码模式下正常显示

## 2. 视图切换事件绑定修复

- [x] 2.1 修改 `src/layouts/Layout.astro` 第 71-96 行，将事件绑定改为事件委托机制
- [x] 2.2 使用 `document.addEventListener('click')` 在 document 级别监听点击事件
- [x] 2.3 使用 `e.target.closest('.plantuml-toggle-to-image')` 匹配目标元素
- [x] 2.4 测试点击动态创建的"图片"按钮能成功切换回图片视图

## 3. 本地功能测试

- [x] 3.1 运行 `npm run dev` 启动开发服务器
- [x] 3.2 测试包含中文的 PlantUML 代码块（TC-01）
- [x] 3.3 测试图片切换到源码视图（TC-02）
- [x] 3.4 测试源码切换回图片视图（TC-03）⭐ 核心修复验证
- [x] 3.5 测试工具栏按钮顺序（TC-04）
- [x] 3.6 测试默认显示图片视图（TC-05）
- [x] 3.7 测试 View Transitions 导航后功能（TC-06）
- [x] 3.8 测试暗色模式下显示（TC-07）

## 4. 边界和性能测试

- [x] 4.1 测试非 ASCII 字符解码（日文、韩文、emoji）（TC-08）
- [x] 4.2 测试事件委托性能（多个 PlantUML 代码块）（TC-09）
- [x] 4.3 测试页面刷新后状态重置（TC-10）
- [x] 4.4 测试复杂 PlantUML 图表的切换（TC-11）
- [x] 4.5 在不同浏览器中测试 TextDecoder API 兼容性（TC-12）

## 5. 代码审查和部署

- [x] 5.1 提交代码变更到 Git 仓库
- [x] 5.2 在 commit message 中引用本次 change
- [ ] 5.3 等待代码审查通过
- [ ] 5.4 合并到主分支
- [ ] 5.5 部署到生产环境
- [ ] 5.6 在生产环境验证核心功能（TC-01, TC-03）
