import { describe, it, expect, beforeEach } from 'vitest';
import {
  defineWorkflow,
  executeWorkflow,
  registerWorkflow,
  routeWorkflow,
  getWorkflowByName,
  workflowRegistry,
} from './index.js';
import { clearStepRegistry } from '../steps/index.js';

describe('Workflow Engine', () => {
  beforeEach(() => {
    // Clear registries before each test
    workflowRegistry.clear();
    clearStepRegistry();
  });

  describe('defineWorkflow', () => {
    it('TC-01: should define a workflow', () => {
      const demoWorkflow = defineWorkflow({
        name: 'demo',
        intent: 'demo',
        steps: [
          {
            type: 'validator',
            name: 'checkInput',
            execute: () => true,
          },
          {
            type: 'action',
            name: 'sayHello',
            execute: () => 'Hello!',
          },
        ],
      });

      expect(demoWorkflow.name).toBe('demo');
      expect(demoWorkflow.intent).toBe('demo');
      expect(demoWorkflow.steps).toHaveLength(2);
    });

    it('TC-02: should validate workflow name format (kebab-case)', () => {
      expect(() =>
        defineWorkflow({
          name: 'InvalidName',
          intent: 'test',
          steps: [],
        })
      ).toThrow('kebab-case');

      expect(() =>
        defineWorkflow({
          name: 'invalid_name',
          intent: 'test',
          steps: [],
        })
      ).toThrow('kebab-case');
    });

    it('TC-03: should validate intent name format (snake_case)', () => {
      expect(() =>
        defineWorkflow({
          name: 'test-workflow',
          intent: 'InvalidIntent',
          steps: [],
        })
      ).toThrow('snake_case');
    });
  });

  describe('executeWorkflow', () => {
    it('TC-04: should execute steps in order', async () => {
      const executionOrder: string[] = [];

      const workflow = defineWorkflow({
        name: 'test-order',
        intent: 'test_order',
        steps: [
          {
            type: 'processor',
            name: 'step1',
            execute: () => {
              executionOrder.push('step1');
              return 'result1';
            },
          },
          {
            type: 'processor',
            name: 'step2',
            execute: () => {
              executionOrder.push('step2');
              return 'result2';
            },
          },
          {
            type: 'processor',
            name: 'step3',
            execute: () => {
              executionOrder.push('step3');
              return 'result3';
            },
          },
        ],
      });

      const result = await executeWorkflow(workflow, {});

      expect(result.success).toBe(true);
      expect(executionOrder).toEqual(['step1', 'step2', 'step3']);
    });

    it('TC-05: should stop execution when validator fails', async () => {
      const workflow = defineWorkflow({
        name: 'test-validator-fail',
        intent: 'test_validator_fail',
        steps: [
          {
            type: 'validator',
            name: 'checkInput',
            execute: () => {
              throw new Error('Validation failed');
            },
          },
          {
            type: 'action',
            name: 'shouldNotRun',
            execute: () => 'This should not run',
          },
        ],
      });

      const result = await executeWorkflow(workflow, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    it('TC-06: should stop execution when processor fails', async () => {
      const workflow = defineWorkflow({
        name: 'test-processor-fail',
        intent: 'test_processor_fail',
        steps: [
          {
            type: 'processor',
            name: 'failingProcessor',
            execute: () => {
              throw new Error('Processing failed');
            },
          },
          {
            type: 'action',
            name: 'shouldNotRun',
            execute: () => 'This should not run',
          },
        ],
      });

      const result = await executeWorkflow(workflow, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Processing failed');
    });

    it('TC-07: should stop execution when action fails', async () => {
      const workflow = defineWorkflow({
        name: 'test-action-fail',
        intent: 'test_action_fail',
        steps: [
          {
            type: 'action',
            name: 'failingAction',
            execute: () => {
              throw new Error('Action failed');
            },
          },
          {
            type: 'action',
            name: 'shouldNotRun',
            execute: () => 'This should not run',
          },
        ],
      });

      const result = await executeWorkflow(workflow, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Action failed');
    });

    it('TC-08: should continue execution when notifier fails', async () => {
      const executed: string[] = [];

      const workflow = defineWorkflow({
        name: 'test-notifier-fail',
        intent: 'test_notifier_fail',
        steps: [
          {
            type: 'notifier',
            name: 'failingNotifier',
            execute: () => {
              executed.push('notifier');
              throw new Error('Notifier failed');
            },
          },
          {
            type: 'action',
            name: 'shouldRun',
            execute: () => {
              executed.push('action');
              return 'This should run';
            },
          },
        ],
      });

      const result = await executeWorkflow(workflow, {});

      expect(result.success).toBe(true);
      expect(executed).toEqual(['notifier', 'action']);
    });

    it('TC-09: should write step results to context', async () => {
      const workflow = defineWorkflow({
        name: 'test-context-write',
        intent: 'test_context_write',
        steps: [
          {
            type: 'processor',
            name: 'generateData',
            execute: () => ({ value: 42 }),
          },
          {
            type: 'processor',
            name: 'readData',
            execute: (ctx) => {
              const data = ctx.steps.generateData as { value: number };
              return data.value * 2;
            },
          },
        ],
      });

      const result = await executeWorkflow(workflow, {});

      expect(result.success).toBe(true);
      expect(result.data?.readData).toBe(84);
    });

    it('TC-10: should read params from context', async () => {
      const workflow = defineWorkflow({
        name: 'test-params',
        intent: 'test_params',
        steps: [
          {
            type: 'processor',
            name: 'getParam',
            execute: (ctx) => ctx.params.testParam,
          },
        ],
      });

      const result = await executeWorkflow(workflow, { testParam: 'hello' });

      expect(result.success).toBe(true);
      expect(result.data?.getParam).toBe('hello');
    });
  });

  describe('Workflow Registry', () => {
    it('TC-11: should route workflow by intent', () => {
      const workflow = defineWorkflow({
        name: 'test-workflow',
        intent: 'test_intent',
        steps: [
          { type: 'action', name: 'test', execute: () => true },
        ],
      });

      registerWorkflow(workflow);

      const routed = routeWorkflow('test_intent');
      expect(routed).toBeDefined();
      expect(routed?.name).toBe('test-workflow');
    });

    it('TC-12: should return undefined for unknown intent', () => {
      const routed = routeWorkflow('unknown_intent');
      expect(routed).toBeUndefined();
    });

    it('TC-13: should return success result', async () => {
      const workflow = defineWorkflow({
        name: 'success-workflow',
        intent: 'success',
        steps: [
          { type: 'action', name: 'test', execute: () => 'done' },
        ],
      });

      const result = await executeWorkflow(workflow, {});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('TC-14: should return failure result', async () => {
      const workflow = defineWorkflow({
        name: 'failure-workflow',
        intent: 'failure',
        steps: [
          {
            type: 'validator',
            name: 'fail',
            execute: () => {
              throw new Error('Failed');
            },
          },
        ],
      });

      const result = await executeWorkflow(workflow, {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });
  });
});
