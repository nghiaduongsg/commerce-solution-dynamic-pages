import { act, renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import useClearServerErrors from './useClearServerErrors';
import { ClearFormServerErrors } from '../redux/reducers';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

describe('useClearServerErrors', () => {
  it('should correctly dispatch ClearFormServerErrors action', () => {
    const mockDispatch = jest.fn();

    const mockedUsedDispatch = useDispatch as unknown as jest.Mock;
    mockedUsedDispatch.mockReturnValue(mockDispatch);

    const { result } = renderHook(() => useClearServerErrors());

    act(() => {
      result.current.clearServerErrors();
    });

    expect(mockDispatch).toHaveBeenCalledWith(ClearFormServerErrors());
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(typeof result.current.clearServerErrors).toBe('function');
  });
});
