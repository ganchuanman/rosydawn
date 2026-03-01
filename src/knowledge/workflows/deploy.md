# 部署系统 (deploy)

将博客部署到生产环境。

---

## 用途

自动化部署流程：
- 拉取最新代码
- 安装依赖
- 构建站点
- 部署到 Nginx
- 更新 SSL 证书

---

## 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `dry-run` | boolean | ❌ | 模拟部署（不实际执行），默认 false |

---

## 使用示例

### REPL 模式

```
> 部署博客
> 我要发布到生产环境
```

### 命令行模式

```bash
# 实际部署
rosydawn deploy

# 模拟部署（查看会执行什么操作）
rosydawn deploy --dry-run

# 完整命令
rosydawn deploy:apply
```

---

## 执行流程

1. **前置检查**
   - 检查 Git 状态
   - 验证环境变量
   - 检查服务器连接

2. **代码更新**
   ```bash
   git pull origin main
   npm install
   ```

3. **构建站点**
   ```bash
   npm run build
   ```

4. **部署到 Nginx**
   ```bash
   cp -r dist/* /var/www/rosydawn/
   sudo systemctl restart nginx
   ```

5. **SSL 证书更新**（如果需要）
   ```bash
   sudo certbot renew
   ```

---

## 服务器要求

- **Web 服务器**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **Node.js**: 18+
- **自动化**: Cron（可选，用于定时部署）

---

## Cron 定时部署

添加到 crontab 实现自动部署：

```bash
# 每小时检查一次更新
0 * * * * cd /path/to/rosydawn && /usr/bin/node /path/to/rosydawn/bin/rosydawn deploy
```

---

## 相关链接

- [系统状态检查](./check-status.md) - 检查部署状态
- [静态知识库](../static.md) - 部署详细说明

---

## 故障排查

### 部署失败

1. 检查 Git 权限
2. 验证 Nginx 配置
3. 查看 Nginx 错误日志：`tail -f /var/log/nginx/error.log`

### SSL 证书问题

```bash
# 手动更新证书
sudo certbot renew --force-renewal
```

---

## 注意事项

- 部署会重启 Nginx，导致短暂服务中断
- 建议先用 `--dry-run` 检查
- 生产环境建议使用蓝绿部署（需额外配置）

---

## 最后更新

2026-03-01
