import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  defineStep,
  registerStep,
  getStepByName,
  getStepsByType,
  clearStepRegistry,
} from './index.js';

describe('Step Registry', () => {
  beforeEach(() => {
    clearStepRegistry();
  });

  describe('TC-15: defineStep', () => {
    it('should define a step with all properties', () => {
      const step = defineStep({
        type: 'validator',
        name: 'testStep',
        description: 'A test step',
        execute: async () => true,
      });

      expect(step.type).toBe('validator');
      expect(step.name).toBe('testStep');
      expect(step.description).toBe('A test step');
      expect(typeof step.execute).toBe('function');
    });

    it('should throw error for empty name', () => {
      expect(() =>
        defineStep({
          type: 'validator',
          name: '',
          execute: async () => true,
        })
      ).toThrow('Step name cannot be empty');
    });

    it('should throw error for invalid type', () => {
      expect(() =>
        defineStep({
          type: 'invalid' as any,
          name: 'test',
          execute: async () => true,
        })
      ).toThrow('Invalid step type');
    });

    it('should throw error if execute is not a function', () => {
      expect(() =>
        defineStep({
          type: 'validator',
          name: 'test',
          execute: 'not a function' as any,
        })
      ).toThrow('Step execute must be a function');
    });
  });

  describe('TC-16: Step type constraints', () => {
    it('should accept valid types', () => {
      const types: Array<'validator' | 'processor' | 'action' | 'notifier'> = [
        'validator',
        'processor',
        'action',
        'notifier',
      ];

      types.forEach((type) => {
        const step = defineStep({
          type,
          name: `test-${type}`,
          execute: async () => true,
        });
        expect(step.type).toBe(type);
      });
    });
  });

  describe('TC-17: registerStep', () => {
    it('should register a step', () => {
      const step = defineStep({
        type: 'validator',
        name: 'testStep',
        execute: async () => true,
      });

      registerStep(step);

      const retrieved = getStepByName('testStep');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('testStep');
    });
  });

  describe('TC-18: getStepByName', () => {
    it('should find registered step', () => {
      const step = defineStep({
        type: 'action',
        name: 'myAction',
        execute: async () => 'result',
      });

      registerStep(step);

      const found = getStepByName('myAction');
      expect(found).toBe(step);
    });

    it('should return undefined for unknown step', () => {
      const found = getStepByName('unknown');
      expect(found).toBeUndefined();
    });
  });

  describe('TC-19: duplicate registration warning', () => {
    it('should warn on duplicate registration', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const step1 = defineStep({
        type: 'validator',
        name: 'duplicate',
        execute: async () => 1,
      });

      const step2 = defineStep({
        type: 'validator',
        name: 'duplicate',
        execute: async () => 2,
      });

      registerStep(step1);
      registerStep(step2);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('already registered')
      );

      const found = getStepByName('duplicate');
      await expect(found?.execute({} as any)).resolves.toBe(2);

      warnSpy.mockRestore();
    });
  });

  describe('TC-20: categorize by type', () => {
    it('should store steps by type', () => {
      const validator = defineStep({
        type: 'validator',
        name: 'validator1',
        execute: async () => true,
      });

      const processor = defineStep({
        type: 'processor',
        name: 'processor1',
        execute: async () => true,
      });

      const action = defineStep({
        type: 'action',
        name: 'action1',
        execute: async () => true,
      });

      registerStep(validator);
      registerStep(processor);
      registerStep(action);

      const validators = getStepsByType('validator');
      const processors = getStepsByType('processor');
      const actions = getStepsByType('action');

      expect(validators).toHaveLength(1);
      expect(validators[0].name).toBe('validator1');

      expect(processors).toHaveLength(1);
      expect(processors[0].name).toBe('processor1');

      expect(actions).toHaveLength(1);
      expect(actions[0].name).toBe('action1');
    });
  });

  describe('TC-21: list all steps by type', () => {
    it('should list all steps of a type', () => {
      const steps = [
        defineStep({
          type: 'validator',
          name: 'validator1',
          execute: async () => true,
        }),
        defineStep({
          type: 'validator',
          name: 'validator2',
          execute: async () => true,
        }),
        defineStep({
          type: 'validator',
          name: 'validator3',
          execute: async () => true,
        }),
      ];

      steps.forEach(registerStep);

      const validators = getStepsByType('validator');
      expect(validators).toHaveLength(3);
      expect(validators.map((s) => s.name).sort()).toEqual([
        'validator1',
        'validator2',
        'validator3',
      ]);
    });

    it('should return empty array for type with no steps', () => {
      const notifiers = getStepsByType('notifier');
      expect(notifiers).toEqual([]);
    });
  });
});
