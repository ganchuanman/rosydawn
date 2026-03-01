# 发布文章 (publish-article)

将已编辑好的文章发布到博客。

---

## 用途

验证并发布文章到博客系统：
- 验证 frontmatter 格式
- 检查必需字段
- 生成社交媒体预览
- 更新站点索引

---

## 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `slug` | string | ✅ | 文章标识符（目录名，如 2026/03/my-article） |

---

## 使用示例

### REPL 模式

```
> 发布文章 2026/03/websocket-guide
> 我想发布我的最新文章
```

### 命令行模式

```bash
# 基础用法
rosydawn publish --slug "2026/03/websocket-guide"

# 完整命令
rosydawn content:publish --slug "2026/02/typescript-tips"

# 使用别名
rosydawn publish --slug "2026/03/my-article"
```

---

## 执行流程

1. **验证文章**
   - 检查文件是否存在
   - 验证 frontmatter 格式
   - 检查必需字段（title、date、description）

2. **优化内容**
   - 生成 OG 图片（如果未提供）
   - 计算阅读时间
   - 生成目录（TOC）

3. **更新索引**
   - 更新标签索引
   - 更新归档索引
   - 生成 RSS feed

4. **构建预览**
   - 本地构建测试
   - 检查链接有效性

---

## 相关链接

- [创建文章](./create-article.md) - 创建新文章
- [部署系统](./deploy.md) - 部署到生产环境
- [静态知识库](../static.md) - 系统整体介绍

---

## 注意事项

- 发布前确保文章内容已编辑完成
- slug 必须是完整路径（包含年月）
- 发布后需要部署才能在生产环境看到

---

## 最后更新

2026-03-01
