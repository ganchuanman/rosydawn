import type { AIClient, IntentRecognitionResult, IntentResponse, ChatMessage } from './types.js';
import { createAIClient } from './client.js';
import { aiCache } from './cache.js';
import type { KnowledgeBase } from '../knowledge/types.js';

/**
 * 意图分类映射
 *
 * 将意图按能力域分类，便于组织和显示
 */
export const CATEGORY_MAP: Record<string, {
  category: 'content' | 'deploy' | 'system' | 'help';
  description: string;
}> = {
  // Content 类意图（内容管理）
  create_article: {
    category: 'content',
    description: '创建新文章'
  },
  publish_article: {
    category: 'content',
    description: '发布文章到博客'
  },

  // Deploy 类意图（部署运维）
  deploy: {
    category: 'deploy',
    description: '部署博客到生产环境'
  },
  check_status: {
    category: 'deploy',
    description: '检查系统状态'
  },
  setup_ssl: {
    category: 'deploy',
    description: '配置 SSL 证书'
  },

  // System 类意图（系统命令）
  help: {
    category: 'help',
    description: '显示帮助信息'
  },
  start_dev: {
    category: 'system',
    description: '启动开发服务器'
  },
  build: {
    category: 'system',
    description: '构建生产版本'
  }
};

/**
 * 获取意图的分类信息
 */
export function getIntentCategory(intent: string): string {
  const mapping = CATEGORY_MAP[intent];
  return mapping?.category || 'other';
}

/**
 * 按类别分组意图
 */
export function groupIntentsByCategory(intents: string[]): Map<string, string[]> {
  const grouped = new Map<string, string[]>();

  for (const intent of intents) {
    const category = getIntentCategory(intent);
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(intent);
  }

  return grouped;
}

/**
 * 构建 System Prompt
 */
function buildSystemPrompt(knowledge: KnowledgeBase): string {
  const workflowDescriptions = knowledge.workflows
    .map((wf) => {
      let desc = `- ${wf.intent}: ${wf.description || wf.name}`;

      if (wf.params && wf.params.length > 0) {
        const requiredParams = wf.params.filter((p) => p.required);
        const optionalParams = wf.params.filter((p) => !p.required);

        if (requiredParams.length > 0) {
          desc += `\n  必需参数: ${requiredParams.map((p) => p.name).join(', ')}`;
        }
        if (optionalParams.length > 0) {
          desc += `\n  可选参数: ${optionalParams.map((p) => p.name).join(', ')}`;
        }
      }

      if (wf.examples && wf.examples.length > 0) {
        desc += `\n  示例: ${wf.examples.join(', ')}`;
      }

      return desc;
    })
    .join('\n\n');

  return `你是一个博客管理助手的意图识别模块。

## 可用功能

${workflowDescriptions}

## 项目规则

${knowledge.projectRules.join('\n')}

## 系统约束

${knowledge.constraints.join('\n')}

## 输出要求

1. 识别用户的意图（匹配最接近的 intent 名称）
2. 提取参数（如果有）
3. 检测缺失的必需参数
4. 给出置信度（0-1之间的数字）
5. 简要说明推理过程

## 输出格式

请严格按照以下 JSON 格式输出，不要包含任何其他内容：

\`\`\`json
{
  "intent": "intent_name",
  "params": {
    "param1": "value1",
    "param2": "value2"
  },
  "missing_params": ["missing_param1"],
  "confidence": 0.95,
  "reasoning": "简要说明推理过程"
}
\`\`\`

## 注意事项

- 如果无法识别用户意图，将 intent 设置为 "unknown"，confidence 设置为 0
- 置信度低于 0.7 时，说明用户输入模糊
- 参数值应该从用户输入中提取，不要编造
- 只输出 JSON，不要有任何额外的文字说明`;
}

/**
 * 从 AI 响应中提取 JSON
 */
function extractJSON(content: string): string {
  // 尝试提取 ```json ``` 代码块中的内容
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // 尝试提取 ``` ``` 代码块中的内容
  const codeBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // 直接返回原始内容
  return content.trim();
}

/**
 * 清理 Markdown 格式
 */
function cleanMarkdown(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体
    .replace(/`(.*?)`/g, '$1') // 移除行内代码
    .replace(/\n{2,}/g, '\n'); // 合并多个空行
}

/**
 * 解析 AI 响应
 */
function parseAIResponse(content: string): IntentRecognitionResult {
  try {
    // 提取 JSON
    const jsonStr = extractJSON(content);

    // 清理格式
    const cleanedStr = cleanMarkdown(jsonStr);

    // 解析 JSON
    const result = JSON.parse(cleanedStr);

    // 验证必需字段
    if (typeof result.intent !== 'string') {
      throw new Error('Missing or invalid intent field');
    }
    if (typeof result.confidence !== 'number') {
      result.confidence = 0.5; // 默认置信度
    }
    if (!result.params) {
      result.params = {};
    }
    if (!result.missing_params) {
      result.missing_params = [];
    }

    return result as IntentRecognitionResult;
  } catch (error: any) {
    console.error('❌ 解析 AI 响应失败:', error.message);
    console.error('原始响应:', content);

    // 返回 unknown 意图
    return {
      intent: 'unknown',
      params: {},
      missing_params: [],
      confidence: 0,
      reasoning: `解析失败: ${error.message}`
    };
  }
}

/**
 * 意图识别主函数
 */
export async function recognizeIntent(
  userInput: string,
  knowledge: KnowledgeBase,
  aiClient?: AIClient,
  enableCache: boolean = true // 实验性功能，默认启用
): Promise<IntentResponse> {
  const startTime = Date.now();

  // 尝试从缓存获取 (实验性)
  if (enableCache) {
    const cached = aiCache.get(userInput);
    if (cached) {
      return {
        type: 'success',
        result: cached
      };
    }
  }

  try {
    // 创建 AI 客户端
    const client = aiClient || createAIClient();

    // 构建消息
    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt(knowledge) },
      { role: 'user', content: userInput }
    ];

    // 调用 AI
    const response = await client.chat({
      messages,
      temperature: 0.3, // 使用较低的温度以获得更一致的结果
      timeout: 30000 // 30秒超时，支持推理模型
    });

    // 计算延迟
    const elapsed = Date.now() - startTime;

    // 性能日志
    if (elapsed > 5000) {
      console.warn('⚠️  AI 响应较慢:', elapsed, 'ms');
      console.warn('   建议: 使用 deepseek-chat 模型或检查网络连接');
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`   AI 响应时间: ${elapsed}ms`);
    }

    // 解析响应
    const result = parseAIResponse(response.content);

    // 处理 unknown 意图
    if (result.intent === 'unknown' || result.confidence === 0) {
      return {
        type: 'error',
        message: '无法理解您的意图，请换一种表达方式或输入 help 查看可用命令'
      };
    }

    // 处理低置信度
    if (result.confidence < 0.7) {
      return {
        type: 'clarification_needed',
        message: `我不太确定您的意图，您是想要执行 ${result.intent} 吗？`,
        possibleIntents: [result.intent]
      };
    }

    // 缓存成功的识别结果 (实验性)
    if (enableCache && result.confidence >= 0.9) {
      aiCache.set(userInput, result);
    }

    // 返回成功结果
    return {
      type: 'success',
      result
    };
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error('❌ AI 调用失败:', error.message);
    console.error(`   耗时: ${elapsed}ms`);

    // 处理超时
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout') || error.message.includes('timed out')) {
      return {
        type: 'error',
        message: 'AI 服务响应超时 (30秒)，建议使用 deepseek-chat 模型或检查网络连接',
        fallback: 'manual_mode'
      };
    }

    // 处理认证失败
    if (error.status === 401 || error.message.includes('API key')) {
      return {
        type: 'error',
        message: 'AI 服务认证失败，请检查 API Key 配置'
      };
    }

    // 处理服务不可用
    if (error.status === 503 || error.message.includes('unavailable')) {
      return {
        type: 'error',
        message: 'AI 服务暂时不可用，请稍后重试',
        fallback: 'manual_mode'
      };
    }

    // 其他错误
    return {
      type: 'error',
      message: `AI 调用失败: ${error.message}`,
      fallback: 'manual_mode'
    };
  }
}
