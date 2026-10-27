import { renderHook, act } from '@testing-library/react';
import useDefaultValueFrom from './useDefaultValueFrom';
import * as useFormFieldModule from '@pkg-entity/hooks/useFormField';
import * as useFormDataModule from '@pkg-common/dataResolver/useFormData';
import * as useCheckFromModule from '@pkg-common/dataResolver/useCheckFrom';
import * as useCodeListQueryModule from '@pkg-core/codeList/hooks/useCodeListQuery';
import * as useEntityModule from '@pkg-entity/hooks/useEntity';

jest.mock('@pkg-entity/hooks/useFormField');
jest.mock('@pkg-common/dataResolver/useFormData');
jest.mock('@pkg-common/dataResolver/useCheckFrom');
jest.mock('@pkg-core/codeList/hooks/useCodeListQuery');
jest.mock('@pkg-entity/hooks/useEntity');

describe('useDefaultValueFrom', () => {
  const widgetId = 'testWidget';

  let setFieldValueMock: jest.Mock;

  beforeEach(() => {
    setFieldValueMock = jest.fn();

    (useFormFieldModule.default as jest.Mock).mockReturnValue({
      value: undefined,
      setFieldValue: setFieldValueMock,
    });

    (useFormDataModule.default as jest.Mock).mockReturnValue({
      value: 'defaultValue',
    });

    (useCheckFromModule.default as jest.Mock).mockReturnValue({
      check: true,
    });

    (useCodeListQueryModule.default as jest.Mock).mockReturnValue(true);

    (useEntityModule.default as jest.Mock).mockReturnValue({
      extras: {},
    });
  });

  it('applies default value when no value is set', () => {
    renderHook(() => useDefaultValueFrom(widgetId, { code: 'someCode' }));

    expect(setFieldValueMock).toHaveBeenCalledWith('defaultValue', 'useDefaultValueFrom');
  });

  it('applies default value wrapped in property, when no value is set', () => {
    renderHook(() => useDefaultValueFrom(widgetId, { code: 'someCode' }, 'myProperty'));

    expect(setFieldValueMock).toHaveBeenCalledWith(
      { myProperty: 'defaultValue' },
      'useDefaultValueFrom',
    );
  });

  it('applies default value when wrapToProperty is present by default value is already an object', () => {
    (useFormDataModule.default as jest.Mock).mockReturnValue({
      value: { id: 'defaultValue' },
    });
    renderHook(() => useDefaultValueFrom(widgetId, { code: 'someCode' }, 'myProperty'));

    expect(setFieldValueMock).toHaveBeenCalledWith({ id: 'defaultValue' }, 'useDefaultValueFrom');
  });

  it('applies default value when wrapToProperty is present by default value is an object array', () => {
    (useFormDataModule.default as jest.Mock).mockReturnValue({
      value: [1, 2, 3],
    });
    renderHook(() => useDefaultValueFrom(widgetId, { code: 'someCode' }, 'myProperty'));

    expect(setFieldValueMock).toHaveBeenCalledWith([1, 2, 3], 'useDefaultValueFrom');
  });

  it('does not overwrite value in APPLY_WHEN_FIELD_VALUE_EMPTY mode if value exists', () => {
    (useFormFieldModule.default as jest.Mock).mockReturnValue({
      value: 'existingValue',
      setFieldValue: setFieldValueMock,
    });

    renderHook(() =>
      useDefaultValueFrom(widgetId, {
        code: 'someCode',
        mode: 'APPLY_WHEN_FIELD_VALUE_EMPTY',
      }),
    );

    expect(setFieldValueMock).not.toHaveBeenCalled();
  });

  it('resets valueHasChanged when mode allows overrides', () => {
    const { rerender } = renderHook(
      () =>
        useDefaultValueFrom(widgetId, {
          code: 'someCode',
          mode: 'APPLY_WHEN_FIELD_VALUE_EMPTY' as
            | 'EVERY_TIME_DEFAULT_VALUE_CHANGES'
            | 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES'
            | 'APPLY_WHEN_FIELD_VALUE_EMPTY'
            | 'ONLY_ONCE'
            | 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES_AFTER_SAVE',
        }),
      {
        initialProps: { mode: 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES' },
      },
    );

    act(() => {
      rerender({ mode: 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES' });
    });

    expect(setFieldValueMock).toHaveBeenCalledWith('defaultValue', 'useDefaultValueFrom');
  });

  it('does not apply default if applyChangeWhen is false', () => {
    (useCheckFromModule.default as jest.Mock).mockReturnValue({ check: false });

    renderHook(() =>
      useDefaultValueFrom(widgetId, {
        code: 'someCode',
        applyChangeWhen: {
          operator: 'every',
          fields: [
            {
              key: 'status',
              source: {
                type: 'ENTITY',
                code: 'statusCode',
              },
              operator: 'equals',
              checkWhen: ['active'],
            },
          ],
        },
      }),
    );

    expect(setFieldValueMock).not.toHaveBeenCalled();
  });

  it('re-applies default value when field value is cleared externally', () => {
    let currentFieldValue: string | undefined = 'defaultValue';

    (useFormFieldModule.default as jest.Mock).mockReturnValue({
      get value() {
        return currentFieldValue;
      },
      setFieldValue: setFieldValueMock,
    });
    const { rerender } = renderHook(() => useDefaultValueFrom(widgetId, { code: 'someCode' }));

    expect(setFieldValueMock).toHaveBeenCalledWith('defaultValue', 'useDefaultValueFrom');
    setFieldValueMock.mockClear();
    currentFieldValue = undefined;
    rerender();

    expect(setFieldValueMock).toHaveBeenCalledWith('defaultValue', 'useDefaultValueFrom');
  });
});
