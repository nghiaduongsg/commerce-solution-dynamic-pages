import { renderHook } from '@testing-library/react';
import useCalculate from './useCalculate';
import useFormField from '@pkg-entity/hooks/useFormField';
import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import { CheckFromSchemaWithPrecision } from '@pkg-common/types';

jest.mock('@pkg-entity/hooks/useFormField');
jest.mock('@pkg-common/dataResolver/useMultipleFormData');

describe('useCalculate hook', () => {
  const setFieldValueMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useFormField as jest.Mock).mockReturnValue({
      setFieldValue: setFieldValueMock,
    });
  });

  it('calculates sum (add) correctly', () => {
    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 2, b: 3 });
    const from = {
      operator: 'add',
      fields: [],
      precision: 2,
    } as unknown as CheckFromSchemaWithPrecision;

    const { rerender } = renderHook(() => useCalculate('test-id', from));
    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 2, b: 3, c: 1 });
    rerender();

    expect(setFieldValueMock).toHaveBeenCalledWith(6, 'useCalculate'); // 2+3+1
  });

  it('calculates multiplication correctly', () => {
    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 2, b: 3 });
    const from = {
      operator: 'multiply',
      fields: [],
      precision: 2,
    } as unknown as CheckFromSchemaWithPrecision;

    const { rerender } = renderHook(() => useCalculate('test-id', from));

    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 2, b: 3, c: 2 });
    rerender();

    expect(setFieldValueMock).toHaveBeenCalledWith(12, 'useCalculate'); // 2*3*2
  });

  it('calculates percentage correctly', () => {
    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 50, b: 2 });
    const from = {
      operator: 'percentage',
      fields: [],
      precision: 2,
    } as unknown as CheckFromSchemaWithPrecision;

    const { rerender } = renderHook(() => useCalculate('test-id', from));
    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 50, b: 2, c: 1 });
    rerender();

    expect(setFieldValueMock).toHaveBeenCalledWith(1, 'useCalculate');
  });

  it('sets undefined if some values are missing', () => {
    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 2, b: 3 });
    const from = {
      operator: 'add',
      fields: [],
      precision: 2,
    } as unknown as CheckFromSchemaWithPrecision;

    const { rerender } = renderHook(() => useCalculate('test-id', from));

    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 2, b: undefined });
    rerender();

    expect(setFieldValueMock).toHaveBeenCalledWith(undefined, 'useCalculate');
  });

  it('respects precision', () => {
    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 0.1, b: 0.2 });
    const from = {
      operator: 'add',
      fields: [],
      precision: 1,
    } as unknown as CheckFromSchemaWithPrecision;

    const { rerender } = renderHook(() => useCalculate('test-id', from));

    (useMultipleFormData as jest.Mock).mockReturnValue({ a: 0.1, b: 0.2, c: 0.05 });
    rerender();

    // 0.1 + 0.2 + 0.05 = 0.35 → precision 1 → 0.4
    expect(setFieldValueMock).toHaveBeenCalledWith(0.4, 'useCalculate');
  });
});
