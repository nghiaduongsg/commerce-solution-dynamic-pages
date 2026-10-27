import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import useApiLoadedData from './useApiLoadedData';
import { equalityCheck } from '@pkg-common/utils/utils';
import { selectApiData } from '@pkg-core/apiData/redux/selectors';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('@pkg-common/utils/utils', () => ({
  equalityCheck: jest.fn(),
}));

jest.mock('@pkg-core/apiData/redux/selectors', () => ({
  selectApiData: jest.fn(),
}));

describe('useApiLoadedData', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return data from Redux selector', () => {
    const mockData = { id: '123', name: 'Test Data' };
    const mockSelector = jest.fn();

    (selectApiData as jest.Mock).mockReturnValue(mockSelector);
    (useSelector as any as jest.Mock).mockReturnValue(mockData);

    const { result } = renderHook(() => useApiLoadedData('test-id'));

    expect(result.current).toEqual(mockData);
  });

  it('should call useSelector with correct selector and equality check', () => {
    const mockSelector = jest.fn();

    (selectApiData as jest.Mock).mockReturnValue(mockSelector);
    (useSelector as any as jest.Mock).mockReturnValue({});

    renderHook(() => useApiLoadedData('test-id'));

    expect(selectApiData).toHaveBeenCalledWith('test-id');
    expect(useSelector).toHaveBeenCalledWith(mockSelector, equalityCheck);
  });

  it('should memoize the returned data', () => {
    const mockData = { id: '123', name: 'Test Data' };
    const mockSelector = jest.fn();

    (selectApiData as jest.Mock).mockReturnValue(mockSelector);
    (useSelector as any as jest.Mock).mockReturnValue(mockData);

    const { result, rerender } = renderHook(() => useApiLoadedData('test-id'));
    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult);
  });

  it('should update memoized value when data changes', () => {
    const initialData = { id: '1', name: 'Data 1' };
    const updatedData = { id: '2', name: 'Data 2' };
    const mockSelector = jest.fn();

    (selectApiData as jest.Mock).mockReturnValue(mockSelector);
    (useSelector as any as jest.Mock)
      .mockReturnValueOnce(initialData)
      .mockReturnValueOnce(updatedData);

    const { result, rerender } = renderHook(({ id }) => useApiLoadedData(id), {
      initialProps: { id: 'test-id' },
    });

    expect(result.current).toEqual(initialData);

    rerender({ id: 'test-id' });

    expect(result.current).toEqual(updatedData);
  });

  it('should handle undefined data', () => {
    const mockSelector = jest.fn();

    (selectApiData as jest.Mock).mockReturnValue(mockSelector);
    (useSelector as any as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useApiLoadedData('test-id'));

    expect(result.current).toBeUndefined();
  });

  it('should handle null data', () => {
    const mockSelector = jest.fn();

    (selectApiData as jest.Mock).mockReturnValue(mockSelector);
    (useSelector as any as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useApiLoadedData('test-id'));

    expect(result.current).toBeNull();
  });
});
