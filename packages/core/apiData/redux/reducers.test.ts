import ApiDataReducer, {
  CALL_API_FULFILLED,
  CALL_API_PENDING,
  CALL_API_REJECTED,
  CallApi,
} from './reducers';
import { mockDate } from '@_jestHelpers/dateMock';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('ApiData Reducer', () => {
  mockDate(1234);

  it('should return the defaultState when no action is passed', () => {
    const state = {
      A: {},
      B: {},
    };

    expect(ApiDataReducer(state, { type: '' })).toEqual(state);
  });

  it('ApiData/CallApi/pending', () => {
    const state = {
      A: {},
    };

    const action = {
      type: CALL_API_PENDING,
      meta: {
        arg: {
          id: 'B',
          url: 'http/some/url',
          method: 'post',
          data: { prop: 'prop' },
        },
      },
    };

    const expected = {
      A: {},
      B: {
        loading: true,
        finished: false,
      },
    };
    expect(ApiDataReducer(state, action)).toEqual(expected);
  });

  it('ApiData/CallApi/fulfilled', () => {
    const state = {
      A: {},
    };

    const action = {
      type: CALL_API_FULFILLED,
      payload: {
        id: 'B',
        data: { prop: 'prop' },
      },
    };

    const expected = {
      A: {},
      B: {
        loading: false,
        data: { prop: 'prop' },
        refreshId: 1234,
        finished: true,
      },
    };
    expect(ApiDataReducer(state, action)).toEqual(expected);
  });

  it('ApiData/CallApi/rejected', () => {
    const state = {
      A: {},
    };

    const action = {
      type: CALL_API_REJECTED,
      payload: {
        id: 'B',
        error: { message: 'error' },
      },
    };

    const expected = {
      A: {},
      B: {
        loading: false,
        error: { message: 'error' },
        finished: true,
      },
    };
    expect(ApiDataReducer(state, action)).toEqual(expected);
  });

  it('ApiData/ClearApiData', () => {
    const state = {
      A: {},
      B: {
        loading: false,
        data: {
          prop: 'some data',
        },
      },
    };

    const action = {
      type: 'ApiData/ClearApiData',
      payload: {
        id: 'B',
      },
    };

    const expected = {
      A: {},
    };
    expect(ApiDataReducer(state, action)).toEqual(expected);
  });

  it('ApiData/ClearAllApiData', () => {
    const state = {
      A: {},
      B: {
        loading: false,
        data: {
          prop: 'some data',
        },
      },
      C: {
        loading: false,
        error: { message: 'error' },
      },
      D_SCHEMAS: {
        loading: false,
        data: { someData: 'data' },
      },
    };

    const action = {
      type: 'ApiData/ClearAllApiData',
    };

    const expected = {
      D_SCHEMAS: {
        loading: false,
        data: { someData: 'data' },
      },
    };
    expect(ApiDataReducer(state, action)).toEqual(expected);
  });

  it('ApiData/ClearFormApiData', () => {
    const state = {
      USER_ACCESS_PERMISSIONS: {
        data: ['VIEW', 'UPDATE'],
        finished: true,
      },
      FormData_Type: {
        loading: false,
        data: {
          name: 'BusReg',
        },
      },
      SCHEMAS: {
        loading: false,
        data: { schema: 'definition' },
      },
    };

    const action = {
      type: 'ApiData/ClearFormApiData',
    };

    const expected = {
      USER_ACCESS_PERMISSIONS: {
        data: ['VIEW', 'UPDATE'],
        finished: true,
      },
      SCHEMAS: {
        loading: false,
        data: { schema: 'definition' },
      },
    };

    expect(ApiDataReducer(state, action)).toEqual(expected);
  });

  it('ApiData/SetApiData', () => {
    const state = {
      A: {},
      B: {
        loading: false,
        data: {
          prop: 'some data',
        },
      },
    };

    const action = {
      type: 'ApiData/SetApiData',
      payload: { id: 'C', data: { field: 'field-value' } },
    };

    const expected = {
      A: {},
      B: {
        loading: false,
        data: {
          prop: 'some data',
        },
      },
      C: {
        data: {
          field: 'field-value',
        },
        finished: true,
      },
    };
    expect(ApiDataReducer(state, action)).toEqual(expected);
  });

  it(SYSTEM_CLEAR, () => {
    const state = {
      A: {},
      B: {
        loading: false,
        data: {
          prop: 'some data',
        },
      },
      C: {
        loading: false,
        error: { message: 'error' },
      },
      D_SCHEMAS: {
        loading: false,
        data: { someData: 'data' },
      },
    };

    const action = {
      type: SYSTEM_CLEAR,
    };

    const expected = {
      D_SCHEMAS: {
        loading: false,
        data: { someData: 'data' },
      },
    };
    expect(ApiDataReducer(state, action)).toEqual(expected);
  });
  describe('CallApi', () => {
    let dispatch: jest.Mock;
    let getState: jest.Mock;

    beforeEach(() => {
      dispatch = jest.fn();
      getState = jest.fn(() => ({
        System: { apiUrl: 'https://api.test.com' },
      }));
      mockedAxios.mockClear();
    });
    it('should dispatch fulfilled action when API call is successful', async () => {
      const mockPayload = { id: 'callApi-data', url: 'callApiData' };
      const mockResponseData = { field1: 'TestField1', field2: 'TestField2' };
      mockedAxios.mockResolvedValue({ data: mockResponseData });
      const action = CallApi(mockPayload);
      const result = await action(dispatch, getState, {});
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'get',
        url: 'https://api.test.com/callApiData',
        params: {},
        data: undefined,
      });
      expect(dispatch).toHaveBeenCalled();
      expect(result.type).toBe('ApiData/CallApi/fulfilled');
      expect(result.payload).toEqual({
        id: 'callApi-data',
        pageId: 'callApi-data',
        data: mockResponseData,
        jsonPath: undefined,
        metadata: undefined,
      });
    });
    it('should call the callback function on success', async () => {
      const mockCallback = jest.fn();
      const mockPayload = { id: 'user-data', url: 'users/1', callback: mockCallback };
      mockedAxios.mockResolvedValue({ data: {} });
      const action = CallApi(mockPayload);
      await action(dispatch, getState, {});
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
    it('should include queryParams in the request when provided', async () => {
      const mockPayload = {
        id: 'parties-search',
        url: 'parties/search',
        queryParams: {
          query: 'test',
          page: 2,
          limit: 25,
        },
      };
      const mockResponseData = [{ id: 1, name: 'Test Party' }];
      mockedAxios.mockResolvedValue({ data: mockResponseData });
      const action = CallApi(mockPayload);
      await action(dispatch, getState, {});
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'get',
        url: 'https://api.test.com/parties/search',
        data: undefined,
        params: {
          query: 'test',
          page: 2,
          limit: 25,
        },
      });
      const fulfilledAction = dispatch.mock.calls.find((call) =>
        call[0].type.endsWith('/fulfilled'),
      );
      expect(fulfilledAction[0].payload.data).toEqual(mockResponseData);
    });
  });
});
