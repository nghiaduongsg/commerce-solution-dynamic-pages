import { renderHook } from '@testing-library/react';
import useValueFrom from './useValueFrom';
import * as useFormFieldModule from '@pkg-entity/hooks/useFormField';
import * as useFormDataModule from '@pkg-common/dataResolver/useFormData';
import * as useCheckFromModule from '@pkg-common/dataResolver/useCheckFrom';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import { DataSourceSchema } from '@pkg-common/types';

jest.mock('@pkg-entity/hooks/useFormField', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@pkg-common/dataResolver/useFormData', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@pkg-common/dataResolver/useCheckFrom', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('useValueFrom ', () => {
  const widgetId = 'field1';

  const valueFromMock: DataSourceSchema = {
    type: 'API_DATA',
    applyWhen: {
      operator: 'every',
      fields: [],
    },
  };

  const setFieldValueMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFormFieldModule.default as jest.Mock).mockReturnValue({
      value: null,
      setFieldValue: setFieldValueMock,
    });

    (useFormDataModule.default as jest.Mock).mockReturnValue({
      value: 'defaultValue',
    });

    (useCheckFromModule.default as jest.Mock).mockReturnValue({
      check: true,
    });
  });

  const storeData = {
    Entities: {
      form123: {
        entityStoreId: 'form123',
        isNew: true,
        entity: {
          givenReportedFormData: {},
        },
        formData: {
          givenReportedFormData: {
            form123_fieldX: [
              { __index: 0, name: 'item1' },
              { __index: 2, name: 'item2' },
            ],
          },
        },
        lastUpdate: Date.now(),
        entityIdKey: 'id',
        url: 'registration/parties',
        entityDataAreaKey: 'partyDataArea',
      },
    },
    apiData: {},
  };

  const { wrapper } = getMockWrapperAndStore(storeData);

  it('applies defaultValue if shouldApplyValue is true', () => {
    renderHook(() => useValueFrom(widgetId, valueFromMock), { wrapper });
    expect(setFieldValueMock).toHaveBeenCalledWith('defaultValue', 'useValueFrom');
  });

  it('does not applies defaultValue if defaultValue does not have value ', () => {
    (useFormDataModule.default as jest.Mock).mockReturnValue({
      value: null,
    });
    renderHook(() => useValueFrom(widgetId, valueFromMock), { wrapper });
    expect(setFieldValueMock).not.toHaveBeenCalled();
  });

  it('does not apply value if check fails', () => {
    (useCheckFromModule.default as jest.Mock).mockReturnValue({ check: false });

    renderHook(() => useValueFrom(widgetId, valueFromMock), { wrapper });

    expect(setFieldValueMock).not.toHaveBeenCalled();
  });
});
