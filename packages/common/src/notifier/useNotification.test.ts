import { selectNotification } from '@pkg-common/notifier/selectors';
import { useSelector } from 'react-redux';
import useNotification from '@pkg-common/notifier/useNotification';
import { renderHook } from '@testing-library/react';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));
jest.mock('./selectors', () => ({
  selectNotification: jest.fn(),
}));

const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;
const mockSelectNotification = selectNotification as jest.MockedFunction<typeof selectNotification>;

describe('useNotification Hook - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call selectNotification with the provided key', () => {
    const testKey = 'test-key';
    const mockSelectorFunction = jest.fn();

    mockSelectNotification.mockReturnValue(mockSelectorFunction);

    renderHook(() => useNotification(testKey));

    expect(mockSelectNotification).toHaveBeenCalledWith(testKey);
    expect(mockSelectNotification).toHaveBeenCalledTimes(1);
  });

  it('should return the value returned by useSelector', () => {
    const testKey = 'test-key';
    const expectedValue = 'expected-notification';

    mockUseSelector.mockReturnValue(expectedValue);

    const { result } = renderHook(() => useNotification(testKey));

    expect(result.current).toBe(expectedValue);
  });
});
