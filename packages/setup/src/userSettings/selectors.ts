import { SettingsFilters, UserSettingsState } from '@pkg-setup/src/userSettings/types';
import { isJSON } from '@pkg-common/utils/utils';

const getLastSavedFilterGroup = (tableId: string, filters: Array<SettingsFilters> = []) => {
  const filter = filters?.find((f) => f.tableId === tableId);

  const numOfGroups = filter?.groups?.length;
  if (!numOfGroups) {
    return undefined;
  }

  return filter?.groups.find((group) => group.groupId === filter.latest);
};

export const selectedLanguage = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.preferredLanguage;
export const selectedThemeMode = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.themeMode || 'light';
export const selectedThemeName = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.themeName || '';
export const selectedThemeSource = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.themeSource || 'system';
export const selectedThemeType = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.themeType || 'LARGE';

export const shortcutsOn = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.applyShortcuts || false;

export const selectedProfileImage = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.profileImage;

export const selectedLogo = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.userLogo;

export const selectedHomeImage = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.userHomeImage;

export const selectTheme = (state: { UserSettings: UserSettingsState }) => state.UserSettings.theme;

export const selectDepositRegister = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.depositRegister;

export const selectTenderRegister = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.tenderRegister;

export const selectLastSavedParsedCriteria =
  (tableId: string) => (state: { UserSettings: UserSettingsState }) => {
    const filters = state.UserSettings.filters;
    const lastSavedGroup = getLastSavedFilterGroup(tableId, filters);
    try {
      return isJSON(lastSavedGroup?.criteria) || {};
    } catch {
      return {};
    }
  };

export const selectLastSavedCriteria =
  (tableId: string) => (state: { UserSettings: UserSettingsState }) => {
    const filters = state.UserSettings.filters;
    const lastSavedGroup = getLastSavedFilterGroup(tableId, filters);
    return lastSavedGroup?.criteria;
  };

export const selectLastSavedGroup =
  (tableId: string) => (state: { UserSettings: UserSettingsState }) => {
    const filters = state.UserSettings.filters;
    const lastSavedGroup = getLastSavedFilterGroup(tableId, filters);

    return lastSavedGroup?.groupId ?? undefined;
  };

export const selectGroupsForTable =
  (tableId: string) => (state: { UserSettings: UserSettingsState }) => {
    const filters = state.UserSettings.filters;
    const selectedTableFilter = filters?.find((filter) => filter?.tableId === tableId);
    return selectedTableFilter?.groups ?? [];
  };

export const selectAllTableFilters = (state: { UserSettings: UserSettingsState }) =>
  state.UserSettings.filters;
