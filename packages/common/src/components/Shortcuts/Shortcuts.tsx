import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import React, { useEffect } from 'react';
import useSystem from '@pkg-setup/src/system/useSystem';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';
import { useTheme } from '@mui/material/styles';
import { registerKeyboardShortcuts } from '@pkg-common/utils/utils';

const Shortcuts = () => {
  const theme = useTheme();
  const { toggleShortcuts, shortcutsOn } = useUserSettings();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  useEffect(() => {
    registerKeyboardShortcuts(shortcutsOn || false);
  }, [shortcutsOn]);

  return (
    <GenericIconButton
      id="toggle-shortcuts-btn"
      ariaLabel={translate(shortcutsOn ? 'keyboardShortcutsEnabled' : 'keyboardShortcutsDisabled', {
        ns: COMMON,
        lng: selectedLanguage,
      })}
      ariaDescription={translate(
        shortcutsOn ? 'keyboardShortcutsEnabled' : 'keyboardShortcutsDisabled',
        {
          ns: COMMON,
          lng: selectedLanguage,
          toTheme: 'light',
        },
      )}
      onClick={() => {
        toggleShortcuts();
      }}
      icon={
        <AssetByType
          input="icons"
          name="Keyboard"
          props={{
            style: {
              color: shortcutsOn ? theme.palette.secondary.main : theme.palette.divider,
            },
          }}
        />
      }
      label={''}
    />
  );
};

export default Shortcuts;
