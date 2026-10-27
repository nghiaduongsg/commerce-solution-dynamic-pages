import { renderHook } from '@testing-library/react';
import useClearFrom from './useClearFrom';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import useFieldReady from '@pkg-form/hooks/useFieldReady';
import { hasValue } from '@pkg-common/utils/utils';
import { compareValues } from '@pkg-form/validations/utils/widgetUtils';
import useTable from '@pkg-list/hooks/useTable';
const mockUseTable = useTable as jest.Mock;
jest.mock('@pkg-list/hooks/useTable', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@pkg-common/dataResolver/useCheckFrom');
jest.mock('@pkg-entity/hooks/useFormField');
jest.mock('@pkg-form/hooks/useFieldReady');
jest.mock('@pkg-common/utils/utils');
jest.mock('@pkg-form/validations/utils/widgetUtils');

const mockUseCheckFrom = useCheckFrom;
const mockUseFormField = useFormField;
const mockUseFieldReady = useFieldReady;
const mockHasValue = hasValue;
const mockCompareValues = compareValues;

describe('useClearFrom', () => {
  const mockSetFieldValue = jest.fn();
  const mockRemoveFilterData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseTable.mockReturnValue({
      filterData: {},
      removeFilterData: mockRemoveFilterData,
    });
    (mockUseFormField as jest.Mock).mockReturnValue({
      setFieldValue: mockSetFieldValue,
      value: null,
    });
    (mockUseCheckFrom as jest.Mock).mockReturnValue({
      check: false,
      values: {},
    });
    (mockUseFieldReady as jest.Mock).mockReturnValue(true);
    (mockHasValue as jest.Mock).mockReturnValue(false);
    (mockCompareValues as jest.Mock).mockReturnValue(false);
  });

  it('should not crash when called without clearFrom parameter', () => {
    (mockUseCheckFrom as jest.Mock).mockReturnValue({
      check: true,
      values: { field1: 'newValue' },
    });
    (mockUseFormField as jest.Mock).mockReturnValue({
      setFieldValue: mockSetFieldValue,
      value: 'existingValue',
    });
    (mockHasValue as jest.Mock)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValue(true);
    (mockCompareValues as jest.Mock).mockReturnValue(true);
    (mockUseFieldReady as jest.Mock).mockReturnValue(true);
    const { rerender } = renderHook(() => useClearFrom('testId'));
    rerender();
    expect(mockSetFieldValue).toHaveBeenCalledTimes(0);
  });

  it('should call removeFilterData when id is a filter id and conditions are met', () => {
    const mockRemoveFilterData = jest.fn();

    mockUseTable.mockReturnValue({
      filterData: { myFilterKey: 'existingValue' },
      removeFilterData: mockRemoveFilterData,
    });

    (mockUseCheckFrom as jest.Mock).mockReturnValue({
      check: true,
      values: { field1: 'newValue' },
    });

    (mockUseFormField as jest.Mock).mockReturnValue({
      setFieldValue: mockSetFieldValue,
      value: 'existingValue',
    });

    // Make sure the effect proceeds
    (mockHasValue as jest.Mock).mockImplementation(
      (v) => v !== null && v !== undefined && v !== '',
    );
    (mockCompareValues as jest.Mock).mockReturnValue(true);
    (mockUseFieldReady as jest.Mock).mockReturnValue(true);

    const { rerender } = renderHook(() =>
      useClearFrom('testId-filters_myFilterKey', {
        defaultValue: 'resetValue',
        operator: 'every',
        fields: [],
      }),
    );

    rerender();

    expect(mockRemoveFilterData).toHaveBeenCalledWith('myFilterKey');
    expect(mockSetFieldValue).not.toHaveBeenCalled();
  });

  describe('ref flows', () => {
    let mockSetFieldValue: Function;
    beforeEach(() => {
      jest.clearAllMocks();
      mockSetFieldValue = jest.fn();
      (mockUseFormField as jest.Mock).mockReturnValue({
        setFieldValue: mockSetFieldValue,
        value: 'currentValue',
      });
      (mockUseFieldReady as jest.Mock).mockReturnValue(true);
    });
    it('should set valuesRef.current to values when valuesRef has no initial value', () => {
      (mockUseCheckFrom as jest.Mock).mockReturnValue({
        check: false,
        values: { field1: 'value1', field2: 'value2' },
      });
      (mockHasValue as jest.Mock)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
        .mockReturnValue(true);
      (mockCompareValues as jest.Mock).mockReturnValue(false);
      renderHook(() =>
        useClearFrom('testId', {
          defaultValue: 'test',
          operator: 'every',
          fields: [],
        }),
      );
      expect(mockHasValue).toHaveBeenCalledTimes(4);
      expect(mockSetFieldValue).not.toHaveBeenCalled();
    });
    it('should clear field when values change and all conditions are met', () => {
      (mockUseCheckFrom as jest.Mock).mockReturnValue({
        check: true,
        values: { field1: 'newValue' },
      });
      (mockUseFormField as jest.Mock).mockReturnValue({
        setFieldValue: mockSetFieldValue,
        value: 'existingValue',
      });
      (mockHasValue as jest.Mock)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValue(true);
      (mockCompareValues as jest.Mock).mockReturnValue(true);
      (mockUseFieldReady as jest.Mock).mockReturnValue(true);
      const { rerender } = renderHook(() =>
        useClearFrom('testId', { defaultValue: 'resetValue', operator: 'every', fields: [] }),
      );
      rerender();
      expect(mockSetFieldValue).toHaveBeenCalledWith('resetValue', 'useClearFrom');
    });
  });
});
