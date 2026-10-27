import React from 'react';
import { Typography, List, ListItem, ListItemText, Paper, useTheme, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { hasValue } from '@pkg-common/utils';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useSystem } from '@pkg-setup/index';
import { PopupElement } from './SearchBar';
import GenericIconButton from '../GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';

interface MatchPopupProps {
  popupElements: PopupElement[];
  currentIndex: number;
  onSelectField: (i: number) => void;
}

const MatchPopup: React.FC<MatchPopupProps> = ({ popupElements, currentIndex, onSelectField }) => {
  const theme = useTheme();
  const ListItemComp = ListItem as React.ElementType;
  const { t: translate } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();

  const truncate = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <Paper
      className="matchPopup"
      elevation={4}
      sx={{
        position: 'fixed',
        top: 115,
        right: 25,
        width: 320,
        maxHeight: 500,
        overflowY: 'auto',
        zIndex: 2000,
        p: 2,
      }}
    >
      <Typography variant="subtitle1">
        {translate('matchesFound', {
          ns: COMMON,
          lng: selectedLanguage,
          matches: popupElements.length,
        })}
      </Typography>
      {popupElements.length > 0 && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {translate('matchesCounter', {
            ns: COMMON,
            lng: selectedLanguage,
            index: currentIndex + 1,
            matches: popupElements.length,
          })}
        </Typography>
      )}

      <List dense>
        {popupElements.map((el, i) => {
          return (
            <ListItemComp
              key={`${el.value}-${i}`}
              selected={i === currentIndex}
              role="listitem"
              tabIndex={0}
              sx={{
                border: '1px solid',
                borderColor: i === currentIndex ? theme.palette.primary.main : 'divider',
                borderRadius: 1,
                mb: 1,
              }}
              secondaryAction={
                <GenericIconButton
                  id={`go-to-field-btn-${i}`}
                  testId={`go-to-field-btn-${i}`}
                  ariaLabel={translate('onSelectFieldButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })}
                  onClick={() => {
                    if (el.tabType === 'TAB' || el.tabType === 'TAB_PANEL') {
                      document.getElementById(el.tabId)?.click();
                    }
                    onSelectField(i);
                  }}
                  icon={<AssetByType input="icons" name="East" />}
                  styles={{ padding: 0 }}
                  applyDebounce={false}
                />
              }
            >
              <ListItemText
                key={`${el.value}-key`}
                primary={translate('matchCounter', {
                  ns: COMMON,
                  lng: selectedLanguage,
                  index: i + 1,
                  matches: popupElements.length,
                  displayType: translate(
                    el.displayType === 'fieldName' ? 'fieldName' : el.displayType,
                    {
                      ns: COMMON,
                      lng: selectedLanguage,
                      fieldName: el.fieldName,
                      tabTitle: el.tabTitle ? ` (${el.tabTitle} Panel)` : '',
                    },
                  ),
                })}
                sx={{
                  pr: 8,
                  color: theme.palette.primary.main,
                }}
                secondary={
                  <Tooltip
                    title={el.value}
                    placement="top"
                    role={hasValue(el.value) ? 'tooltip' : undefined}
                  >
                    <Typography key={`${el.value}-Typography`} variant="body2">
                      {translate('matchValue', {
                        ns: COMMON,
                        lng: selectedLanguage,
                        value: truncate(el.value ?? '', 30),
                      })}
                    </Typography>
                  </Tooltip>
                }
              />
            </ListItemComp>
          );
        })}
      </List>
    </Paper>
  );
};

export default MatchPopup;
