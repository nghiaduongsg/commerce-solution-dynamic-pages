import { renderHook, act } from '@testing-library/react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useClearApiData from '@pkg-core/apiData/hooks/useClearApiData';
import { ClearAllApiData, ClearFormApiData, ClearMultipleApiData } from '../redux/reducers';
import { selectAllApisFinished } from '../redux/selectors';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../redux/reducers', () => ({
  ClearAllApiData: jest.fn(() => ({
    type: 'ClearAllApiData',
  })),
  ClearFormApiData: jest.fn(() => ({
    type: 'ClearFormApiData',
  })),
  ClearMultipleApiData: jest.fn((payload) => ({
    type: 'ClearMultipleApiData',
    payload,
  })),
}));

jest.mock('../redux/selectors', () => ({
  selectAllApisFinished: jest.fn(),
}));

describe('useClearApiData', () => {
  const dispatchMock = jest.fn();
  const selectorMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useDispatch as any as jest.Mock).mockReturnValue(dispatchMock);
    (selectAllApisFinished as jest.Mock).mockReturnValue(selectorMock);
    (useSelector as any as jest.Mock).mockReturnValue(true);
  });

  it('should return apisFinished from useSelector', () => {
    const { result } = renderHook(() => useClearApiData());

    expect(selectAllApisFinished).toHaveBeenCalledTimes(1);
    expect(useSelector).toHaveBeenCalledWith(selectorMock, shallowEqual);
    expect(result.current.apisFinished).toBe(true);
  });

  it('should dispatch ClearFormApiData when clearFormApiData is called', () => {
    const { result } = renderHook(() => useClearApiData());

    act(() => {
      result.current.clearFormApiData();
    });

    expect(ClearFormApiData).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'ClearFormApiData',
    });
  });

  it('should dispatch ClearMultipleApiData with ids when clearMultipleApiData is called', () => {
    const ids = ['api-1', 'api-2'];
    const { result } = renderHook(() => useClearApiData());

    act(() => {
      result.current.clearMultipleApiData(ids);
    });

    expect(ClearMultipleApiData).toHaveBeenCalledTimes(1);
    expect(ClearMultipleApiData).toHaveBeenCalledWith({ ids });
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'ClearMultipleApiData',
      payload: { ids },
    });
  });

  it('should dispatch ClearAllApiData when clearAllApiData is called', () => {
    const { result } = renderHook(() => useClearApiData());

    act(() => {
      result.current.clearAllApiData();
    });

    expect(ClearAllApiData).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'ClearAllApiData',
    });
  });
});
