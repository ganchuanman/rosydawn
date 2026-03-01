# Rosydawn 静态知识库

本文档包含 Rosydawn 博客系统的静态知识，用于 AI 帮助系统。

---

## 系统简介

Rosydawn 是一个个人技术博客系统，基于 Astro 5.x 构建，采用静态站点生成（SSG）架构。

### 核心特性

- **零成本托管**：纯静态站点，可部署到 GitHub Pages、Netlify 等
- **极致阅读体验**：使用系统字体、零外部请求、阅读进度条
- **强大代码展示**：Shiki 双主题高亮、代码块折叠/复制/行号
- **技术图表支持**：PlantUML 在线渲染、图/码切换
- **AI 辅助创作**：自动生成标题、描述、标签

---

## 环境配置

### 系统要求

- Node.js 18+
- npm 或 pnpm
- Git

### 环境变量

```bash
# AI 功能配置（必需）
OPENAI_API_KEY=your_api_key_here

# 可选：自定义 AI 服务端点
OPENAI_BASE_URL=https://api.openai.com/v1

# 可选：模型配置
OPENAI_MODEL=gpt-4
```

### 安装依赖

```bash
npm install
```

---

## 使用方式

### REPL 模式（推荐）

直接运行 `rosydawn` 进入交互式 REPL 模式：

```bash
rosydawn
```

然后可以自然语言提问：
- "怎么创建新文章？"
- "如何部署到生产环境？"
- "能做什么？"

### 命令行模式

使用命令行参数直接执行命令：

```bash
# 创建文章
rosydawn new --topic "WebSocket 实战"

# 发布文章
rosydawn publish --slug "2026/03/my-article"

# 部署
rosydawn deploy

# 查看帮助
rosydawn --help
```

---

## 部署说明

### 自动部署（推荐）

Rosydawn 支持自动化部署到生产环境：

```bash
rosydawn deploy
```

部署流程：
1. 拉取最新代码（`git pull`）
2. 安装依赖（`npm install`）
3. 构建站点（`npm run build`）
4. 部署到 Nginx 目录
5. 配置 SSL 证书（Let's Encrypt）

### 手动部署

```bash
# 1. 构建
npm run build

# 2. 复制到 Nginx 目录
cp -r dist/* /var/www/rosydawn/

# 3. 重启 Nginx
sudo systemctl restart nginx
```

### 服务器要求

- Nginx
- Certbot（用于 SSL）
- Node.js 18+
- Cron（用于定时任务）

---

## 常见问题

### Q: 如何修改博客配置？

编辑 `astro.config.mjs` 文件，修改站点URL、标题等配置。

### Q: 如何添加新标签？

在文章的 frontmatter 中添加 tags 数组：

```yaml
tags: ["技术", "前端", "WebSocket"]
```

### Q: 如何自定义主题？

修改 `src/styles/global.css` 中的 CSS 变量：

```css
:root {
  --primary-color: #your-color;
  --background: #your-bg;
}
```

### Q: AI 功能无法使用？

检查环境变量：
1. 确认设置了 `OPENAI_API_KEY`
2. 如果使用第三方服务，确认 `OPENAI_BASE_URL` 正确
3. 检查 API key 是否有效

### Q: 如何添加 Disqus 评论？

在文章模板中添加 Disqus 代码片段。参考 Astro 文档。

---

## 开发指南

### 项目结构

```
rosydawn/
├── src/
│   ├── cli/          # CLI 入口和命令
│   ├── ai/           # AI 客户端和意图识别
│   ├── workflow/     # 工作流引擎
│   ├── workflows/    # 工作流定义
│   ├── steps/        # 可复用步骤
│   ├── knowledge/    # 知识库（本文件所在位置）
│   ├── content/      # 博客内容
│   └── components/   # UI 组件
├── scripts/          # 构建和部署脚本
└── public/           # 静态资源
```

### Commit 规范

使用 Conventional Commits：

- `feat:` 新功能
- `fix:` Bug 修复
- `refactor:` 代码重构
- `docs:` 文档更新
- `test:` 测试相关

---

## 最后更新

- **日期**: 2026-03-01
- **版本**: 1.0.0
- **维护者**: @ganchuanman

如有问题或建议，请在 GitHub Issues 反馈。
