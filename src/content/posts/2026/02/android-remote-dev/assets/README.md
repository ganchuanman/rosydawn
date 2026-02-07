# Assets 资源说明

本目录存放文章相关的静态资源文件。

## 文件列表

| 文件名 | 说明 | 建议尺寸 |
|--------|------|----------|
| `network-topology.png` | 网络拓扑图，展示 Mac Mini 与 MacBook 的连接架构 | 1200x800 |
| `vscode-remote.png` | VS Code Remote SSH 配置截图 | 1000x600 |
| `performance-comparison.png` | 性能对比图表，本地 vs 远程构建时间对比 | 800x500 |

## 图片制作建议

### network-topology.png
可以使用 draw.io 或 Excalidraw 制作，建议包含：
- Mac Mini 和 MacBook 图标
- SSH 隧道连接线
- ADB over TCP 连接
- Android 设备/模拟器

### vscode-remote.png
截图 VS Code 远程连接成功后的界面，重点展示：
- 左下角的远程连接状态
- 文件资源管理器中的远程项目
- 终端中的远程 shell

### performance-comparison.png
使用图表工具（如 Chart.js 或 Excel）制作柱状图：
- X 轴：测试场景（Clean Build / Incremental Build）
- Y 轴：构建时间（秒）
- 两组柱状：本地 vs 远程
