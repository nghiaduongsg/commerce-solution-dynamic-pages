import { renderHook } from '@testing-library/react';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { jpValue } from '@pkg-common/dataResolver/utils';
import usePrevious from '@pkg-common/hooks/usePrevious';
import useEntity from '@pkg-entity/hooks/useEntity';
import useCodeListAttributes from '@pkg-core/codeList/hooks/useCodeListAttributes';
import useSystem from '@pkg-setup/src/system/useSystem';
import useNotifiers from '@pkg-common/notifier/useNotifiers';
import useLoader from '@pkg-common/loader/useLoader';
import useCodeInjection from './useCodeInjection';
import { getMockWrapperAndStore, getMockWrapperForContext } from '@_jestHelpers/reactMockStore';

jest.mock('@pkg-entity/hooks/useEntityFormData');
jest.mock('@pkg-common/dataResolver/utils');
jest.mock('@pkg-common/hooks/usePrevious');
jest.mock('@pkg-entity/hooks/useEntity');
jest.mock('@pkg-core/codeList/hooks/useCodeListAttributes');
jest.mock('@pkg-setup/src/system/useSystem');
jest.mock('@pkg-common/notifier/useNotifiers');
jest.mock('@pkg-common/loader/useLoader');
jest.mock('@pkg-form/validations/utils/validationUtils');
jest.mock('@pkg-entity/utils/utils');
jest.mock('@pkg-common/dataResolver/utils');

const mockUseEntityFormData = useEntityFormData as jest.MockedFunction<typeof useEntityFormData>;
const mockUsePrevious = usePrevious as jest.MockedFunction<typeof usePrevious>;
const mockUseEntity = useEntity as jest.MockedFunction<typeof useEntity>;
const mockUseCodeListAttributes = useCodeListAttributes as jest.MockedFunction<
  typeof useCodeListAttributes
>;
const mockUseSystem = useSystem as jest.MockedFunction<typeof useSystem>;
const mockUseNotifiers = useNotifiers as jest.MockedFunction<typeof useNotifiers>;
const mockUseLoader = useLoader as jest.MockedFunction<typeof useLoader>;
const mockJpValue = jpValue as jest.MockedFunction<typeof jpValue>;

const entityId = 'test-entity';
const storeData = {
  ApiData: {
    A: { loading: true, refreshId: 15, data: { a: 'a' } },
    B: { loading: false, error: { message: 'error' } },
  },
};
const mockSchemasConfig = {
  entityDataAreaKey: 'data',
  uiJsonSchema: { type: 'object' },
  jsonSchema: { type: 'object' },
};

const contextValue = {
  errors: {},
  setFieldErrors: jest.fn(),
  getFieldErrors: jest.fn().mockReturnValue([]),
  addFieldErrors: jest.fn(),
  removeFieldErrors: jest.fn(),
  isFieldValid: jest.fn().mockReturnValue(true),
  isFormValid: jest.fn().mockReturnValue(true),
  isGroupValid: jest.fn().mockReturnValue(true),
  clearErrors: jest.fn(),
  clearParentFieldErrors: jest.fn(),
};

// Create a combined wrapper function
const createCombinedWrapper = (storeData) => {
  const { wrapper: reduxWrapper, dispatchStub } = getMockWrapperAndStore(storeData);
  const contextWrapper = getMockWrapperForContext(contextValue);

  // Combine both wrappers
  const combinedWrapper = ({ children }) =>
    reduxWrapper({
      children: contextWrapper({ children }),
    });

  return { wrapper: combinedWrapper, dispatchStub };
};

describe('useCodeInjection', () => {
  const mockEntityHandler = { get: jest.fn(), set: jest.fn() };
  const mockEnqueueSnackbar = jest.fn();
  const mockShowLoader = jest.fn();
  const mockHideLoader = jest.fn();
  const mockCodeListHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEntity.mockReturnValue(mockEntityHandler as any);
    (mockUseEntityFormData as jest.Mock).mockReturnValue({
      formDataForCodeInjection: { field1: 'value1' },
    });
    (mockUsePrevious as jest.Mock).mockReturnValue({ field1: 'oldValue1' });
    mockUseCodeListAttributes.mockReturnValue(mockCodeListHandler as any);
    (mockUseSystem as jest.Mock).mockReturnValue({ apiUrl: 'the-best-url' });
    (mockUseNotifiers as jest.Mock).mockReturnValue({ enqueueSnackbar: mockEnqueueSnackbar });
    (mockUseLoader as jest.Mock).mockReturnValue({
      showLoader: mockShowLoader,
      hideLoader: mockHideLoader,
    });
  });

  it('should return buttons from setupButtons function and execute onChange bindings when form data changes', () => {
    const mockOnChange = jest.fn();
    const mockSetupCode = jest
      .fn()
      .mockReturnValue([{ jsonPath: '$.field1', onChange: mockOnChange }]);
    const mockButtonClick = jest.fn();
    const mockSetupButtons = jest
      .fn()
      .mockReturnValue([{ id: 'btn1', label: 'Test Button', onClick: mockButtonClick }]);
    (mockJpValue as jest.Mock).mockReturnValueOnce('oldValue1').mockReturnValueOnce('value1');

    const { wrapper } = createCombinedWrapper(storeData);

    const { result } = renderHook(
      () =>
        useCodeInjection(
          entityId,
          { ...mockSchemasConfig, subType: 'testType' },
          mockSetupCode,
          mockSetupButtons,
        ),
      { wrapper },
    );

    expect(mockSetupCode).toHaveBeenCalledWith(expect.any(Object));
    expect(mockSetupButtons).toHaveBeenCalledWith(expect.any(Object));
    expect(result.current).toEqual([
      { id: 'btn1', label: 'Test Button', onClick: mockButtonClick },
    ]);
  });

  it('should return empty array when setupCode is omitted and handle undefined setupButtons', () => {
    const mockSetupCode = jest
      .fn()
      .mockReturnValue([{ jsonPath: '$.field1', onChange: jest.fn() }]);

    const { wrapper } = createCombinedWrapper(storeData);

    const { result } = renderHook(
      () => useCodeInjection(entityId, mockSchemasConfig, mockSetupCode, undefined, true),
      { wrapper },
    );

    expect(mockSetupCode).not.toHaveBeenCalled();
    expect(result.current).toEqual([]);
  });

  it('should handle dispatch operations gracefully', () => {
    const schemasConfig = { entityDataAreaKey: 'data' };
    let capturedParams;
    const mockSetupCode = jest.fn().mockImplementation((params) => {
      capturedParams = params;
      return [];
    });

    const { dispatchStub, wrapper } = createCombinedWrapper(storeData);

    renderHook(() => useCodeInjection(entityId, schemasConfig, mockSetupCode), { wrapper });

    const { validationsHandler } = capturedParams;
    validationsHandler.addValidationErrors('testField', ['error1']);
    expect(contextValue.addFieldErrors).toHaveBeenCalledWith('testField', ['error1']);

    validationsHandler.clearServerErrors();
    expect(dispatchStub).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('ClearFormServerErrors'),
      }),
    );
    validationsHandler.setValidationErrors('testField', ['error1']);
    expect(contextValue.setFieldErrors).toHaveBeenCalledWith('testField', ['error1']);

    validationsHandler.removeValidationErrors('testField', ['error1']);
    expect(contextValue.removeFieldErrors).toHaveBeenCalledWith('testField', ['error1']);

    validationsHandler.setServerErrors(['testViolation']);
    expect(dispatchStub).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('SetFormServerErrors'),
      }),
    );
  });

  it('should handle snackbar notifications correctly', () => {
    const schemasConfig = {};
    let capturedParams;
    const mockSetupCode = jest.fn().mockImplementation((params) => {
      capturedParams = params;
      return [];
    });

    const { wrapper } = createCombinedWrapper(storeData);

    renderHook(() => useCodeInjection(entityId, schemasConfig, mockSetupCode, undefined, false), {
      wrapper,
    });
    const { utils } = capturedParams;
    utils?.wrapEntity({});
    utils?.unwrapEntity({});
    utils?.raiseSnackbar('Test message', 'error', 'test-key');

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith({
      key: 'test-key',
      message: 'Test message',
      severity: 'error',
      namespace: 'common',
    });

    const snackbars = [
      { payload: { message: 'Message 1', severity: 'dark' }, type: 'test' },
      { payload: { message: 'Message 2', severity: 'error' }, type: 'test' },
    ];
    utils?.raiseSnackbars(snackbars);
    expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(3);
  });

  it('should handle jpValue errors on prev call in hasChanged function', () => {
    const mockOnChange = jest.fn();
    const mockSetupCode = jest
      .fn()
      .mockReturnValue([{ jsonPath: '$.invalidPath', onChange: mockOnChange }]);
    mockJpValue.mockImplementation(() => {
      throw new Error('Invalid JSON path');
    });

    const { wrapper } = createCombinedWrapper(storeData);

    renderHook(() => useCodeInjection(entityId, {}, mockSetupCode, undefined, false), { wrapper });
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle jpValue errors on next call in hasChanged function', () => {
    const mockOnChange = jest.fn();
    const mockSetupCode = jest
      .fn()
      .mockReturnValue([{ jsonPath: '$.invalidPath', onChange: mockOnChange }]);
    mockJpValue.mockReturnValueOnce('prevValue').mockImplementationOnce(() => {
      throw new Error('Invalid JSON path');
    });

    const { wrapper } = createCombinedWrapper(storeData);

    renderHook(() => useCodeInjection(entityId, {}, mockSetupCode, undefined, false), { wrapper });
    expect(mockOnChange).not.toHaveBeenCalled();
  });
});
