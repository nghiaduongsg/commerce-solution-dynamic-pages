import { renderHook } from '@testing-library/react';
import useValidations from './useValidations';

// Group imports by category for better organization
// Validation utilities
import { getAllTextValidationErrors } from '@pkg-form/validations/utils/textValidationUtils';
import {
  getDateArrayValidationErrors,
  getDateValidationErrors,
} from '@pkg-form/validations/utils/dateValidationUtils';
import { getTimeValidationErrors } from '@pkg-form/validations/utils/timeValidationUtils';
import { getLabelsValidationErrors } from '@pkg-form/validations/utils/labelsValidationUtils';
import { getAllArrayItemsValidationErrors } from '@pkg-form/validations/utils/arrayValidationUtils';
import { isInfo } from '@pkg-form/validations/utils/validationUtils';

// Redux selectors
import { selectLists } from '@pkg-core/codeList/redux/selectors';

// Custom hooks
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import { useSystem } from '@pkg-setup/index';

// Utilities
import { hasValue } from '@pkg-common/utils/utils';
import { mockMultipleFormDataHook } from '@_jestHelpers/useMultipleFormDataMock';
import { getMockWrapperWithFormManagerAndValidationsContext } from '@_jestHelpers/reactMockStore';

// Mock external dependencies first
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector: any) => selector({}), // Pass empty state object
  shallowEqual: jest.fn(),
}));

jest.mock('react-use', () => ({
  useDebounce: () => [null, jest.fn()],
}));

// Mock validation utilities
jest.mock('@pkg-form/validations/utils/textValidationUtils');
jest.mock('@pkg-form/validations/utils/dateValidationUtils');
jest.mock('@pkg-form/validations/utils/timeValidationUtils');
jest.mock('@pkg-form/validations/utils/labelsValidationUtils');
jest.mock('@pkg-form/validations/utils/validationUtils');
jest.mock('@pkg-form/validations/utils/arrayValidationUtils');

// Mock Redux selectors
jest.mock('@pkg-form/validations/redux/selectors');
jest.mock('@pkg-core/codeList/redux/selectors');

// Mock custom hooks
jest.mock('@pkg-core/codeList/hooks/useCodeListAttributes');
jest.mock('@pkg-common/dataResolver/useFormData');
jest.mock('@pkg-entity/hooks/useEntityFormData');
jest.mock('@pkg-setup/index');

// Mock utilities
jest.mock('@pkg-common/utils/utils');

// Type mocked functions with better typing
const mockGetAllTextValidationErrors = getAllTextValidationErrors as jest.MockedFunction<
  typeof getAllTextValidationErrors
>;
const mockGetDateValidationErrors = getDateValidationErrors as jest.MockedFunction<
  typeof getDateValidationErrors
>;
const mockGetDateArrayValidationErrors = getDateArrayValidationErrors as jest.MockedFunction<
  typeof getDateArrayValidationErrors
>;
const mockGetTimeValidationErrors = getTimeValidationErrors as jest.MockedFunction<
  typeof getTimeValidationErrors
>;
const mockGetLabelsValidationErrors = getLabelsValidationErrors as jest.MockedFunction<
  typeof getLabelsValidationErrors
>;
const mockGetAllArrayItemsValidationErrors =
  getAllArrayItemsValidationErrors as jest.MockedFunction<typeof getAllArrayItemsValidationErrors>;
const mockIsInfo = isInfo as jest.MockedFunction<typeof isInfo>;

// Hook mocks
const mockUseEntityFormData = useEntityFormData as jest.MockedFunction<typeof useEntityFormData>;
const mockUseSystem = useSystem as jest.MockedFunction<typeof useSystem>;
const mockHasValue = hasValue as jest.MockedFunction<typeof hasValue>;

// Selector mocks
const mockSelectLists = selectLists as jest.MockedFunction<any>;

// Helper function to create default mock returns
const createDefaultMocks = () => ({
  codeListAttributes: { getAttribute: jest.fn() } as any,
  entityFormData: { dataExists: true } as any,
  system: { isSignReversed: false } as any,
  hasValue: false,
  isInfo: false,
  fieldErrors: () => [] as string[],
  fieldValid: () => true,
  fieldDirty: () => true,
  fieldVisible: () => true,
  codelists: () => ({
    A: [],
    testCodelist: [{ code: 'item1', label: 'Item 1', attributes: [{ key: 'minValue', value: 5 }] }],
  }),
});

describe('useValidations - Unit Tests', () => {
  mockMultipleFormDataHook({ maxLength: 15, minValue: 'item1' });
  const validationsContext = {
    errors: {},
    setFieldErrors: jest.fn(),
    getFieldErrors: jest.fn().mockReturnValue([]),
    addFieldErrors: jest.fn(),
    removeFieldErrors: jest.fn(),
    removeMultipleFieldErrors: jest.fn(),
    isFieldValid: jest.fn().mockReturnValue(true),
    isFormValid: jest.fn().mockReturnValue(true),
    isGroupValid: jest.fn().mockReturnValue(true),
    clearErrors: jest.fn(),
    clearParentFieldErrors: jest.fn(),
  };

  const formManagerContext = {
    isFieldVisible: jest.fn().mockReturnValue(true),
    isFieldDirty: jest.fn().mockReturnValue(true),
  };
  const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
    validationsContext,
    formManagerContext,
  );

  beforeEach(() => {
    jest.clearAllMocks();

    const defaults = createDefaultMocks();

    // Set up all default mock returns
    mockUseEntityFormData.mockReturnValue(defaults.entityFormData);
    mockUseSystem.mockReturnValue(defaults.system);
    mockHasValue.mockReturnValue(defaults.hasValue);
    mockIsInfo.mockReturnValue(defaults.isInfo);

    // Redux selectors
    mockSelectLists.mockReturnValue(defaults.codelists);

    // Validation functions default to empty arrays
    mockGetAllTextValidationErrors.mockReturnValue([]);
    mockGetDateValidationErrors.mockReturnValue([]);
    mockGetTimeValidationErrors.mockReturnValue([]);
    mockGetLabelsValidationErrors.mockReturnValue([]);
    mockGetAllArrayItemsValidationErrors.mockReturnValue([]);
  });

  // Helper function for common test setup
  const setupValidationTest = (overrides: Partial<ReturnType<typeof createDefaultMocks>> = {}) => {
    const defaults = createDefaultMocks();
    const config = { ...defaults, ...overrides };

    mockUseEntityFormData.mockReturnValue(config.entityFormData);
    mockUseSystem.mockReturnValue(config.system);
    mockHasValue.mockReturnValue(config.hasValue);
    mockIsInfo.mockReturnValue(config.isInfo);
    mockSelectLists.mockReturnValue(defaults.codelists);

    // Update context mocks if provided
    if (overrides.fieldErrors) {
      validationsContext.getFieldErrors.mockReturnValue(overrides.fieldErrors());
    }
    if (overrides.fieldValid !== undefined) {
      validationsContext.isFieldValid.mockReturnValue(overrides.fieldValid());
    }
    if (overrides.fieldDirty !== undefined) {
      formManagerContext.isFieldDirty.mockReturnValue(overrides.fieldDirty());
    }
    if (overrides.fieldVisible !== undefined) {
      formManagerContext.isFieldVisible.mockReturnValue(overrides.fieldVisible());
    }
  };

  describe('Field Type Validation', () => {
    it('should call text validation for string type', () => {
      mockGetAllTextValidationErrors.mockReturnValue(['required']);

      const { result } = renderHook(
        () => useValidations('field1', '', 'string', { required: true }),
        { wrapper },
      );

      expect(mockGetAllTextValidationErrors).toHaveBeenCalledWith(
        { required: true },
        '',
        undefined,
        false,
      );
      expect(result.current.errors).toEqual(['required']);
    });

    it('should call text validation for number type', () => {
      mockGetAllTextValidationErrors.mockReturnValue(['minValue#{"minValue": 0}']);

      const { result } = renderHook(() => useValidations('field1', -5, 'number', { minValue: 0 }), {
        wrapper,
      });

      expect(mockGetAllTextValidationErrors).toHaveBeenCalledWith(
        { minValue: 0 },
        -5,
        undefined,
        false,
      );
      expect(result.current.errors).toContain('minValue#{"minValue": 0}');
    });

    it('should call date validation for date type with invalid date', () => {
      mockGetDateArrayValidationErrors.mockReturnValue(['invalidDate']);

      const { result } = renderHook(
        () => useValidations('field1', 'invalid-date', 'dateArray', {}),
        { wrapper },
      );

      expect(mockGetDateArrayValidationErrors).toHaveBeenCalledWith({}, 'invalid-date');
      expect(result.current.errors).toEqual(['invalidDate']);
    });

    it('should call date validation for date type', () => {
      mockGetDateValidationErrors.mockReturnValue(['invalidDate']);

      const { result } = renderHook(() => useValidations('field1', 'invalid-date', 'date', {}), {
        wrapper,
      });

      expect(mockGetDateValidationErrors).toHaveBeenCalledWith({}, 'invalid-date');
      expect(result.current.errors).toEqual(['invalidDate']);
    });

    it('should call time validation for time type with invalid time', () => {
      mockGetTimeValidationErrors.mockReturnValue(['invalidTime']);

      const { result } = renderHook(() => useValidations('field1', 'invalid-time', 'time', {}), {
        wrapper,
      });

      expect(mockGetTimeValidationErrors).toHaveBeenCalledWith({}, 'invalid-time');
      expect(result.current.errors).toEqual(['invalidTime']);
    });

    it('should call labels validation for labels type', () => {
      mockGetLabelsValidationErrors.mockReturnValue(['required']);
      const labelsValue = [{ languageCL: 'en', description: '' }];

      const { result } = renderHook(() => useValidations('field1', labelsValue, 'labels', {}), {
        wrapper,
      });

      expect(mockGetLabelsValidationErrors).toHaveBeenCalledWith({}, labelsValue);
      expect(result.current.errors).toEqual(['required']);
    });

    it('should call array validations for array structures (multiple = false)', () => {
      mockGetAllArrayItemsValidationErrors.mockReturnValue(['required']);
      const arrayValue = [];

      const { result } = renderHook(() => useValidations('field1', arrayValue, 'array', {}), {
        wrapper,
      });

      expect(mockGetAllArrayItemsValidationErrors).toHaveBeenCalledWith({}, false, arrayValue);
      expect(result.current.errors).toEqual(['required']);
    });

    it('should call array validations for array structures (multiple = true)', () => {
      mockGetAllArrayItemsValidationErrors.mockReturnValue(['required']);
      const arrayValue = [];
      const multiple = true;

      const { result } = renderHook(
        () => useValidations('field1', arrayValue, 'array', {}, undefined, [], multiple),
        {
          wrapper,
        },
      );

      expect(mockGetAllArrayItemsValidationErrors).toHaveBeenCalledWith({}, multiple, arrayValue);
      expect(result.current.errors).toEqual(['required']);
    });

    it('should pass acceptSingleSpace parameter for text validation', () => {
      mockGetAllTextValidationErrors.mockReturnValue([]);

      renderHook(() => useValidations('field1', 'test', 'string', { acceptSingleSpace: true }), {
        wrapper,
      });

      expect(mockGetAllTextValidationErrors).toHaveBeenCalledWith(
        { acceptSingleSpace: true },
        'test',
        true,
        false,
      );
    });

    it('should pass isSignReversed parameter for text validation', () => {
      setupValidationTest({
        system: { isSignReversed: true } as any,
      });
      mockGetAllTextValidationErrors.mockReturnValue([]);

      renderHook(() => useValidations('field1', '123', 'string', {}), { wrapper });

      expect(mockGetAllTextValidationErrors).toHaveBeenCalledWith({}, '123', undefined, true);
    });
  });

  describe('Dynamic Validations', () => {
    it('should merge extra validations from codelist', () => {
      setupValidationTest();
      mockGetAllTextValidationErrors.mockReturnValue([]);

      const { result } = renderHook(
        () =>
          useValidations(
            'field1',
            'test',
            'string',
            { required: true },
            { codelist: 'testCodelist', attribute: 'minValue' },
          ),
        { wrapper },
      );

      expect(result.current.dynamicValidations).toEqual({
        required: true,
        minValue: 5,
      });
    });

    it('should merge extra validations from attribute without codelist', () => {
      setupValidationTest({
        hasValue: true,
      });
      mockGetAllTextValidationErrors.mockReturnValue([]);

      const { result } = renderHook(
        () =>
          useValidations(
            'field1',
            'test',
            'string',
            { required: true },
            { attribute: 'maxLength' },
          ),
        { wrapper },
      );

      expect(result.current.dynamicValidations).toEqual({
        maxLength: 15,
        required: true,
      });
    });

    it('should set attribute to undefined when no related field value', () => {
      setupValidationTest();
      mockGetAllTextValidationErrors.mockReturnValue([]);

      const { result } = renderHook(
        () =>
          useValidations(
            'field1',
            'test',
            'string',
            { required: true },
            { attribute: 'minLength' },
          ),
        { wrapper },
      );

      expect(result.current.dynamicValidations).toEqual({
        required: true,
        minLength: undefined,
      });
    });

    it('should return original validations when no extra validations', () => {
      mockGetAllTextValidationErrors.mockReturnValue([]);

      const { result } = renderHook(
        () => useValidations('field1', 'test', 'string', { required: true }),
        { wrapper },
      );

      expect(result.current.dynamicValidations).toEqual({
        required: true,
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should return empty errors and valid true for filter fields', () => {
      mockGetAllTextValidationErrors.mockReturnValue(['required']);

      const { result } = renderHook(
        () => useValidations('field1-filters', '', 'string', { required: true }),
        { wrapper },
      );

      expect(result.current.errors).toEqual([]);
      expect(result.current.valid).toBe(true);
    });

    it('should return normal errors for non-filter fields', () => {
      setupValidationTest({
        fieldErrors: () => ['required'],
        fieldValid: () => false,
        fieldDirty: () => true,
      });
      mockGetAllTextValidationErrors.mockReturnValue(['required']);

      const { result } = renderHook(
        () => useValidations('field1', '', 'string', { required: true }),
        { wrapper },
      );

      expect(result.current.errors).toEqual(['required']);
      expect(result.current.valid).toBe(false);
    });
  });

  describe('Server Errors Handling', () => {
    it('should return invalid when server errors exist and not info', () => {
      setupValidationTest({
        isInfo: false,
      });
      mockGetAllTextValidationErrors.mockReturnValue([]);

      const { result } = renderHook(
        () => useValidations('field1', 'test', 'string', {}, undefined, ['serverError']),
        { wrapper },
      );

      expect(result.current.valid).toBe(false);
    });

    it('should return valid when server errors are info type', () => {
      setupValidationTest({
        isInfo: true,
      });
      mockGetAllTextValidationErrors.mockReturnValue([]);

      const { result } = renderHook(
        () => useValidations('field1', 'test', 'string', {}, undefined, ['info:message']),
        { wrapper },
      );

      expect(result.current.valid).toBe(true);
    });

    it('should return valid when field is not dirty', () => {
      setupValidationTest({
        hasValue: false,
        fieldDirty: () => false,
      });
      mockGetAllTextValidationErrors.mockReturnValue(['required']);

      const { result } = renderHook(
        () => useValidations('field1', '', 'string', { required: true }),
        { wrapper },
      );

      expect(result.current.valid).toBe(true);
    });

    it('should handle string server error', () => {
      setupValidationTest({
        isInfo: false,
      });
      mockGetAllTextValidationErrors.mockReturnValue([]);

      const { result } = renderHook(
        () => useValidations('field1', 'test', 'string', {}, undefined, 'serverError'),
        { wrapper },
      );

      expect(result.current.valid).toBe(false);
    });
  });

  describe('Validation State', () => {
    it('should return correct validation state when no errors', () => {
      mockGetAllTextValidationErrors.mockReturnValue([]);

      const { result } = renderHook(() => useValidations('field1', 'test', 'string', {}), {
        wrapper,
      });

      expect(result.current.errors).toEqual([]);
      expect(result.current.valid).toBe(true);
    });

    it('should return correct validation state when has errors', () => {
      setupValidationTest({
        fieldErrors: () => ['required'],
        fieldValid: () => false,
        fieldDirty: () => true,
      });
      mockGetAllTextValidationErrors.mockReturnValue(['required']);

      const { result } = renderHook(
        () => useValidations('field1', '', 'string', { required: true }),
        { wrapper },
      );

      expect(result.current.errors).toEqual(['required']);
      expect(result.current.valid).toBe(false);
    });

    it('should return correct validation state when field has errors but is not visible', () => {
      setupValidationTest({
        fieldErrors: () => ['required'],
        fieldValid: () => false,
        fieldDirty: () => true,
        fieldVisible: () => false,
      });
      mockGetAllTextValidationErrors.mockReturnValue(['required']);

      const { result } = renderHook(
        () => useValidations('field1', '', 'string', { required: true }),
        { wrapper },
      );

      expect(result.current.errors).toEqual([]);
      expect(result.current.valid).toBe(true);
    });

    it('should return correct validation state when field has errors but is not dirty', () => {
      setupValidationTest({
        fieldErrors: () => ['required'],
        fieldValid: () => false,
        fieldDirty: () => false,
        fieldVisible: () => true,
      });
      mockGetAllTextValidationErrors.mockReturnValue(['required']);

      const { result } = renderHook(
        () => useValidations('field1', '', 'string', { required: true }),
        { wrapper },
      );

      expect(result.current.errors).toEqual(['required']);
      expect(result.current.valid).toBe(true);
    });
  });
});
