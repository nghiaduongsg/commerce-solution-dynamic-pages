import { renderHook, act } from '@testing-library/react';
import { useSelector, useDispatch } from 'react-redux';
import useLatestButtonAction from './useLatestButtonAction';
import { selectLatestButtonAction } from './selectors';
import { SetLatestButtonPress, ClearLatestButtonPress } from './reducers';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('./selectors', () => ({
  selectLatestButtonAction: jest.fn(),
}));

jest.mock('./reducers', () => ({
  SetLatestButtonPress: jest.fn((payload) => ({
    type: 'ButtonPress/SetLatestButtonPress',
    payload,
  })),
  ClearLatestButtonPress: jest.fn(() => ({
    type: 'ButtonPress/ClearLatestButtonPress',
  })),
}));

describe('useLatestButtonAction', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('should return the latestButtonAction value from the selector', () => {
    const testActionId = 'action-id-123';
    (useSelector as unknown as jest.Mock).mockReturnValue(testActionId);

    const { result } = renderHook(() => useLatestButtonAction());

    expect(selectLatestButtonAction).toHaveBeenCalled();

    expect(result.current.latestButtonAction).toBe(testActionId);
  });

  it('should return undefined when the selector returns undefined', () => {
    // Configure the mock useSelector to return undefined
    (useSelector as unknown as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useLatestButtonAction());

    expect(result.current.latestButtonAction).toBeUndefined();
  });

  it('should dispatch SetLatestButtonPress when setLatestButtonAction is called', () => {
    const testActionId = 'new-action-id-456';

    const { result } = renderHook(() => useLatestButtonAction());

    act(() => {
      result.current.setLatestButtonAction(testActionId);
    });

    expect(SetLatestButtonPress).toHaveBeenCalledWith({ actionId: testActionId });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ButtonPress/SetLatestButtonPress',
      payload: { actionId: testActionId },
    });
  });

  it('should dispatch ClearLatestButtonPress when clearLatestButtonAction is called', () => {
    const { result } = renderHook(() => useLatestButtonAction());

    act(() => {
      result.current.clearLatestButtonAction();
    });

    expect(ClearLatestButtonPress).toHaveBeenCalled();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ButtonPress/ClearLatestButtonPress',
    });
  });
});
