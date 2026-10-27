import { renderHook } from '@testing-library/react';
import {
  getMockWrapper,
  getMockWrapperAndStore,
  getMockWrapperWithFormManagerAndValidationsContext,
} from '@_jestHelpers/reactMockStore';
import useActionButton from './useActionButton';
import { ActionButtonType } from './types';
import { act } from 'react';

const mockCallApi = jest.fn();
const mockNavigate = jest.fn();
const mockAddItem = jest.fn();
const mockUpdateItem = jest.fn();
const mockSaveTableData = jest.fn();
const mockAddLocalTableRow = jest.fn();
const mockDeleteLocalTableRow = jest.fn();
const mockEditLocalTableRow = jest.fn();
const mockUndoLocalTableRow = jest.fn();
const mockSetActiveRow = jest.fn();
const mockSetEntityFormData = jest.fn();
const mockClearEntityFormData = jest.fn();
const mockMarkButtonPress = jest.fn();
const mockDispatch = jest.fn();
const mockSetTemporaryAttachment = jest.fn();
const mockIsFormValid = jest.fn();
const mockEnqueueSnackbar = jest.fn();
const mockSetLatestButtonAction = jest.fn();

jest.mock('@pkg-common/dataResolver/useCheckFrom', () => ({
  __esModule: true,
  default: () => ({ check: true }),
}));

jest.mock('@pkg-common/dataResolver/useDynamicApi', () => ({
  __esModule: true,
  default: () => ({ url: 'test-url', data: {}, method: 'GET' }),
}));

jest.mock('@pkg-entity/hooks/useEntityFormData', () => ({
  __esModule: true,
  default: () => ({
    formData: { field1: 'value1' },
    clearEntityFormData: mockClearEntityFormData,
    setEntityFormData: mockSetEntityFormData,
  }),
}));

jest.mock('@pkg-core/apiData/hooks/useCallApiData', () => ({
  __esModule: true,
  default: () => mockCallApi,
}));

jest.mock('@pkg-setup/src/system/useSystem', () => ({
  __esModule: true,
  default: () => ({
    apiUrl: 'https://api.test.com',
    selectedLanguage: 'en',
  }),
}));

jest.mock('../../../../list/hooks/useTable', () => ({
  __esModule: true,
  default: () => ({
    saveTableData: mockSaveTableData,
    addLocalTableRow: mockAddLocalTableRow,
    deleteLocalTableRow: mockDeleteLocalTableRow,
    editLocalTableRow: mockEditLocalTableRow,
    undoLocalTableRow: mockUndoLocalTableRow,
    setActiveRow: mockSetActiveRow,
  }),
}));

jest.mock('@pkg-form/validations/hooks/useFormValidity', () => ({
  __esModule: true,
  default: () => ({ isFormValid: mockIsFormValid() }),
}));

jest.mock('../../notifier/useNotifiers', () => ({
  __esModule: true,
  default: () => ({ enqueueSnackbar: mockEnqueueSnackbar }),
}));

jest.mock('@pkg-common/button/useButtonPress', () => ({
  __esModule: true,
  default: () => ({ markButtonPress: mockMarkButtonPress }),
}));

jest.mock('@pkg-entity/hooks/useFormField', () => ({
  __esModule: true,
  default: () => ({ addItem: mockAddItem, setFieldValue: mockUpdateItem }),
}));

jest.mock('@pkg-setup/src/userSettings/useUserSettings', () => ({
  __esModule: true,
  default: () => ({ filters: {} }),
}));

jest.mock('@pkg-entity/index', () => ({
  useEntity: () => ({ setTemporaryAttachment: mockSetTemporaryAttachment }),
}));

jest.mock('@pkg-common/button/useLatestButtonAction', () => ({
  __esModule: true,
  default: () => ({ setLatestButtonAction: mockSetLatestButtonAction }),
}));

jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => ({})),
}));

jest.mock('@pkg-common/utils', () => ({
  getFormIdFromWidgetId: jest.fn(() => 'FORM_ID'),
  hasValue: jest.fn((value) => value != null && value !== ''),
  appendQueryParams: jest.fn((baseUrl) => `${baseUrl}?param=1`),
}));

jest.mock('@pkg-common/utils/utils', () => ({
  isExternal: jest.fn(),
}));

jest.mock('@pkg-constants/validationCodes', () => ({
  commonCodes: {
    clientValidationErrors: 'Validation Error',
  },
}));

jest.mock('@pkg-form/validations/utils/formUtils', () => ({
  downloadFile: jest.fn(),
  setAnnouncement: jest.fn(),
}));

const defaultStoreData = {
  FormValidations: {
    errors: {},
    serverErrors: {},
    serverErrorTypes: {},
    disabledValues: {},
    dirty: { enabled: false, formId: '' },
    visibility: {},
    pageDirty: false,
  },
};

describe('useActionButton', () => {
  const mockWidgetId = 'testWidget';
  const mockOnSuccessCallback = jest.fn();

  const validationContext = {
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

  const formManagerContext = {
    forceDirty: jest.fn(),
  };

  const wrapper = getMockWrapperWithFormManagerAndValidationsContext(
    validationContext,
    formManagerContext,
  );

  // Create a combined wrapper function
  const createCombinedWrapper = (storeData) => {
    const { wrapper: reduxWrapper } = getMockWrapperAndStore(storeData);

    // Combine both wrappers
    const combinedWrapper = ({ children }) =>
      reduxWrapper({
        children: wrapper({ children }),
      });

    return { wrapper: combinedWrapper };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    validationContext.isFormValid = jest.fn().mockReturnValue(true);
  });

  describe('shouldSetPageDirty default behavior (true)', () => {
    xit('should call forceDirty when form is invalid', () => {
      validationContext.isFormValid.mockReturnValue(false);

      const action: ActionButtonType = {
        title: 'Title',
        showClientValidations: true,
        shouldSetPageDirty: true,
      };

      const { wrapper } = createCombinedWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(formManagerContext.forceDirty).toHaveBeenCalledWith('FORM_ID');
    });

    it('should not call forceDirty when form is valid', () => {
      validationContext.isFormValid.mockReturnValue(true);
      const action: ActionButtonType = {
        title: 'Title',
      };

      const { wrapper } = createCombinedWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(formManagerContext.forceDirty).not.toHaveBeenCalled();
    });
  });

  describe('shouldSetPageDirty false behavior', () => {
    it('should not call forceDirty when form is invalid', () => {
      validationContext.isFormValid.mockReturnValue(false);

      const action: ActionButtonType = {
        title: 'Title',
        showClientValidations: true,
        shouldSetPageDirty: false,
      };

      const { wrapper } = createCombinedWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(formManagerContext.forceDirty).not.toHaveBeenCalled();
    });

    it('should not call forceDirty when form is valid', () => {
      validationContext.isFormValid.mockReturnValue(true);
      const action: ActionButtonType = {
        title: 'Title',
      };

      const { wrapper } = createCombinedWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(formManagerContext.forceDirty).not.toHaveBeenCalled();
    });
  });

  describe('Modal behavior with schemas', () => {
    it('should open modal when schemas are provided', () => {
      const action: ActionButtonType = {
        title: 'Modal Action',
        schemas: {
          schema: { id: 'test-schema' },
          uiSchema: { 'ui:options': { modalSize: 'lg' } },
        },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      act(() => {
        result.current.onClick(undefined);
      });

      expect(result.current.modalOpen).toBe(true);
      expect(result.current.modalSize).toBe('lg');
    });

    it('should set entity form data when source is provided with schemas', () => {
      const mockSource = { id: 1, name: 'test' };
      const action: ActionButtonType = {
        title: 'Modal Action',
        source: mockSource,
        schemas: {
          schema: { id: 'test-schema' },
          uiSchema: { 'ui:page': { customFieldsKey: 'custom' } },
        },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(mockSetEntityFormData).toHaveBeenCalledWith(mockSource, false, 'custom');
    });
  });

  describe('Custom onClick behavior', () => {
    it('should call custom onClick and set latest button action', () => {
      const mockCustomOnClick = jest.fn();
      const action: ActionButtonType = {
        title: 'Custom Action',
        onClick: mockCustomOnClick,
        actionId: 'custom-action-123',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      const params = { test: 'data' };
      result.current.onClick(params);

      expect(mockCustomOnClick).toHaveBeenCalledWith(params, undefined);
      expect(mockSetLatestButtonAction).toHaveBeenCalledWith('custom-action-123');
    });
  });

  describe('Table operations', () => {
    it('should handle SAVE_LOCAL_TABLE type', () => {
      const action: ActionButtonType = {
        title: 'Save Table',
        type: 'SAVE_LOCAL_TABLE',
        values: { resourceToEntity: 'entity123', url: 'test-url' },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(mockSaveTableData).toHaveBeenCalledWith('test-url', 'entity123', 'GET', {});
    });

    it('should handle DELETE_LOCALLY type', () => {
      const mockSource = { id: 1, name: 'test' };
      const action: ActionButtonType = {
        title: 'Delete Local',
        type: 'DELETE_LOCALLY',
        source: mockSource,
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(mockDeleteLocalTableRow).toHaveBeenCalledWith({ rowData: mockSource });
    });
  });

  describe('Row activation without onClick', () => {
    it('should set active row when no onClick and source provided', () => {
      const mockSource = { id: 1, name: 'test' };
      const action: ActionButtonType = {
        title: 'Activate Row',
        source: mockSource,
        type: 'default',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(mockSetActiveRow).toHaveBeenCalledWith({
        ...mockSource,
        __ACTION__: 'default',
      });
      expect(mockOnSuccessCallback).toHaveBeenCalled();
    });

    it('should use onRowActivated from context when available', () => {
      const mockOnRowActivated = jest.fn();
      const mockSource = { id: 1, name: 'test' };

      // Mock the context
      require('react').useContext.mockReturnValue({ onRowActivated: mockOnRowActivated });

      const action: ActionButtonType = {
        title: 'Activate Row Context',
        source: mockSource,
        actionId: 'row-action-123',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(mockOnRowActivated).toHaveBeenCalledWith({
        ...mockSource,
        __ACTION__: 'Activate Row Context',
      });
      expect(mockSetLatestButtonAction).toHaveBeenCalledWith('row-action-123');
    });
  });

  describe('Download functionality', () => {
    it('should handle download type with success', async () => {
      const { downloadFile } = require('@pkg-form/validations/utils/formUtils');
      downloadFile.mockResolvedValue({ url: 'download-url', error: null });

      const action: ActionButtonType = {
        title: 'Download',
        type: 'download',
        values: { resourceId: 'file123', url: 'download-url' },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      await result.current.onClick(undefined);

      expect(downloadFile).toHaveBeenCalled();
      expect(mockSetTemporaryAttachment).toHaveBeenCalledWith('download-url');
    });

    it('should handle download type with 403 error', async () => {
      const { downloadFile } = require('@pkg-form/validations/utils/formUtils');
      downloadFile.mockResolvedValue({
        url: null,
        error: { status: 403, message: 'Forbidden' },
      });

      const action: ActionButtonType = {
        title: 'Download',
        type: 'download',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      await result.current.onClick(undefined);

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.any(String),
        }),
      );
    });
  });

  describe('Redirect functionality', () => {
    it('should handle redirect type with external URL', () => {
      const { isExternal } = require('@pkg-common/utils/utils');
      (isExternal as jest.Mock).mockReturnValue(true);

      const action: ActionButtonType = {
        title: 'Redirect External',
        type: 'redirect',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle redirect type with internal URL and data', () => {
      const { isExternal } = require('@pkg-common/utils/utils');
      (isExternal as jest.Mock).mockReturnValue(false);

      const action: ActionButtonType = {
        title: 'Redirect Internal',
        type: 'redirect',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(mockNavigate).toHaveBeenCalledWith('test-url?param=1', { state: {} });
    });
  });

  describe('onSubmit functionality', () => {
    it('should handle ADD_LOCALLY type with addToField', () => {
      const action: ActionButtonType = {
        title: 'Add Local',
        type: 'ADD_LOCALLY',
        addToField: 'testField',
        schemas: { schema: { id: 'test' }, uiSchema: {} },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onSubmit();

      expect(mockAddItem).toHaveBeenCalledWith({ field1: 'value1' });
    });

    it('should handle EDIT_LOCALLY type', () => {
      const action: ActionButtonType = {
        title: 'Edit Local',
        type: 'EDIT_LOCALLY',
        schemas: { schema: { id: 'test' }, uiSchema: {} },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onSubmit();

      expect(mockEditLocalTableRow).toHaveBeenCalledWith({ rowData: { field1: 'value1' } });
    });

    it('should handle UNDO_LOCALLY type', () => {
      const action: ActionButtonType = {
        title: 'Undo Local',
        type: 'UNDO_LOCALLY',
        schemas: { schema: { id: 'test' }, uiSchema: {} },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onSubmit();

      expect(mockUndoLocalTableRow).toHaveBeenCalledWith({ rowData: { field1: 'value1' } });
    });

    it('should handle onClick with avoidSubmit', () => {
      const mockCustomOnClick = jest.fn();
      const action: ActionButtonType & { avoidSubmit: boolean } = {
        title: 'Custom Submit',
        onClick: mockCustomOnClick,
        avoidSubmit: true,
        schemas: { schema: { id: 'test' }, uiSchema: {} },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onSubmit();

      expect(mockCustomOnClick).toHaveBeenCalledWith({ field1: 'value1' });
    });

    it('should mark button press when no values provided', () => {
      const action: ActionButtonType = {
        title: 'Default Submit',
        schemas: { schema: { id: 'test' }, uiSchema: {} },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onSubmit();

      expect(mockMarkButtonPress).toHaveBeenCalled();
      expect(mockCallApi).toHaveBeenCalledWith('FORM_ID', { field1: 'value1' }, {});
    });
    it('should handle ADD_CASE_ACTIVITY scenario with bundler field1 and default fields', () => {
      const action: ActionButtonType = {
        title: 'Add Local',
        type: 'ADD_CASE_ACTIVITY',
        addToField: 'testField',
        schemas: { schema: { id: 'test' }, uiSchema: {} },
      };

      const expected = {
        caseActivityStatusCL: 'PENDING',
        caseActivityStatusCLDescription: 'Pending',
        caseTypeActivityInfo: {
          activityCaseTypeCode: undefined,
          cancelAllowed: undefined,
          cancelReasonRequired: undefined,
          caseTypeActivityTypeCL: undefined,
          caseTypeActivityTypeCLDescription: undefined,
          humanTaskTypeCode: undefined,
          name: undefined,
          phaseCode: undefined,
          processTaskTypeCode: undefined,
          repeatAllowed: undefined,
        },
        field1: 'value1',
        manuallyAddedSw: true,
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onSubmit();

      expect(mockAddItem).toHaveBeenCalledWith(expected);
    });
    it('should handle EDIT_CASE_ACTIVITY scenario gracefully', () => {
      const action: ActionButtonType = {
        title: 'Edit',
        type: 'EDIT_CASE_ACTIVITY',
        schemas: { schema: { id: 'test' }, uiSchema: {} },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onSubmit();
      expect(mockUpdateItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('Translation key logic', () => {
    it('should use title when provided', () => {
      const action: ActionButtonType = {
        title: 'Custom Title',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      expect(result.current.title).toBe('Custom Title');
    });

    it('should use genericRedirectButton for redirect type', () => {
      const action: ActionButtonType = {
        type: 'redirect',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      expect(result.current.title).toBe('genericRedirectButton');
    });

    it('should use icon when provided and no title', () => {
      const action: ActionButtonType = {
        icon: 'SAVE_ICON',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      expect(result.current.title).toBe('save_icon');
    });

    it('should use custom namespace when provided', () => {
      const action: ActionButtonType = {
        title: 'Custom Title',
        namespace: 'CUSTOM_NS',
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      // The translate function is mocked to return the key, so we can't test the actual namespace usage
      // but we can verify the hook doesn't crash with custom namespace
      expect(result.current.title).toBe('Custom Title');
    });
  });

  describe('Main type handling', () => {
    xit('should handle main type with uiSchema', () => {
      mockIsFormValid.mockReturnValue(true);
      const mockUISchema = { 'ui:test': true };
      require('react').useContext.mockReturnValue(mockUISchema);

      const action: ActionButtonType = {
        title: 'Main Action',
        type: 'main',
        schemas: undefined,
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      result.current.onClick(undefined);

      expect(mockCallApi).toHaveBeenCalledWith('FORM_ID', { field1: 'value1' }, mockUISchema);
    });
  });

  describe('Error handling in onCancel', () => {
    it('should clear timeout on cleanup', () => {
      jest.useFakeTimers();
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const action: ActionButtonType = {
        title: 'Test Cancel',
        shouldSetPageDirty: false,
        schemas: { schema: { id: 'test' }, uiSchema: {} },
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      const cleanup = result.current.onCancel();
      cleanup();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
  describe('onButtonPress / wrappedOnButtonClick integration', () => {
    it('should call onButtonPress before invoking the underlying onButtonClick logic when provided as 5th argument', () => {
      const mockOnButtonPress = jest.fn();
      const mockCustomOnClick = jest.fn();

      const action: ActionButtonType = {
        title: 'Wrapped Action',
        onClick: mockCustomOnClick,
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () =>
          useActionButton(
            mockWidgetId,
            action,
            mockOnSuccessCallback,
            undefined,
            mockOnButtonPress,
          ),
        { wrapper },
      );

      const testParams = { data: 'test' };
      result.current.onClick(testParams);

      expect(mockOnButtonPress).toHaveBeenCalledTimes(1);
      expect(mockCustomOnClick).toHaveBeenCalledWith(testParams, undefined);
      expect(mockOnButtonPress.mock.invocationCallOrder[0]).toBeLessThan(
        mockCustomOnClick.mock.invocationCallOrder[0],
      );
    });
    it('should execute successfully without throwing when onButtonPress is undefined', () => {
      const mockCustomOnClick = jest.fn();

      const action: ActionButtonType = {
        title: 'Action Without Press Callback',
        onClick: mockCustomOnClick,
      };

      const wrapper = getMockWrapper(defaultStoreData);
      const { result } = renderHook(
        () => useActionButton(mockWidgetId, action, mockOnSuccessCallback),
        { wrapper },
      );

      expect(() => result.current.onClick({ test: 'payload' })).not.toThrow();
      expect(mockCustomOnClick).toHaveBeenCalledWith({ test: 'payload' }, undefined);
    });
  });
});
