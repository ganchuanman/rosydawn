#!/usr/bin/env tsx

/**
 * Help Command Script
 * 显示所有可用的 npm scripts 命令及其详细说明
 * 支持AI理解和选择正确的命令
 */

interface Command {
  name: string;
  description: string;
  usageScenario: string;
  expectedResult: string;
  prerequisites?: string;
}

interface Category {
  description: string;
  commands: Command[];
}

// 定义所有命令分类和详细信息
const categories: Record<string, Category> = {
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
      },
      {
        name: 'preview',
        description: '预览构建后的生产环境效果',
        usageScenario: '构建完成后，部署前验证效果',
        expectedResult: '启动本地服务器预览 dist/ 目录内容',
        prerequisites: '需要先运行 npm run build'
      }
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
        prerequisites: '需要配置 AI 服务（用于生成标题和 slug）',
      },
      {
        name: 'content:publish',
        description: '发布已完成的博客文章到 Git 仓库',
        usageScenario: '文章撰写完成，准备发布时使用',
        expectedResult: '检测文章变更 → AI 生成描述和标签 → 更新 frontmatter → 提交并推送到远程仓库',
        prerequisites: '需要有未提交的文章变更'
      }
    ]
  },
  deploy: {
    description: '部署相关命令，用于服务器部署和维护',
    commands: [
      {
        name: 'deploy:build',
        description: '构建部署包',
        usageScenario: '准备部署到生产服务器时使用',
        expectedResult: '生成可用于部署的构建包'
      },
      {
        name: 'deploy:ssl',
        description: 'SSL 证书管理',
        usageScenario: '需要管理 SSL 证书时使用',
        expectedResult: '执行 SSL 证书相关操作'
      },
      {
        name: 'deploy:renew',
        description: '续期 SSL 证书',
        usageScenario: 'SSL 证书即将过期需要续期时使用',
        expectedResult: '更新 SSL 证书'
      },
      {
        name: 'deploy:status',
        description: '查看部署状态',
        usageScenario: '需要了解当前部署状态时使用',
        expectedResult: '显示部署相关信息'
      },
      {
        name: 'deploy:cron',
        description: '定时任务管理（查看帮助）',
        usageScenario: '需要了解定时任务命令时使用',
        expectedResult: '显示定时任务相关命令说明'
      },
      {
        name: 'deploy:cron:install',
        description: '安装定时任务',
        usageScenario: '需要设置定时执行的任务时使用',
        expectedResult: '在系统中安装定时任务'
      },
      {
        name: 'deploy:cron:remove',
        description: '移除定时任务',
        usageScenario: '需要删除已安装的定时任务时使用',
        expectedResult: '从系统中移除定时任务'
      },
      {
        name: 'deploy:cron:status',
        description: '查看定时任务状态',
        usageScenario: '需要检查定时任务是否正常运行时使用',
        expectedResult: '显示定时任务的当前状态'
      }
    ]
  },
  help: {
    description: '帮助命令，显示命令使用说明',
    commands: [
      {
        name: 'help',
        description: '显示所有可用命令及详细说明',
        usageScenario: '不知道使用什么命令或需要查看命令列表时使用',
        expectedResult: '输出格式化的命令列表，包含描述、使用场景、预期结果等信息'
      }
    ]
  }
};

/**
 * 格式化输出命令信息
 */
function formatCommand(cmd: Command, indent: string = '  '): string {
  let output = `${indent}npm run ${cmd.name}\n`;
  output += `${indent}  说明: ${cmd.description}\n`;
  output += `${indent}  场景: ${cmd.usageScenario}\n`;
  output += `${indent}  结果: ${cmd.expectedResult}\n`;
  if (cmd.prerequisites) {
    output += `${indent}  前置: ${cmd.prerequisites}\n`;
  }
  return output;
}

/**
 * 格式化输出分类信息
 */
function formatCategory(categoryName: string, category: Category): string {
  let output = `\n${'='.repeat(60)}\n`;
  output += `${categoryName.toUpperCase()} - ${category.description}\n`;
  output += `${'='.repeat(60)}\n\n`;

  category.commands.forEach(cmd => {
    output += formatCommand(cmd);
    output += '\n';
  });

  return output;
}

/**
 * 主函数 - 输出帮助信息
 */
function main() {
  console.log('\n📚 Rosydawn 项目命令指南\n');
  console.log('运行以下命令来执行相应操作：\n');

  // 按顺序输出各个分类
  const categoryOrder = ['dev', 'content', 'deploy', 'help'];

  categoryOrder.forEach(categoryName => {
    const category = categories[categoryName];
    if (category) {
      console.log(formatCategory(categoryName, category));
    }
  });

  console.log('💡 提示：');
  console.log('  - 所有命令都通过 npm run <command> 执行');
  console.log('  - content:new 和 content:publish 需要 AI 服务配置');
  console.log('  - 部署相关命令需要服务器访问权限\n');
}

// 执行主函数
main();
