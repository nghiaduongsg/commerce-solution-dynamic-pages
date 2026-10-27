import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import TextWidget from './TextWidget';
import useFormField from '@pkg-entity/hooks/useFormField';
import { renderWithProviders } from '@pkg-common/test-utils';

jest.mock('@pkg-form/validations/hooks/useTextWidgetValidations', () => ({
  __esModule: true,
  default: jest.fn(() => ({ valid: true, dirty: false, errors: [] })),
}));
jest.mock('@pkg-form/hooks/useAdditionalInfo', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    translatedMessage: 'This is my mock translated message.',
    severity: 'info',
    displayIcon: false,
    variant: 'outlined',
    isDefault: true,
    isMultiple: false,
    isTooltip: false,
  }),
}));
jest.mock('@pkg-setup/src/system/useSystem', () => ({
  __esModule: true,
  default: jest.fn(() => ({ selectedLanguage: 'en' })),
}));
let capturedOnChange = jest.fn();
jest.mock('@pkg-entity/hooks/useFormField', () => ({
  __esModule: true,
  default: jest.fn((config) => {
    if (config && config.onChange) {
      capturedOnChange = config.onChange;
    }
    return {
      value: '',
      storeValue: '',
      setFieldValue: (newValue: string | number) => capturedOnChange(newValue),
      clearFormValues: jest.fn(),
    };
  }),
}));
jest.mock('@pkg-common/dataResolver/useFormData', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    value: '123',
    current: { value: 'TestId' },
  })),
}));
jest.mock('@pkg-common/dataResolver/useCheckFrom', () => ({
  __esModule: true,
  default: jest.fn(() => ({ check: true })),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str: any) => str,
    i18n: { changeLanguage: () => new Promise(() => {}) },
  }),
}));
jest.mock('@pkg-form/hooks/useDefaultValueFrom', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockedUseFormField = useFormField as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  mockedUseFormField.mockClear();
  capturedOnChange.mockClear();
});

describe('TextWidget', () => {
  it('should render properly', () => {
    const initialReduxState = {
      form: { data: { TestId: { value: 'Initial Value From Mock Store' } } },
    };
    renderWithProviders(
      initialReduxState,
      <TextWidget
        id="TestId"
        schema={{ type: ['string', 'number'] }}
        uiSchema={{
          'ui:information': {
            severity: 'warning',
            displayIcon: true,
            namespace: 'TestPage',
          },
        }}
        label="TestLabel"
        componentName="TextWidget"
        value=""
        onChange={() => {}}
        formContext={{
          formId: 'TestForm',
          idKey: 'TestId',
          namespace: 'TestNamespace',
          avoidDefaultLoad: false,
        }}
        options={{
          showLabel: true,
          validations: {
            required: false,
            minLength: 1,
            maxLength: 255,
            minValue: 1,
            maxValue: 100,
          },
          mask: {
            pattern: '',
            prefixFrom: {
              operator: 'every',
              fields: [{ key: 'TestId', source: {} }],
              source: {},
            },
          },
          allowCardItemDialogActionsFrom: undefined,
          withTyping: false,
          multiline: true,
          endAdornment: <div>Test</div>,
          startAdornment: <div>Hello</div>,
          uniqueFields: 'Hello',
          uniqueFieldsIf: false,
          multiple: false,
          apiValues: { url: 'http://localhost:8080' },
          translation: {
            key: 'translatableKey',
            helpText: 'This is a translatable text',
          },
          omitValidationHints: false,
        }}
      />,
    );

    const widget = screen?.getByText(123);
    expect(widget).toBeInTheDocument();
  });
  it('should invoke the form events (onFocus,onBlur,onChange)', async () => {
    const initialReduxState = {
      form: { data: { TestId: { value: 'Initial Value From Mock Store' } } },
    };
    const { user } = renderWithProviders(
      initialReduxState,
      <TextWidget
        id="TestId"
        schema={{}}
        uiSchema={{}}
        onChange={capturedOnChange}
        label="TestLabel"
        componentName="TextWidget"
        value=""
        formContext={{
          formId: 'TestForm',
          idKey: 'TestId',
          namespace: 'TestNamespace',
          avoidDefaultLoad: false,
          dataTestId: 'TextWidgetTestId',
          mechanism: 'DEFAULT',
        }}
        options={{
          validations: {
            required: true,
            minLength: 1,
            maxLength: 255,
            minValue: 1,
            maxValue: 100,
          },
          allowCardItemDialogActionsFrom: undefined,
          withTyping: false,
          endAdornment: <div>Test</div>,
          startAdornment: <div>Hello</div>,
          uniqueFields: 'Hello',
          uniqueFieldsIf: false,
          multiple: true,
          apiValues: { url: 'http://localhost:8080' },
          translation: {
            key: 'translatableKey',
            helpText: 'This is a translatable text',
          },
          omitValidationHints: false,
        }}
      />,
    );
    const widget = screen?.getByTestId(/TextWidgetTestId/i);
    const typedValue = 'hello world';

    await waitFor(async () => {
      await user?.click(widget);
      await user?.type(widget, typedValue);
      await user?.tab();
    });

    expect(widget).toBeInTheDocument();
    //The onChange will be captured 11 times once for each keystroke of the "hello world" string + the space
    expect(capturedOnChange).toHaveBeenCalledTimes(11);
  });
  it('should trigger TextWidgetValidations hook', async () => {
    const initialReduxState = {
      form: { data: { TestId: { value: 'Initial Value From Mock Store' } } },
    };
    const { user } = renderWithProviders(
      initialReduxState,
      <TextWidget
        id="TestId"
        schema={{}}
        uiSchema={{}}
        onChange={capturedOnChange}
        label="TestLabel"
        componentName="TextWidget"
        value=""
        formContext={{
          formId: 'TestForm',
          idKey: 'TestId',
          namespace: 'TestNamespace',
          avoidDefaultLoad: false,
          dataTestId: 'TextWidgetTestId',
          mechanism: 'DEFAULT',
        }}
        options={{
          validations: {
            required: true,
            minLength: 1,
            maxLength: 3,
            minValue: 1,
            maxValue: 100,
          },
          allowCardItemDialogActionsFrom: undefined,
          withTyping: false,
          endAdornment: <div>Test</div>,
          startAdornment: <div>Hello</div>,
          uniqueFields: 'Hello',
          uniqueFieldsIf: false,
          multiple: true,
          apiValues: { url: 'http://localhost:8080' },
          translation: {
            key: 'translatableKey',
            helpText: 'This is a translatable text',
          },
          omitValidationHints: false,
        }}
      />,
    );
    const widget = screen?.getByTestId(/TextWidgetTestId/i);
    const typedValue = 'hello world';
    await waitFor(async () => await user?.type(widget, typedValue));
    expect(widget).toBeInvalid();
  });

  const renderWidget = ({ type = 'integer', value = '' } = {}) => {
    return renderWithProviders(
      {},
      <TextWidget
        id="TestId"
        schema={{ type }}
        uiSchema={{}}
        onChange={capturedOnChange}
        label="TestLabel"
        componentName="TextWidget"
        value={value}
        formContext={{
          formId: 'TestForm',
          idKey: 'TestId',
          namespace: 'TestNamespace',
          avoidDefaultLoad: false,
          dataTestId: 'TextWidgetTestId',
          mechanism: 'DEFAULT',
        }}
        options={{
          validations: {
            required: true,
            minLength: 1,
            maxLength: 3,
            minValue: 1,
            maxValue: 100,
          },
          allowCardItemDialogActionsFrom: undefined,
          withTyping: false,
          endAdornment: <div>Test</div>,
          startAdornment: <div>Hello</div>,
          uniqueFields: 'Hello',
          uniqueFieldsIf: false,
          multiple: true,
          apiValues: { url: 'http://localhost:8080' },
          translation: {
            key: 'translatableKey',
            helpText: 'This is a translatable text',
          },
          omitValidationHints: false,
        }}
      />,
    );
  };

  it('should strip decimals for integer type', async () => {
    renderWidget({ type: 'integer' });

    const widget = screen.getByRole('spinbutton');

    fireEvent.change(widget, { target: { value: '1.32' } });

    expect(capturedOnChange).toHaveBeenLastCalledWith(132);
  });

  it('should allow negative integers', async () => {
    renderWidget({ type: 'integer' });

    const widget = screen.getByRole('spinbutton');

    fireEvent.change(widget, { target: { value: '-12' } });

    expect(capturedOnChange).toHaveBeenLastCalledWith(-12);
  });

  it('should ignore non-numeric characters for integer', async () => {
    renderWidget({ type: 'integer' });

    const widget = screen.getByRole('spinbutton');

    fireEvent.change(widget, { target: { value: 'a' } });

    expect(capturedOnChange).not.toHaveBeenCalled();
  });

  it('should allow decimals for number type', async () => {
    renderWidget({ type: 'number' });

    const widget = screen.getByRole('spinbutton');

    fireEvent.change(widget, { target: { value: '1.23' } });

    expect(capturedOnChange).toHaveBeenLastCalledWith(1.23);
  });

  it('should call setFieldValue with uppercased value on blur when textToUppercase is true', async () => {
    const initialReduxState = {
      form: { data: { TestId: { value: 'Initial Value From Mock Store' } } },
    };
    renderWithProviders(
      initialReduxState,
      <TextWidget
        id="TestId"
        schema={{}}
        uiSchema={{}}
        onChange={capturedOnChange}
        label="TestLabel"
        componentName="TextWidget"
        value=""
        formContext={{
          formId: 'TestForm',
          idKey: 'TestId',
          namespace: 'TestNamespace',
          avoidDefaultLoad: false,
          dataTestId: 'TextWidgetTestId',
          mechanism: 'DEFAULT',
        }}
        options={{
          textToUppercase: true,
          validations: {
            required: true,
            minLength: 1,
            maxLength: 255,
            minValue: 1,
            maxValue: 100,
          },
          allowCardItemDialogActionsFrom: undefined,
          withTyping: false,
          endAdornment: <div>Test</div>,
          startAdornment: <div>Hello</div>,
          uniqueFields: 'Hello',
          uniqueFieldsIf: false,
          multiple: true,
          apiValues: { url: 'http://localhost:8080' },
          translation: {
            key: 'translatableKey',
            helpText: 'This is a translatable text',
          },
          omitValidationHints: false,
        }}
      />,
    );
    const widget = screen?.getByTestId(/TextWidgetTestId/i);

    fireEvent.blur(widget, { target: { value: 'hello' } });

    expect(capturedOnChange).toHaveBeenLastCalledWith('HELLO');
  });
});
