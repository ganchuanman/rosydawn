/**
 * AI 客户端类型定义
 */

/**
 * 聊天消息
 */
export interface ChatMessage {
  /** 角色: system/user/assistant */
  role: 'system' | 'user' | 'assistant';
  /** 消息内容 */
  content: string;
}

/**
 * 聊天选项
 */
export interface ChatOptions {
  /** 消息列表 */
  messages: ChatMessage[];
  /** 模型名称 (可选) */
  model?: string;
  /** 温度参数 (0-1) */
  temperature?: number;
  /** 最大 Token 数 */
  maxTokens?: number;
  /** 超时时间 (毫秒) */
  timeout?: number;
}

/**
 * 聊天响应
 */
export interface ChatResponse {
  /** 响应内容 */
  content: string;
  /** 使用的 Token 数 (可选) */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 模型名称 */
  model: string;
}

/**
 * AI 客户端接口
 */
export interface AIClient {
  /**
   * 发送聊天请求
   *
   * @param options - 聊天选项
   * @returns 聊天响应
   */
  chat(options: ChatOptions): Promise<ChatResponse>;
}

/**
 * AI 提供商类型
 */
export type AIProvider = 'openai' | 'azure' | 'ollama' | 'deepseek';

/**
 * AI 客户端配置
 */
export interface AIClientConfig {
  /** API Key */
  apiKey?: string;
  /** Base URL */
  baseURL?: string;
  /** 模型名称 */
  model?: string;
  /** 默认超时时间 (毫秒) */
  timeout?: number;
}

/**
 * 意图识别结果
 */
export interface IntentRecognitionResult {
  /** 识别到的意图 */
  intent: string;
  /** 提取的参数 */
  params: Record<string, any>;
  /** 缺失的必需参数 */
  missing_params: string[];
  /** 置信度 (0-1) */
  confidence: number;
  /** 推理过程 (可选) */
  reasoning?: string;
}

/**
 * 意图识别响应类型
 */
export type IntentResponse =
  | { type: 'success'; result: IntentRecognitionResult }
  | { type: 'clarification_needed'; message: string; possibleIntents: string[] }
  | { type: 'error'; message: string; fallback?: string };
