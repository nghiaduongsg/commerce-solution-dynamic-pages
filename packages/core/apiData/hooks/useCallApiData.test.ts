import { renderHook, act } from '@testing-library/react';
import * as routerModule from 'react-router';
import * as dynamicApiModule from '@pkg-common/dataResolver/useDynamicApi';
import { mockSystemHook } from '@_jestHelpers/useSystemMock';
import * as notifiersModule from '@pkg-common/notifier/useNotifiers';
import * as buttonModule from '@pkg-common/button/useButtonPress';
import * as useSystemModule from '@pkg-setup/src/system/useSystem';
import useCallApiData from './useCallApiData';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import { CallApi } from '../redux/reducers';

jest.mock('react-router', () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn()?.mockReturnValue({ pathname: 'a/b/list' }),
}));

jest.mock('@pkg-common/dataResolver/useDynamicApi');
jest.mock('@pkg-common/notifier/useNotifiers', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('@pkg-common/button/useButtonPress', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-core/apiData/redux/reducers', () => ({
  CallApi: jest.fn((payload) => ({ type: 'apiData/CallApi', payload })),
  ClearApiData: jest.fn((payload) => ({ type: 'apiData/ClearApiData', payload })),
}));
const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
describe('useCallApiData', () => {
  const mockNavigate = jest.fn();
  const mockEnqueueSnackbar = jest.fn();
  const mockMarkButtonPress = jest.fn();

  beforeEach(() => {
    // reset all mocks
    jest.clearAllMocks();

    mockSystemHook();
    jest.spyOn(routerModule, 'useNavigate').mockReturnValue(mockNavigate);

    // useDynamicApi mock
    (dynamicApiModule.default as jest.Mock).mockReturnValue({
      url: '/api/test',
      method: 'post' as const,
      data: { key: 'value' },
      queryParams: {},
      dataValuesReady: true,
      urlReady: true,
    });

    // useNotifiers mock
    (notifiersModule.default as jest.Mock).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
    });

    // useButtonPress mock
    (buttonModule.default as jest.Mock).mockReturnValue({
      markButtonPress: mockMarkButtonPress,
    });

    // useSystem mock
    (useSystemModule.default as jest.Mock).mockReturnValue({
      selectedLanguage: 'EN',
    });

    // mock global transformDataForServer
    (window as any).transformDataForServer = (_pageId: string, data: any) => data;
  });
  const storeData = {
    ApiData: {
      ProductVersion_SINGLE_RECORD_FORM_SCHEMAS: {
        data: {
          id: 'bc538126-8b93-47e2-a873-724f4513bc99',
          entityCL: 'ProductVersion',
          code: 'ProductVersion',
          entityCLDescription: null,
          entitySubType: null,
          screenTypeCL: 'SINGLE_RECORD_FORM',
          screenTypeCLDescription: 'Single Record Form',
          ownerCL: 'BASE',
          ownerCLDescription: 'Base',
          helpURL: null,
          schemas: [],
        },
        finished: true,
        refreshId: Date.now(),
        loading: false,
        error: null,
      },
    },
  };

  const { wrapper } = getMockWrapperAndStore(storeData);
  const apiValuesSchema = {
    url: '/api/test',
    method: 'post' as const,
    resourceId: 'Version',
  };

  it('should return a function', () => {
    const { result } = renderHook(
      () =>
        useCallApiData(
          'ProductVersion_SINGLE_RECORD_FORM_SCHEMAS',
          'page1',
          apiValuesSchema,
          undefined,
          undefined,
          { error: 'errorMsg' },
        ),
      { wrapper },
    );

    expect(typeof result.current).toBe('function');
  });

  it('should call API when conditions are met', () => {
    const { result } = renderHook(
      () =>
        useCallApiData('test-id', 'test-page', { url: '/api/test', resourceToEntity: 'Version' }),
      { wrapper },
    );

    act(() => {
      result.current('page-identifier');
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      CallApi({
        id: 'test-id',
        pageId: 'page-identifier',
        url: '/api/test',
        method: 'post',
        data: { key: 'value' },
        queryParams: {},
        wrapToProperty: undefined,
        metadata: { url: '/api/test', resourceToEntity: 'Version' },
      }),
    );
  });

  it('calls markButtonPress and navigate on successful refreshId', () => {
    const notify = { success: 'Success' };
    renderHook(
      () =>
        useCallApiData(
          'ProductVersion_SINGLE_RECORD_FORM_SCHEMAS',
          'page1',
          apiValuesSchema,
          undefined,
          undefined,
          notify,
        ),
      { wrapper },
    );

    expect(mockMarkButtonPress).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Success', severity: 'dark' }),
    );
  });

  it('does not call API if shouldCallApi conditions are false', () => {
    const storeWithResponse = {
      ApiData: {
        ProductVersion_SINGLE_RECORD_FORM_SCHEMAS: {
          data: { existing: 'data' },
          finished: true,
          loading: false,
          error: null,
        },
      },
    };
    const { wrapper } = getMockWrapperAndStore(storeWithResponse);

    const { result } = renderHook(
      () =>
        useCallApiData(
          'ProductVersion_SINGLE_RECORD_FORM_SCHEMAS',
          'page1',
          apiValuesSchema,
          undefined,
          undefined,
          { error: 'errorMsg' },
        ),
      { wrapper },
    );

    act(() => {
      result.current('page1');
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('shows error notification and clears API data on error', () => {
    const storeWithError = {
      ApiData: {
        ProductVersion_SINGLE_RECORD_FORM_SCHEMAS: {
          data: null,
          finished: false,
          loading: false,
          error: 'Some error',
        },
      },
    };

    const { wrapper: errorWrapper } = getMockWrapperAndStore(storeWithError);
    const notify = { error: 'Error message' };

    renderHook(
      () =>
        useCallApiData(
          'ProductVersion_SINGLE_RECORD_FORM_SCHEMAS',
          'page1',
          apiValuesSchema,
          undefined,
          undefined,
          notify,
        ),
      { wrapper: errorWrapper },
    );

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error message', severity: 'error' }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'apiData/ClearApiData' }),
    );
  });
});
