import reducer, { Update, Init } from './reducers';
import type { SystemState } from './types';

jest.mock('../user/reducers', () => ({
  getAll: jest.fn((input: Record<string, boolean> | undefined) => ({
    ...(input || {}),
    __normalized: true,
  })),
}));

jest.mock('@pkg-constants/formIds', () => ({
  USER_PREFERENCES: 'USER_PREFERENCES',
}));

import { getAll } from '../user/reducers';
import { USER_PREFERENCES } from '@pkg-constants/formIds';
import { el, enUS, lt } from 'date-fns/locale';

describe('System slice reducer', () => {
  const now = new Date('2023-01-02T03:04:05.000Z');
  const nowMs = now.getTime();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const initial: Partial<SystemState> = {
    apiUrl: '',
    allSymbol: '',
    systemUsed: '',
    systemAssets: '',
    applyPermissions: true,
    useStaticSchemas: true,
    useDefaultTranslations: true,
    primaryCurrency: { code: '' },
    selectedLanguage: '',
    lastUpdate: 0,
    retentionPeriod: 1,
    isSignReversed: false,
    securableObjects: {},
  };

  it('should return the initial state for unknown action', () => {
    const state = reducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(initial);
  });

  describe('Update reducer', () => {
    it('should merge payload props and set lastUpdate to now', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const next = reducer(
        prev,
        Update({
          apiUrl: 'https://new.example.com',
          primaryCurrency: { code: 'EUR' },
          lastUpdate: 123,
        }),
      );

      expect(next.apiUrl).toBe('https://new.example.com');
      expect(next.primaryCurrency).toEqual({ code: 'EUR' });
      expect(next.applyPermissions).toBe(true);
      expect(next.lastUpdate).toBe(nowMs);
      expect(next.lastUpdate).not.toBe(123);
    });

    it('should update only lastUpdate when payload is empty', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);
      const next = reducer(prev, Update({}));

      expect({ ...next, lastUpdate: 0 }).toEqual(initial);
      expect(next.lastUpdate).toBe(nowMs);
    });

    it('should perform a shallow merge for nested objects', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);
      const next = reducer(prev, Update({ primaryCurrency: { code: 'GBP' } }));

      expect(next.primaryCurrency).toEqual({ code: 'GBP' });
      expect(next.primaryLanguage).toBeUndefined();
      expect(next.lastUpdate).toBe(nowMs);
    });

    it('should handle undefined payload', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);
      const next = reducer(prev, Update(undefined as any));

      expect({ ...next, lastUpdate: 0 }).toEqual(initial);
      expect(next.lastUpdate).toBe(nowMs);
    });

    it('should handle null payload', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);
      const next = reducer(prev, Update(null as any));

      expect({ ...next, lastUpdate: 0 }).toEqual(initial);
      expect(next.lastUpdate).toBe(nowMs);
    });
  });

  describe('Init reducer', () => {
    it('should merge System payload, set lastUpdate, and normalize securableObjects with getAll', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const payload: Partial<SystemState> = {
        apiUrl: 'https://init.example.com',
        selectedLanguage: 'en',
        securableObjects: { READ: true, WRITE: false },
      };

      const next = reducer(
        prev,
        Init({
          System: payload,
        } as any),
      );

      expect(next.apiUrl).toBe('https://init.example.com');
      expect(next.selectedLanguage).toBe('en');

      expect(next.lastUpdate).toBe(nowMs);

      expect(getAll).toHaveBeenCalledTimes(1);
      expect(getAll).toHaveBeenCalledWith({ READ: true, WRITE: false });
      expect(next.securableObjects).toEqual({
        READ: true,
        WRITE: false,
        __normalized: true,
      });
    });

    it('should handle missing System payload (still updates lastUpdate, calls getAll with undefined)', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);
      const next = reducer(prev, Init({} as any));

      expect(getAll).toHaveBeenCalledTimes(1);
      expect(getAll).toHaveBeenCalledWith(undefined);
      expect(next.lastUpdate).toBe(nowMs);
      expect(next.securableObjects).toEqual({ __normalized: true });
    });

    it('should handle empty securableObjects', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const payload: Partial<SystemState> = {
        apiUrl: 'https://init.example.com',
        securableObjects: {},
      };

      const next = reducer(
        prev,
        Init({
          System: payload,
        } as any),
      );

      expect(getAll).toHaveBeenCalledWith({});
      expect(next.securableObjects).toEqual({ __normalized: true });
    });

    it('should handle securableObjects with mixed permissions', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const payload: Partial<SystemState> = {
        apiUrl: 'https://test.example.com',
        securableObjects: { create: true, delete: false, update: true },
      };

      const next = reducer(
        prev,
        Init({
          System: payload,
        } as any),
      );

      expect(getAll).toHaveBeenCalledWith({ create: true, delete: false, update: true });
      expect(next.securableObjects).toEqual({
        create: true,
        delete: false,
        update: true,
        __normalized: true,
      });
    });

    it('should handle null System payload', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);
      const next = reducer(prev, Init({ System: null } as any));

      expect(getAll).toHaveBeenCalledWith(undefined);
      expect(next.lastUpdate).toBe(nowMs);
      expect(next.securableObjects).toEqual({ __normalized: true });
    });
  });

  describe('extraReducers: ApiData/CallApi/fulfilled', () => {
    const fulfilledType = 'ApiData/CallApi/fulfilled';

    it('should update selectedLanguage when pageId matches USER_PREFERENCES and JSON is valid', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const action = {
        type: fulfilledType,
        payload: {
          pageId: USER_PREFERENCES,
          data: { dataArea: JSON.stringify({ preferredLanguage: 'fr' }) },
        },
      };

      const next = reducer(prev, action as any);
      expect(next.selectedLanguage).toBe('fr');
    });

    it('should update selectedLanguage when id matches USER_PREFERENCES and JSON is valid', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const action = {
        type: fulfilledType,
        payload: {
          id: USER_PREFERENCES,
          data: { dataArea: JSON.stringify({ preferredLanguage: 'it' }) },
        },
      };

      const next = reducer(prev, action as any);
      expect(next.selectedLanguage).toBe('it');
    });

    it('should ignore when JSON is invalid (no throw) and keep selectedLanguage unchanged', () => {
      const withLang = reducer(
        reducer(undefined, { type: '@@INIT' } as any),
        Update({ selectedLanguage: 'en' }),
      );

      const action = {
        type: fulfilledType,
        payload: {
          pageId: USER_PREFERENCES,
          data: { dataArea: 'not-json' },
        },
      };

      const next = reducer(withLang, action as any);
      expect(next.selectedLanguage).toBe('en');
    });

    it('should ignore actions that do not target USER_PREFERENCES', () => {
      const withLang = reducer(
        reducer(undefined, { type: '@@INIT' } as any),
        Update({ selectedLanguage: 'en' }),
      );

      const action = {
        type: fulfilledType,
        payload: {
          pageId: 'SOME_OTHER_PAGE',
          data: { dataArea: JSON.stringify({ preferredLanguage: 'de' }) },
        },
      };

      const next = reducer(withLang, action as any);
      expect(next.selectedLanguage).toBe('en');
    });

    it('should keep selectedLanguage unchanged when preferredLanguage is absent in response', () => {
      const withLang = reducer(
        reducer(undefined, { type: '@@INIT' } as any),
        Update({ selectedLanguage: 'en' }),
      );

      const action = {
        type: fulfilledType,
        payload: {
          pageId: USER_PREFERENCES,
          data: { dataArea: JSON.stringify({ somethingElse: true }) },
        },
      };

      const next = reducer(withLang, action as any);
      expect(next.selectedLanguage).toBe('en');
    });

    it('should handle missing data object', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const action = {
        type: fulfilledType,
        payload: {
          pageId: USER_PREFERENCES,
        },
      };

      const next = reducer(prev, action as any);
      expect(next.selectedLanguage).toBe('');
    });

    it('should handle missing dataArea in data object', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const action = {
        type: fulfilledType,
        payload: {
          pageId: USER_PREFERENCES,
          data: {},
        },
      };

      const next = reducer(prev, action as any);
      expect(next.selectedLanguage).toBe('');
    });

    it('should handle null dataArea', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const action = {
        type: fulfilledType,
        payload: {
          pageId: USER_PREFERENCES,
          data: { dataArea: null },
        },
      };

      const next = reducer(prev, action as any);
      expect(next.selectedLanguage).toBe('');
    });

    it('should handle undefined payload', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const action = {
        type: fulfilledType,
        payload: undefined,
      };

      const next = reducer(prev, action as any);
      expect(next.selectedLanguage).toBe('');
    });

    it('should handle both pageId and id being undefined', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const action = {
        type: fulfilledType,
        payload: {
          data: { dataArea: JSON.stringify({ preferredLanguage: 'de' }) },
        },
      };

      const next = reducer(prev, action as any);
      expect(next.selectedLanguage).toBe('');
    });

    it('should handle empty string dataArea', () => {
      const prev = reducer(undefined, { type: '@@INIT' } as any);

      const action = {
        type: fulfilledType,
        payload: {
          pageId: USER_PREFERENCES,
          data: { dataArea: '' },
        },
      };

      const next = reducer(prev, action as any);
      expect(next.selectedLanguage).toBe('');
    });

    it('should fallback to existing selectedLanguage when preferredLanguage is null', () => {
      const withLang = reducer(
        reducer(undefined, { type: '@@INIT' } as any),
        Update({ selectedLanguage: 'en' }),
      );

      const action = {
        type: fulfilledType,
        payload: {
          pageId: USER_PREFERENCES,
          data: { dataArea: JSON.stringify({ preferredLanguage: null }) },
        },
      };

      const next = reducer(withLang, action as any);
      expect(next.selectedLanguage).toBe('en');
    });
  });
});
