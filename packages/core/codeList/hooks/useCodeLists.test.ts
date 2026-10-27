import { configureStore } from '@reduxjs/toolkit';
import reducer, { LoadCodeList } from '../redux/reducers';
import systemReducer from '../../../setup/src/system/reducers';

describe('useCodeLists', () => {
  let store: ReturnType<typeof configureStore>;
  beforeEach(() => {
    jest.resetAllMocks();
    store = configureStore({
      reducer: {
        System: systemReducer,
        CodeList: reducer,
      },
      preloadedState: {
        System: {
          apiUrl: 'api/url',
        },
        CodeList: {
          lists: [],
          loading: false,
          componentValueType: {},
        },
      },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should dispatch action LoadCodeList when "loadCodeList" is called', async () => {
    const result = await store.dispatch(LoadCodeList({ code: 'A', api: 'some/api' }));
    expect(result.type).toEqual(LoadCodeList.rejected.type);
  });

  it('should dispatch action LoadCodeList when "loadCodeList" is called with query params', async () => {
    const result = await store.dispatch(LoadCodeList());
    expect(result.type).toEqual(LoadCodeList.rejected.type); //SHOULD BE ENHANCED
  });
});
