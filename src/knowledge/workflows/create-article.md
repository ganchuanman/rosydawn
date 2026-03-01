# 创建文章 (create-article)

创建新的博客文章，自动生成文件结构和 frontmatter。

---

## 用途

快速创建符合规范的博客文章模板，包括：
- 创建年份/月份/标题目录结构
- 生成标准 frontmatter
- 可选：AI 自动生成标题、描述和标签

---

## 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `topic` | string | ✅ | 文章主题（用于生成标题和目录名） |
| `category` | string | ❌ | 文章分类（可选） |

---

## 使用示例

### REPL 模式

```
> 创建一篇关于 WebSocket 的文章
> 我想写一篇 TypeScript 教程
```

### 命令行模式

```bash
# 基础用法
rosydawn new --topic "WebSocket 实战指南"

# 指定分类
rosydawn content:new --topic "React Hooks 详解" --category "前端"

# 使用别名
rosydawn new --topic "Git 工作流最佳实践"
```

---

## 执行流程

1. **AI 增强标题生成**（如果启用）
   - 基于 topic 生成吸引人的标题
   - 生成简洁的描述
   - 推荐相关标签

2. **创建目录结构**
   ```
   src/content/posts/
   └── 2026/
       └── 03/
           └── my-article-slug/
               └── index.md
   ```

3. **生成 frontmatter**
   ```yaml
   ---
   title: "WebSocket 实战指南"
   date: 2026-03-01
   description: "深入理解 WebSocket 协议..."
   tags: ["WebSocket", "网络协议", "实时通信"]
   ---
   ```

---

## 相关链接

- [发布文章](./publish-article.md) - 发布创建好的文章
- [静态知识库](../static.md) - 系统整体介绍

---

## 注意事项

- 文章 slug 自动从标题生成（转为 kebab-case）
- 如果目录已存在，会提示错误
- 创建后可手动编辑 `index.md` 文件

---

## 最后更新

2026-03-01
