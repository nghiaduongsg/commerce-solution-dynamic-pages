import React from 'react';
import { render, screen } from '@testing-library/react';
import MainButton from './MainButton';
import { MainButtonProps } from './types.d';
import * as usePageModule from '@pkg-layout/src/common/hooks/usePage';
import * as useChangesConfirmationModule from '@pkg-common/components/ChangesConfirmation/useChangesConfirmation';
import * as useMultipleFormDataModule from '@pkg-common/dataResolver/useMultipleFormData';
import * as usePermissionsModule from '@pkg-setup/src/user/usePermissions';
import * as useSystemModule from '@pkg-setup/src/system/useSystem';
import * as useValidationsContextModule from '@pkg-form/validations/ValidationsContext';
import * as useFormManagerContextModule from '@pkg-form/FormManagerContext';
import * as useNotifiersModule from '@pkg-common/notifier/useNotifiers';
import * as useClearServerErrorsModule from '@pkg-form/validations/hooks/useClearServerErrors';
import * as useActionButtonModule from '@pkg-common/components/AppActions/useActionButton';
import * as usePreventDoubleClickModule from '@pkg-common/hooks/usePreventDoubleClick';
import * as useDebouncedActionModule from '@pkg-common/hooks/useDebouncedAction';

const mockUseMultipleFormData = useMultipleFormDataModule.default as jest.MockedFunction<
  typeof useMultipleFormDataModule.default
>;

const mockUsePage = usePageModule.default as jest.MockedFunction<typeof usePageModule.default>;
const mockUseChangesConfirmation = useChangesConfirmationModule.default as jest.MockedFunction<
  typeof useChangesConfirmationModule.default
>;
const mockUsePermissions = usePermissionsModule.default as jest.MockedFunction<
  typeof usePermissionsModule.default
>;
const mockUseSystem = useSystemModule.default as jest.MockedFunction<
  typeof useSystemModule.default
>;
const mockUseValidationsContext =
  useValidationsContextModule.useValidationsContext as jest.MockedFunction<
    typeof useValidationsContextModule.useValidationsContext
  >;
const mockUseFormManagerContext =
  useFormManagerContextModule.useFormManagerContext as jest.MockedFunction<
    typeof useFormManagerContextModule.useFormManagerContext
  >;
const mockUseNotifiers = useNotifiersModule.default as jest.MockedFunction<
  typeof useNotifiersModule.default
>;
const mockUseClearServerErrors = useClearServerErrorsModule.default as jest.MockedFunction<
  typeof useClearServerErrorsModule.default
>;
const mockUseActionButton = useActionButtonModule.default as jest.MockedFunction<
  typeof useActionButtonModule.default
>;
const mockUsePreventDoubleClick =
  usePreventDoubleClickModule.usePreventDoubleClick as jest.MockedFunction<
    typeof usePreventDoubleClickModule.usePreventDoubleClick
  >;
const mockUseDebouncedAction = useDebouncedActionModule.default as jest.MockedFunction<
  typeof useDebouncedActionModule.default
>;

jest.mock('@pkg-layout/src/common/hooks/usePage', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-common/components/ChangesConfirmation/useChangesConfirmation', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-common/dataResolver/useMultipleFormData', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-setup/src/user/usePermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-setup/src/system/useSystem', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-form/validations/ValidationsContext', () => ({
  useValidationsContext: jest.fn(),
}));

jest.mock('@pkg-form/FormManagerContext', () => ({
  useFormManagerContext: jest.fn(),
}));

jest.mock('@pkg-common/notifier/useNotifiers', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-form/validations/hooks/useClearServerErrors', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-common/components/AppActions/useActionButton', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-common/hooks/usePreventDoubleClick', () => ({
  usePreventDoubleClick: jest.fn(),
}));

jest.mock('@pkg-common/hooks/useDebouncedAction', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-common/dataResolver/useCheckFrom', () => ({
  __esModule: true,
  default: jest.fn(() => ({ check: true, values: {} })),
}));

jest.mock('@pkg-common/components/GenericButton/GenericButton', () => ({
  __esModule: true,
  default: ({ testId, disabled, label }) => (
    <button data-testid={testId} disabled={disabled}>
      {label}
    </button>
  ),
}));

jest.mock('@pkg-common/components/AssetByType/AssetByType', () => ({
  AssetByType: () => <span data-testid="asset" />,
}));

jest.mock('./MainButtonWIthContext', () => ({
  MainButtonWIthContext: () => <div data-testid="main-btn-with-context" />,
}));

jest.mock('@pkg-constants/translationNamespaces', () => ({
  ACCESSIBILITY: 'ACCESSIBILITY',
  COMMON: 'COMMON',
}));

jest.mock('@pkg-constants/validationCodes', () => ({
  commonCodes: { formErrorMessage: 'formErrorMessage' },
}));

jest.mock('@pkg-constants/keyboardShortcuts', () => ({
  SAVE_FORM_SHORTCUT: 'ctrl+s',
}));

jest.mock('@pkg-common/utils', () => ({
  hasValue: jest.fn((v) => v != null && v !== ''),
}));

jest.mock('@pkg-form/validations/utils/widgetUtils', () => ({
  getDebounceDelay: jest.fn(() => 0),
}));

type ButtonProps = NonNullable<MainButtonProps['buttonProperties']>;

const buildProps = (
  overrides: Omit<Partial<MainButtonProps>, 'buttonProperties'> & {
    buttonProperties?: Partial<ButtonProps>;
  } = {},
): MainButtonProps => {
  const { buttonProperties, ...rest } = overrides;
  return {
    id: 'form1',
    onSaveEntity: jest.fn(),
    data: undefined,
    parentPageId: '',
    buttonProperties: {
      type: 'submit',
      style: 'CLASSIC',
      icon: 'save',
      label: 'Save',
      color: 'secondary',
      markPresses: false,
      permissionKey: 'keyA',
      ...buttonProperties,
    },
    ...rest,
  };
};

describe('MainButton - permission logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSystem.mockReturnValue({ selectedLanguage: 'EN' } as any);
    mockUseValidationsContext.mockReturnValue({ isFormValid: jest.fn(() => true) } as any);
    mockUseFormManagerContext.mockReturnValue({ forceDirty: jest.fn() } as any);
    mockUseNotifiers.mockReturnValue({ enqueueSnackbar: jest.fn() } as any);
    mockUseClearServerErrors.mockReturnValue({ clearServerErrors: jest.fn() } as any);
    mockUseActionButton.mockReturnValue({ onSubmit: jest.fn() } as any);
    mockUsePreventDoubleClick.mockReturnValue({ disabled: false, disable: jest.fn() });
    mockUseDebouncedAction.mockImplementation((fn) => fn);
    mockUseMultipleFormData.mockReturnValue({});
    mockUsePermissions.mockReturnValue(true);
    mockUsePage.mockReturnValue({ 'ui:page': {} });
    mockUseChangesConfirmation.mockReturnValue({
      showConfirm: false,
      handleButtonClick: jest.fn(),
      confirmDialog: null,
    });
  });

  describe('useMultipleFormData called with permissionKey.replacements', () => {
    it('passes the object permissionKey replacements to useMultipleFormData', () => {
      const replacements = [{ type: 'state', path: 'user.id' }];
      const props = buildProps({
        buttonProperties: { permissionKey: { replacements } as any },
      });

      render(<MainButton {...props} />);

      expect(mockUseMultipleFormData).toHaveBeenCalledWith('form1', replacements, false);
    });

    it('passes undefined replacements when permissionKey is a string', () => {
      const props = buildProps({
        buttonProperties: { permissionKey: 'stringKey' },
      });

      render(<MainButton {...props} />);

      expect(mockUseMultipleFormData).toHaveBeenCalledWith('form1', undefined, false);
    });
  });

  describe('usePermissions called with resolved replacementValues', () => {
    it('passes the permissionKey and replacementValues to usePermissions', () => {
      const replacementValues = { userId: 123 };
      mockUseMultipleFormData.mockReturnValue(replacementValues);
      const props = buildProps({
        buttonProperties: { permissionKey: 'keyA' },
      });

      render(<MainButton {...props} />);

      expect(mockUsePermissions).toHaveBeenCalledWith('keyA', replacementValues);
    });

    it('uses the default permissionKey when none is provided', () => {
      const replacementValues = { userId: 123 };
      mockUseMultipleFormData.mockReturnValue(replacementValues);
      const props = buildProps({
        buttonProperties: { permissionKey: undefined },
      });

      render(<MainButton {...props} />);

      expect(mockUseMultipleFormData).toHaveBeenCalledWith('form1', undefined, false);
      expect(mockUsePermissions).toHaveBeenCalledWith('defaultItemActions', replacementValues);
    });

    it('resolves object permissionKey replacements and passes them to usePermissions', () => {
      const replacements = [{ type: 'state', path: 'user.id' }];
      const replacementValues = { userId: 123 };
      mockUseMultipleFormData.mockReturnValue(replacementValues);
      const props = buildProps({
        buttonProperties: { permissionKey: { replacements } as any },
      });

      render(<MainButton {...props} />);

      expect(mockUseMultipleFormData).toHaveBeenCalledWith('form1', replacements, false);
      expect(mockUsePermissions).toHaveBeenCalledWith({ replacements }, replacementValues);
    });
  });

  describe('permission drives the disabled state', () => {
    it('disables the button when usePermissions returns false', () => {
      mockUsePermissions.mockReturnValue(false);
      const props = buildProps();

      render(<MainButton {...props} />);

      expect(screen.getByTestId('form1-form-btn')).toBeDisabled();
    });

    it('enables the button when usePermissions returns true', () => {
      mockUsePermissions.mockReturnValue(true);
      const props = buildProps();

      render(<MainButton {...props} />);

      expect(screen.getByTestId('form1-form-btn')).toBeEnabled();
    });
  });
});
