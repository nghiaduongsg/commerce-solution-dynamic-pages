import { renderHook } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import useApiData from './useApiData';
import { ApiValuesSchema } from '@pkg-common/types';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  shallowEqual: jest.fn((a, b) => a === b),
}));

jest.mock('@pkg-core/apiData/redux/selectors', () => ({
  selectApiData: jest.fn(() =>
    Object.assign(() => ({}), {
      clearCache: jest.fn(),
      resultsCount: jest.fn(() => 0),
      resetResultsCount: jest.fn(),
    }),
  ),
  selectApiDataLoading: jest.fn(() => Object.assign(() => false, {})),
  selectApiFinished: jest.fn(() => Object.assign(() => false, {})),
  selectApiHasError: jest.fn(() => Object.assign(() => false, {})),
}));

jest.mock('../redux/reducers', () => ({ CallApi: jest.fn() }));

jest.mock('@pkg-common/utils/utils', () => ({ urlHasAllParams: jest.fn() }));

jest.mock('@pkg-form/validations/utils/widgetUtils', () => ({
  getContextValue: jest.fn(),
}));

jest.mock('@pkg-common/dataResolver/useDynamicApi', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('react-use/lib/usePrevious', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-common/dataResolver/useCheckFrom', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@pkg-common/button/selectors', () => ({
  selectPressedSignatureKey: jest.fn(() => Object.assign(() => false, {})),
}));

jest.mock('@pkg-core/initialization/api/utils', () => ({
  constructDataToSend: jest.fn((data) => data),
}));

jest.mock('@pkg-setup/src/system/useSystem', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import {
  selectApiData,
  selectApiDataLoading,
  selectApiFinished,
  selectApiHasError,
} from '@pkg-core/apiData/redux/selectors';
import { CallApi } from '../redux/reducers';
import { urlHasAllParams } from '@pkg-common/utils/utils';
import { getContextValue } from '@pkg-form/validations/utils/widgetUtils';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import usePrevious from 'react-use/lib/usePrevious';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { selectPressedSignatureKey } from '@pkg-common/button/selectors';
import useSystem from '@pkg-setup/src/system/useSystem';
import { constructDataToSend } from '@pkg-core/initialization/api/utils';

const mockUseDispatch = useDispatch as unknown as jest.Mock;
const mockUseSelector = useSelector as unknown as jest.Mock;
const mockSelectApiData = selectApiData as jest.Mock;
const mockSelectApiDataLoading = selectApiDataLoading as jest.Mock;
const mockSelectApiFinished = selectApiFinished as jest.Mock;
const mockSelectApiHasError = selectApiHasError as jest.Mock;
const mockCallApi = CallApi as jest.Mock;
const mockUrlHasAllParams = urlHasAllParams as jest.Mock;
const mockGetContextValue = getContextValue as jest.Mock;
const mockUseDynamicApi = useDynamicApi as jest.Mock;
const mockUsePrevious = usePrevious as jest.Mock;
const mockUseCheckFrom = useCheckFrom as jest.Mock;
const mockSelectPressedSignatureKey = selectPressedSignatureKey as jest.Mock;
const mockUseSystem = useSystem as jest.Mock;
const mockConstructDataToSend = constructDataToSend as jest.Mock;

describe('useApiData', () => {
  const mockDispatch = jest.fn();
  const mockApiResponse = { data: 'test response' };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseSelector.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector();
      }
      return mockApiResponse;
    });

    mockSelectApiData.mockReturnValue(() => mockApiResponse);
    mockSelectApiDataLoading.mockReturnValue(() => false);
    mockSelectApiFinished.mockReturnValue(() => false);
    mockSelectApiHasError.mockReturnValue(() => false);

    mockUseDynamicApi.mockReturnValue({
      url: 'https://api.test.com/data',
      method: 'get',
      data: { param1: 'value1' },
      queryParams: { q: 'search' },
      dataValuesReady: true,
      urlReady: true,
    });

    mockUsePrevious.mockReturnValue(undefined);
    mockUseCheckFrom.mockReturnValue({ check: true, values: {} });
    mockUrlHasAllParams.mockReturnValue(true);
    mockGetContextValue.mockReturnValue('processed response');
    mockCallApi.mockReturnValue({ type: 'CALL_API', payload: {} });
    mockSelectPressedSignatureKey.mockReturnValue(() => false);

    mockUseSystem.mockReturnValue({
      apiUrl: 'https://api.test.com',
      useStaticSchemas: true,
      useDefaultTranslations: true,
      applyPermissions: true,
      allSymbol: '*',
      application: 'test-app',
      getSystemAssets: '/assets',
      primaryCurrency: { code: 'USD' },
      hideInactive: 'N',
      hideExpired: 'N',
      primaryLanguage: { code: 'en' },
      sourceCurrencyMode: 'Y',
      retentionPeriod: 30,
      isSignReversed: false,
      selectedLanguage: 'en',
      authToken: 'token',
      lastUpdate: Date.now(),
      securableObjects: {},
      init: jest.fn(),
      clear: jest.fn(),
      update: jest.fn(),
    });
  });

  describe('Basic Behavior', () => {
    it('returns response when no jsonPath is provided', () => {
      const { result } = renderHook(() => useApiData('test-id'));

      expect(result.current).toBe(mockApiResponse);
    });

    it('returns processed response when jsonPath is provided', () => {
      const apiValues: ApiValuesSchema = {
        url: 'https://api.test.com/data',
        jsonPath: ['$.data'],
        performQuery: true,
      };

      const { result } = renderHook(() => useApiData('test-id', apiValues));

      expect(mockGetContextValue).toHaveBeenCalledWith('test-id', mockApiResponse, {
        code: 'test-id',
        jsonPath: ['$.data'],
        performQuery: true,
      });
      expect(result.current).toBe('processed response');
    });
  });

  describe('API Dispatch Behavior', () => {
    it('dispatches API call with correct payload', () => {
      const apiValues: ApiValuesSchema = { url: 'https://api.test.com/data', method: 'get' };

      renderHook(() => useApiData('test-id', apiValues));

      expect(mockDispatch).toHaveBeenCalled();
      expect(mockCallApi).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-id', url: 'https://api.test.com/data' }),
      );
    });

    it('does NOT call API when urlHasAllParams returns false', () => {
      mockUrlHasAllParams.mockReturnValue(false);
      renderHook(() => useApiData('test-id', { url: 'https://api.test.com/data', method: 'get' }));

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('still calls API when urlReady/dataValuesReady are false', () => {
      mockUseDynamicApi.mockReturnValueOnce({
        url: 'https://api.test.com/data',
        method: 'get',
        data: {},
        queryParams: {},
        urlReady: false,
        dataValuesReady: false,
      });

      renderHook(() => useApiData('test-id', { url: 'https://api.test.com/data' }));

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('calls API even when performQuery is false (no post-processing)', () => {
      renderHook(() =>
        useApiData('test-id', { url: 'https://api.test.com/data', performQuery: false }),
      );

      expect(mockDispatch).toHaveBeenCalled();
      expect(mockGetContextValue).not.toHaveBeenCalled();
    });
  });

  describe('State Transitions', () => {
    it('handles API finished state correctly', () => {
      mockSelectApiFinished.mockReturnValue(() => true);
      renderHook(() => useApiData('test-id', { url: 'https://api.test.com/data' }));

      expect(mockSelectApiFinished).toHaveBeenCalled();
    });

    it('handles API error state correctly', () => {
      mockSelectApiHasError.mockReturnValue(() => true);
      renderHook(() => useApiData('test-id', { url: 'https://api.test.com/data' }));

      expect(mockSelectApiHasError).toHaveBeenCalled();
    });

    it('skips API call when applyWhen check is false', () => {
      mockUseCheckFrom.mockReturnValue({ check: false });
      renderHook(() =>
        useApiData('test-id', {
          url: 'https://api.test.com/data',
          performQuery: true,
          applyWhen: { operator: 'every', fields: [] },
        }),
      );

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('Refresh / Change Detection', () => {
    it('detects url change and re-calls API', () => {
      mockUsePrevious.mockReturnValue('old-url');
      mockUseDynamicApi.mockReturnValue({
        url: 'https://api.test.com/new',
        method: 'get',
        data: { p: 1 },
        queryParams: {},
        dataValuesReady: true,
        urlReady: true,
      });

      renderHook(() => useApiData('test-id', { url: 'https://api.test.com/new' }));

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('detects data change and re-calls API', () => {
      mockUsePrevious.mockReturnValue({ param1: 'old' });
      mockUseDynamicApi.mockReturnValue({
        url: 'https://api.test.com/data',
        method: 'get',
        data: { param1: 'new' },
        queryParams: {},
        dataValuesReady: true,
        urlReady: true,
      });

      renderHook(() => useApiData('test-id', { url: 'https://api.test.com/data' }));

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('triggers refresh when button signature key pressed', () => {
      mockSelectPressedSignatureKey.mockReturnValue(() => true);
      renderHook(() =>
        useApiData('test-id', {
          url: 'https://api.test.com/data',
          performQuery: true,
          refreshFromButtons: ['BTN1'],
        }),
      );

      expect(mockDispatch).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('does not call API when apiUrl missing from system', () => {
      mockUseSystem.mockReturnValueOnce({ apiUrl: '' });
      renderHook(() => useApiData('test-id', { url: 'https://api.test.com/data' }));

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('handles dataFrom logic and calls API', () => {
      mockUsePrevious.mockReturnValue({ old: 'data' });
      mockUseDynamicApi.mockReturnValue({
        url: 'https://api.test.com/data',
        method: 'get',
        data: { key1: 'value1' },
        queryParams: {},
        dataValuesReady: true,
      });

      renderHook(() =>
        useApiData('test-id', {
          url: 'https://api.test.com/data',
          performQuery: true,
          dataFrom: [{ key: 'test-key', source: { type: 'SELF' }, operator: 'equals' } as any],
        }),
      );

      expect(mockDispatch).toHaveBeenCalled();
      expect(mockCallApi).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-id', url: 'https://api.test.com/data' }),
      );
    });
  });

  describe('mode flag', () => {
    it('ONLY_ONCE: calls API with correct payload', () => {
      renderHook(() =>
        useApiData('test-id', {
          url: 'https://api.test.com/data',
          method: 'get',
          mode: 'ONLY_ONCE',
        }),
      );

      expect(mockDispatch).toHaveBeenCalled();
      expect(mockCallApi).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'test-id', url: 'https://api.test.com/data' }),
      );
    });

    it('ONLY_ONCE: does not call API again after finished=true even if data changes', () => {
      mockSelectApiFinished.mockReturnValue(() => true);
      mockUsePrevious.mockReturnValue({ param1: 'old' });

      renderHook(() =>
        useApiData('test-id', {
          url: 'https://api.test.com/data',
          method: 'get',
          mode: 'ONLY_ONCE',
        }),
      );

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('ONLY_ONCE: still calls API when button press refresh is triggered', () => {
      mockSelectApiFinished.mockReturnValue(() => true);
      mockSelectPressedSignatureKey.mockReturnValue(() => true);
      renderHook(() =>
        useApiData('test-id', {
          url: 'https://api.test.com/data',
          mode: 'ONLY_ONCE',
          refreshFromButtons: ['BTN1'],
        }),
      );

      expect(mockDispatch).toHaveBeenCalled();
    });

    it('EVERY_TIME: re-calls API when data changes even after finished=true', () => {
      mockSelectApiFinished.mockReturnValue(() => true);
      mockUsePrevious.mockReturnValue({ param1: 'old' });
      mockUseDynamicApi.mockReturnValue({
        url: 'https://api.test.com/data',
        method: 'get',
        data: { param1: 'new' },
        queryParams: { q: 'search' },
        dataValuesReady: true,
        urlReady: true,
      });

      renderHook(() =>
        useApiData('test-id', {
          url: 'https://api.test.com/data',
          mode: 'EVERY_TIME',
        }),
      );

      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
