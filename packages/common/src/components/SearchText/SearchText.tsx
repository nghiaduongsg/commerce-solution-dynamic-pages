import React, { useEffect, useState } from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';

import { setAnnouncement } from '@pkg-form/validations/utils/formUtils';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useSystem } from '@pkg-setup/index';
import { useDebounce } from 'react-use';

const SearchText = ({ id, label, onApply, onClear, count, reset }) => {
  const theme = useTheme();

  const [query, setQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const { selectedLanguage } = useSystem();

  const [_, cancel] = useDebounce(
    () => {
      if (!query) {
        onClear();
      }

      onApply(query);
    },
    400,
    [query],
  );

  useEffect(() => {
    if (query) {
      setAnnouncement(
        `${id}-alert-help-text`,
        translate('searchKeyApplied', { ns: ACCESSIBILITY, count }),
      );
    }
  }, [query, count]);

  useEffect(() => {
    if (reset && !!query) {
      setQuery('');
      setOpenSearch(false);
      onClear();
    }
  }, [reset, query]);

  useEffect(() => {
    return () => {
      if (cancel) {
        cancel();
      }
    };
  }, []);

  return (
    <Box>
      {!openSearch && (
        <GenericIconButton
          id={`search-button`}
          testId={`search-button`}
          ariaLabel={translate('openSearchKeyButtonAriaLabel', {
            ns: ACCESSIBILITY,
            lng: selectedLanguage,
            table: label,
          })}
          onClick={() => setOpenSearch(!openSearch)}
          icon={
            <AssetByType
              input="icons"
              name="Search"
              props={query ? { color: theme.palette.primary.dark } : {}}
            />
          }
        />
      )}
      {openSearch && (
        <TextField
          size="small"
          onChange={(event) => setQuery(event.target.value.toLowerCase())}
          value={query}
          autoFocus
          slotProps={{
            htmlInput: {
              ['data-testid']: 'menu-searchField',
              'aria-label': translate('searchKeyFieldAriaLabel', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
                table: label,
              }),
              tabIndex: 0,
              role: 'searchbox',
            },
            input: {
              style: { padding: theme.spacing(0.5, 1) },
              endAdornment: (
                <InputAdornment position="end">
                  <GenericIconButton
                    id={`${id}-close-search-btn`}
                    testId="close-search-btn"
                    ariaLabel={translate('clearSearchKeyButtonAriaLabel', {
                      ns: COMMON,
                      lng: selectedLanguage,
                      table: label,
                    })}
                    onClick={() => {
                      setQuery('');
                      setOpenSearch(false);
                      setAnnouncement(
                        `${id}-search-key-clear`,
                        translate('searchKeyCleared', {
                          ns: ACCESSIBILITY,
                          lng: selectedLanguage,
                        }),
                      );
                    }}
                    icon={<AssetByType input="icons" name="Clear" />}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    </Box>
  );
};

export default SearchText;
