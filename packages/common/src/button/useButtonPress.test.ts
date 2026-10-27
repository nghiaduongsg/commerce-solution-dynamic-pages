import { renderHook, act } from '@testing-library/react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsPressed } from './selectors';
import { MarkButtonPress } from './reducers';
import useButtonPress from './useButtonPress';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('./selectors', () => ({
  selectIsPressed: jest.fn(),
}));

jest.mock('./reducers', () => ({
  MarkButtonPress: jest.fn((payload) => ({ type: 'MarkButtonPress', payload })),
}));

describe('useButtonPress', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('should return the correct pressed value from selector', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useButtonPress('btn-id-1'));

    expect(selectIsPressed).toHaveBeenCalledWith('btn-id-1');
    expect(result.current.pressed).toBe(true);
  });

  it('should dispatch MarkButtonPress with the correct id', () => {
    (useSelector as unknown as jest.Mock).mockReturnValue(false);

    const { result } = renderHook(() => useButtonPress('btn-id-2'));
    act(() => {
      result.current.markButtonPress();
    });

    expect(MarkButtonPress).toHaveBeenCalledWith({ id: 'btn-id-2' });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'MarkButtonPress',
      payload: { id: 'btn-id-2' },
    });
  });
});
