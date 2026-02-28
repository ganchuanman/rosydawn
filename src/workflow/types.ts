/**
 * Step 类型枚举
 *
 * - validator: 校验器,用于前置条件检查,失败会中断流程
 * - processor: 处理器,用于数据转换和准备,失败会中断流程
 * - action: 动作,用于执行核心操作,失败会中断流程
 * - notifier: 通知器,用于用户交互和通知,失败不会中断流程
 */
export type StepType = 'validator' | 'processor' | 'action' | 'notifier';

/**
 * Step 定义
 *
 * @template T - Step 返回的数据类型
 */
export interface Step<T = any> {
  /** Step 类型 */
  type: StepType;
  /** Step 名称(唯一标识) */
  name: string;
  /** Step 描述 */
  description?: string;
  /** Step 执行函数 */
  execute: (context: WorkflowContext) => Promise<T> | T;
}

/**
 * Workflow 执行上下文
 *
 * 在 steps 之间传递共享的执行上下文
 */
export interface WorkflowContext {
  /** 用户输入的参数 */
  params: Record<string, any>;
  /** 各 step 的输出结果 */
  steps: Record<string, any>;
  /** 工作流元数据 */
  metadata: Record<string, any>;
}

/**
 * Workflow 参数定义
 */
export interface WorkflowParams {
  /** 必需参数列表 */
  required?: string[];
  /** 可选参数列表 */
  optional?: string[];
}

/**
 * Workflow 定义
 */
export interface Workflow {
  /** Workflow 名称(kebab-case) */
  name: string;
  /** Workflow 描述 */
  description?: string;
  /** Intent 名称(snake_case) */
  intent: string;
  /** 参数定义 */
  params?: WorkflowParams;
  /** Step 列表 */
  steps: Step[];
}

/**
 * Workflow 执行结果
 */
export interface WorkflowResult<T = any> {
  /** 执行是否成功 */
  success: boolean;
  /** 返回的数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * Step 执行结果
 */
export interface StepResult<T = any> {
  /** 执行是否成功 */
  success: boolean;
  /** 返回的数据 */
  data?: T;
  /** 错误信息 */
  error?: Error;
}
