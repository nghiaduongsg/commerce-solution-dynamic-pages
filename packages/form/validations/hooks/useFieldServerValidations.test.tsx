import useFieldServerValidations from './useFieldServerValidations';
import { renderHook } from '@testing-library/react';
import { getMockWrapper } from '@_jestHelpers/reactMockStore';

const storeDataIsValid = {
  FormValidations: {
    serverErrors: {
      fieldID_a: ['true'],
      fieldID_b: ['true'],
      otherField_a: ['true'],
    },
  },
};

const storeDataErrors = {
  FormValidations: {
    serverErrors: {
      fieldID_a: ['error message'],
    },
  },
};

describe('useFieldServerValidations', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return isFieldValid', () => {
    const wrapper = getMockWrapper(storeDataIsValid);
    const { result } = renderHook(() => useFieldServerValidations('fieldID'), { wrapper });
    expect(result.current.isFieldValid).toEqual(true);
  });

  it('should return errors', () => {
    const wrapper = getMockWrapper(storeDataErrors);

    const { result } = renderHook(() => useFieldServerValidations('fieldID_a'), { wrapper });

    expect(result.current.errors).toEqual(['error message']);
  });
});
