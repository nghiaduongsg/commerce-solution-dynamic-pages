import useFieldVisibility from './useFieldVisibility';
import { mockFieldApplicabityHook } from '@_jestHelpers/useFieldApplicabilityMock';
import { mockCheckFromHook } from '@_jestHelpers/useCheckFromMock';
import { renderHook } from '@testing-library/react';
import { mockFieldReadyHook } from '@_jestHelpers/useFieldReadyMock';
import { getMockWrapperWithFormManagerAndValidationsContext } from '@_jestHelpers/reactMockStore';

describe('useFieldVisibility', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return visible false if field is readonly, disabled and not visible in card', () => {
    mockFieldApplicabityHook(true);
    mockCheckFromHook(true);
    mockFieldReadyHook(false);
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors: jest.fn() },
      {
        isFieldVisible: () => true,
        setFieldVisibility: () => {},
      },
    );

    const options = { visibleInCard: false };

    const { result } = renderHook(() => useFieldVisibility('fieldId', true, true, options), {
      wrapper,
    });
    const { visible } = result.current;

    expect(visible).toEqual(false);
  });

  it('should return visible false if field is not readonly and disabled and is not visible (from schema)', () => {
    mockFieldApplicabityHook(true);
    mockCheckFromHook(true);
    mockFieldReadyHook(false);
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors: jest.fn() },
      {
        isFieldVisible: () => true,
        setFieldVisibility: () => {},
      },
    );

    const options = { visible: false };

    const { result } = renderHook(() => useFieldVisibility('fieldId', false, false, options), {
      wrapper,
    });
    const { visible } = result.current;

    expect(visible).toEqual(false);
  });

  it('should return visible true if field is readonly, disabled and visible in card and no other restrictions exist', () => {
    mockFieldApplicabityHook(true);
    mockCheckFromHook(true);
    mockFieldReadyHook(false);
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors: jest.fn() },
      {
        isFieldVisible: () => true,
        setFieldVisibility: () => {},
      },
    );

    const options = { visibleInCard: true };

    const { result } = renderHook(() => useFieldVisibility('fieldId', true, true, options), {
      wrapper,
    });
    const { visible } = result.current;

    expect(visible).toEqual(true);
  });

  it('should return visible true if field is not readonly and disabled and is visible (from schema) and no other restrictions exist', () => {
    mockFieldApplicabityHook(true);
    mockCheckFromHook(true);
    mockFieldReadyHook(false);
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors: jest.fn() },
      {
        isFieldVisible: () => true,
        setFieldVisibility: () => {},
      },
    );

    const options = { visible: true };

    const { result } = renderHook(() => useFieldVisibility('fieldId', false, false, options), {
      wrapper,
    });
    const { visible } = result.current;

    expect(visible).toEqual(true);
  });

  it('should return visible false if field should be hidden due to visibilityFrom restrictions', () => {
    mockFieldApplicabityHook(true);
    mockCheckFromHook(false);
    mockFieldReadyHook(false);
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors: jest.fn() },
      {
        isFieldVisible: () => true,
        setFieldVisibility: () => {},
      },
    );

    const options = { visible: true };

    const { result } = renderHook(() => useFieldVisibility('fieldId', false, false, options), {
      wrapper,
    });
    const { visible } = result.current;

    expect(visible).toEqual(false);
  });

  it('should return visible true if field should be shown based on visibilityFrom and no other restrictions exist', () => {
    mockFieldApplicabityHook(true);
    mockCheckFromHook(true);
    mockFieldReadyHook(false);
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors: jest.fn() },
      {
        isFieldVisible: () => true,
        setFieldVisibility: () => {},
      },
    );

    const options = { visible: true };

    const { result } = renderHook(() => useFieldVisibility('fieldId', false, false, options), {
      wrapper,
    });
    const { visible } = result.current;

    expect(visible).toEqual(true);
  });

  it('should return visible false if field should be hidden due to applicability restrictions', () => {
    mockFieldApplicabityHook(false);
    mockCheckFromHook(true);
    mockFieldReadyHook(false);
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors: jest.fn() },
      {
        isFieldVisible: () => true,
        setFieldVisibility: () => {},
      },
    );

    const options = { visible: true };

    const { result } = renderHook(() => useFieldVisibility('fieldId', false, false, options), {
      wrapper,
    });
    const { visible } = result.current;

    expect(visible).toEqual(false);
  });

  it('should return visible true if field should be shown based on applicability and no other restrictions exist', () => {
    mockFieldApplicabityHook(true);
    mockCheckFromHook(true);
    mockFieldReadyHook(false);
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors: jest.fn() },
      {
        isFieldVisible: () => true,
        setFieldVisibility: () => {},
      },
    );

    const options = { visible: true };

    const { result } = renderHook(() => useFieldVisibility('fieldId', false, false, options), {
      wrapper,
    });
    const { visible } = result.current;

    expect(visible).toEqual(true);
  });

  it('should call setFieldVisibility is field is visible and should get hidden', () => {
    mockFieldApplicabityHook(false);
    mockCheckFromHook(true);
    mockFieldReadyHook(true);
    const setFieldVisibility = jest.fn();
    const setFieldErrors = jest.fn();
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors },
      {
        isFieldVisible: () => true,
        setFieldVisibility,
      },
    );

    const options = { visible: true, validations: { required: true } };

    renderHook(
      () => {
        return useFieldVisibility('fieldId', false, false, options);
      },
      { wrapper },
    );

    expect(setFieldVisibility).toHaveBeenCalledWith('fieldId', false);
  });

  it('should call setFieldVisibility is field is not visible and should get visible', () => {
    mockFieldApplicabityHook(true);
    mockCheckFromHook(true);
    mockFieldReadyHook(true);
    const setFieldVisibility = jest.fn();
    const setFieldErrors = jest.fn();
    const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
      { setFieldErrors },
      {
        isFieldVisible: () => false,
        setFieldVisibility,
      },
    );

    const options = { visible: true, validations: { required: true } };

    renderHook(
      () => {
        return useFieldVisibility('fieldId', false, false, options);
      },
      { wrapper },
    );

    expect(setFieldVisibility).toHaveBeenCalledWith('fieldId', true);
    expect(setFieldErrors).not.toHaveBeenCalled();
  });
});
