import { renderHook, act } from '@testing-library/react';
import useDebouncedAction from './useDebouncedAction';

jest.useFakeTimers();

describe('useDebouncedAction', () => {
  it('should call the action after the delay', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useDebouncedAction(action, 100));

    act(() => {
      result.current();
    });

    expect(action).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should use default delay when not provided', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useDebouncedAction(action));

    act(() => {
      result.current();
    });

    expect(action).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should debounce multiple calls within the delay window', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useDebouncedAction(action, 100));

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    expect(action).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should call the action with the correct parameters', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useDebouncedAction(action, 100));

    act(() => {
      result.current('param1', 'param2', 'param3');
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(action).toHaveBeenCalledWith('param1', 'param2', 'param3');
  });

  it('should call the action with undefined when no parameters provided', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useDebouncedAction(action, 100));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(action).toHaveBeenCalledWith(undefined, undefined, undefined);
  });

  it('should reset timer on subsequent calls', () => {
    const action = jest.fn();
    const { result } = renderHook(() => useDebouncedAction(action, 100));

    act(() => {
      result.current('first');
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });

    act(() => {
      result.current('second');
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(action).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith('second', undefined, undefined);
  });

  it('should not call action if it is undefined', () => {
    const { result } = renderHook(() => useDebouncedAction(undefined as any, 100));

    act(() => {
      result.current();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(() => {
      jest.advanceTimersByTime(100);
    }).not.toThrow();
  });
});
