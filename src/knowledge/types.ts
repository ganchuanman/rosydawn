/**
 * 知识库类型定义
 */

/**
 * 参数 Schema
 */
export interface ParamSchema {
  /** 参数名 */
  name: string;
  /** 参数类型 */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** 是否必需 */
  required: boolean;
  /** 参数说明 */
  description?: string;
  /** 默认值 */
  default?: any;
}

/**
 * Workflow 元数据
 */
export interface WorkflowMetadata {
  /** Workflow 名称 (kebab-case) */
  name: string;
  /** Workflow 描述 */
  description?: string;
  /** Intent 名称 (snake_case) */
  intent: string;
  /** 参数定义 */
  params?: ParamSchema[];
  /** 使用示例 */
  examples?: string[];
}

/**
 * 知识库
 */
export interface KnowledgeBase {
  /** Workflow 列表 */
  workflows: WorkflowMetadata[];
  /** 项目特定规则 */
  projectRules: string[];
  /** 系统约束 */
  constraints: string[];
  /** 生成时间戳 */
  generatedAt: string;
}
