import reducer, {
  ChangeLanguage,
  ChangeThemeMode,
  ChangeThemeName,
  FetchUserPreferences,
  SetLatestFilterGroup,
  SetUserPreferences,
  ToggleShortcuts,
} from './reducers';
import { Init } from '../system/reducers';
import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import { UserSettingsState } from '@pkg-setup/src/userSettings/types';
import { mockDate } from '@_jestHelpers/dateMock';
import { USER_PREFERENCES } from '@pkg-constants/formIds';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('../system/reducers', () => ({
  Init: { type: '@SYSTEM/INIT' },
}));

const initialState = {
  languages: {},
  themeName: 'default',
  themeMode: 'light',
  themeType: 'LARGE',
  themeSource: 'system',
  loading: false,
  applyShortcuts: false,
  preferredLanguage: 'EN',
  userPreferencesSavedLanguage: 'EN',
  filters: [
    {
      tableId: 'A',
      latest: 'latest',
    },
    {
      tableId: 'B',
    },
  ],
} as UserSettingsState;

const dataArea = {
  languages: {},
  themeName: 'BlaBla',
  themeMode: 'dark',
  themeType: 'SLIM',
  themeSource: 'remote',
  applyShortcuts: false,
  preferredLanguage: 'EN',
  theme: 'A-NICE-THEME',
  filters: [
    {
      tableId: 'A',
      latest: 'latest',
    },
    {
      tableId: 'B',
    },
  ],
  userLogo: 'user-logo',
  userHomeImage: 'user-home',
  profilePicUrl: 'profile-picture',
};

describe('UserSettings reducers', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({ ...initialState, filters: [] });
  });

  it('should handle ChangeLanguage', () => {
    const state = reducer(initialState, ChangeLanguage({ language: 'FR' }));

    expect(state.preferredLanguage).toEqual('FR');
  });

  it('should handle ChangeThemeMode', () => {
    const state = reducer(initialState, ChangeThemeMode({ mode: 'dark' }));

    expect(state.themeMode).toEqual('dark');
  });

  it('should handle ChangeThemeName', () => {
    const state = reducer(initialState, ChangeThemeName({ name: 'BlaBla' }));

    expect(state.themeName).toEqual('BlaBla');
  });

  it('should handle ToggleShortcuts', () => {
    const state = reducer(initialState, ToggleShortcuts());

    expect(state.applyShortcuts).toEqual(true);
  });

  describe('SetLatestFilterGroup', () => {
    it('when tableId is not found', () => {
      const state = reducer(
        initialState,
        SetLatestFilterGroup({ tableId: 'C', groupId: 'new latest' }),
      );

      expect(state.filters).toEqual([
        {
          tableId: 'A',
          latest: 'latest',
        },
        {
          tableId: 'B',
        },
      ]);
    });

    it('when tableId exists', () => {
      const state = reducer(
        initialState,
        SetLatestFilterGroup({ tableId: 'A', groupId: 'new latest' }),
      );

      expect(state.filters).toEqual([
        {
          tableId: 'A',
          latest: 'new latest',
        },
        {
          tableId: 'B',
        },
      ]);
    });
  });

  describe('FetchUserPreferences', () => {
    it('should handle FetchUserPreferences.pending', () => {
      const state = reducer(initialState, { type: FetchUserPreferences.pending.type });

      expect(state.loading).toBe(true);
    });

    it('should handle FetchUserPreferences.fulfilled - when all props are found in dataArea', () => {
      const payload = { content: [{ dataArea: JSON.stringify(dataArea) }] };
      const state = reducer(
        { ...initialState, loading: true },
        { type: FetchUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toBe(false);
      expect(state.userPreferencesSavedLanguage).toEqual(dataArea.preferredLanguage);
      expect(state.themeMode).toEqual(dataArea.themeMode);
      expect(state.themeType).toEqual(dataArea.themeType);
      expect(state.themeSource).toEqual(dataArea.themeSource);
      expect(state.themeName).toEqual(dataArea.themeName);
      expect(state.filters).toEqual(dataArea.filters);
      expect(state.applyShortcuts).toEqual(dataArea.applyShortcuts);
      expect(state.userLogo).toEqual(dataArea.userLogo);
      expect(state.userHomeImage).toEqual(dataArea.userHomeImage);
      expect(state.theme).toEqual(dataArea.theme);
      expect(state.profileImage).toEqual(dataArea.profilePicUrl);
    });

    it('should handle FetchUserPreferences.fulfilled - when dataArea is empty', () => {
      const payload = { content: [{ dataArea: JSON.stringify({}) }] };
      const state = reducer(
        { ...initialState, loading: true },
        { type: FetchUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toBe(false);
      expect(state.userPreferencesSavedLanguage).toBeUndefined();
      expect(state.themeMode).toEqual(initialState.themeMode);
      expect(state.themeType).toEqual(initialState.themeType);
      expect(state.themeSource).toEqual(initialState.themeSource);
      expect(state.themeName).toEqual(initialState.themeName);
      expect(state.filters).toBeUndefined();
      expect(state.applyShortcuts).toEqual(initialState.applyShortcuts);
      expect(state.userLogo).toEqual(initialState.userLogo);
      expect(state.userHomeImage).toEqual(initialState.userHomeImage);
      expect(state.theme).toEqual(initialState.theme);
      expect(state.profileImage).toBeUndefined();
    });

    it('should handle FetchUserPreferences.fulfilled - when parsing fails', () => {
      const payload = { content: undefined };
      const state = reducer(
        { ...initialState, loading: true },
        { type: FetchUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toBe(false);
      expect(state.themeMode).toEqual(initialState.themeMode);
      expect(state.themeType).toEqual(initialState.themeType);
      expect(state.themeSource).toEqual(initialState.themeSource);
      expect(state.themeName).toEqual(initialState.themeName);
      expect(state.filters).toBeUndefined();
      expect(state.applyShortcuts).toEqual(initialState.applyShortcuts);
      expect(state.userLogo).toEqual(initialState.userLogo);
      expect(state.userHomeImage).toEqual(initialState.userHomeImage);
      expect(state.theme).toEqual(initialState.theme);
      expect(state.profileImage).toBeUndefined();
    });

    it('should handle FetchUserPreferences.rejected', () => {
      const state = reducer(
        { ...initialState, loading: true },
        { type: FetchUserPreferences.rejected.type },
      );

      expect(state.loading).toBe(false);
    });
  });

  describe('SetUserPreferences', () => {
    const filters = [
      {
        tableId: 'A',
        groups: [
          { groupId: '1', updatedAt: 123 },
          { groupId: '2', updatedAt: 123 },
          { groupId: '3', updatedAt: 123 },
        ],
        latest: '2',
      },
      {
        tableId: 'B',
      },
    ];

    it('should handle SetUserPreferences.pending', () => {
      const state = reducer(initialState, { type: SetUserPreferences.pending.type });

      expect(state.loading).toBe(true);
    });

    it('should handle SetUserPreferences.fulfilled - type = DELETE, groupId found', () => {
      const payload = { tableId: 'A', groupId: '1', criteria: [], type: 'DELETE' };

      const state = reducer(
        // @ts-ignore
        { ...initialState, loading: true, filters },
        { type: SetUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toEqual(false);
      expect(state.filters).toEqual([
        {
          tableId: 'A',
          groups: [
            { groupId: '2', updatedAt: 123 },
            { groupId: '3', updatedAt: 123 },
          ],
          latest: undefined,
        },
        {
          tableId: 'B',
        },
      ]);
    });

    it('should handle SetUserPreferences.fulfilled - type = DELETE, groupId not found', () => {
      const payload = { tableId: 'A', groupId: '5', criteria: [], type: 'DELETE' };

      const state = reducer(
        // @ts-ignore
        { ...initialState, loading: true, filters },
        { type: SetUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toEqual(false);
      expect(state.filters).toEqual([
        {
          tableId: 'A',
          groups: [
            { groupId: '1', updatedAt: 123 },
            { groupId: '2', updatedAt: 123 },
            { groupId: '3', updatedAt: 123 },
          ],
          latest: undefined,
        },
        {
          tableId: 'B',
        },
      ]);
    });

    it('should handle SetUserPreferences.fulfilled - type = DELETE, tableId not found', () => {
      const payload = { tableId: 'C', groupId: '1', criteria: [], type: 'DELETE' };

      const state = reducer(
        // @ts-ignore
        { ...initialState, loading: true, filters },
        { type: SetUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toEqual(false);
      expect(state.filters).toEqual([
        {
          tableId: 'A',
          groups: [
            { groupId: '1', updatedAt: 123 },
            { groupId: '2', updatedAt: 123 },
            { groupId: '3', updatedAt: 123 },
          ],
          latest: '2',
        },
        {
          tableId: 'B',
        },
      ]);
    });

    it('should handle SetUserPreferences.fulfilled - type = UPDATE, groupId found', () => {
      mockDate(1234);
      const payload = { tableId: 'A', groupId: '1', criteria: { a: 'a', b: 'b' }, type: 'UPDATE' };

      const state = reducer(
        // @ts-ignore
        { ...initialState, loading: true, filters },
        { type: SetUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toEqual(false);
      expect(state.filters).toEqual([
        {
          tableId: 'A',
          groups: [
            { groupId: '1', criteria: JSON.stringify(payload.criteria), updatedAt: 1234 },
            { groupId: '2', updatedAt: 123 },
            { groupId: '3', updatedAt: 123 },
          ],
          latest: '1',
        },
        {
          tableId: 'B',
        },
      ]);
    });

    it('should handle SetUserPreferences.fulfilled - type = UPDATE, groupId not found', () => {
      mockDate(1234);
      const payload = { tableId: 'A', groupId: '5', criteria: { a: 'a' }, type: 'UPDATE' };

      const state = reducer(
        // @ts-ignore
        { ...initialState, loading: true, filters },
        { type: SetUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toEqual(false);
      expect(state.filters).toEqual([
        {
          tableId: 'A',
          groups: [
            { groupId: '1', updatedAt: 123 },
            { groupId: '2', updatedAt: 123 },
            { groupId: '3', updatedAt: 123 },
            { groupId: '5', updatedAt: 1234, criteria: JSON.stringify(payload.criteria) },
          ],
          latest: '5',
        },
        {
          tableId: 'B',
        },
      ]);
    });

    it('should handle SetUserPreferences.fulfilled - type = UPDATE, tableId not found', () => {
      mockDate(1234);
      const payload = { tableId: 'C', groupId: '1', criteria: { a: 'a' }, type: 'UPDATE' };

      const state = reducer(
        // @ts-ignore
        { ...initialState, loading: true, filters },
        { type: SetUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toEqual(false);
      expect(state.filters).toEqual([
        {
          tableId: 'A',
          groups: [
            { groupId: '1', updatedAt: 123 },
            { groupId: '2', updatedAt: 123 },
            { groupId: '3', updatedAt: 123 },
          ],
          latest: '2',
        },
        {
          tableId: 'B',
        },
        {
          tableId: 'C',
          groups: [{ groupId: '1', updatedAt: 1234, criteria: JSON.stringify(payload.criteria) }],
          latest: '1',
        },
      ]);
    });

    it('should handle SetUserPreferences.fulfilled - type = MERGE', () => {
      const importedFilters = [
        {
          tableId: 'C',
          groups: [
            { groupId: '1', updatedAt: 123 },
            { groupId: '2', updatedAt: 123 },
            { groupId: '3', updatedAt: 123 },
          ],
        },
        {
          tableId: 'B',
          groups: [
            { groupId: '1', updatedAt: 123 },
            { groupId: '3', updatedAt: 123 },
          ],
        },
      ];
      const payload = { tableId: 'A', groupId: '1', criteria: [], type: 'MERGE', importedFilters };

      const state = reducer(
        // @ts-ignore
        { ...initialState, loading: true, filters },
        { type: SetUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toEqual(false);
      expect(state.filters).toEqual([
        {
          groups: [
            {
              groupId: '1',
              updatedAt: 123,
            },
            {
              groupId: '2',
              updatedAt: 123,
            },
            {
              groupId: '3',
              updatedAt: 123,
            },
          ],
          latest: '2',
          tableId: 'A',
        },
        {
          groups: [
            {
              groupId: '1',
              updatedAt: 123,
            },
            {
              groupId: '3',
              updatedAt: 123,
            },
          ],
          tableId: 'B',
        },
        {
          groups: [
            {
              groupId: '1',
              updatedAt: 123,
            },
            {
              groupId: '2',
              updatedAt: 123,
            },
            {
              groupId: '3',
              updatedAt: 123,
            },
          ],
          tableId: 'C',
        },
      ]);
    });

    it('should handle SetUserPreferences.fulfilled - type = SETTINGS, no filter state change', () => {
      const filters = [
        {
          tableId: 'A',
          groups: [{ groupId: '1', updatedAt: 123 }],
          latest: '1',
        },
      ];
      const payload = { type: 'SETTINGS', preferredLanguage: 'FR' };

      const state = reducer(
        // @ts-ignore
        { ...initialState, loading: true, filters },
        { type: SetUserPreferences.fulfilled.type, payload },
      );

      expect(state.loading).toEqual(false);
      expect(state.filters).toEqual(filters);
    });

    it('should handle SetUserPreferences.rejected', () => {
      const state = reducer(
        { ...initialState, loading: true },
        { type: SetUserPreferences.rejected.type },
      );

      expect(state.loading).toEqual(false);
    });
  });

  describe('ApiData/CallApi/fulfilled', () => {
    it('should handle ApiData/CallApi/fulfilled - when all props are found in dataArea', () => {
      const payload = { data: { dataArea: JSON.stringify(dataArea) }, pageId: USER_PREFERENCES };
      const state = reducer(
        { ...initialState, loading: true },
        { type: 'ApiData/CallApi/fulfilled', payload },
      );

      expect(state.userPreferencesSavedLanguage).toEqual(dataArea.preferredLanguage);
      expect(state.themeMode).toEqual(dataArea.themeMode);
      expect(state.themeType).toEqual(dataArea.themeType);
      expect(state.themeSource).toEqual(dataArea.themeSource);
      expect(state.themeName).toEqual(dataArea.themeName);
      expect(state.filters).toEqual(dataArea.filters);
      expect(state.applyShortcuts).toEqual(dataArea.applyShortcuts);
      expect(state.userLogo).toEqual(dataArea.userLogo);
      expect(state.userHomeImage).toEqual(dataArea.userHomeImage);
      expect(state.theme).toEqual(dataArea.theme);
      expect(state.profileImage).toEqual(dataArea.profilePicUrl);
    });

    it('should handle ApiData/CallApi/fulfilled - when dataArea is empty', () => {
      const payload = { data: { dataArea: JSON.stringify({}) }, pageId: USER_PREFERENCES };
      const state = reducer(
        { ...initialState, loading: true },
        { type: 'ApiData/CallApi/fulfilled', payload },
      );

      expect(state.userPreferencesSavedLanguage).toBeUndefined();
      expect(state.themeMode).toEqual(initialState.themeMode);
      expect(state.themeType).toEqual(initialState.themeType);
      expect(state.themeSource).toEqual(initialState.themeSource);
      expect(state.themeName).toEqual(initialState.themeName);
      expect(state.filters).toBeUndefined();
      expect(state.applyShortcuts).toEqual(initialState.applyShortcuts);
      expect(state.userLogo).toEqual(initialState.userLogo);
      expect(state.userHomeImage).toEqual(initialState.userHomeImage);
      expect(state.theme).toEqual(initialState.theme);
      expect(state.profileImage).toBeUndefined();
    });

    it('should handle ApiData/CallApi/fulfilled - when parsing fails', () => {
      const payload = { data: { dataArea: '' }, pageId: USER_PREFERENCES };
      const state = reducer(
        { ...initialState, loading: true },
        { type: 'ApiData/CallApi/fulfilled', payload },
      );

      expect(state.themeMode).toEqual(initialState.themeMode);
      expect(state.themeType).toEqual(initialState.themeType);
      expect(state.themeSource).toEqual(initialState.themeSource);
      expect(state.themeName).toEqual(initialState.themeName);
      expect(state.filters).toBeUndefined();
      expect(state.applyShortcuts).toEqual(initialState.applyShortcuts);
      expect(state.userLogo).toEqual(initialState.userLogo);
      expect(state.userHomeImage).toEqual(initialState.userHomeImage);
      expect(state.theme).toEqual(initialState.theme);
      expect(state.profileImage).toBeUndefined();
    });
  });

  describe('Init', () => {
    it('should handle Init - when all props are found in dataArea', () => {
      const payload = { UserSettings: dataArea };
      const state = reducer(initialState, { type: Init.type, payload });

      expect(state.userPreferencesSavedLanguage).toEqual(dataArea.preferredLanguage);
      expect(state.themeMode).toEqual(dataArea.themeMode);
      expect(state.themeType).toEqual(dataArea.themeType);
      expect(state.themeSource).toEqual(dataArea.themeSource);
      expect(state.themeName).toEqual(dataArea.themeName);
      expect(state.filters).toEqual(dataArea.filters);
      expect(state.applyShortcuts).toEqual(dataArea.applyShortcuts);
      expect(state.userLogo).toEqual(dataArea.userLogo);
      expect(state.userHomeImage).toEqual(dataArea.userHomeImage);
      expect(state.theme).toEqual(dataArea.theme);
      expect(state.profileImage).toEqual(dataArea.profilePicUrl);
    });

    it('should handle ApiData/CallApi/fulfilled - when dataArea is empty', () => {
      const payload = { UserSettings: {} };
      const state = reducer(initialState, { type: Init.type, payload });

      expect(state.userPreferencesSavedLanguage).toBeUndefined();
      expect(state.themeMode).toEqual(initialState.themeMode);
      expect(state.themeType).toEqual(initialState.themeType);
      expect(state.themeSource).toEqual(initialState.themeSource);
      expect(state.themeName).toEqual(initialState.themeName);
      expect(state.filters).toBeUndefined();
      expect(state.applyShortcuts).toEqual(initialState.applyShortcuts);
      expect(state.userLogo).toEqual(initialState.userLogo);
      expect(state.userHomeImage).toEqual(initialState.userHomeImage);
      expect(state.theme).toEqual(initialState.theme);
      expect(state.profileImage).toBeUndefined();
    });

    it('should handle ApiData/CallApi/fulfilled - when parsing fails', () => {
      const payload = { UserSettings: '' };
      const state = reducer(initialState, { type: Init.type, payload });

      expect(state.themeMode).toEqual(initialState.themeMode);
      expect(state.themeType).toEqual(initialState.themeType);
      expect(state.themeSource).toEqual(initialState.themeSource);
      expect(state.themeName).toEqual(initialState.themeName);
      expect(state.filters).toBeUndefined();
      expect(state.applyShortcuts).toEqual(initialState.applyShortcuts);
      expect(state.userLogo).toEqual(initialState.userLogo);
      expect(state.userHomeImage).toEqual(initialState.userHomeImage);
      expect(state.theme).toEqual(initialState.theme);
      expect(state.profileImage).toBeUndefined();
    });
  });
});

describe('FetchUserPreferences thunk', () => {
  const createThunkStore = (systemUsed = 'IRM') =>
    configureStore({
      reducer: {
        UserSettings: reducer,
        System: (state = { systemUsed, apiUrl: 'https://api' }) => state,
        LoggedInUser: (state = { profile: { userId: 'user-1', partyRoleId: 'role-1' } }) => state,
      },
    });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('calls the IRM URL', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { content: [] } });
    const store = createThunkStore('IRM');

    await store.dispatch(FetchUserPreferences());

    expect(mockedAxios.post).toHaveBeenCalledWith('https://api/registration/users/search', {
      ids: ['role-1'],
      partyRoleTypeCode: 'SOTAXUSER',
    });
  });

  it('calls the ISS URL', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { content: [] } });
    const store = createThunkStore('ISS');

    await store.dispatch(FetchUserPreferences());

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api/ss-registry/portal-users/user-1/user-preferences',
    );
  });

  it('dispatches fulfilled with response data', async () => {
    const responseData = { content: [{ dataArea: JSON.stringify(dataArea) }] };
    mockedAxios.post.mockResolvedValueOnce({ data: responseData });
    const store = createThunkStore('IRM');

    const result = await store.dispatch(FetchUserPreferences());

    expect(result.type).toBe(FetchUserPreferences.fulfilled.type);
    expect(result.payload).toEqual(responseData);
  });

  it('dispatches rejected when API call fail', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    const store = createThunkStore('IRM');

    const result = await store.dispatch(FetchUserPreferences());

    expect(result.type).toBe(FetchUserPreferences.rejected.type);
  });
});

describe('SetUserPreferences thunk', () => {
  const createThunkStore = (systemUsed = 'IRM') =>
    configureStore({
      reducer: {
        UserSettings: reducer,
        System: (state = { systemUsed, apiUrl: 'https://api' }) => state,
        LoggedInUser: (state = { profile: { userId: 'user-1', partyRoleId: 'role-1' } }) => state,
        Tables: (state = {}) => state,
      },
    });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('calls the IRM URL via axios.put', async () => {
    mockedAxios.put.mockResolvedValueOnce({});
    const store = createThunkStore('IRM');

    await store.dispatch(SetUserPreferences({ type: 'UPDATE', tableId: 'A', groupId: '1' }));

    expect(mockedAxios.put).toHaveBeenCalledWith(
      'https://api/registration/users/preferences/role-1',
      expect.anything(),
    );
  });

  it('calls the ISS URL via axios.put', async () => {
    mockedAxios.put.mockResolvedValueOnce({});
    const store = createThunkStore('ISS');

    await store.dispatch(SetUserPreferences({ type: 'UPDATE', tableId: 'A', groupId: '1' }));

    expect(mockedAxios.put).toHaveBeenCalledWith(
      'https://api/ss-registry/portal-users/user-1/user-preferences',
      expect.anything(),
    );
  });

  it('dispatches fulfilled with correct payload on success', async () => {
    mockedAxios.put.mockResolvedValueOnce({});
    const store = createThunkStore();

    const result = await store.dispatch(
      SetUserPreferences({ type: 'UPDATE', tableId: 'A', groupId: '1' }),
    );

    expect(result.type).toBe(SetUserPreferences.fulfilled.type);
    expect(result.payload).toMatchObject({ type: 'UPDATE', tableId: 'A', groupId: '1' });
  });

  it('dispatches rejected when API call fails', async () => {
    mockedAxios.put.mockRejectedValueOnce('fail');
    const store = createThunkStore();

    const result = await store.dispatch(
      SetUserPreferences({ type: 'UPDATE', tableId: 'A', groupId: '1' }),
    );

    expect(result.type).toBe(SetUserPreferences.rejected.type);
  });

  it('calls the IRM URL with SETTINGS type for language preference', async () => {
    mockedAxios.put.mockResolvedValueOnce({});
    const store = createThunkStore('IRM');

    await store.dispatch(
      SetUserPreferences({ type: 'SETTINGS', tableId: '', groupId: '', preferredLanguage: 'FR' }),
    );

    expect(mockedAxios.put).toHaveBeenCalledWith(
      'https://api/registration/users/preferences/role-1',
      expect.objectContaining({
        dataArea: expect.stringContaining('"preferredLanguage":"FR"'),
      }),
    );
  });

  it('dispatches fulfilled with SETTINGS type on language save success', async () => {
    mockedAxios.put.mockResolvedValueOnce({});
    const store = createThunkStore();

    const result = await store.dispatch(
      SetUserPreferences({ type: 'SETTINGS', tableId: '', groupId: '', preferredLanguage: 'FR' }),
    );

    expect(result.type).toBe(SetUserPreferences.fulfilled.type);
    expect(result.payload).toMatchObject({ type: 'SETTINGS' });
  });

  it('dispatches rejected when SETTINGS API call fails', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    const store = createThunkStore();

    const result = await store.dispatch(
      SetUserPreferences({ type: 'SETTINGS', preferredLanguage: 'FR' }),
    );

    expect(result.type).toBe(SetUserPreferences.rejected.type);
  });
});

describe('SYSTEM_CLEAR', () => {
  it('resets latest to empty string for all filters', () => {
    const initialStateWithFilters: UserSettingsState = {
      ...initialState,
      filters: [
        { tableId: 'A', latest: 'group-1', groups: [] },
        { tableId: 'B', latest: 'group-2', groups: [] },
      ],
    };

    const state = reducer(initialStateWithFilters, { type: '@SYSTEM/CLEAR' });

    expect(state.filters).toBeDefined();
    expect(state.filters?.[0].latest).toBe('');
    expect(state.filters?.[1].latest).toBe('');
  });
});
