import { act, renderHook, waitFor } from '@testing-library/react';
import useMask from './useMask';
import * as useFormDataModule from '@pkg-common/dataResolver/useFormData';
import * as useCheckFromModule from '@pkg-common/dataResolver/useCheckFrom';
import * as reactImaskModule from 'react-imask';

jest.mock('@pkg-common/dataResolver/useFormData');
jest.mock('@pkg-common/dataResolver/useCheckFrom');
jest.mock('react-imask', () => ({
  IMask: { MaskedRange: jest.fn() },
  useIMask: jest.fn(),
}));

describe('useMask hook', () => {
  const onChangeMock = jest.fn();
  let capturedOnComplete: ((value: string) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnComplete = null;
    (useFormDataModule.default as jest.Mock).mockReturnValue({ value: 'PREFIX' });
    (useCheckFromModule.default as jest.Mock).mockReturnValue({ check: true });
    (reactImaskModule.useIMask as jest.Mock).mockImplementation((_options, callbacks) => {
      capturedOnComplete = callbacks?.onComplete || null;
      return {
        ref: { current: null },
        value: '',
        unmaskedValue: '',
      };
    });
  });

  it('should return shouldApplyMask = true when check passes', () => {
    const { result } = renderHook(() => useMask('field1', { pattern: 'mm/dd' }, onChangeMock));
    expect(result.current.shouldApplyMask).toBe(true);
  });

  it('should not apply mask if useCheckFrom returns false', () => {
    (useCheckFromModule.default as jest.Mock).mockReturnValue({ check: false });
    const { result } = renderHook(() => useMask('field1', { pattern: 'mm/dd' }, onChangeMock));
    expect(result.current.shouldApplyMask).toBe(false);
  });

  it('should handle HH:mm pattern correctly', () => {
    const { result } = renderHook(() => useMask('field1', { pattern: 'HH:mm' }, onChangeMock));

    expect(result.current.shouldApplyMask).toBe(true);
  });

  it('should handle custom mask patterns', () => {
    const { result } = renderHook(() => useMask('field1', { pattern: 'XXX-999' }, onChangeMock));

    expect(result.current.shouldApplyMask).toBe(true);
  });

  it('should handle onComplete callback with prefix scenarios', async () => {
    const maskProps = {
      pattern: 'test-pattern',
      prefixFrom: { key: 'testKey', source: { field: 'testField' } },
      key: 'testKey',
      source: { field: 'testField' },
    } as any;
    renderHook(() => useMask('field1', maskProps, onChangeMock));
    act(() => capturedOnComplete?.('PREFIX-123-456'));
    await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith('PREFIX123456'));
    onChangeMock.mockClear();
    act(() => capturedOnComplete?.('123-456'));
    await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith('PREFIX123456'));
    onChangeMock.mockClear();
    renderHook(() => useMask('field1', { pattern: 'test-pattern' }, onChangeMock));
    act(() => capturedOnComplete?.('123-456'));
    await waitFor(() => expect(onChangeMock).toHaveBeenCalledWith('123456'));
  });
});
