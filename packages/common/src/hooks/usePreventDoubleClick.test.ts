import { renderHook, act } from '@testing-library/react';
import { usePreventDoubleClick } from './usePreventDoubleClick';

jest.useFakeTimers();

describe('usePreventDoubleClick', () => {
  it('should start with disabled = false', () => {
    const { result } = renderHook(() => usePreventDoubleClick());
    expect(result.current.disabled).toBe(false);
  });

  it('disable should set disabled = true', () => {
    const { result } = renderHook(() => usePreventDoubleClick());

    act(() => {
      result.current.disable();
    });

    expect(result.current.disabled).toBe(true);
  });

  it('disabled should reset to false after 500ms', () => {
    const { result } = renderHook(() => usePreventDoubleClick());

    act(() => {
      result.current.disable();
    });

    expect(result.current.disabled).toBe(true);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.disabled).toBe(false);
  });
});
