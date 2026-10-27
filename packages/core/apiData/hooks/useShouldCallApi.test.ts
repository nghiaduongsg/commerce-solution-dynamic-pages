/** @jest-environment jsdom */

import { renderHook } from '@testing-library/react';
import { useSelector } from 'react-redux';
import useShouldCallApi from '@pkg-core/apiData/hooks/useShouldCallApi';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import usePrevious from 'react-use/lib/usePrevious';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { urlHasAllParams } from '@pkg-common/utils/utils';
import { selectPressedSignatureKey } from '@pkg-common/button/selectors';
import {
  selectApiDataLoading,
  selectApiFinished,
  selectApiHasError,
} from '@pkg-core/apiData/redux/selectors';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('@pkg-common/dataResolver/useDynamicApi', () => jest.fn());
jest.mock('react-use/lib/usePrevious', () => jest.fn());
jest.mock('@pkg-common/dataResolver/useCheckFrom', () => jest.fn());
jest.mock('@pkg-common/utils/utils', () => ({
  urlHasAllParams: jest.fn(),
}));
jest.mock('@pkg-common/button/selectors', () => ({
  selectPressedSignatureKey: jest.fn(),
}));
jest.mock('@pkg-core/apiData/redux/selectors', () => ({
  selectApiDataLoading: jest.fn(),
  selectApiFinished: jest.fn(),
  selectApiHasError: jest.fn(),
}));

describe('useShouldCallApi', () => {
  const refreshSelector = jest.fn();
  const loadingSelector = jest.fn();
  const hasErrorSelector = jest.fn();
  const finishedSelector = jest.fn();

  const mockSelectors = ({
    refreshFromButtonPress = false,
    loading = false,
    hasError = false,
    finished = false,
  } = {}) => {
    (selectPressedSignatureKey as jest.Mock).mockReturnValue(refreshSelector);
    (selectApiDataLoading as jest.Mock).mockReturnValue(loadingSelector);
    (selectApiHasError as jest.Mock).mockReturnValue(hasErrorSelector);
    (selectApiFinished as jest.Mock).mockReturnValue(finishedSelector);

    (useSelector as any as jest.Mock).mockImplementation((selector: unknown) => {
      switch (selector) {
        case refreshSelector:
          return refreshFromButtonPress;
        case loadingSelector:
          return loading;
        case hasErrorSelector:
          return hasError;
        case finishedSelector:
          return finished;
        default:
          return undefined;
      }
    });
  };

  const mockHookDeps = ({
    url = '/test-url',
    data = {},
    urlPrev = undefined,
    dataPrev = undefined,
    applyUnderCondition = true,
    hasAllParams = true,
  }: {
    url?: string | undefined;
    data?: Record<string, unknown>;
    urlPrev?: string | undefined;
    dataPrev?: Record<string, unknown> | undefined;
    applyUnderCondition?: boolean;
    hasAllParams?: boolean;
  } = {}) => {
    (useDynamicApi as jest.Mock).mockReturnValue({ url, data });
    (usePrevious as jest.Mock).mockReturnValueOnce(urlPrev).mockReturnValueOnce(dataPrev);
    (useCheckFrom as jest.Mock).mockReturnValue({ check: applyUnderCondition });
    (urlHasAllParams as jest.Mock).mockReturnValue(hasAllParams);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return false when applyWhen exists and condition is not satisfied', () => {
    mockSelectors();
    mockHookDeps({
      url: '/test-url',
      data: {},
      applyUnderCondition: false,
      hasAllParams: true,
    });

    const { result } = renderHook(() =>
      useShouldCallApi('api-id', {
        applyWhen: [{ field: 'status', value: 'ACTIVE' }],
      } as any),
    );

    expect(result.current).toBe(false);
  });

  it('should return true when api should load normally', () => {
    mockSelectors({
      loading: false,
      hasError: false,
      finished: false,
      refreshFromButtonPress: false,
    });

    mockHookDeps({
      url: '/test-url',
      data: {},
      urlPrev: undefined,
      dataPrev: undefined,
      applyUnderCondition: true,
      hasAllParams: true,
    });

    const { result } = renderHook(() => useShouldCallApi('api-id'));

    expect(result.current).toBe(true);
  });

  it('should return false when url is missing', () => {
    mockSelectors();
    mockHookDeps({
      url: undefined,
      data: {},
      urlPrev: undefined,
      dataPrev: undefined,
      applyUnderCondition: true,
      hasAllParams: false,
    });

    const { result } = renderHook(() => useShouldCallApi('api-id'));

    expect(result.current).toBe(false);
  });

  it('should return true when url has changed even if loading, finished and hasError are true', () => {
    mockSelectors({
      loading: true,
      hasError: true,
      finished: true,
      refreshFromButtonPress: false,
    });

    mockHookDeps({
      url: '/new-url',
      data: {},
      urlPrev: '/old-url',
      dataPrev: {},
      applyUnderCondition: true,
      hasAllParams: true,
    });

    const { result } = renderHook(() => useShouldCallApi('api-id'));

    expect(result.current).toBe(true);
  });

  it('should return true when refresh is triggered from button press', () => {
    mockSelectors({
      loading: true,
      hasError: true,
      finished: true,
      refreshFromButtonPress: true,
    });

    mockHookDeps({
      url: '/same-url',
      data: {},
      urlPrev: '/same-url',
      dataPrev: {},
      applyUnderCondition: true,
      hasAllParams: true,
    });

    const apiValues = {
      refreshFromButtons: ['button-1'],
    } as any;

    const { result } = renderHook(() => useShouldCallApi('api-id', apiValues));

    expect(selectPressedSignatureKey).toHaveBeenCalledWith(['button-1']);
    expect(result.current).toBe(true);
  });

  it('should return false when refresh button is pressed but url does not have all params', () => {
    mockSelectors({
      loading: true,
      hasError: true,
      finished: true,
      refreshFromButtonPress: true,
    });

    mockHookDeps({
      url: '/same-url',
      data: {},
      urlPrev: '/same-url',
      dataPrev: {},
      applyUnderCondition: true,
      hasAllParams: false,
    });

    const apiValues = {
      refreshFromButtons: ['button-1'],
    } as any;

    const { result } = renderHook(() => useShouldCallApi('api-id', apiValues));

    expect(result.current).toBe(false);
  });

  it('should return true when dataFrom exists, key count matches and data has changed', () => {
    mockSelectors({
      loading: false,
      hasError: false,
      finished: false,
      refreshFromButtonPress: false,
    });

    mockHookDeps({
      url: '/test-url',
      data: { firstName: 'John', lastName: 'Doe' },
      urlPrev: '/old-url',
      dataPrev: {},
      applyUnderCondition: true,
      hasAllParams: true,
    });

    const apiValues = {
      dataFrom: {
        firstName: 'someField1',
        lastName: 'someField2',
      },
    } as any;

    const { result } = renderHook(() => useShouldCallApi('api-id', apiValues));

    expect(result.current).toBe(true);
  });

  it('should return false when dataFrom exists but key count does not match', () => {
    mockSelectors({
      loading: false,
      hasError: false,
      finished: false,
      refreshFromButtonPress: false,
    });

    mockHookDeps({
      url: '/test-url',
      data: { firstName: 'John', lastName: 'Doe' },
      urlPrev: '/old-url',
      dataPrev: {},
      applyUnderCondition: true,
      hasAllParams: true,
    });

    const apiValues = {
      dataFrom: {
        firstName: 'someField1',
      },
    } as any;

    const { result } = renderHook(() => useShouldCallApi('api-id', apiValues));

    expect(result.current).toBe(false);
  });
});
