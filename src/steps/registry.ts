import type { Step, StepType } from '../workflow/types.js';

/**
 * Step 分类索引
 *
 * 按 StepType 存储 step 名称集合
 */
export type StepCategories = Record<StepType, Set<string>>;

/**
 * Step 注册表接口
 */
export interface StepRegistry {
  /** 注册 Step */
  register(step: Step): void;
  /** 根据名称获取 Step */
  getByName(name: string): Step | undefined;
  /** 根据类型获取所有 Steps */
  getByType(type: StepType): Step[];
  /** 清空注册表 */
  clear(): void;
  /** 获取所有已注册的 Step 名称 */
  getAllNames(): string[];
}

/**
 * 定义 Step
 *
 * @param definition - Step 定义
 * @returns Step 对象
 *
 * @example
 * ```typescript
 * const checkGitChanges = defineStep({
 *   type: 'validator',
 *   name: 'checkGitChanges',
 *   description: 'Check if there are uncommitted Git changes',
 *   execute: async (ctx) => {
 *     // Implementation
 *     return { hasChanges: true };
 *   }
 * });
 * ```
 */
export function defineStep<T = any>(definition: Step<T>): Step<T> {
  // 验证 step 名称不为空
  if (!definition.name || definition.name.trim() === '') {
    throw new Error('Step name cannot be empty');
  }

  // 验证 type 有效
  const validTypes: StepType[] = ['validator', 'processor', 'action', 'notifier'];
  if (!validTypes.includes(definition.type)) {
    throw new Error(
      `Invalid step type: ${definition.type}. Must be one of: ${validTypes.join(', ')}`
    );
  }

  // 验证 execute 是函数
  if (typeof definition.execute !== 'function') {
    throw new Error('Step execute must be a function');
  }

  return definition;
}

/**
 * Step 注册表实现
 */
class StepRegistryClass implements StepRegistry {
  private steps = new Map<string, Step>();
  private categories: StepCategories = {
    validator: new Set(),
    processor: new Set(),
    action: new Set(),
    notifier: new Set(),
  };

  register(step: Step): void {
    // 检查是否已存在
    if (this.steps.has(step.name)) {
      console.warn(`Step "${step.name}" already registered, overwriting...`);
      // 从旧的分类中移除
      for (const category of Object.values(this.categories)) {
        category.delete(step.name);
      }
    }

    // 存储 step
    this.steps.set(step.name, step);

    // 添加到对应分类
    this.categories[step.type].add(step.name);
  }

  getByName(name: string): Step | undefined {
    return this.steps.get(name);
  }

  getByType(type: StepType): Step[] {
    const names = this.categories[type];
    return Array.from(names)
      .map((name) => this.steps.get(name)!)
      .filter(Boolean);
  }

  clear(): void {
    this.steps.clear();
    for (const category of Object.values(this.categories)) {
      category.clear();
    }
  }

  getAllNames(): string[] {
    return Array.from(this.steps.keys());
  }
}

/**
 * 全局 Step 注册表实例
 */
export const stepRegistry = new StepRegistryClass();

/**
 * 注册 Step
 *
 * @param step - Step 对象
 *
 * @example
 * ```typescript
 * const checkGitChanges = defineStep({
 *   type: 'validator',
 *   name: 'checkGitChanges',
 *   execute: async (ctx) => { ... }
 * });
 *
 * registerStep(checkGitChanges);
 * ```
 */
export function registerStep(step: Step): void {
  stepRegistry.register(step);
}

/**
 * 根据名称获取 Step
 *
 * @param name - Step 名称
 * @returns Step 对象或 undefined
 */
export function getStepByName(name: string): Step | undefined {
  return stepRegistry.getByName(name);
}

/**
 * 根据类型获取所有 Steps
 *
 * @param type - Step 类型
 * @returns Step 列表
 */
export function getStepsByType(type: StepType): Step[] {
  return stepRegistry.getByType(type);
}

/**
 * 清空注册表(用于测试)
 */
export function clearStepRegistry(): void {
  stepRegistry.clear();
}
