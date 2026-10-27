import {
  selectFieldServerErrors,
  selectFormServerErrors,
  selectIsFormValidServerErrors,
  selectFieldServerValid,
  selectCustomArrayFieldServerErrors,
  selectFieldServerErrorTypes,
} from './selectors';
import { AnyType } from '@pkg-common/types';

describe('Form Validation selectors', () => {
  const state = {
    FormValidations: {
      serverErrors: {
        field_prop1_0_A: ['1', '2', '3', '5'],
        field_prop2: ['4', '5', '6', '7'],
      },

      serverErrorTypes: {
        field_prop1_0_A: [
          { type: 'ERROR', message: '1' },
          { type: 'WARNING', message: '2' },
          { type: 'ERROR', message: '3' },
          { type: 'WARNING', message: '5' },
        ],
        field_prop2: [
          { type: 'ERROR', message: '4' },
          { type: 'WARNING', message: '5' },
          { type: 'ERROR', message: '6' },
          { type: 'WARNING', message: '7' },
        ],
      },
    },
  } as AnyType;

  it('selectFormServerErrors', () => {
    const expected = state.FormValidations.serverErrors;
    expect(selectFormServerErrors(state)).toEqual(expected);
  });

  describe('selectIsFormValidServerErrors', () => {
    it('should return true if parent field has no errors', () => {
      expect(selectIsFormValidServerErrors('another')(state)).toEqual(true);
    });

    it('should return false if field has errors', () => {
      expect(selectIsFormValidServerErrors('field')(state)).toEqual(false);
    });
  });

  it('selectFieldServerErrors', () => {
    expect(selectFieldServerErrors('field_prop2')(state)).toEqual(['4', '5', '6', '7']);
  });

  it('selectFieldServerErrorTypes', () => {
    expect(selectFieldServerErrorTypes('field_prop2')(state)).toEqual([
      { type: 'ERROR', message: '4' },
      { type: 'WARNING', message: '5' },
      { type: 'ERROR', message: '6' },
      { type: 'WARNING', message: '7' },
    ]);
  });

  describe('selectFieldServerValid', () => {
    it('should return true if parent field has no errors', () => {
      expect(selectFieldServerValid('another')(state)).toEqual(true);
    });

    it('should return false if field has errors', () => {
      expect(selectFieldServerValid('field_prop2')(state)).toEqual(false);
    });
  });

  it('selectCustomArrayFieldServerErrors', () => {
    expect(selectCustomArrayFieldServerErrors('field_prop1_0_A')(state)).toEqual([
      ['1', '2', '3', '5'],
    ]);
  });
});
