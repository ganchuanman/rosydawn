# 构建系统 (build)

构建生产版本的静态站点。

---

## 用途

生成优化的静态文件：
- 静态站点生成（SSG）
- 资源优化
- 代码压缩
- 图片优化

---

## 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `preview` | boolean | ❌ | 构建后启动预览服务器，默认 false |

---

## 使用示例

### REPL 模式

```
> 构建博客
> 生成静态文件
```

### 命令行模式

```bash
# 构建
rosydawn build

# 构建并预览
rosydawn build --preview

# 完整命令
rosydawn build:run
```

---

## 执行流程

1. 清理 `dist/` 目录
2. 生成静态 HTML
3. 优化资源（CSS、JS、图片）
4. 生成 sitemap
5. 生成 RSS feed
6. 输出到 `dist/` 目录

---

## 输出目录

```
dist/
├── index.html
├── blog/
│   └── 2026/
│       └── 03/
│           └── my-article/
│               └── index.html
├── tags/
│   └── index.html
├── assets/
│   ├── *.css
│   └── *.js
└── favicon.svg
```

---

## 相关链接

- [启动开发服务器](./start-dev.md) - 本地开发
- [部署系统](./deploy.md) - 部署到生产
- [静态知识库](../static.md) - 系统介绍

---

## 注意事项

- 构建时间取决于文章数量
- 图片会自动优化（WebP 格式）
- 构建后需要部署才能在生产环境看到

---

## 最后更新

2026-03-01
