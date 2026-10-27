import { AppErrorViolation } from '@pkg-common/types';
import {
  getBackendValidations,
  getBEValidations,
  getBEValidationTypes,
  isInfo,
  updateBEValidationsForStepForm,
  updateBEValidationTypesForStepForm,
} from './validationUtils';

const ENTITY = 'root';

const violations = [
  {
    fieldName: 'labels[0].description',
    message: 'Invalid description',
  },
  {
    fieldName: 'labels',
    message: 'Required',
    errorCode: 'ERR_1',
  },
  {
    fieldName: 'items[1].code',
    message: 'Wrong code',
    warning: true,
  },
] as Array<AppErrorViolation>;

const makeFormData = (data: object) => JSON.stringify(data);

describe('validationUtils', () => {
  describe('isInfo & containsInfo functions', () => {
    it('should return true if param starts with "INFO_"', () => {
      expect(isInfo('INFO_testText')).toEqual(true);
    });
    it('should return false if text is array', () => {
      expect(isInfo(['', 'testText'])).toEqual(false);
    });
    it('should return true when text is falsy', () => {
      expect(isInfo(undefined)).toEqual(true);
    });
    it('should enter the catch block with a bad object', () => {
      const badObjectText = {
        indexOf: () => {
          throw new Error('testError');
        },
      };
      expect(isInfo(badObjectText as any)).toEqual(false);
    });
  });

  describe('getBEValidations', () => {
    it('maps violations correctly', () => {
      const result = getBEValidations(ENTITY, violations);

      expect(result).toEqual({
        root_labels_0_description: ['Invalid description'],
        root_labels: ['ERR_1: Required'],
        root_items_1_code: ['Wrong code'],
      });
    });

    it('handles empty input', () => {
      expect(getBEValidations(ENTITY, [])).toEqual({});
    });
  });

  describe('getBEValidationTypes', () => {
    it('maps validation types correctly', () => {
      const result = getBEValidationTypes(ENTITY, violations);

      expect(result['root_labels_0_description'][0]).toEqual({
        message: 'Invalid description',
        type: 'ERROR',
      });

      expect(result['root_items_1_code'][0].type).toBe('WARNING');
    });
  });

  describe('getFieldId (indirectly via getBEValidations)', () => {
    it('replaces "[" with "_"', () => {
      const result = getBEValidations(ENTITY, [
        { fieldName: 'items[0]', message: 'error' } as AppErrorViolation,
      ]);
      expect(result['root_items_0']).toEqual(['error']);
    });

    it('replaces "]." with "_"', () => {
      const result = getBEValidations(ENTITY, [
        { fieldName: 'items[0].name', message: 'error' } as AppErrorViolation,
      ]);
      expect(result['root_items_0_name']).toEqual(['error']);
    });

    it('replaces "." with "_"', () => {
      const result = getBEValidations(ENTITY, [
        { fieldName: 'address.city', message: 'error' } as AppErrorViolation,
      ]);
      expect(result['root_address_city']).toEqual(['error']);
    });

    it('removes trailing "]"', () => {
      const result = getBEValidations(ENTITY, [
        { fieldName: 'items[0]', message: 'error' } as AppErrorViolation,
      ]);
      expect(result['root_items_0']).toEqual(['error']);
    });

    it('removes "$." prefix', () => {
      const result = getBEValidations(ENTITY, [
        { fieldName: '$.address.city', message: 'error' } as AppErrorViolation,
      ]);
      expect(result['root_address_city']).toEqual(['error']);
    });
  });

  describe('getViolationMessage (indirectly via getBEValidations)', () => {
    it('uses messageKey when message is absent', () => {
      const result = getBEValidations(ENTITY, [
        { fieldName: 'name', messageKey: 'NAME_REQUIRED' } as any,
      ]);
      expect(result['root_name']).toEqual(['NAME_REQUIRED']);
    });

    it('formats message with errorCode', () => {
      const result = getBEValidations(ENTITY, [
        { fieldName: 'name', message: 'Required', errorCode: 'ERR_001' } as AppErrorViolation,
      ]);
      expect(result['root_name']).toEqual(['ERR_001: Required']);
    });

    it('returns plain message when no errorCode', () => {
      const result = getBEValidations(ENTITY, [
        { fieldName: 'name', message: 'Required' } as AppErrorViolation,
      ]);
      expect(result['root_name']).toEqual(['Required']);
    });
  });

  describe('getViolationType (indirectly via getBEValidationTypes)', () => {
    it('returns ERROR when warning is false', () => {
      const result = getBEValidationTypes(ENTITY, [
        { fieldName: 'name', message: 'error', warning: false } as AppErrorViolation,
      ]);
      expect(result['root_name'][0].type).toBe('ERROR');
    });

    it('returns WARNING when warning is true', () => {
      const result = getBEValidationTypes(ENTITY, [
        { fieldName: 'name', message: 'warning', warning: true } as AppErrorViolation,
      ]);
      expect(result['root_name'][0].type).toBe('WARNING');
    });

    it('returns ERROR when warning is undefined', () => {
      const result = getBEValidationTypes(ENTITY, [
        { fieldName: 'name', message: 'error' } as AppErrorViolation,
      ]);
      expect(result['root_name'][0].type).toBe('ERROR');
    });
  });

  describe('updateBEValidationsForStepForm', () => {
    const formStepKey = 'step1';

    it('replaces only same step errors - including suffix, and keeps others', () => {
      const formData = makeFormData({ name: 'John', address: { city: 'Oslo' } });

      const existingErrors = {
        'root_name#step1': ['Old step1 name error'],
        'root_classification_city#step2': ['Other step error'],
        root_name: ['Old non-step name error'],
      };

      const violations = [
        { fieldName: 'name', message: 'Name is required', rejectedValue: null },
        { fieldName: 'address.city', message: 'City is invalid', rejectedValue: null },
      ];

      const result = updateBEValidationsForStepForm(
        ENTITY,
        violations,
        formStepKey,
        existingErrors,
        formData,
      );

      expect(result['root_name#step1']).toEqual(['Name is required']);
      expect(result['root_address_city#step1']).toEqual(['City is invalid']);
      expect(result['root_classification_city#step2']).toEqual(['Other step error']);
      expect(result['root_name']).toBeUndefined();
      expect(result['root_name#step1']).not.toContain('Old step1 name error');
    });

    it('replaces only same step errors - not including suffix, and keeps others', () => {
      const formData = makeFormData({ email: 'test@test.com' });

      const existingErrors = {
        'root_phone#step2': ['Phone step2 error'],
        root_unrelated: ['Unrelated non-step error'],
      };

      const violations = [
        { fieldName: 'email', message: 'Email is invalid', rejectedValue: 'email' },
      ];

      const result = updateBEValidationsForStepForm(
        ENTITY,
        violations,
        formStepKey,
        existingErrors,
        formData,
      );

      expect(result['root_email#step1']).toEqual(['Email is invalid']);
      expect(result['root_phone#step2']).toEqual(['Phone step2 error']);
      expect(result['root_unrelated']).toEqual(['Unrelated non-step error']);
    });

    it('removes existing validation types for the same form step', () => {
      const existing = {
        'root_field#step1': [{ message: 'old', type: 'ERROR' as const }],
        'root_other#step2': [{ message: 'keep', type: 'WARNING' as const }],
      };
      const result = updateBEValidationTypesForStepForm(
        'root',
        [{ fieldName: 'field', message: 'new' } as AppErrorViolation],
        'step1',
        existing,
        makeFormData({ field: 'value' }),
      ) as Record<string, Array<{ message: string; type: 'WARNING' | 'ERROR' }>>;

      expect(result['root_field#step1']).toHaveLength(1);
      expect(result['root_field#step1'][0].message).toBe('new');
      expect(result['root_other#step2']).toEqual(existing['root_other#step2']);
    });

    it('accumulates multiple violations for the same field in the same step', () => {
      const existing = {};
      const result = updateBEValidationTypesForStepForm(
        'root',
        [
          { fieldName: 'field', message: 'first error' } as AppErrorViolation,
          { fieldName: 'field', message: 'second error', warning: true } as AppErrorViolation,
        ],
        'step1',
        existing,
        makeFormData({ field: 'value' }),
      ) as Record<string, Array<{ message: string; type: 'WARNING' | 'ERROR' }>>;

      expect(result['root_field#step1']).toHaveLength(2);
      expect(result['root_field#step1'][0]).toEqual({ message: 'first error', type: 'ERROR' });
      expect(result['root_field#step1'][1]).toEqual({ message: 'second error', type: 'WARNING' });
    });

    it('handles empty violations and preserves unrelated existing entries', () => {
      const existing = {
        'root_field#step1': [{ message: 'old', type: 'ERROR' as const }],
        'root_other#step2': [{ message: 'keep', type: 'WARNING' as const }],
      };
      const result = updateBEValidationTypesForStepForm(
        'root',
        [],
        'step1',
        existing,
        makeFormData({ field: 'value' }),
      ) as Record<string, Array<{ message: string; type: 'WARNING' | 'ERROR' }>>;

      expect(result['root_field#step1']).toBeUndefined();
      expect(result['root_other#step2']).toEqual(existing['root_other#step2']);
    });

    it('handles violations with errorCode in the message', () => {
      const existing = {};
      const result = updateBEValidationTypesForStepForm(
        'root',
        [{ fieldName: 'field', message: 'Some error', errorCode: 'ERR_42' } as AppErrorViolation],
        'step1',
        existing,
        makeFormData({ field: 'value' }),
      ) as Record<string, Array<{ message: string; type: 'WARNING' | 'ERROR' }>>;

      expect(result['root_field#step1']).toHaveLength(1);
      expect(result['root_field#step1'][0].message).toBe('ERR_42: Some error');
      expect(result['root_field#step1'][0].type).toBe('ERROR');
    });
  });

  describe('isStepErrorKey (indirectly via updateBEValidationsForStepForm)', () => {
    it('returns false when key has no "#" separator - keeps the key', () => {
      const formData = makeFormData({ field: 'value' });
      const existingErrors = {
        root_field: ['plain error'],
      };

      const result = updateBEValidationsForStepForm(ENTITY, [], 'step1', existingErrors, formData);

      expect(result['root_field']).toBeUndefined();
    });

    it('does not remove key from different step', () => {
      const formData = makeFormData({ other: 'value' });
      const existingErrors = {
        'root_field#step2': ['step2 error'],
      };

      const result = updateBEValidationsForStepForm(ENTITY, [], 'step1', existingErrors, formData);

      expect(result['root_field#step2']).toEqual(['step2 error']);
    });
  });

  describe('isInfo', () => {
    it('returns true for array containing INFO_ string', () => {
      expect(isInfo(['INFO_something', 'other'])).toBe(true);
    });

    it('returns false for array without INFO_ string', () => {
      expect(isInfo(['error', 'warning'])).toBe(false);
    });

    it('returns true for string starting with INFO_', () => {
      expect(isInfo('INFO_test')).toBe(true);
    });

    it('returns false for string not starting with INFO_', () => {
      expect(isInfo('ERROR_test')).toBe(false);
    });
  });

  describe('getFlattenedKeysFromJson - result.push(getFieldId(path))', () => {
    it('pushes primitive leaf values into result', () => {
      const formData = makeFormData({ name: 'John' });
      const existingErrors = {
        root_name: ['old error'],
      };

      const result = updateBEValidationsForStepForm(ENTITY, [], 'step1', existingErrors, formData);

      expect(result['root_name']).toBeUndefined();
    });

    it('pushes nested array primitive values into result', () => {
      const formData = makeFormData({ tags: ['a', 'b'] });
      const existingErrors = {
        root_tags_0: ['old tag error'],
      };

      const result = updateBEValidationsForStepForm(ENTITY, [], 'step1', existingErrors, formData);

      expect(result['root_tags_0']).toBeUndefined();
    });
  });

  describe('getSetOfFieldIdsWithStepValidation (indirectly via prioritizeValidationsWithStepErrors)', () => {
    it('builds correct set of field ids that have step validation', () => {
      const formData = makeFormData({ status: 'active', name: 'John' });
      const existingErrors = {
        root_status: ['plain status error'],
        root_name: ['plain name error'],
      };

      const result = updateBEValidationsForStepForm(
        ENTITY,
        [{ fieldName: 'status', message: 'Step status error' } as AppErrorViolation],
        'step1',
        existingErrors,
        formData,
      );

      expect(result['root_status']).toBeUndefined();
      expect(result['root_status#step1']).toEqual(['Step status error']);
      expect(result['root_name']).toBeUndefined();
    });
  });

  describe('getFlattenedKeysFromJson (indirectly via updateBEValidationsForStepForm)', () => {
    it('handles nested arrays in form data', () => {
      const formData = makeFormData({
        labels: [{ description: 'A' }, { description: 'B' }],
      });

      const result = updateBEValidationsForStepForm(
        ENTITY,
        [{ fieldName: 'labels[0].description', message: 'Invalid' } as AppErrorViolation],
        'step1',
        {},
        formData,
      );

      expect(result['root_labels_0_description#step1']).toEqual(['Invalid']);
    });

    it('handles null values in form data without crashing', () => {
      const formData = makeFormData({ name: null, code: '123' });

      const result = updateBEValidationsForStepForm(
        ENTITY,
        [{ fieldName: 'code', message: 'Code error' } as AppErrorViolation],
        'step1',
        {},
        formData,
      );

      expect(result['root_code#step1']).toEqual(['Code error']);
    });
  });

  describe('isStepErrorKey (indirectly via updateBEValidationsForStepForm)', () => {
    it('does not remove keys without # separator', () => {
      const formData = makeFormData({ field: 'value' });

      const existingErrors = {
        root_field: ['Non-step error'],
        root_other_field: ['Another non-step error'],
      };

      const result = updateBEValidationsForStepForm(ENTITY, [], 'step1', existingErrors, formData);

      expect(result['root_other_field']).toEqual(['Another non-step error']);
    });

    it('removes only the matching step key and not other steps', () => {
      const formData = makeFormData({ field: 'value' });

      const existingErrors = {
        'root_field#step1': ['Step1 error'],
        'root_field#step2': ['Step2 error'],
      };

      const result = updateBEValidationsForStepForm(
        ENTITY,
        [{ fieldName: 'field', message: 'New step1 error' } as AppErrorViolation],
        'step1',
        existingErrors,
        formData,
      );

      expect(result['root_field#step1']).toEqual(['New step1 error']);
      expect(result['root_field#step2']).toBeUndefined(); // prioritized out
    });
  });

  describe('prioritizeValidationsWithStepErrors (indirectly tested)', () => {
    it('removes plain (non-step) key when a step key exists for same field', () => {
      const formData = makeFormData({ status: 'active' });

      const existingErrors = {
        root_status: ['Plain error'],
      };

      const result = updateBEValidationsForStepForm(
        ENTITY,
        [{ fieldName: 'status', message: 'Step error' } as AppErrorViolation],
        'step1',
        existingErrors,
        formData,
      );

      expect(result['root_status#step1']).toEqual(['Step error']);
      expect(result['root_status']).toBeUndefined();
    });

    it('keeps plain key when no step validation exists for that field', () => {
      const formData = makeFormData({ code: '123' });

      const existingErrors = {
        root_unrelated: ['Unrelated plain error'],
      };

      const result = updateBEValidationsForStepForm(
        ENTITY,
        [{ fieldName: 'code', message: 'Code error' } as AppErrorViolation],
        'step1',
        existingErrors,
        formData,
      );

      expect(result['root_unrelated']).toEqual(['Unrelated plain error']);
      expect(result['root_code#step1']).toEqual(['Code error']);
    });
  });

  describe('updateBEValidationTypesForStepForm', () => {
    const formStepKey = 'step1';

    it('replaces only same step errors Error Type - including suffix, and keeps others', () => {
      const formData = makeFormData({ status: 'active', labels: [{ description: 'A' }] });

      const existingValidationTypes = {
        'root_status#step1': [{ message: 'Old status error', type: 'ERROR' as const }],
        'root_phone#step2': [{ message: 'Other step error', type: 'WARNING' as const }],
        root_status: [{ message: 'Old plain status error', type: 'ERROR' as const }],
      };

      const violations = [
        { fieldName: 'status', message: 'Status is invalid', rejectedValue: null, warning: false },
        {
          fieldName: 'labels[0].description',
          message: 'Description missing',
          rejectedValue: null,
          warning: true,
        },
      ];

      const result = updateBEValidationTypesForStepForm(
        ENTITY,
        violations,
        formStepKey,
        existingValidationTypes,
        formData,
      );

      expect(result['root_status#step1']).toEqual([
        { message: 'Status is invalid', type: 'ERROR' },
      ]);
      expect(result['root_labels_0_description#step1']).toEqual([
        { message: 'Description missing', type: 'WARNING' },
      ]);
      expect(result['root_phone#step2']).toEqual([
        { message: 'Other step error', type: 'WARNING' },
      ]);
      expect(result['root_status']).toBeUndefined();
      expect(result['root_status#step1']).not.toContainEqual({
        message: 'Old status error',
        type: 'ERROR',
      });
    });

    it('replaces only same step errors Error Type - not including suffix, and keeps others', () => {
      const formData = makeFormData({ code: '123' });

      const existingValidationTypes = {
        'root_name#step2': [{ message: 'Name step2 error', type: 'ERROR' as const }],
        root_externalId: [{ message: 'ExternalId error', type: 'WARNING' as const }],
      };

      const violations = [
        { fieldName: 'code', message: 'Code is too short', warning: false, rejectedValue: '123' },
      ];

      const result = updateBEValidationTypesForStepForm(
        ENTITY,
        violations,
        formStepKey,
        existingValidationTypes,
        formData,
      );

      expect(result['root_code#step1']).toEqual([{ message: 'Code is too short', type: 'ERROR' }]);
      expect(result['root_name#step2']).toEqual([{ message: 'Name step2 error', type: 'ERROR' }]);
      expect(result['root_externalId']).toEqual([{ message: 'ExternalId error', type: 'WARNING' }]);
    });
  });

  describe('getBackendValidations', () => {
    it('uses step-based update when formStep exists', () => {
      const result = getBackendValidations({
        entityId: ENTITY,
        violationsData: violations,
        url: 'http://test.com?formStep=step1',
        currentServerErrors: {},
        currentServerErrorTypes: {},
        formData: makeFormData({ name: 'John' }),
      });
      expect(Object.keys(result.serverErrors)[0]).toContain('#step1');
    });

    it('uses full validation when no formStep', () => {
      const result = getBackendValidations({
        entityId: ENTITY,
        violationsData: [{ fieldName: 'name', message: 'Name is required', rejectedValue: null }],
        url: 'http://test.com',
        currentServerErrors: {},
        currentServerErrorTypes: {},
        formData: makeFormData({ name: 'John' }),
      });
      expect(result.serverErrors[`${ENTITY}_name`]).toBeDefined();
    });

    it('handles empty violationsData gracefully', () => {
      const result = getBackendValidations({
        entityId: ENTITY,
        violationsData: [],
        url: 'http://test.com',
        currentServerErrors: {},
        currentServerErrorTypes: {},
        formData: makeFormData({}),
      });
      expect(result.serverErrors).toEqual({});
      expect(result.serverErrorTypes).toEqual({});
    });

    it('calls step-based update when formStep param exists in url', () => {
      const formData = makeFormData({ name: 'John' });
      const result = getBackendValidations({
        entityId: ENTITY,
        violationsData: [{ fieldName: 'name', message: 'Name error' } as AppErrorViolation],
        url: 'http://test.com?formStep=step1',
        currentServerErrors: {},
        currentServerErrorTypes: {},
        formData,
      });

      expect(result.serverErrors['root_name#step1']).toEqual(['Name error']);
      expect(result.serverErrorTypes['root_name#step1']).toEqual([
        { message: 'Name error', type: 'ERROR' },
      ]);
    });

    it('does not use step-based update when formStep param is missing', () => {
      const result = getBackendValidations({
        entityId: ENTITY,
        violationsData: [{ fieldName: 'name', message: 'Name error' } as AppErrorViolation],
        url: 'http://test.com',
        currentServerErrors: {},
        currentServerErrorTypes: {},
        formData: makeFormData({ name: 'John' }),
      });

      expect(result.serverErrors['root_name']).toEqual(['Name error']);
      expect(Object.keys(result.serverErrors).some((k) => k.includes('#'))).toBe(false);
    });
  });
});
