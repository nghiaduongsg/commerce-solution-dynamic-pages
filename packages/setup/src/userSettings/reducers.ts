import { SettingsFilters, UserSettingsState } from './types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';
import axios from 'axios';
import { AnyType } from '@pkg-common/types';
import { SystemState } from '@pkg-setup/src/system/types';
import { Init } from '@pkg-setup/src/system/reducers';
import { EnqueueSnackbar } from '@pkg-common/notifier/reducers';
import { USER_PREFERENCES } from '@pkg-constants/formIds';
import { UserState } from '../user/types';
import { MarkButtonPress } from '@pkg-common/button/reducers';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';

const initialState: UserSettingsState = {
  languages: {},
  themeName: 'default',
  themeMode: 'light',
  themeType: 'LARGE',
  themeSource: 'system',
  loading: false,
  applyShortcuts: false,
  preferredLanguage: 'EN',
  userPreferencesSavedLanguage: 'EN',
  filters: [],
};

const FILTER_ACTION_MESSAGES: Record<string, string> = {
  UPDATE: 'filtersSavedSuccessfully',
  DELETE: 'filtersDeletedSuccessfully',
};

export const slice = 'UserSettings';

export const FetchUserPreferences: AnyType = createAsyncThunk(
  'UserSettings/fetchUserPreferences',
  async (_, { getState }) => {
    const state = getState() as { System: SystemState; LoggedInUser: UserState };
    const { systemUsed: application, apiUrl } = state.System || {};
    const { profile } = state.LoggedInUser || {};
    const { userId, partyRoleId } = profile || {};

    if (application === 'ISS') {
      const url = `${apiUrl}/ss-registry/portal-users/${userId}/user-preferences`;
      return axios.get(url).then((response) => response.data);
    } else {
      const url = `${apiUrl}/registration/users/search`;
      const payload = {
        ids: [partyRoleId],
        partyRoleTypeCode: 'SOTAXUSER',
      };
      return axios.post(url, payload).then((response) => response.data);
    }
  },
);

export const SetUserPreferences: AnyType = createAsyncThunk(
  'UserSettings/setUserPreferences',
  async (
    action: {
      type: string;
      tableId: string;
      groupId: string;
      importedFilters?: SettingsFilters[];
      preferredLanguage?: string;
    },
    { getState, rejectWithValue, dispatch },
  ) => {
    const { type, tableId, groupId, importedFilters, preferredLanguage } = action;
    try {
      const state = getState() as any;
      const { criteria } = (state.Tables ?? {})[tableId] ?? {};
      const { systemUsed: application, apiUrl } = state.System ?? {};
      const {
        profile: { userId, partyRoleId },
      } = state.LoggedInUser || {};

      const url =
        application === 'ISS'
          ? `${apiUrl}/ss-registry/portal-users/${userId}/user-preferences`
          : `${apiUrl}/registration/users/preferences/${partyRoleId}`;

      const settings = state.UserSettings || {};
      await axios.put(
        url,
        prepareUserSettings(
          tableId,
          groupId,
          type,
          settings,
          criteria,
          importedFilters,
          preferredLanguage,
        ),
      );

      const snackbarMessage = FILTER_ACTION_MESSAGES[type];
      if (snackbarMessage) {
        dispatch(
          EnqueueSnackbar({
            key: new Date().getTime().toString(),
            message: snackbarMessage,
            namespace: COMMON,
            severity: 'dark',
          }),
        );
      }

      dispatch(MarkButtonPress({ id: 'SetUserPreferences' }));
      return { type, tableId, groupId, importedFilters, criteria };
    } catch (error) {
      const errorMessage = type === 'SETTINGS' ? 'languageSaveError' : 'filtersError';
      dispatch(
        EnqueueSnackbar({
          key: new Date().getTime().toString(),
          message: errorMessage,
          namespace: COMMON,
          severity: 'error',
        }),
      );
      return rejectWithValue({
        error: error,
      });
    }
  },
);

const userSettingsSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    ChangeLanguage: (state, action) => {
      state.preferredLanguage = action.payload.language;
    },
    ChangeThemeMode: (state, action) => {
      state.themeMode = action.payload.mode;
    },
    ChangeThemeName: (state, action) => {
      state.themeName = action.payload.name;
    },
    ToggleShortcuts: (state) => {
      state.applyShortcuts = !state.applyShortcuts;
    },
    SetLatestFilterGroup: (state, action) => {
      const { tableId, groupId } = action.payload ?? {};
      if (state?.filters) {
        const filter = state?.filters?.find((filter) => filter.tableId === tableId);
        if (filter) {
          filter.latest = groupId;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(FetchUserPreferences.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(FetchUserPreferences.fulfilled, (state, action) => {
      try {
        const response = parseResponse(action?.payload?.content?.[0].dataArea);
        setupUserSettings(state, response);
        state.loading = false;
      } catch {
        state.loading = false;
      }
    });
    builder.addCase(FetchUserPreferences.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(SetUserPreferences.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(SetUserPreferences.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(SetUserPreferences.fulfilled, (state, action) => {
      const { tableId, groupId, criteria, type, importedFilters } = action.payload || {};
      state.loading = false;
      if (type === 'SETTINGS') return;
      // @ts-ignore
      state.filters =
        type === 'DELETE'
          ? deleteFilters(tableId, groupId, state.filters || [])
          : type === 'MERGE'
            ? mergeFilters(state.filters || [], importedFilters || [])
            : updateFilters(tableId, groupId, criteria, state.filters || []);
    });
    builder.addCase('ApiData/CallApi/fulfilled', (state, action: AnyType) => {
      if (
        action.payload?.pageId === USER_PREFERENCES ||
        action.payload?.id === USER_PREFERENCES //WIP
      ) {
        try {
          const response = parseResponse(action.payload?.data?.dataArea);
          setupUserSettings(state, response);
        } catch {}
      }
    });
    builder.addCase(Init, (state, action: AnyType) => {
      try {
        const settings = action?.payload?.UserSettings || {};
        setupUserSettings(state, settings);
      } catch {}
    });
    builder.addCase(SYSTEM_CLEAR, (state) => {
      state?.filters?.forEach((filter) => (filter.latest = ''));
    });
  },
});

export default userSettingsSlice.reducer;
export const {
  ChangeLanguage,
  SetLatestFilterGroup,
  ChangeThemeMode,
  ChangeThemeName,
  ToggleShortcuts,
} = userSettingsSlice.actions;

const parseResponse = (response: AnyType) => {
  try {
    return JSON.parse(response);
  } catch {
    return {};
  }
};

const getProcessedFilters = (
  type: string,
  filters: SettingsFilters[] | undefined,
  tableId: string,
  groupId: string,
  criteria: AnyType | undefined,
  importedFilters: SettingsFilters[] | undefined,
) => {
  switch (type) {
    case 'SETTINGS':
      return filters || [];
    case 'DELETE':
      return deleteFilters(tableId, groupId, filters || []);
    case 'MERGE':
      return mergeFilters(filters || [], importedFilters || []);
    default:
      return updateFilters(tableId, groupId, criteria, filters || []);
  }
};

const prepareUserSettings = (
  tableId: string,
  groupId: string,
  type: string,
  oldSettings,
  criteria?: AnyType,
  importedFilters?: SettingsFilters[],
  preferredLanguageOverride?: string,
) => {
  const {
    preferredLanguage: storedLanguage,
    themeMode,
    themeType,
    themeName,
    themeSource,
    filters,
    applyShortcuts,
    theme,
    profilePicUrl,
    userLogo,
    userHomeImage,
    depositRegister,
    tenderRegister,
  } = oldSettings || {};

  const preferredLanguage = preferredLanguageOverride ?? storedLanguage;

  const processedFilters = getProcessedFilters(
    type,
    filters,
    tableId,
    groupId,
    criteria,
    importedFilters,
  );

  const settings = {
    preferredLanguage,
    themeMode,
    themeType,
    themeName,
    themeSource,
    applyShortcuts,
    theme,
    profilePicUrl,
    userLogo,
    userHomeImage,
    filters: processedFilters,
    depositRegister,
    tenderRegister,
  };

  try {
    return {
      ...settings,
      dataArea: JSON.stringify(settings),
    };
  } catch {
    return oldSettings;
  }
};

const setupUserSettings = (
  state,
  response: {
    preferredLanguage?: string;
    themeMode?: string;
    themeType?: string;
    themeName?: string;
    themeSource?: string;
    applyShortcuts?: boolean;
    theme?: string;
    profilePicUrl?: string;
    userHomeImage?: string;
    userLogo?: string;
    filters?: AnyType;
    depositRegister?: AnyType;
    tenderRegister?: AnyType;
  } = {},
) => {
  //  Saved in a different property to maintain different values with the dropdown language while still allowing the refresh of HomeLayout
  state.userPreferencesSavedLanguage = response?.preferredLanguage;
  state.themeMode = response?.themeMode || initialState.themeMode;
  state.themeType = response?.themeType || initialState.themeType;
  state.themeName = response?.themeName || initialState.themeName;
  state.themeSource = response?.themeSource || initialState.themeSource;
  state.filters = response?.filters;
  state.applyShortcuts = response?.applyShortcuts || initialState.applyShortcuts;
  state.userLogo = response?.userLogo || initialState.userLogo;
  state.userHomeImage = response?.userHomeImage || initialState.userHomeImage;
  state.theme = response?.theme;
  state.depositRegister = response?.depositRegister;
  state.tenderRegister = response?.tenderRegister;
  if (response?.profilePicUrl) {
    state.profileImage = response?.profilePicUrl;
  }
};

const updateFilters = (
  tableId: string,
  groupId: string,
  criteria: AnyType,
  filters: SettingsFilters[],
) => {
  const now = new Date().toISOString();

  const copyFilters = cloneDeep(filters);

  const stringifiedCriteria = JSON.stringify(criteria);

  const filter = copyFilters.find((filter) => filter.tableId === tableId);

  if (filter) {
    // If tableId exists, check if the groupId exists

    const group = (filter?.groups ?? []).find((group) => group.groupId === groupId);

    if (group) {
      group.criteria = stringifiedCriteria;
      group.updatedAt = now;
    } else {
      filter?.groups?.push({
        groupId,
        criteria: stringifiedCriteria,
        updatedAt: now,
      });
    }
    filter.latest = groupId;

    return copyFilters;
  }

  return [
    ...filters,
    {
      tableId,
      latest: groupId,
      groups: [
        {
          groupId,
          criteria: stringifiedCriteria,
          updatedAt: now,
        },
      ],
    },
  ];
};

const deleteFilters = (tableId: string, groupId: string, filters: SettingsFilters[]) => {
  return filters
    .map((filter) => {
      if (filter.tableId !== tableId) return filter;

      const updatedGroups = filter?.groups?.filter((group) => group.groupId !== groupId);

      return updatedGroups.length ? { ...filter, groups: updatedGroups, latest: undefined } : null;
    })
    .filter(Boolean); // Remove null values
};

const mergeFilters = (existingFilters: SettingsFilters[], importedFilters: SettingsFilters[]) => {
  const existingMap = new Map<string, SettingsFilters>();

  for (const filter of existingFilters) {
    existingMap.set(filter.tableId, cloneDeep(filter));
  }

  for (const imported of importedFilters) {
    existingMap.set(imported.tableId, cloneDeep(imported));
  }

  return Array.from(existingMap.values());
};

export const exportFilters = (groups = {}, tableId = '', lastGroup: string | null = null) => {
  const json = JSON.stringify([{ tableId, groups, latest: lastGroup }], null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = tableId ? `${tableId}-filters.json` : 'filters.json';
  a.click();
  URL.revokeObjectURL(url);
};

export const importFilters = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.readAsText(file);
};
