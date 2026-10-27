import { renderHook, act } from '@testing-library/react';
import { useButtonClick } from './useButtonClick';
import { usePreventDoubleClick } from '@pkg-common/hooks/usePreventDoubleClick';

jest.mock('@pkg-common/hooks/usePreventDoubleClick');

describe('useButtonClick', () => {
  const disableMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePreventDoubleClick as jest.Mock).mockReturnValue({
      disabled: false,
      disable: disableMock,
    });
  });

  it('should set clicked to true when warning exists', () => {
    const { result } = renderHook(() => useButtonClick({ some: 'warning' }, jest.fn()));

    act(() => {
      result.current.onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
    });

    expect(result.current.clicked).toBe(true);
    expect(disableMock).not.toHaveBeenCalled();
  });

  it('should call onClick and disable when no warning', () => {
    const onClick = jest.fn();
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();

    const { result } = renderHook(() => useButtonClick(undefined, onClick));

    act(() => {
      result.current.onButtonClick({ preventDefault, stopPropagation });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(disableMock).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
    expect(result.current.clicked).toBe(false);
  });

  it('should NOT call onClick when openInNewTab is truthy', () => {
    const onClick = jest.fn();
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();

    const { result } = renderHook(() => useButtonClick(undefined, onClick, undefined, true));

    act(() => {
      result.current.onButtonClick({ preventDefault, stopPropagation });
    });

    expect(preventDefault).not.toHaveBeenCalled();
    expect(stopPropagation).not.toHaveBeenCalled();
    expect(disableMock).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    expect(result.current.clicked).toBe(false);
  });

  it('onConfirm should call onClick and disable', () => {
    const onClick = jest.fn();
    const { result } = renderHook(() => useButtonClick(undefined, onClick));

    act(() => {
      result.current.onConfirm({ type: 'confirm' });
    });

    expect(onClick).toHaveBeenCalledWith({ type: 'confirm' });
    expect(disableMock).toHaveBeenCalled();
    expect(result.current.clicked).toBe(false);
  });

  it('onCancel should reset clicked', () => {
    const { result } = renderHook(() => useButtonClick({ some: 'warn' }, jest.fn()));

    act(() => {
      result.current.onButtonClick({ preventDefault: jest.fn(), stopPropagation: jest.fn() });
    });
    expect(result.current.clicked).toBe(true);

    act(() => {
      result.current.onCancel();
    });
    expect(result.current.clicked).toBe(false);
  });
});
