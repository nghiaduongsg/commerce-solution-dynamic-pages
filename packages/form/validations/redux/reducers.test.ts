import reducer from './reducers';
import {
  SAVE_ENTITY_SUCCESS,
  SAVE_ENTITY_ERROR,
  REMOVE_ARRAY_FIELD_ITEM,
} from '@pkg-entity/redux/actions';
import { AnyType } from '@pkg-common/types';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { CallApi } from '@pkg-core/apiData/redux/reducers';
import { SAVE_TABLE_DATA_ERROR, SAVE_TABLE_DATA_SUCCESS } from '@pkg-list/src/actions';

describe('Form Validation reducer', () => {
  const defaultState = {
    errors: {},
    serverErrors: {},
    serverErrorTypes: {},
    validationStep: null,
  };

  const initialState = {
    errors: {
      field1: ['1', '2'],
      field2: ['1'],
    },
    serverErrorTypes: {},
    serverErrors: {},
  };

  it('should return the default state when parameter state is undefined and no action is passed', () => {
    expect(reducer(undefined, { type: '' })).toEqual(defaultState);
  });

  it('should return the parameter state when no action is passed', () => {
    expect(reducer(initialState, { type: '' })).toEqual(initialState); //CHECK IT
  });

  it('FormValidations/SetFormServerErrors', () => {
    const action = {
      type: 'FormValidations/SetFormServerErrors',
      payload: {
        field: 'field1',
        errors: {
          field1: ['1', '2'],
          field2: ['3'],
        },
        errorTypes: {
          field1: [
            { message: '1', type: 'ERROR' },
            { message: '2', type: 'WARNING' },
          ],
          field2: [{ message: '3', type: 'ERROR' }],
        },
      },
    };

    const expected = {
      errors: {
        field1: ['1', '2'],
        field2: ['3'],
      },
      errorTypes: {
        field1: [
          { message: '1', type: 'ERROR' },
          { message: '2', type: 'WARNING' },
        ],
        field2: [{ message: '3', type: 'ERROR' }],
      },
    };

    expect(reducer(initialState, action).serverErrors).toEqual(expected.errors);
    expect(reducer(initialState, action).serverErrorTypes).toEqual(expected.errorTypes);
  });

  it('FormValidations/ClearFormServerErrors', () => {
    const action = {
      type: 'FormValidations/ClearFormServerErrors',
    };

    const state = {
      serverErrors: {
        field1: ['1', '2'],
        field2: ['3'],
      },
      serverErrorTypes: {
        field1: [
          { message: '1', type: 'ERROR' },
          { message: '2', type: 'WARNING' },
        ],
        field2: [{ message: '3', type: 'ERROR' }],
      },
      errors: {},
    };

    // @ts-ignore
    expect(reducer(state, action).serverErrors).toEqual({});
    // @ts-ignore
    expect(reducer(state, action).serverErrorTypes).toEqual({});
  });

  it('should handle SAVE_ENTITY_ERROR', () => {
    const action = {
      type: SAVE_ENTITY_ERROR,
      payload: {
        entityId: 'entityId',
        error: {
          message: 'error',
          violations: [
            {
              fieldName: 'fieldA',
              message: 'fieldA error message',
            },
            {
              fieldName: 'fieldA.prop1',
              message: 'fieldA_prop1 error message 1',
            },
            {
              fieldName: 'fieldB[1].prop2',
              message: 'fieldB_1_prop2 error message',
            },
            {
              fieldName: 'fieldB[2]',
              message: 'fieldB_2 error message',
            },
            {
              fieldName: 'fieldB[2]_prop1[0].id',
              message: 'fieldB_2_prop1_0_id error message',
            },
            {
              fieldName: 'fieldA.prop1',
              message: 'fieldA_prop1 error message 2',
            },
          ],
        },
      },
    };

    const expected = {
      entityId_fieldA_prop1: ['fieldA_prop1 error message 1', 'fieldA_prop1 error message 2'],
      entityId_fieldA: ['fieldA error message'],
      entityId_fieldB_1_prop2: ['fieldB_1_prop2 error message'],
      entityId_fieldB_2: ['fieldB_2 error message'],
      entityId_fieldB_2_prop1_0_id: ['fieldB_2_prop1_0_id error message'],
    };

    expect(reducer(defaultState, action).serverErrors).toEqual(expected);
  });

  it('should handle SAVE_TABLE_DATA_ERROR', () => {
    const action = {
      type: SAVE_TABLE_DATA_ERROR,
      payload: {
        entityId: 'entityId',
        error: {
          message: 'error',
          violations: [
            {
              fieldName: 'fieldA',
              message: 'fieldA error message',
            },
            {
              fieldName: 'fieldA.prop1',
              message: 'fieldA_prop1 error message 1',
            },
            {
              fieldName: 'fieldB[1].prop2',
              message: 'fieldB_1_prop2 error message',
            },
            {
              fieldName: 'fieldB[2]',
              message: 'fieldB_2 error message',
            },
            {
              fieldName: 'fieldB[2]_prop1[0].id',
              message: 'fieldB_2_prop1_0_id error message',
            },
            {
              fieldName: 'fieldA.prop1',
              message: 'fieldA_prop1 error message 2',
            },
          ],
        },
      },
    };

    const expected = {
      entityId_fieldA_prop1: ['fieldA_prop1 error message 1', 'fieldA_prop1 error message 2'],
      entityId_fieldA: ['fieldA error message'],
      entityId_fieldB_1_prop2: ['fieldB_1_prop2 error message'],
      entityId_fieldB_2: ['fieldB_2 error message'],
      entityId_fieldB_2_prop1_0_id: ['fieldB_2_prop1_0_id error message'],
    };

    expect(reducer(defaultState, action).serverErrors).toEqual(expected);
  });

  it('should handle SAVE_ENTITY_SUCCESS', () => {
    const action = {
      type: SAVE_ENTITY_SUCCESS,
      payload: {},
    };

    const state = {
      serverErrors: {
        field1_a: ['1', '2'],
        field1_b: ['1', '2'],
        field2_c: ['1'],
        field3_d: ['1', '2', '3'],
      },
    } as AnyType;

    expect(reducer(state, action).serverErrors).toEqual({});
  });

  it('should handle SAVE_TABLE_DATA_SUCCESS', () => {
    const action = {
      type: SAVE_TABLE_DATA_SUCCESS,
      payload: {},
    };

    const state = {
      serverErrors: {
        field1_a: ['1', '2'],
        field1_b: ['1', '2'],
        field2_c: ['1'],
        field3_d: ['1', '2', '3'],
      },
    } as AnyType;

    expect(reducer(state, action).serverErrors).toEqual({});
  });

  it(CallApi.rejected, () => {
    const action = {
      type: CallApi.rejected,
      payload: {
        pageId: 'A',
        error: {
          message: 'error',
          violations: [
            {
              fieldName: 'fieldA',
              message: 'fieldA error message',
            },
            {
              fieldName: 'fieldA.prop1',
              message: 'fieldA_prop1 error message 1',
            },
            {
              fieldName: 'fieldB[1].prop2',
              message: 'fieldB_1_prop2 error message',
            },
            {
              fieldName: 'fieldB[2]',
              message: 'fieldB_2 error message',
            },
            {
              fieldName: 'fieldB[2]_prop1[0].id',
              message: 'fieldB_2_prop1_0_id error message',
            },
            {
              fieldName: 'fieldA.prop1',
              message: 'fieldA_prop1 error message 2',
            },
          ],
        },
      },
    };

    const state = {
      serverErrors: {
        B_fieldA: ['fieldA error message'],
        B_fieldB_prop1: ['fieldB_prop1 error message'],
        A_fieldC_prop1: ['fieldC_prop1 error message'],
      },
      serverErrorTypes: {},
    };

    const expected = {
      B_fieldA: ['fieldA error message'],
      B_fieldB_prop1: ['fieldB_prop1 error message'],
      A_fieldA_prop1: ['fieldA_prop1 error message 1', 'fieldA_prop1 error message 2'],
      A_fieldA: ['fieldA error message'],
      A_fieldB_1_prop2: ['fieldB_1_prop2 error message'],
      A_fieldB_2: ['fieldB_2 error message'],
      A_fieldB_2_prop1_0_id: ['fieldB_2_prop1_0_id error message'],
    };

    // @ts-ignore
    expect(reducer(state, action).serverErrors).toEqual(expected);
  });

  it('should handle CallApi.rejected with empty violations list and does not clear server errors and server error types', () => {
    const action = {
      type: CallApi.rejected,
      payload: {
        pageId: 'A',
        error: {
          message: 'error',
          violations: [],
        },
      },
    };

    const errors = {
      B_fieldA: ['fieldA error message'],
      B_fieldB_prop1: ['fieldB_prop1 error message'],
      A_fieldC_prop1: ['fieldC_prop1 error message'],
    };

    const errorTypes = {
      B_fieldA: [
        { message: 'B_fieldA', type: 'ERROR' },
        { message: '2', type: 'WARNING' },
      ],
      B_fieldB_prop1: [
        { message: 'B_fieldA_prop1', type: 'ERROR' },
        { message: 'B_fieldA_prop1', type: 'WARNING' },
      ],
      A_fieldC_prop1: [{ message: 'A_fieldC_prop1', type: 'ERROR' }],
    };

    const state = {
      visibility: {},
      serverErrors: errors,
      serverErrorTypes: errorTypes,
    };

    // @ts-ignore
    const result = reducer(state, action);
    expect(result.serverErrors).toEqual(errors);
    expect(result.serverErrorTypes).toEqual(errorTypes);
  });

  it('should handle CallApi.rejected with no violations field and does not clear server errors and server error types', () => {
    const action = {
      type: CallApi.rejected,
      payload: {
        pageId: 'A',
        error: {
          message: 'error',
        },
      },
    };

    const errors = {
      B_fieldA: ['fieldA error message'],
      B_fieldB_prop1: ['fieldB_prop1 error message'],
      A_fieldC_prop1: ['fieldC_prop1 error message'],
    };

    const errorTypes = {
      B_fieldA: [
        { message: 'B_fieldA', type: 'ERROR' },
        { message: '2', type: 'WARNING' },
      ],
      B_fieldB_prop1: [
        { message: 'B_fieldA_prop1', type: 'ERROR' },
        { message: 'B_fieldA_prop1', type: 'WARNING' },
      ],
      A_fieldC_prop1: [{ message: 'A_fieldC_prop1', type: 'ERROR' }],
    };

    const state = {
      visibility: {},
      serverErrors: errors,
      serverErrorTypes: errorTypes,
    };

    // @ts-ignore
    const result = reducer(state, action);
    expect(result.serverErrors).toEqual(errors);
    expect(result.serverErrorTypes).toEqual(errorTypes);
  });

  it('should handle CallApi.fulfilled and clear server errors for entity B', () => {
    const state = {
      serverErrors: {
        A_field1: ['A field 1 error'],
        A_field2: ['A field 2 error'],
        B_field1: ['B field 1 error'],
      },
      serverErrorTypes: {},
      errors: {},
    };

    const action = {
      type: CallApi.fulfilled,
      payload: {
        pageId: 'B',
      },
    };
    // @ts-ignore
    expect(reducer(state, action).serverErrors).toEqual({
      A_field1: ['A field 1 error'],
      A_field2: ['A field 2 error'],
      B_field1: [],
    });
  });

  it('should handle CallApi.fulfilled and clear server errors for entity A', () => {
    const state = {
      serverErrors: {
        A_field1: ['A field 1 error'],
        A_field2: ['A field 2 error'],
        B_field1: ['B field 1 error'],
      },
      serverErrorTypes: {},
      errors: {},
    };

    const action = {
      type: CallApi.fulfilled,
      payload: {
        pageId: 'A',
      },
    };
    // @ts-ignore
    expect(reducer(state, action).serverErrors).toEqual({
      A_field1: [],
      A_field2: [],
      B_field1: ['B field 1 error'],
    });
  });

  it('should handle CallApi.fulfilled and NOT clear server errors for entity FormDefinition', () => {
    const state = {
      serverErrors: {
        A_field1: ['A field 1 error'],
        A_field2: ['A field 2 error'],
        B_field1: ['B field 1 error'],
        FormDefinition_field1: ['FormDefinition field 1 error'],
        FormDefinition_field2: ['FormDefinition field 1 error'],
      },
      serverErrorTypes: {},
      errors: {},
    };

    const action = {
      type: CallApi.fulfilled,
      payload: {
        pageId: 'FormDefinition',
      },
    };
    // @ts-ignore
    expect(reducer(state, action).serverErrors).toEqual({
      A_field1: ['A field 1 error'],
      A_field2: ['A field 2 error'],
      B_field1: ['B field 1 error'],
      FormDefinition_field1: ['FormDefinition field 1 error'],
      FormDefinition_field2: ['FormDefinition field 1 error'],
    });
  });

  it('should handle CallApi.fulfilled with violation errors for any entity', () => {
    const state = {
      ...initialState,
      serverErrors: {
        FormDefinition_field1: ['FormDefinition field 1 error'],
        FormDefinition_field2: ['FormDefinition field 2 error'],
        Other_field2: ['Other field 2 error'],
      },
      serverErrorTypes: {},
      error: {},
    };

    const action = {
      type: CallApi.fulfilled,
      payload: {
        pageId: 'FormDefinition',
        data: {
          violationsData: [
            { message: 'violation 1', fieldName: 'field1' },
            { message: 'violation 3', fieldName: 'field3' },
          ],
        },
      },
    };

    const expected = {
      FormDefinition_field1: ['violation 1'],
      FormDefinition_field3: ['violation 3'],
    };

    expect(reducer(state, action).serverErrors).toEqual(expected);
  });

  it('should handle CallApi.fulfilled with violation errors and mapToProperty for any entity', () => {
    const state = {
      ...initialState,
      serverErrors: {
        FormDefinition_field1: ['FormDefinition field 1 error'],
        FormDefinition_field2: ['FormDefinition field 2 error'],
        Other_field2: ['Other field 2 error'],
      },
      serverErrorTypes: {},
      error: {},
    };

    const action = {
      type: CallApi.fulfilled,
      meta: { arg: { wrapToProperty: 'other' } },
      payload: {
        pageId: 'FormDefinition',
        data: {
          other: {
            violationsData: [
              { message: 'violation 1', fieldName: 'other.field1' },
              { message: 'violation 3', fieldName: 'field3' },
            ],
          },
        },
      },
    };

    const expected = {
      FormDefinition_other_field1: ['violation 1'],
      FormDefinition_field3: ['violation 3'],
    };

    expect(reducer(state, action).serverErrors).toEqual(expected);
  });

  it('should NOT clear server errors when skipClearFormServerErrorsOnSuccess is true', () => {
    const state = {
      visibility: {},
      serverErrors: {
        A_field1: ['A field 1 error'],
        A_field2: ['A field 2 error'],
        B_field1: ['B field 1 error'],
      },
      serverErrorTypes: {},
      errors: {},
    };

    const action = {
      type: CallApi.fulfilled,
      payload: {
        pageId: 'B',
        metadata: {
          skipClearFormServerErrorsOnSuccess: true,
        },
      },
    };
    // @ts-ignore
    expect(reducer(state, action).serverErrors).toEqual({
      A_field1: ['A field 1 error'],
      A_field2: ['A field 2 error'],
      B_field1: ['B field 1 error'],
    });
  });

  it('should clear server errors when skipClearFormServerErrorsOnSuccess is false or undefined', () => {
    const state = {
      visibility: {},
      serverErrors: {
        A_field1: ['A field 1 error'],
        A_field2: ['A field 2 error'],
        B_field1: ['B field 1 error'],
      },
      serverErrorTypes: {},
      errors: {},
    };

    const actionWithFalse = {
      type: CallApi.fulfilled,
      payload: {
        pageId: 'B',
        metadata: {
          skipClearFormServerErrorsOnSuccess: false,
        },
      },
    };

    const actionWithUndefined = {
      type: CallApi.fulfilled,
      payload: {
        pageId: 'B',
        metadata: {},
      },
    };

    const expected = {
      A_field1: ['A field 1 error'],
      A_field2: ['A field 2 error'],
      B_field1: [],
    };

    // @ts-ignore
    expect(reducer(state, actionWithFalse).serverErrors).toEqual(expected);
    // @ts-ignore
    expect(reducer(state, actionWithUndefined).serverErrors).toEqual(expected);
  });

  it('should handle SYSTEM_CLEAR', () => {
    const action = {
      type: SYSTEM_CLEAR,
    };

    const state = {
      errors: {
        field1_a: ['1', '2'],
        field1_b: ['1', '2'],
        field2_c: ['1'],
      },
      serverErrorTypes: {},
      serverErrors: {
        field1_a: ['1', '2'],
        field1_b: ['1', '2'],
        field2_c: ['1'],
        field3_d: ['1', '2', '3'],
      },
    };

    const result = reducer(state, action);

    expect(result.errors).toEqual({});
    expect(result.serverErrors).toEqual({});
  });

  describe('FormValidations for Steps', () => {
    it('should set the validationStep correctly', () => {
      const state = { validationStep: 'STEP_1' };
      const action = {
        type: 'FormValidations/SetValidationStep',
        payload: 'STEP_2',
      };
      const expected = { validationStep: 'STEP_2' };
      expect(reducer(state as any, action)).toEqual(expected);
    });
  });

  describe('REMOVE_ARRAY_FIELD_ITEM - serverErrors reindexing', () => {
    it('should delete errors for the removed index and reindex subsequent items', () => {
      const serverErrors = {
        CaseType_activities_0_phaseCode: ['error-0'],
        CaseType_activities_1_phaseCode: ['error-1'],
        CaseType_activities_2_phaseCode: ['error-2'],
      };

      const serverErrorTypes = {
        CaseType_activities_0_phaseCode: [{ message: 'error-0', type: 'ERROR' }],
        CaseType_activities_1_phaseCode: [{ message: 'error-1', type: 'ERROR' }],
        CaseType_activities_2_phaseCode: [{ message: 'error-2', type: 'ERROR' }],
      };

      const state = { ...initialState, serverErrors, serverErrorTypes };

      const action = {
        type: REMOVE_ARRAY_FIELD_ITEM,
        payload: {
          entityId: 'CaseType',
          fieldId: 'CaseType_activities',
          index: 1,
        },
      };

      const expectedServerErrors = {
        CaseType_activities_0_phaseCode: ['error-0'],
        CaseType_activities_1_phaseCode: ['error-2'],
      };

      const expectedServerErrorTypes = {
        CaseType_activities_0_phaseCode: [{ message: 'error-0', type: 'ERROR' }],
        CaseType_activities_1_phaseCode: [{ message: 'error-2', type: 'ERROR' }],
      };

      // @ts-ignore
      const result = reducer(state, action);
      expect(result.serverErrors).toEqual(expectedServerErrors);
      expect(result.serverErrorTypes).toEqual(expectedServerErrorTypes);
    });

    it('should delete errors for the first index and reindex all subsequent items', () => {
      const serverErrors = {
        CaseType_activities_0_phaseCode: ['error-0'],
        CaseType_activities_1_phaseCode: ['error-1'],
        CaseType_activities_2_phaseCode: ['error-2'],
      };

      const state = { ...initialState, serverErrors, serverErrorTypes: {} };

      const action = {
        type: REMOVE_ARRAY_FIELD_ITEM,
        payload: { entityId: 'CaseType', fieldId: 'CaseType_activities', index: 0 },
      };

      const expectedServerErrors = {
        CaseType_activities_0_phaseCode: ['error-1'],
        CaseType_activities_1_phaseCode: ['error-2'],
      };

      // @ts-ignore
      expect(reducer(state, action).serverErrors).toEqual(expectedServerErrors);
    });
  });
});
