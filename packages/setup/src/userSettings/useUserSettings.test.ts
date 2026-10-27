import { renderHook } from '@testing-library/react';
import useUserSettings from './useUserSettings';
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import {
  ChangeLanguage,
  ChangeThemeMode,
  ChangeThemeName,
  ToggleShortcuts,
} from '@pkg-setup/src/userSettings/reducers';

const settings = {
  loading: false,
  themeMode: 'light',
  themeSource: 'remote',
  themeName: 'My-Theme',
  themeType: 'LARGE',
  applyShortcuts: true,
  preferredLanguage: 'EL',
  userPreferencesSavedLanguage: 'EN',
  theme: undefined,
  profileImage: 'image',
  userLogo: 'image',
  userHomeImage: 'image',
  filters: [
    {
      tableId: 'A',
      groups: [
        {
          groupId: '1',
          criteria: JSON.stringify({ a: 'a' }),
          updatedAt: '123',
        },
        {
          groupId: '2',
          criteria: JSON.stringify({ b: 'b' }),
          updatedAt: '123',
        },
      ],
    },
  ],
};

const storeData = {
  UserSettings: settings,
  System: {
    apiUrl: '',
    systemUsed: 'IRM',
  },
};

describe('useUserSettings', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should return the theme related properties from the store', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });

    expect(result.current.themeName).toEqual(settings.themeName);
    expect(result.current.themeSource).toEqual(settings.themeSource);
    expect(result.current.themeMode).toEqual(settings.themeMode);
    expect(result.current.themeType).toEqual(settings.themeType);
    expect(result.current.theme).toEqual(settings.theme);
  });

  it('should return language from the store', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });

    expect(result.current.language).toEqual(settings.preferredLanguage);
  });

  it('should return applyShortcuts from the store', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });

    expect(result.current.shortcutsOn).toEqual(settings.applyShortcuts);
  });

  it('should return images from the store', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });

    expect(result.current.logo).toEqual(settings.userLogo);
    expect(result.current.homeImage).toEqual(settings.userHomeImage);
    expect(result.current.profileImage).toEqual(settings.profileImage);
  });

  it('should return saved filters from the store', () => {
    const { wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });

    expect(result.current.filters).toEqual(settings.filters);
  });

  it('should dispatch action ChangeLanguage when "changeLanguage" is called', () => {
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });
    const { changeLanguage } = result.current;

    changeLanguage('DE');

    expect(dispatchStub).toHaveBeenCalledWith(ChangeLanguage({ language: 'DE' }));
  });

  it('should dispatch action ChangeThemeMode when "changeThemeMode" is called', () => {
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });
    const { changeThemeMode } = result.current;

    changeThemeMode('dark');

    expect(dispatchStub).toHaveBeenCalledWith(ChangeThemeMode({ mode: 'dark' }));
  });

  it('should dispatch action ChangeThemeName when "changeThemeName" is called', () => {
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });
    const { changeThemeName } = result.current;

    changeThemeName('ChristmasTheme');

    expect(dispatchStub).toHaveBeenCalledWith(ChangeThemeName({ name: 'ChristmasTheme' }));
  });

  it('should dispatch action ToggleShortcuts when "toggleShortcuts" is called', () => {
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });
    const { toggleShortcuts } = result.current;

    toggleShortcuts();

    expect(dispatchStub).toHaveBeenCalledWith(ToggleShortcuts());
  });

  it('should dispatch action FetchUserPreferences when "fetchUserPreferences" is called', () => {
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });
    const { fetchUserPreferences } = result.current;

    fetchUserPreferences();

    expect(dispatchStub).toHaveBeenCalledTimes(1);
  });

  it('should dispatch action SetUserPreferences when "setUserPreferences" is called', () => {
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });
    const { setUserPreferences } = result.current;

    setUserPreferences('TableA', 'DELETE');

    expect(dispatchStub).toHaveBeenCalledTimes(1);
  });

  it('should dispatch action SetUserPreferences with type SETTINGS when "saveLanguagePreference" is called', () => {
    const { dispatchStub, wrapper } = getMockWrapperAndStore(storeData);
    const { result } = renderHook(() => useUserSettings(), { wrapper });
    const { saveLanguagePreference } = result.current;

    saveLanguagePreference('FR');

    expect(dispatchStub).toHaveBeenCalledTimes(1);
  });
});
