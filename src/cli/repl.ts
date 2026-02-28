#!/usr/bin/env node

// 加载环境变量 (必须在其他 imports 之前)
import dotenv from 'dotenv';
dotenv.config();

import { input } from '@inquirer/prompts';
import { version } from '../../package.json' with { type: 'json' };
import { registerMockWorkflows } from '../workflows/index.js';
import { executeWorkflow } from '../workflow/engine.js';
import { routeWorkflow } from '../workflow/registry.js';
import { recognizeIntent } from '../ai/intent-recognizer.js';
import { collectMissingParams } from '../ai/param-collector.js';
import { loadKnowledge } from '../knowledge/loader.js';
import { handleError, showError } from './error-handler.js';
import { validateAndSanitizeInput, detectSuspiciousPatterns } from './input-validator.js';
import type { KnowledgeBase } from '../knowledge/types.js';

/**
 * 显示欢迎信息
 */
function showWelcome(): void {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║       Rosydawn AI Blog Assistant       ║');
  console.log('║           Version: ' + version + '                 ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log('💬 这是一个 AI 对话式博客管理工具');
  console.log('📝 输入自然语言指令，AI 会帮你执行操作');
  console.log('🚪 输入 exit/quit/q 或按 Ctrl+C/D 退出');
  console.log('');
}

/**
 * 处理用户输入 (集成 AI 意图识别)
 */
async function processInput(userInput: string, knowledge: KnowledgeBase): Promise<void> {
  // 输入验证和清理
  const validation = validateAndSanitizeInput(userInput);

  if (!validation.valid) {
    console.log('❌ 输入无效:', validation.error);
    console.log('');
    return;
  }

  const sanitizedInput = validation.sanitized;

  // 检测可疑模式
  const warnings = detectSuspiciousPatterns(sanitizedInput);
  if (warnings.length > 0) {
    console.log('⚠️  警告:', warnings.join(', '));
    console.log('');
  }

  // 空输入处理
  if (!sanitizedInput) {
    return;
  }

  try {
    // 显示思考提示
    console.log('\n🤔 思考中...\n');

    // AI 意图识别
    const response = await recognizeIntent(sanitizedInput, knowledge);

    // 处理不同类型的响应
    switch (response.type) {
      case 'success': {
        const { result } = response;

        // 显示识别结果
        console.log('✅ 识别到意图:', result.intent);
        console.log('   置信度:', (result.confidence * 100).toFixed(0) + '%');
        if (result.reasoning) {
          console.log('   推理:', result.reasoning);
        }
        console.log('');

        // 检查参数缺失
        if (result.missing_params.length > 0) {
          console.log('⚠️  需要补充以下参数:', result.missing_params.join(', '));
          console.log('');

          try {
            // 获取 Workflow 定义
            const workflow = routeWorkflow(result.intent);
            const paramSchemas = workflow?.params ? undefined : undefined; // TODO: 从 Workflow 提取

            // 收集缺失参数
            const collectedParams = await collectMissingParams(result.missing_params, paramSchemas);

            // 合并参数
            result.params = { ...result.params, ...collectedParams };
            console.log('');
          } catch (error: any) {
            if (error.message === 'USER_CANCELLED') {
              console.log('✋ 操作已取消\n');
              return;
            }
            throw error;
          }
        }

        // 执行 Workflow
        const workflow = routeWorkflow(result.intent);
        if (workflow) {
          await executeWorkflow(workflow, result.params);
        } else {
          console.log('❌ 未找到对应的 Workflow:', result.intent);
          console.log('');
        }
        break;
      }

      case 'clarification_needed': {
        console.log('🤔', response.message);
        console.log('');
        break;
      }

      case 'error': {
        console.log('❌', response.message);
        if (response.fallback) {
          console.log('💡 降级方案:', response.fallback);
        }
        console.log('');
        break;
      }
    }
  } catch (error: any) {
    // 错误处理
    const errorResult = handleError(error);
    showError(errorResult);
  }
}

/**
 * 启动 REPL 主循环
 */
async function startREPL(): Promise<void> {
  // 显示欢迎信息
  showWelcome();

  // 检查环境变量
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key') {
    console.log('⚠️  警告: OPENAI_API_KEY 未配置或使用占位符');
    console.log('');
    console.log('请按以下步骤配置:');
    console.log('  1. 编辑 .env 文件');
    console.log('  2. 将 OPENAI_API_KEY=your-api-key 替换为真实的 API Key');
    console.log('  3. 重新运行 npm run repl');
    console.log('');
    console.log('💡 如果你没有 OpenAI API Key，可以:');
    console.log('   - 使用 Azure OpenAI (配置 AZURE_OPENAI_API_KEY)');
    console.log('   - 使用本地 Ollama (配置 OPENAI_BASE_URL=http://localhost:11434/v1)');
    console.log('   - 使用 DeepSeek 等兼容服务');
    console.log('');
    process.exit(1);
  }

  // 加载知识库
  const knowledge = await loadKnowledge();

  // 注册 Mock Workflows
  registerMockWorkflows();

  // 主循环
  while (true) {
    try {
      const userInput = await input({
        message: '',
        prefix: '🤖 >'
      });

      // 退出命令处理
      const trimmedInput = userInput.trim().toLowerCase();
      if (['exit', 'quit', 'q'].includes(trimmedInput)) {
        console.log('👋 再见！\n');
        break;
      }

      // 处理输入
      await processInput(userInput, knowledge);
    } catch (error: any) {
      // Ctrl+C 或 Ctrl+D 会触发 error
      if (error?.name === 'ExitPromptError') {
        console.log('\n👋 再见！\n');
        break;
      }

      // 其他错误
      const errorResult = handleError(error);
      showError(errorResult);
    }
  }
}

// 启动 REPL
startREPL().catch((error) => {
  console.error('❌ REPL 启动失败:', error);
  process.exit(1);
});
