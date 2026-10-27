import {
  selectUseStaticSchemas,
  selectUseDefaultTranslations,
  selectApiUrl,
  selectAllSymbol,
  selectApplication,
  selectSystemAssets,
  selectPrimaryCurrency,
  selectPrimaryLanguage,
  selectSourceCurrencyMode,
  selectHideInactive,
  selectHideExpired,
  selectRetentionPeriod,
  selectIsSignReversed,
  selectLanguage,
  selectAuthToken,
  selectApplyPermissions,
  selectLastUpdate,
  selectSecurableObjects,
  selectLocale,
  selectApplySecObjectPermissions,
} from './selectors';
import { SystemState } from './types';
import { el, enUS, lt } from 'date-fns/locale';

type RootState = { System: SystemState };

const makeState = (overrides: Partial<SystemState> = {}): RootState => {
  const base: SystemState = {
    apiUrl: 'https://api.example.com',
    systemUsed: 'APP',
    allSymbol: '*',
    systemAssets: '/assets',
    useStaticSchemas: true,
    useDefaultTranslations: false,
    applyPermissions: true,
    applySecObjectPermissions: true,
    primaryCurrency: { code: 'USD' },
    primaryLanguage: { code: 'en' },
    retentionPeriod: 90,
    selectedLanguage: 'en',
    camundaUrl: 'https://camunda.example.com',
    camunda7RuntimeUrl: 'https://camunda7.example.com/runtime',
    camunda7HistoryUrl: 'https://camunda7.example.com/history',
    authToken: 'token-123',
    securableObjects: { READ: true, WRITE: false },
    codelists: { lists: ['COUNTRIES'], api: 'https://api.example.com/codelists' },
    lastUpdate: 1_690_000_000,
    sourceCurrencyMode: 'Y',
    hideInactive: 'N',
    hideExpired: 'Y',
    isSignReversed: true,
    themes: [{ code: 'dark', label: 'Dark' }],
  };

  return { System: { ...base, ...overrides } };
};

describe('System selectors', () => {
  describe('selectUseStaticSchemas', () => {
    it('selectUseStaticSchemas', () => {
      const state = makeState({ useStaticSchemas: true });

      expect(selectUseStaticSchemas(state)).toBe(true);
    });
  });

  describe('selectApplySecObjectPermissions', () => {
    it('selectApplySecObjectPermissions - false', () => {
      const state = makeState({ applySecObjectPermissions: false });

      expect(selectApplySecObjectPermissions(state)).toBe(false);
    });

    it('selectApplySecObjectPermissions - true', () => {
      const state = makeState({ applySecObjectPermissions: true });

      expect(selectApplySecObjectPermissions(state)).toBe(true);
    });
  });

  describe('selectUseDefaultTranslations', () => {
    it('selectUseDefaultTranslations', () => {
      const state = makeState({ useDefaultTranslations: false });

      expect(selectUseDefaultTranslations(state)).toBe(false);
    });
  });

  describe('selectApiUrl', () => {
    it('selectApiUrl', () => {
      const state = makeState({ apiUrl: 'https://api.example.com' });

      expect(selectApiUrl(state)).toBe('https://api.example.com');
    });
  });

  describe('selectAllSymbol', () => {
    it('selectAllSymbol', () => {
      const state = makeState({ allSymbol: '*' });

      expect(selectAllSymbol(state)).toBe('*');
    });
  });

  describe('selectApplication', () => {
    it('selectApplication maps to systemUsed', () => {
      const state = makeState({ systemUsed: 'MY_APP' });

      expect(selectApplication(state)).toBe('MY_APP');
    });
  });

  describe('selectSystemAssets', () => {
    it('selectSystemAssets', () => {
      const state = makeState({ systemAssets: '/assets' });

      expect(selectSystemAssets(state)).toBe('/assets');
    });
  });

  describe('selectPrimaryCurrency', () => {
    it('selectPrimaryCurrency', () => {
      const state = makeState({ primaryCurrency: { code: 'EUR' } });

      expect(selectPrimaryCurrency(state)).toEqual({ code: 'EUR' });
    });
  });

  describe('selectPrimaryLanguage', () => {
    it('selectPrimaryLanguage', () => {
      const state = makeState({ primaryLanguage: { code: 'fr' } });

      expect(selectPrimaryLanguage(state)).toEqual({ code: 'fr' });
    });
  });

  describe('selectSourceCurrencyMode', () => {
    it('selectSourceCurrencyMode returns set value', () => {
      const state = makeState({ sourceCurrencyMode: 'N' });

      expect(selectSourceCurrencyMode(state)).toBe('N');
    });

    it('selectSourceCurrencyMode returns undefined when not set', () => {
      const state = makeState({ sourceCurrencyMode: undefined });

      expect(selectSourceCurrencyMode(state)).toBeUndefined();
    });
  });

  describe('selectHideInactive', () => {
    it('selectHideInactive returns set value', () => {
      const state = makeState({ hideInactive: 'Y' });

      expect(selectHideInactive(state)).toBe('Y');
    });

    it('selectHideInactive returns undefined when not set', () => {
      const state = makeState({ hideInactive: undefined });

      expect(selectHideInactive(state)).toBeUndefined();
    });
  });

  describe('selectHideExpired', () => {
    it('selectHideExpired returns set value', () => {
      const state = makeState({ hideExpired: 'N' });

      expect(selectHideExpired(state)).toBe('N');
    });

    it('selectHideExpired returns undefined when not set', () => {
      const state = makeState({ hideExpired: undefined });

      expect(selectHideExpired(state)).toBeUndefined();
    });
  });

  describe('selectRetentionPeriod', () => {
    it('selectRetentionPeriod', () => {
      const state = makeState({ retentionPeriod: 365 });

      expect(selectRetentionPeriod(state)).toBe(365);
    });
  });

  describe('selectIsSignReversed', () => {
    it('selectIsSignReversed returns set value', () => {
      const state = makeState({ isSignReversed: false });

      expect(selectIsSignReversed(state)).toBe(false);
    });

    it('selectIsSignReversed returns undefined when not set', () => {
      const state = makeState({ isSignReversed: undefined });

      expect(selectIsSignReversed(state)).toBeUndefined();
    });
  });

  describe('selectLanguage', () => {
    it('selectLanguage', () => {
      const state = makeState({ selectedLanguage: 'de' });

      expect(selectLanguage(state)).toBe('de');
    });
  });

  describe('selectLocale', () => {
    it('selectLocale', () => {
      const state = makeState({ selectedLanguage: 'EL' });

      expect(selectLocale(state)).toBe(el);
    });
  });

  describe('selectAuthToken', () => {
    it('selectAuthToken returns set value', () => {
      const state = makeState({ authToken: 'abc123' });

      expect(selectAuthToken(state)).toBe('abc123');
    });

    it('selectAuthToken returns undefined when not set', () => {
      const state = makeState({ authToken: undefined });

      expect(selectAuthToken(state)).toBeUndefined();
    });
  });

  describe('selectApplyPermissions', () => {
    it('selectApplyPermissions', () => {
      const state = makeState({ applyPermissions: true });

      expect(selectApplyPermissions(state)).toBe(true);
    });
  });

  describe('selectLastUpdate', () => {
    it('selectLastUpdate', () => {
      const state = makeState({ lastUpdate: 1700000000 });

      expect(selectLastUpdate(state)).toBe(1700000000);
    });
  });

  describe('selectSecurableObjects', () => {
    it('selectSecurableObjects returns object as-is', () => {
      const securableObjects = { READ: true, WRITE: false, ADMIN: false };
      const state = makeState({ securableObjects });

      expect(selectSecurableObjects(state)).toBe(securableObjects); // same reference
      expect(selectSecurableObjects(state)).toEqual(securableObjects); // same shape
    });
  });
});
