import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';

import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import React from 'react';
import useSystem from '@pkg-setup/src/system/useSystem';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';

const ThemeMode = () => {
  const { themeMode, changeThemeMode } = useUserSettings();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  return (
    <>
      {themeMode === 'light' && (
        <GenericIconButton
          id="change-theme-toDark-btn"
          ariaLabel={translate('changeThemeMode', { ns: COMMON, lng: selectedLanguage })}
          ariaDescription={translate('changeThemeModeAriaDescription', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            toTheme: 'dark',
          })}
          onClick={() => {
            changeThemeMode('dark');
          }}
          icon={
            <AssetByType input="icons" name="DarkMode" props={{ style: { color: '#00008b' } }} />
          }
        />
      )}
      {themeMode === 'dark' && (
        <GenericIconButton
          id="change-theme-toLight-btn"
          ariaLabel={translate('changeThemeMode', { ns: COMMON, lng: selectedLanguage })}
          ariaDescription={translate('changeThemeModeAriaDescription', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            toTheme: 'light',
          })}
          onClick={() => {
            changeThemeMode('light');
          }}
          icon={
            <AssetByType input="icons" name="LightMode" props={{ style: { color: 'yellow' } }} />
          }
        />
      )}
    </>
  );
};

export default ThemeMode;
