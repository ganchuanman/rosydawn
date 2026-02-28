import OpenAI from 'openai';
import type { AIClient, ChatOptions, ChatResponse, AIProvider, AIClientConfig } from './types.js';

/**
 * OpenAI 客户端 (标准 API)
 */
export class OpenAIClient implements AIClient {
  private client: OpenAI;
  private model: string;
  private timeout: number;

  constructor(config: AIClientConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      baseURL: config.baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      timeout: config.timeout || 30000 // 增加到 30 秒，支持推理模型
    });
    this.model = config.model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.timeout = config.timeout || 30000;
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model || this.model,
      messages: options.messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      timeout: options.timeout || this.timeout
    });

    const choice = response.choices[0];
    if (!choice || !choice.message) {
      throw new Error('No response from OpenAI API');
    }

    return {
      content: choice.message.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined,
      model: response.model
    };
  }
}

/**
 * Azure OpenAI 客户端
 */
export class AzureAIClient implements AIClient {
  private client: OpenAI;
  private model: string;
  private timeout: number;

  constructor(config: AIClientConfig) {
    // Azure OpenAI 使用不同的认证方式
    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY,
      baseURL: config.baseURL || process.env.AZURE_OPENAI_ENDPOINT,
      defaultQuery: { 'api-version': '2024-02-15-preview' },
      defaultHeaders: { 'api-key': config.apiKey || process.env.AZURE_OPENAI_API_KEY },
      timeout: config.timeout || 5000
    });
    this.model = config.model || process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-35-turbo';
    this.timeout = config.timeout || 5000;
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model || this.model,
      messages: options.messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      timeout: options.timeout || this.timeout
    });

    const choice = response.choices[0];
    if (!choice || !choice.message) {
      throw new Error('No response from Azure OpenAI API');
    }

    return {
      content: choice.message.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined,
      model: response.model
    };
  }
}

/**
 * Ollama 客户端 (本地模型)
 */
export class OllamaAIClient implements AIClient {
  private client: OpenAI;
  private model: string;
  private timeout: number;

  constructor(config: AIClientConfig) {
    this.client = new OpenAI({
      baseURL: config.baseURL || 'http://localhost:11434/v1',
      apiKey: 'ollama', // Ollama 不需要 API Key，但 OpenAI SDK 需要一个值
      timeout: config.timeout || 5000
    });
    this.model = config.model || 'llama2';
    this.timeout = config.timeout || 5000;
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: options.model || this.model,
      messages: options.messages as any,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens,
      timeout: options.timeout || this.timeout
    });

    const choice = response.choices[0];
    if (!choice || !choice.message) {
      throw new Error('No response from Ollama API');
    }

    return {
      content: choice.message.content || '',
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      } : undefined,
      model: response.model
    };
  }
}

/**
 * 检测 AI 提供商
 */
function detectProvider(baseURL?: string): AIProvider {
  const url = baseURL || process.env.OPENAI_BASE_URL || '';

  if (url.includes('azure') || process.env.AZURE_OPENAI_ENDPOINT) {
    return 'azure';
  } else if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes(':11434')) {
    return 'ollama';
  } else if (url.includes('deepseek')) {
    return 'deepseek';
  } else {
    return 'openai';
  }
}

/**
 * 创建 AI 客户端
 *
 * 根据 OPENAI_BASE_URL 环境变量自动检测提供商
 */
export function createAIClient(config?: AIClientConfig): AIClient {
  const baseURL = config?.baseURL || process.env.OPENAI_BASE_URL;
  const provider = detectProvider(baseURL);

  switch (provider) {
    case 'azure':
      return new AzureAIClient(config || {});
    case 'ollama':
      return new OllamaAIClient(config || {});
    case 'deepseek':
    case 'openai':
    default:
      return new OpenAIClient(config || {});
  }
}
