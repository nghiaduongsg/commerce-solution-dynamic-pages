import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import {
  selectedLanguage,
  selectedProfileImage,
  selectedThemeMode,
  selectedThemeName,
  selectedThemeSource,
  selectedThemeType,
  selectTheme,
  shortcutsOn,
  selectAllTableFilters,
  selectedLogo,
  selectedHomeImage,
  selectDepositRegister,
  selectTenderRegister,
} from './selectors';
import {
  ChangeLanguage,
  ChangeThemeMode,
  ChangeThemeName,
  ToggleShortcuts,
  FetchUserPreferences,
  SetUserPreferences,
} from './reducers';
import { useCallback } from 'react';
import { SettingsFilters } from './types';

const useUserSettings = () => {
  const dispatch = useDispatch();

  return {
    theme: useSelector(selectTheme),
    language: useSelector(selectedLanguage, shallowEqual),
    themeName: useSelector(selectedThemeName, shallowEqual),
    themeSource: useSelector(selectedThemeSource, shallowEqual),
    themeMode: useSelector(selectedThemeMode, shallowEqual),
    themeType: useSelector(selectedThemeType, shallowEqual),
    shortcutsOn: useSelector(shortcutsOn, shallowEqual),
    profileImage: useSelector(selectedProfileImage, shallowEqual),
    logo: useSelector(selectedLogo, shallowEqual),
    homeImage: useSelector(selectedHomeImage, shallowEqual),
    filters: useSelector(selectAllTableFilters, shallowEqual),
    depositRegister: useSelector(selectDepositRegister, shallowEqual),
    tenderRegister: useSelector(selectTenderRegister, shallowEqual),
    changeLanguage: useCallback(
      (language: string) => dispatch(ChangeLanguage({ language })),
      [dispatch],
    ),
    saveLanguagePreference: useCallback(
      (language: string) => {
        dispatch(
          SetUserPreferences({
            type: 'SETTINGS',
            tableId: '',
            groupId: '',
            preferredLanguage: language,
          }),
        );
      },
      [dispatch],
    ),
    changeThemeMode: useCallback((mode: string) => dispatch(ChangeThemeMode({ mode })), [dispatch]),
    changeThemeName: useCallback((name: string) => dispatch(ChangeThemeName({ name })), [dispatch]),
    toggleShortcuts: useCallback(() => dispatch(ToggleShortcuts()), [dispatch]),
    fetchUserPreferences: useCallback(() => dispatch(FetchUserPreferences()), [dispatch]),
    setUserPreferences: useCallback(
      (
        tableId: string,
        type: string,
        selectedGroup?: string,
        importedFilters?: SettingsFilters[],
      ) =>
        dispatch(
          SetUserPreferences({
            tableId,
            type,
            groupId: selectedGroup ?? 'DEFAULT',
            importedFilters,
          }),
        ),
      [dispatch],
    ),
  };
};

export default useUserSettings;
