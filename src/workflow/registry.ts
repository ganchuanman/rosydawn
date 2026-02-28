import type { Workflow } from './types.js';

/**
 * Workflow 注册表
 *
 * 管理所有注册的 workflows,支持按意图路由和按名称查找
 */
class WorkflowRegistryClass {
  private workflows = new Map<string, Workflow>();
  private intentIndex = new Map<string, string>(); // intent -> workflow name

  /**
   * 注册 Workflow
   *
   * @param workflow - Workflow 对象
   */
  register(workflow: Workflow): void {
    // 检查是否已存在
    if (this.workflows.has(workflow.name)) {
      console.warn(`Workflow "${workflow.name}" already registered, overwriting...`);
    }

    // 存储 workflow
    this.workflows.set(workflow.name, workflow);

    // 建立 intent 索引
    this.intentIndex.set(workflow.intent, workflow.name);
  }

  /**
   * 根据意图路由到对应的 Workflow
   *
   * @param intent - Intent 名称
   * @returns Workflow 对象或 undefined
   */
  route(intent: string): Workflow | undefined {
    const workflowName = this.intentIndex.get(intent);
    if (!workflowName) {
      return undefined;
    }
    return this.workflows.get(workflowName);
  }

  /**
   * 根据名称获取 Workflow
   *
   * @param name - Workflow 名称
   * @returns Workflow 对象或 undefined
   */
  getByName(name: string): Workflow | undefined {
    return this.workflows.get(name);
  }

  /**
   * 获取 Workflow 元数据
   *
   * @param name - Workflow 名称
   * @returns 元数据对象或 undefined
   */
  getMetadata(name: string): {
    name: string;
    description?: string;
    intent: string;
    params?: { required?: string[]; optional?: string[] };
  } | undefined {
    const workflow = this.workflows.get(name);
    if (!workflow) {
      return undefined;
    }

    return {
      name: workflow.name,
      description: workflow.description,
      intent: workflow.intent,
      params: workflow.params,
    };
  }

  /**
   * 获取所有已注册的 Workflow 名称
   *
   * @returns Workflow 名称列表
   */
  getAllNames(): string[] {
    return Array.from(this.workflows.keys());
  }

  /**
   * 清空注册表(用于测试)
   */
  clear(): void {
    this.workflows.clear();
    this.intentIndex.clear();
  }
}

/**
 * 全局 Workflow 注册表实例
 */
export const workflowRegistry = new WorkflowRegistryClass();

/**
 * 注册 Workflow
 *
 * @param workflow - Workflow 对象
 *
 * @example
 * ```typescript
 * const demoWorkflow = defineWorkflow({
 *   name: 'demo',
 *   intent: 'demo',
 *   steps: [...]
 * });
 *
 * registerWorkflow(demoWorkflow);
 * ```
 */
export function registerWorkflow(workflow: Workflow): void {
  workflowRegistry.register(workflow);
}

/**
 * 根据意图路由到对应的 Workflow
 *
 * @param intent - Intent 名称
 * @returns Workflow 对象或 undefined
 *
 * @example
 * ```typescript
 * const workflow = routeWorkflow('create_article');
 * if (workflow) {
 *   const result = await executeWorkflow(workflow, params);
 * }
 * ```
 */
export function routeWorkflow(intent: string): Workflow | undefined {
  return workflowRegistry.route(intent);
}

/**
 * 根据名称获取 Workflow
 *
 * @param name - Workflow 名称
 * @returns Workflow 对象或 undefined
 */
export function getWorkflowByName(name: string): Workflow | undefined {
  return workflowRegistry.getByName(name);
}

/**
 * 获取 Workflow 元数据
 *
 * @param name - Workflow 名称
 * @returns 元数据对象或 undefined
 */
export function getWorkflowMetadata(name: string) {
  return workflowRegistry.getMetadata(name);
}
