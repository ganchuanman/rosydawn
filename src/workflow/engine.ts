import type {
  Workflow,
  WorkflowContext,
  WorkflowResult,
  Step,
  StepResult,
} from './types.js';

/**
 * 定义 Workflow
 *
 * @param definition - Workflow 定义
 * @returns Workflow 对象
 *
 * @example
 * ```typescript
 * const demoWorkflow = defineWorkflow({
 *   name: 'demo',
 *   intent: 'demo',
 *   steps: [
 *     { type: 'validator', name: 'checkInput', execute: () => true },
 *     { type: 'action', name: 'sayHello', execute: () => 'Hello!' }
 *   ]
 * });
 * ```
 */
export function defineWorkflow(definition: Workflow): Workflow {
  // 验证 workflow 名称格式
  if (!/^[a-z]+(-[a-z]+)*$/.test(definition.name)) {
    throw new Error(
      `Workflow name must be in kebab-case format, got: ${definition.name}`
    );
  }

  // 验证 intent 名称格式
  if (!/^[a-z]+(_[a-z]+)*$/.test(definition.intent)) {
    throw new Error(
      `Intent name must be in snake_case format, got: ${definition.intent}`
    );
  }

  // 验证 steps 不为空
  if (!definition.steps || definition.steps.length === 0) {
    throw new Error('Workflow must have at least one step');
  }

  return definition;
}

/**
 * 执行 Workflow
 *
 * @param workflow - Workflow 对象
 * @param params - 执行参数
 * @returns Workflow 执行结果
 *
 * @example
 * ```typescript
 * const result = await executeWorkflow(demoWorkflow, { topic: 'test' });
 * if (result.success) {
 *   console.log('Workflow executed successfully:', result.data);
 * } else {
 *   console.error('Workflow failed:', result.error);
 * }
 * ```
 */
export async function executeWorkflow(
  workflow: Workflow,
  params: Record<string, any> = {}
): Promise<WorkflowResult> {
  // 初始化上下文
  const context: WorkflowContext = {
    params,
    steps: {},
    metadata: {
      workflowName: workflow.name,
      startTime: new Date().toISOString(),
    },
  };

  try {
    // 按顺序执行 steps
    for (const step of workflow.steps) {
      const stepResult = await executeStep(step, context);

      // 如果 step 执行失败
      if (!stepResult.success) {
        // 根据类型决定是否中断
        if (step.type !== 'notifier') {
          // Validator/Processor/Action 失败中断流程
          return {
            success: false,
            error: `Step "${step.name}" failed: ${stepResult.error?.message || 'Unknown error'}`,
            metadata: context.metadata,
          };
        }
        // Notifier 失败仅记录日志,继续执行
        console.error(
          `Notifier "${step.name}" failed (continuing execution):`,
          stepResult.error
        );
      }

      // 将 step 结果写入上下文
      if (stepResult.data !== undefined) {
        context.steps[step.name] = stepResult.data;
      }
    }

    // 所有 steps 执行完成
    context.metadata.endTime = new Date().toISOString();

    return {
      success: true,
      data: context.steps,
      metadata: context.metadata,
    };
  } catch (error) {
    // 捕获未预期的错误
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      metadata: context.metadata,
    };
  }
}

/**
 * 执行单个 Step
 *
 * @param step - Step 对象
 * @param context - 执行上下文
 * @returns Step 执行结果
 */
async function executeStep(
  step: Step,
  context: WorkflowContext
): Promise<StepResult> {
  try {
    const result = await step.execute(context);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
