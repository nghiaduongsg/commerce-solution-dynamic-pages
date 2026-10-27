import { renderHook } from '@testing-library/react';
import useApiDataState from './useApiDataState';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import { ClearApiData, SetApiData, CallApi } from '@pkg-core/apiData/redux/reducers';
import { act } from 'react';

describe('useApiDataState', () => {
  const storeData = {
    ApiData: {
      A: {
        loading: true,
        refreshId: 15,
        data: { a: 'a' },
      },
      B: {
        loading: false,
        error: {
          message: 'error',
        },
      },
    },
  };

  const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);

  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('useSelector loading', () => {
    const { result } = renderHook(() => useApiDataState('A'), { wrapper });
    const { loading } = result.current;

    expect(loading).toEqual(true);
  });

  it('useSelector hasError', () => {
    const { result } = renderHook(() => useApiDataState('B'), { wrapper });
    const { hasError } = result.current;

    expect(hasError).toEqual(true);
  });

  it('useSelector errorMessage', () => {
    const { result } = renderHook(() => useApiDataState('B'), { wrapper });
    const { errorMessage } = result.current;

    expect(errorMessage).toEqual('error');
  });

  it('useSelector refreshId', () => {
    const { result } = renderHook(() => useApiDataState('A'), { wrapper });
    const { refreshId } = result.current;

    expect(refreshId).toEqual(15);
  });

  it('useSelector data', () => {
    const { result } = renderHook(() => useApiDataState('A'), { wrapper });
    const { data } = result.current;

    expect(data).toEqual({ a: 'a' });
  });

  it('should dispatch action ClearApiData when "clearApiData" is called', () => {
    const { result } = renderHook(() => useApiDataState('B'), { wrapper });
    const { clearApiData } = result.current;

    clearApiData();

    expect(dispatchStub).toHaveBeenCalledWith(ClearApiData({ id: 'B' }));
  });

  it('should dispatch action SetApiData when "setApiData" is called', () => {
    const { result } = renderHook(() => useApiDataState('A'), { wrapper });
    const { setApiData } = result.current;
    const payload = { id: 'A', data: { b: 'b' } };

    setApiData(payload);

    expect(dispatchStub).toHaveBeenCalledWith(SetApiData(payload));
  });

  it('should dispatch action CallApi when "callApi" is called', () => {
    const { result } = renderHook(() => useApiDataState('A'), { wrapper });
    const { callApi } = result.current;

    const payload = {
      id: 'id',
      pageId: 'pageId',
      url: 'url',
      method: 'get',
      data: 'data',
      queryParams: 'queryParams',
      saveAs: 'saveAS',
    };

    callApi(payload);

    expect(dispatchStub).toHaveBeenCalledTimes(1);

    const thunk = dispatchStub.mock.calls[0][0];
    expect(typeof thunk).toBe('function');

    // Execute the thunk to trigger the inner dispatch
    thunk(dispatchStub);

    // Now check the second dispatch call (the pending action)
    const pendingAction = dispatchStub.mock.calls[1][0];
    expect(pendingAction.type).toBe('ApiData/CallApi/pending');
    expect(pendingAction.meta.arg).toEqual(payload);
  });
});
