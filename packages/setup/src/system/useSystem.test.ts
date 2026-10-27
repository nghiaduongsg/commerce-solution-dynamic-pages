import { renderHook, act } from '@testing-library/react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import useSystem, { SYSTEM_CLEAR } from './useSystem';
import { SystemState } from './types';
import {
  selectApiUrl,
  selectAllSymbol,
  selectApplication,
  selectSystemAssets,
  selectApplyPermissions,
  selectUseStaticSchemas,
  selectUseDefaultTranslations,
  selectPrimaryCurrency,
  selectLanguage,
  selectAuthToken,
  selectLastUpdate,
  selectSecurableObjects,
  selectRetentionPeriod,
  selectSourceCurrencyMode,
  selectIsSignReversed,
  selectPrimaryLanguage,
  selectHideInactive,
  selectHideExpired,
  selectLabelIndicatorMode,
  selectLabelIndicatorSymbol,
  selectLabelIndicatorIcon,
  selectLabelIndicatorColor,
} from './selectors';

const mockInit = (payload: any) => ({ type: '@SYSTEM/INIT', payload });
const mockUpdate = (payload: any) => ({ type: '@SYSTEM/UPDATE', payload });
const mockLoadCodeLists = (payload: any) => ({ type: '@CODELIST/LOAD', payload });

jest.mock('./reducers', () => ({
  Init: (payload: any) => mockInit(payload),
  Update: (payload: any) => mockUpdate(payload),
}));

jest.mock('@pkg-core/codeList/redux/reducers', () => ({
  LoadCodeLists: (payload: any) => mockLoadCodeLists(payload),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

const mockUseSelector = useSelector as unknown as jest.Mock;
const mockUseDispatch = useDispatch as unknown as jest.Mock;

const mockSystem: SystemState = {
  apiUrl: 'https://api.test.com',
  systemUsed: 'test-app',
  allSymbol: '#',
  systemAssets: '/assets/test',
  useStaticSchemas: true,
  useDefaultTranslations: false,
  applySecObjectPermissions: true,
  applyPermissions: false,
  primaryCurrency: { code: 'EUR' },
  primaryLanguage: { code: 'fr' },
  retentionPeriod: 90,
  selectedLanguage: 'FR',
  camundaUrl: 'https://camunda.test.com',
  camunda7RuntimeUrl: 'https://camunda7-runtime.test.com',
  camunda7HistoryUrl: 'https://camunda7-history.test.com',
  securableObjects: { featureA: true, featureB: false },
  lastUpdate: 123456789,
  authToken: 'test-token',
  sourceCurrencyMode: 'Y',
  hideInactive: 'N',
  hideExpired: 'Y',
  isSignReversed: true,
  labelIndicatorMode: 'HIGHLIGHT_MANDATORY',
  labelIndicatorSymbol: '*',
  labelIndicatorIcon: 'star',
  labelIndicatorColor: 'red',
};

const mockRootState = { System: mockSystem };

describe('useSystem', () => {
  const dispatchSpy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(dispatchSpy);
    mockUseSelector.mockImplementation((selectorFn: any) => selectorFn(mockRootState));
  });

  it('returns values from selectors', () => {
    const { result } = renderHook(() => useSystem());

    expect(result.current.apiUrl).toBe('https://api.test.com');
    expect(result.current.allSymbol).toBe('#');
    expect(result.current.application).toBe('test-app');
    expect(result.current.getSystemAssets).toBe('/assets/test');

    expect(result.current.applyPermissions).toBe(false);
    expect(result.current.applySecObjectPermissions).toBe(true);
    expect(result.current.useStaticSchemas).toBe(true);
    expect(result.current.useDefaultTranslations).toBe(false);

    expect(result.current.primaryCurrency).toEqual({ code: 'EUR' });
    expect(result.current.primaryLanguage).toEqual({ code: 'fr' });

    expect(result.current.sourceCurrencyMode).toBe('Y');
    expect(result.current.hideInactive).toBe('N');
    expect(result.current.hideExpired).toBe('Y');

    expect(result.current.retentionPeriod).toBe(90);
    expect(result.current.isSignReversed).toBe(true);

    expect(result.current.selectedLanguage).toBe('FR');
    expect(result.current.authToken).toBe('test-token');
    expect(result.current.lastUpdate).toBe(123456789);
    expect(result.current.securableObjects).toEqual({ featureA: true, featureB: false });

    expect(result.current.labelIndicatorMode).toBe('HIGHLIGHT_MANDATORY');
    expect(result.current.labelIndicatorSymbol).toBe('*');
    expect(result.current.labelIndicatorIcon).toBe('star');
    expect(result.current.labelIndicatorColor).toBe('red');
  });

  it('uses shallowEqual for selectedLanguage selector', () => {
    renderHook(() => useSystem());

    expect(mockUseSelector).toHaveBeenCalledWith(selectLanguage, shallowEqual);
  });

  it('dispatches Init action on init()', () => {
    const { result } = renderHook(() => useSystem());
    const payload = { System: { systemUsed: 'MySystem' } };

    act(() => {
      result.current.init(payload);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(mockInit(payload));
  });

  it('dispatches Clear action on clear()', () => {
    const { result } = renderHook(() => useSystem());

    act(() => {
      result.current.clear();
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith({ type: SYSTEM_CLEAR });
  });

  it('dispatches Update only when update() is called without codelists', () => {
    const { result } = renderHook(() => useSystem());
    const payload = { apiUrl: 'https://new-api.test.com' };

    act(() => {
      result.current.update(payload);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(mockUpdate(payload));
  });

  it('dispatches Update and LoadCodeLists when update() includes codelists', () => {
    const { result } = renderHook(() => useSystem());
    const codelists = { lists: ['countries', 'currencies'], api: '/codelist/api' };
    const payload = { apiUrl: 'https://another-api.test.com', codelists };

    act(() => {
      result.current.update(payload);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, mockUpdate(payload));
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, mockLoadCodeLists(codelists));
  });

  it('should not dispatch LoadCodeLists when codelists is null', () => {
    const { result } = renderHook(() => useSystem());
    const payload = { apiUrl: 'https://test.com', codelists: null };

    act(() => {
      result.current.update(payload as unknown as Partial<SystemState>);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(mockUpdate(payload));
  });

  it('should not dispatch LoadCodeLists when codelists is undefined', () => {
    const { result } = renderHook(() => useSystem());
    const payload = { apiUrl: 'https://test.com', codelists: undefined };

    act(() => {
      result.current.update(payload);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(mockUpdate(payload));
  });

  it('should not dispatch LoadCodeLists when codelists is false', () => {
    const { result } = renderHook(() => useSystem());
    const payload = { apiUrl: 'https://test.com', codelists: false };

    act(() => {
      result.current.update(payload as unknown as Partial<SystemState>);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(mockUpdate(payload));
  });

  it('should not dispatch LoadCodeLists when codelists is empty string', () => {
    const { result } = renderHook(() => useSystem());
    const payload = { apiUrl: 'https://test.com', codelists: '' };

    act(() => {
      result.current.update(payload as unknown as Partial<SystemState>);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(mockUpdate(payload));
  });

  it('should dispatch LoadCodeLists when codelists is empty object', () => {
    const { result } = renderHook(() => useSystem());
    const payload = { apiUrl: 'https://test.com', codelists: {} };

    act(() => {
      result.current.update(payload as unknown as Partial<SystemState>);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, mockUpdate(payload));
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, mockLoadCodeLists({}));
  });

  it('should dispatch LoadCodeLists when codelists is empty array', () => {
    const { result } = renderHook(() => useSystem());
    const payload = { apiUrl: 'https://test.com', codelists: [] };

    act(() => {
      result.current.update(payload as unknown as Partial<SystemState>);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(2);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, mockUpdate(payload));
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, mockLoadCodeLists([]));
  });

  it('should handle update with no payload', () => {
    const { result } = renderHook(() => useSystem());

    act(() => {
      result.current.update(undefined as unknown as Partial<SystemState>);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(mockUpdate(undefined));
  });

  it('should handle update with null payload', () => {
    const { result } = renderHook(() => useSystem());

    act(() => {
      result.current.update(null as unknown as Partial<SystemState>);
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(mockUpdate(null));
  });

  it('should verify all selectors are called correctly', () => {
    renderHook(() => useSystem());

    expect(mockUseSelector).toHaveBeenCalledWith(selectApiUrl);
    expect(mockUseSelector).toHaveBeenCalledWith(selectAllSymbol);
    expect(mockUseSelector).toHaveBeenCalledWith(selectApplication);
    expect(mockUseSelector).toHaveBeenCalledWith(selectSystemAssets);
    expect(mockUseSelector).toHaveBeenCalledWith(selectApplyPermissions);
    expect(mockUseSelector).toHaveBeenCalledWith(selectUseStaticSchemas);
    expect(mockUseSelector).toHaveBeenCalledWith(selectUseDefaultTranslations);
    expect(mockUseSelector).toHaveBeenCalledWith(selectPrimaryCurrency);
    expect(mockUseSelector).toHaveBeenCalledWith(selectHideInactive);
    expect(mockUseSelector).toHaveBeenCalledWith(selectHideExpired);
    expect(mockUseSelector).toHaveBeenCalledWith(selectPrimaryLanguage);
    expect(mockUseSelector).toHaveBeenCalledWith(selectSourceCurrencyMode);
    expect(mockUseSelector).toHaveBeenCalledWith(selectRetentionPeriod);
    expect(mockUseSelector).toHaveBeenCalledWith(selectIsSignReversed);
    expect(mockUseSelector).toHaveBeenCalledWith(selectLanguage, shallowEqual);
    expect(mockUseSelector).toHaveBeenCalledWith(selectAuthToken);
    expect(mockUseSelector).toHaveBeenCalledWith(selectLastUpdate);
    expect(mockUseSelector).toHaveBeenCalledWith(selectSecurableObjects);
    expect(mockUseSelector).toHaveBeenCalledWith(selectLabelIndicatorMode);
    expect(mockUseSelector).toHaveBeenCalledWith(selectLabelIndicatorSymbol);
    expect(mockUseSelector).toHaveBeenCalledWith(selectLabelIndicatorIcon);
    expect(mockUseSelector).toHaveBeenCalledWith(selectLabelIndicatorColor);
  });

  it('should handle multiple consecutive updates', () => {
    const { result } = renderHook(() => useSystem());

    act(() => {
      result.current.update({ apiUrl: 'https://test1.com' });
      result.current.update({
        apiUrl: 'https://test2.com',
        codelists: { test: true } as any,
      });
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(3);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, mockUpdate({ apiUrl: 'https://test1.com' }));
    expect(dispatchSpy).toHaveBeenNthCalledWith(
      2,
      mockUpdate({ apiUrl: 'https://test2.com', codelists: { test: true } }),
    );
    expect(dispatchSpy).toHaveBeenNthCalledWith(3, mockLoadCodeLists({ test: true }));
  });
});
