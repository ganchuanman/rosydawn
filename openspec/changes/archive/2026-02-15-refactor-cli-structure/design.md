## Context

当前 rosydawn 项目的命令行工具分散在三个独立脚本中：
- `scripts/new.ts` - 创建新文章
- `scripts/publish.ts` - 发布文章
- `scripts/deploy.mjs` - 部署相关操作（build, ssl, renew, status, cron 等）

这些脚本通过 package.json 的 scripts 字段暴露，缺乏统一的入口和组织结构。随着项目发展，需要建立一个清晰的命令分类体系来提升可维护性。

**约束条件**：
- 必须保持与现有 TypeScript/Node.js 技术栈的兼容性
- 不能破坏现有的部署流程
- 需要考虑向后兼容性，给用户迁移时间

## Goals / Non-Goals

**Goals:**
- 建立三大命令分类：开发（dev）、内容（content）、部署（deploy）
- 统一命令命名规范为 `<category>:<action>` 格式
- 提供清晰的命令帮助信息和分组
- 保持向后兼容性，在过渡期内支持旧命令
- 最小化对现有代码的侵入性改动

**Non-Goals:**
- 不重新实现现有脚本的核心逻辑
- 不改变现有命令的功能行为
- 不引入重量级框架或复杂的依赖管理
- 不在这个阶段添加新的命令功能

## Decisions

### 决策 1：命令分类方案

**选择**: 采用三大类别分类

```
dev (开发相关)
  └─ dev - 启动开发服务器
  └─ build - 构建项目
  └─ preview - 预览构建结果

content (内容创作)
  └─ content:new - 创建新文章
  └─ content:publish - 发布文章

deploy (部署相关)
  └─ deploy:build - 构建部署包
  └─ deploy:ssl - SSL 证书管理
  └─ deploy:renew - 续期证书
  └─ deploy:status - 查看部署状态
  └─ deploy:cron - 定时任务管理
  └─ deploy:cron:install - 安装定时任务
  └─ deploy:cron:remove - 移除定时任务
  └─ deploy:cron:status - 查看定时任务状态

help (帮助)
  └─ help - 显示所有可用命令及说明
```

**理由**:
- 清晰的职责划分，符合用户心智模型
- 便于后续扩展新的命令类别
- 与现有命令自然映射，迁移成本低

**替代方案**:
1. 按技术层级分类（frontend/backend/tools）- 不够直观，用户更关心用途而非技术细节
2. 扁平化命名（new-article, deploy-build）- 随着命令增多会变得混乱

### 决策 2：实现方式

**选择**: 保留现有脚本，通过 package.json scripts 别名实现分类

**方案**:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",

    "content:new": "tsx scripts/new.ts",
    "content:publish": "tsx scripts/publish.ts",

    "deploy:build": "node scripts/deploy.mjs build",
    "deploy:ssl": "node scripts/deploy.mjs ssl",
    "deploy:renew": "node scripts/deploy.mjs renew",
    "deploy:status": "node scripts/deploy.mjs status",
    "deploy:cron": "node scripts/deploy.mjs cron",
    "deploy:cron:install": "node scripts/deploy.mjs cron:install",
    "deploy:cron:remove": "node scripts/deploy.mjs cron:remove",
    "deploy:cron:status": "node scripts/deploy.mjs cron:status",

    "help": "tsx scripts/help.ts"
  }
}
```

**理由**:
- 零核心代码改动，仅修改配置和添加 help 脚本
- 统一的命令命名，清晰易记
- 实施成本低，风险小
- 符合 npm scripts 的惯用法

**替代方案**:
1. 引入 commander.js 创建统一 CLI - 增加复杂度和依赖，对现有工作流改动大
2. 创建 wrapper 脚本转发调用 - 增加维护成本，没有额外收益

### 决策 3：Help 命令实现

**选择**: 创建独立的 `scripts/help.ts` 脚本显示详细的命令信息，支持 AI 理解

**方案**:
```typescript
// scripts/help.ts 示例结构
interface Command {
  name: string;
  description: string;
  usageScenario: string;
  expectedResult: string;
  prerequisites?: string;
}

const categories = {
  dev: {
    description: '开发相关命令，用于本地开发和构建',
    commands: [
      {
        name: 'dev',
        description: '启动本地开发服务器，支持热重载',
        usageScenario: '当需要实时预览博客文章或调试代码时使用',
        expectedResult: '在 http://localhost:4321 启动开发服务器'
      },
      {
        name: 'build',
        description: '构建生产环境的静态文件',
        usageScenario: '部署前或需要检查构建产物时使用',
        expectedResult: '在 dist/ 目录生成优化后的静态文件'
      }
      // ...
    ]
  },
  content: {
    description: '内容创作命令，用于创建和发布博客文章',
    commands: [
      {
        name: 'content:new',
        description: '交互式创建新博客文章',
        usageScenario: '当需要撰写新的博客文章时使用',
        expectedResult: '在 src/content/posts/{year}/{month}/{slug}/index.md 创建文章文件并启动开发服务器',
        prerequisites: '需要配置 AI 服务（用于生成标题和 slug）'
      }
      // ...
    ]
  }
  // ...
}
```

**理由**:
- 提供统一的命令查看入口
- 详细信息支持 AI 理解和选择正确的命令
- 便于维护和更新命令列表
- 结构化数据便于扩展（如未来支持按命令查询）

**替代方案**:
1. 简单的命令列表 - 信息不足，AI 无法判断何时使用
2. 使用 commander.js 自动生成 - 引入额外依赖，当前规模不需要

### 决策 4：完全替换旧命令

**选择**: 直接移除旧命令，不保留向后兼容

**方案**:
- 在 package.json 中完全移除 `new` 和 `publish` 命令
- 只保留新的分类命令（`content:new`、`content:publish`）
- 在 README 中明确标注这是 breaking change

**理由**:
- 保持命令结构的简洁性
- 避免维护两套命令的负担
- 项目处于早期阶段，用户基数小，迁移成本低
- 强制用户使用新命令，避免混乱

**替代方案**:
1. 保留旧命令作为别名 - 增加维护成本，无法清理技术债
2. 过渡期保留旧命令 - 延长混乱期，不如直接切换

### 决策 5：文档组织

**选择**: 在 README 中按类别组织命令说明

**方案**:
```markdown
## 命令使用

运行 `npm run help` 查看所有可用命令。

### 开发命令 (dev)
- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览构建结果

### 内容创作命令 (content)
- `npm run content:new` - 创建新文章
- `npm run content:publish` - 发布文章

### 部署命令 (deploy)
...

### 帮助命令 (help)
- `npm run help` - 显示所有可用命令及说明
```

**理由**:
- 与命令分类体系一致
- 便于用户快速查找所需命令
- 结构清晰，易于维护

## Risks / Trade-offs

### 风险 1：用户需要适应新命令
**风险**: 用户习惯了旧命令名称，可能感到困惑
**缓解**:
- 在 README 中突出展示新命令
- 通过 `npm run help` 提供清晰的命令列表
- 在 CHANGELOG 中明确标注这是 breaking change
- 提供迁移指南

### 风险 2：命令命名不够直观
**风险**: `content:new` vs `new:content` 的命名可能引起混淆
**缓解**:
- 参考 npm、git 等工具的命名惯例
- 通过 help 命令提供清晰的说明
- 收集用户反馈，必要时调整

### 权衡 1：简单性 vs 扩展性
**权衡**: 使用 package.json scripts 而非专门框架
**影响**:
- ✅ 实施简单，零核心依赖
- ✅ 符合 npm 生态习惯
- ❌ 缺少高级功能（如命令补全、交互式帮助）
- ❌ 命令增多时可能难以管理

**决策**: 当前阶段优先简单性，未来如有需要再引入框架

### 权衡 2：Breaking Change vs 平滑迁移
**权衡**: 直接替换旧命令 vs 保留兼容性
**影响**:
- ✅ 命令结构清晰，无历史包袱
- ✅ 降低维护成本
- ❌ 短期内可能影响现有用户

**决策**: 项目处于早期，采用直接替换策略

## Migration Plan

### 阶段 1：实施（立即）
1. 创建 `scripts/help.ts` 文件
2. 更新 package.json scripts：
   - 添加 `content:new` 和 `content:publish`
   - 添加 `help` 命令
   - 移除旧的 `new` 和 `publish` 命令
3. 更新 README 文档，展示新的命令结构

### 阶段 2：文档完善（1 周内）
1. 在 README 中添加迁移指南
2. 更新所有文档中的命令示例
3. 确保 help 命令输出完整准确

### 回滚策略
- 所有改动仅涉及 package.json、help.ts 和文档
- 如需回滚，恢复 package.json 中的旧命令即可
- 现有脚本文件（new.ts、publish.ts）保持不变

## Open Questions

1. **help 命令的详细程度？**
   - 当前方案：显示命令列表和简短说明
   - 备选方案：支持 `npm run help <command>` 显示详细用法
   - 需要权衡实现成本和用户价值

2. **未来是否需要命令自动补全？**
   - 如需要，可能要引入 commander.js 或 oclif
   - 当前 package.json 方案无法支持
   - 可作为后续改进项

3. **help 命令是否需要彩色输出？**
   - 可以使用 chalk 等库提供更好的视觉效果
   - 需要评估是否值得增加依赖
