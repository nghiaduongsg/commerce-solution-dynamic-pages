import { renderHook } from '@testing-library/react';
import React, { act } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useFormValidity from './useFormValidity';
import { SetFormServerErrors, SetValidationStep } from '@pkg-form/validations/redux/reducers';
import {
  selectValidationStep,
  selectIsFormValidServerErrors,
  selectParentFormServerErrors,
} from '@pkg-form/validations/redux/selectors';
import ValidationsContext from '@pkg-form/validations/ValidationsContext';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('@pkg-form/validations/redux/selectors', () => ({
  selectIsFormValidServerErrors: jest.fn(),
  selectParentFormServerErrors: jest.fn(),
}));

const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
const mockSelectValidationStep = selectValidationStep as jest.MockedFunction<
  typeof selectValidationStep
>;
const mockSelectIsFormValidServerErrors = selectIsFormValidServerErrors as jest.MockedFunction<
  typeof selectIsFormValidServerErrors
>;
const mockSelectParentFormServerErrors = selectParentFormServerErrors as jest.MockedFunction<
  typeof selectParentFormServerErrors
>;

const wrapper = ({ children }) => {
  return (
    // @ts-ignore
    <ValidationsContext.Provider value={{ isFormValid: () => true }}>
      {children}
    </ValidationsContext.Provider>
  );
};

describe('useFormValidity', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);
  });

  it('should call selectors and return their values', () => {
    mockUseSelector
      .mockReturnValueOnce('STEP_5')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce({ fieldA: 'Server Error' })
      .mockReturnValueOnce(['fieldA']);

    const parentField = 'testForm';

    const { result } = renderHook(() => useFormValidity(parentField), {
      wrapper,
    });

    expect(result.current.validationStep).toBe('STEP_5');
    expect(result.current.isFormValidServerSide).toBe(false);

    expect(mockSelectIsFormValidServerErrors).toHaveBeenCalledWith(parentField);
    expect(mockSelectParentFormServerErrors).toHaveBeenCalledWith(parentField);
  });

  it('should dispatch SetFormServerErrors when setServerErrors is called', () => {
    mockUseSelector.mockReturnValue(null);
    const { result } = renderHook(() => useFormValidity('parent'), {
      wrapper,
    });
    const serverErrors = { fieldB: ['Another server error'] };

    act(() => {
      result.current.setServerErrors(serverErrors);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      SetFormServerErrors({ errors: serverErrors, errorTypes: {} }),
    );
  });

  it('should dispatch SetValidationStep when setValidationStep is called', () => {
    mockUseSelector.mockReturnValue(null);
    const { result } = renderHook(() => useFormValidity('parent'), {
      wrapper,
    });

    act(() => {
      result.current.setValidationStep('A-STEP');
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(SetValidationStep('A-STEP'));
  });

  it('should dispatch SetValidationStep with null when resetValidationStep is called', () => {
    mockUseSelector.mockReturnValue(null);
    const { result } = renderHook(() => useFormValidity('parent'), {
      wrapper,
    });

    act(() => {
      result.current.resetValidationStep();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(SetValidationStep(null));
  });

  it('should maintain stable function references across rerenders', () => {
    mockUseSelector.mockReturnValue(null);
    const { result, rerender } = renderHook(() => useFormValidity('parent'), {
      wrapper,
    });
    const initialSetServerErrors = result.current.setServerErrors;

    rerender();

    expect(result.current.setServerErrors).toBe(initialSetServerErrors);
  });

  it('should return keys when no param is specified', () => {
    mockUseSelector.mockReturnValue(null);
    const { result } = renderHook(() => useFormValidity(), {
      wrapper,
    });
    expect(result.current).toStrictEqual({
      isFormValidServerSide: null,
      isFormValid: true,
      setServerErrors: expect.any(Function),
      serverErrors: null,
      resetValidationStep: expect.any(Function),
      setValidationStep: expect.any(Function),
      validationStep: null,
    });
  });
});
