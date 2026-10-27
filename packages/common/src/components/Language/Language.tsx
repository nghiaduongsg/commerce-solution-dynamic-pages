import React, { useMemo, useState } from 'react';
import { MenuItem, Box, Typography, useTheme, Tooltip, Menu } from '@mui/material';
import { LANGUAGES } from '@pkg-constants/codeListVariables';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useCodeList from '@pkg-core/codeList/hooks/useCodeList';
import { ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useUserSettings from '@pkg-setup/src/userSettings/useUserSettings';

const Language = ({ renderBy }) => {
  const theme = useTheme();
  const { update, selectedLanguage } = useSystem();
  const { saveLanguagePreference } = useUserSettings();
  const { list } = useCodeList(LANGUAGES);
  const { t: translate } = useTranslation([ACCESSIBILITY]);
  const [anchorEl, setAnchorEl] = useState(null);

  const validLanguages = useMemo(() => {
    if (!list) return [];

    return list
      .filter((item) => !item.expired && item.code)
      .map((item) => ({
        ...item,
        label: `${item.code} - ${item.label}`,
      }));
  }, [list]);

  const handleLanguageChange = (languageCode) => {
    update({ selectedLanguage: languageCode });
    saveLanguagePreference(languageCode);
    setAnchorEl(null);
  };

  const handleLanguageIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip
          title={translate('selectedLanguage', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            selectedLanguageLabel: validLanguages?.find((item) => item.code === selectedLanguage)
              ?.label,
          })}
          role={'tooltip'}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Typography color="textPrimary" style={{ marginLeft: theme.spacing(2) }} tabIndex={0}>
              <span
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {translate('selectedLanguageAriaLabel', {
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                })}
              </span>
              {selectedLanguage}
            </Typography>

            <GenericIconButton
              id="language-selector-btn"
              testId="language-selector-btn"
              ariaLabel={translate('languageSelectorAriaLabel', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              ariaControls={anchorEl ? 'language-selector-menu' : undefined}
              onClick={handleLanguageIconClick}
              disabled={validLanguages?.length === 1}
              icon={
                <AssetByType
                  input="icons"
                  name="Language"
                  props={{
                    className: 'primary',
                  }}
                />
              }
            />
          </div>
        </Tooltip>
      </Box>
      <Menu
        id={'language-selector-menu'}
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        style={{ top: theme.spacing(2) }}
        role={'menu'}
      >
        {validLanguages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            data-testid={`language-option-${language.code}`}
            style={{ padding: theme.spacing(3) }}
            role={'menuItem'}
            aria-selected={language.code === selectedLanguage}
          >
            {language[renderBy] || language.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Language;
