import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TextField, InputAdornment, Box } from '@mui/material';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import usePrevious from '@pkg-common/hooks/usePrevious';
import { useTranslation } from 'react-i18next';

import Mark from 'mark.js';
import { setAnnouncement } from '@pkg-form/validations/utils/formUtils';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { SxProps, useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useSystem } from '@pkg-setup/index';
import { hasValue } from '@pkg-common/utils';
import MatchPopup from './MatchPopUp';

export type PopupElement = {
  fieldName: string;
  value: string | undefined;
  elementType: string;
  displayType: string;
  tabType: string;
  tabId: string;
  tabTitle: string;
};

const useStyles = () => {
  return {
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      color: 'black',
    },
  };
};

const unmark = (elements) => {
  elements?.forEach((el) => {
    el.style.color = 'inherit';
    el.style.backgroundColor = 'transparent';
    el.style.fontWeight = 'inherit';
  });
};

const mark = (element) => {
  element.style.backgroundColor = '#FFFF8A';
  element.style.color = 'inherit';
  if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(element.parentElement?.tagName)) {
    element.parentElement.style.display = 'block';
  }
};

const highlight = (element, theme) => {
  element.style.backgroundColor = theme.palette.secondary.main;
  element.style.color = theme.palette.common.white;
};

const isVisible = (element) => {
  return (
    element.offsetParent !== null &&
    window.getComputedStyle(element).visibility !== 'hidden' &&
    window.getComputedStyle(element).display !== 'none'
  );
};

const TABLE_CELL_ELEMENT = 'TABLE_CELL';
const BUTTON_ELEMENT = 'BUTTON';
const HEADING_ELEMENT = 'HEADING';
const CHECKBOX_ELEMENT = 'CHECKBOX';
const DIALOG_CONTENT_ELEMENT = 'DIALOG_CONTENT';
const FORM_FIELD_ELEMENT = 'FORM_FIELD';
const TEXT_FIELD_ELEMENT = 'TEXT_FIELD';
const TAB_PANEL_ELEMENT = 'TAB_PANEL';
const TAB_ELEMENT = 'TAB';

const buildMarkedElement = (el: HTMLElement, searchQuery?: string): PopupElement => {
  const fieldName =
    el.closest('.MuiFormControl-root')?.childNodes[0].textContent ||
    el.closest('.MuiBox-root.css-0')?.childNodes[0].textContent ||
    '';

  const value =
    el.tagName === 'MARK'
      ? el?.parentNode?.textContent || searchQuery
      : (el as HTMLInputElement).value || el.textContent || searchQuery;

  let elementType;
  let tabId;
  let tabType;
  let tabTitle;
  const tableElement = el.closest('table');
  const parentTag = el.parentElement?.tagName;
  if (el.closest('[role="tab"]')) {
    tabType = TAB_ELEMENT;
    tabId = el.closest('[role="tab"]')?.id;
  } else if (el.closest('[role="tabpanel"]')) {
    tabType = TAB_PANEL_ELEMENT;
    const tabTitleId = el.closest('[role="tabpanel"]')?.getAttribute('aria-labelledby');
    const tabTitleElement = tabTitleId && document.getElementById(tabTitleId);
    tabTitle = tabTitleElement && tabTitleElement?.textContent;
    if (tabTitleElement) {
      tabId = tabTitleElement.closest('[role="tab"]')?.id;
    }
  }

  if (tableElement) {
    elementType = TABLE_CELL_ELEMENT;
  } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    elementType = TEXT_FIELD_ELEMENT;
  } else if (parentTag === 'BUTTON') {
    elementType = BUTTON_ELEMENT;
  } else if (parentTag && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(parentTag)) {
    elementType = HEADING_ELEMENT;
  } else if (
    el.closest('.MuiFormControlLabel-root') &&
    (el.closest('.MuiFormControlLabel-root')?.childNodes[0] as HTMLElement)?.classList.contains(
      'MuiCheckbox-root',
    )
  ) {
    elementType = CHECKBOX_ELEMENT;
  } else if (el.closest('[role="dialog"]')) {
    elementType = DIALOG_CONTENT_ELEMENT;
  } else if (el.closest('form')) {
    elementType = FORM_FIELD_ELEMENT;
  } else {
    elementType = el.tagName.toLowerCase();
  }

  const displayType =
    (elementType === FORM_FIELD_ELEMENT || elementType === TEXT_FIELD_ELEMENT) &&
    fieldName &&
    fieldName.length < 45
      ? 'fieldName'
      : elementType;

  return { fieldName, value, elementType, displayType, tabType, tabId, tabTitle };
};

const Toolbar = ({ sx = {} }: { sx?: SxProps }) => {
  const theme = useTheme();
  const styles = useStyles();
  const { t: translate } = useTranslation([COMMON]);
  const { selectedLanguage } = useSystem();

  const [searchQuery, setSearchQuery] = useState('');
  const [markedElements, setMarkedElements] = useState<Element[] | HTMLElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [popup, setPopup] = useState(false);
  const prevMarkedElements = usePrevious(markedElements);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const context = document.querySelector('body');
    const instance = new Mark(context);

    if (!hasValue(searchQuery)) {
      highlightActive([], prevMarkedElements, 0);
      return;
    }

    if (searchQuery) {
      instance.unmark({
        done: () => {
          instance.mark(searchQuery, {
            separateWordSearch: false,
            done: () => {
              const totalElements = Array.from(
                document.querySelectorAll(
                  'mark:not(output mark):not(.skip-link mark), textarea:not([type="hidden"]),input:not([type="hidden"]):not(.global):not(.date-widget-input)',
                ),
              ).filter((el) => {
                if (
                  !isVisible(el) &&
                  !el?.closest('[role="tab"]') &&
                  !el?.closest('[role="tabpanel"]')
                )
                  return false;
                // if (!isVisible(el) && el?.closest('[role="tab"]'))

                if (el.tagName === 'MARK') {
                  if (el.closest('.matchPopup')) {
                    (el as HTMLElement).style.backgroundColor = 'transparent';
                  }
                  return !(
                    el.closest('.MuiModal-hidden') ||
                    el.closest('.matchPopup') ||
                    el.closest('caption.tableCaption') ||
                    el.closest('[aria-hidden="true"]')
                  );
                }

                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                  const element = el as HTMLInputElement | HTMLTextAreaElement;
                  return element.value.toLowerCase().includes(searchQuery.toLowerCase());
                }

                return false;
              });
              setMarkedElements(totalElements);
              setCurrentIndex(totalElements.length > 0 ? 0 : -1);
              highlightActive(totalElements, prevMarkedElements, 0);

              setAnnouncement(
                `global-search-help-text`,
                translate('globalMatchesFound', {
                  ns: ACCESSIBILITY,
                  lng: selectedLanguage,
                  count: totalElements?.length,
                }),
              );
            },
          });
        },
      });
    } else {
      instance.unmark();
      setAnnouncement(
        `global-search-help-text`,
        translate('globalMatchesFound', {
          ns: ACCESSIBILITY,
          lng: selectedLanguage,
          count: 0,
        }),
      );
    }
  }, [searchQuery, location.pathname]);

  const highlightActive = (elements, prevElements, index) => {
    unmark(prevElements);

    elements?.forEach((el, i) => {
      if (i === index) {
        highlight(el, theme);
        setTimeout(() => el?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      } else {
        mark(el);
      }
    });
  };

  const navigateMarks = (direction) => {
    if (markedElements.length === 0) return;

    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = markedElements.length - 1;
    if (newIndex >= markedElements.length) newIndex = 0;

    setCurrentIndex(newIndex);
    highlightActive(markedElements, prevMarkedElements, newIndex);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    window.dispatchEvent(new CustomEvent('expandAccordions', { detail: !!query }));
  };

  useEffect(() => {
    resetSearch();
  }, [location.pathname]);

  useEffect(() => {
    const searchField = inputRef.current;
    if (!searchField) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (markedElements.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateMarks(1);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateMarks(-1);
      }
    };

    searchField.addEventListener('keydown', handleKeyDown);

    return () => {
      searchField.removeEventListener('keydown', handleKeyDown);
    };
  }, [markedElements, navigateMarks]);

  const resetSearch = () => {
    setSearchQuery('');
    setMarkedElements([]);
    setCurrentIndex(-1);
    window.dispatchEvent(new CustomEvent('expandAccordions', { detail: false }));
  };

  const onSelectField = (i) => {
    setCurrentIndex(i);
    highlightActive(markedElements, prevMarkedElements, i);
  };

  const popupElements = useMemo(
    () => markedElements.map((el) => buildMarkedElement(el, searchQuery)),
    [markedElements, searchQuery],
  );

  useEffect(() => {
    searchQuery.length > 0 ? setPopup(true) : setPopup(false);
    searchQuery === '' && setMarkedElements([]);
  }, [searchQuery]);

  const TextFieldComp = TextField as any;

  return (
    <Box
      sx={{ ...styles.searchContainer, ...sx }}
      tabIndex={-1}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setPopup(false);
        }
      }}
    >
      <Box
        id={'global-search-help-text'}
        role={'alert'}
        aria-live={'polite'}
        sx={{ marginRight: theme.spacing(1), fontSize: theme.typography.body2.fontSize }}
      />
      <TextFieldComp
        variant="outlined"
        size="small"
        inputRef={inputRef}
        placeholder={translate('search', { ns: COMMON, lng: selectedLanguage })}
        value={searchQuery}
        onChange={handleSearchChange}
        autoFocus={true}
        slotProps={{
          htmlInput: {
            ['data-testid']: 'global-search-field',
            id: `global-search-html-input`,
            'aria-label': translate('globalSearchKeyAriaLabel', {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            }),
            tabIndex: 0,
            role: 'searchbox',
            className: 'global',
          },
          input: {
            className: 'global-search-input',
            id: `global-search-input`,
            endAdornment: (
              <InputAdornment position="end" sx={{ margin: 0 }}>
                <GenericIconButton
                  id={`prev-match-btn`}
                  testId="prev-search-btn"
                  ariaLabel={translate('prevMatchButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })}
                  onClick={() => navigateMarks(-1)}
                  icon={<AssetByType input="icons" name="ArrowDropUp" />}
                  styles={{ padding: 0 }}
                  applyDebounce={false}
                />
                <GenericIconButton
                  id={`next-match-btn`}
                  testId="next-search-btn"
                  ariaLabel={translate('nextMatchButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })}
                  onClick={() => navigateMarks(1)}
                  icon={<AssetByType input="icons" name="ArrowDropDown" />}
                  styles={{ padding: 0 }}
                  applyDebounce={false}
                />
                <GenericIconButton
                  id={`view-search-results-btn`}
                  testId="view-search-results-btn"
                  ariaLabel={translate('viewSearchResultsButtonAriaLabel', {
                    ns: ACCESSIBILITY,
                    lng: selectedLanguage,
                  })}
                  onClick={() => setPopup((prev) => !prev)}
                  icon={
                    <AssetByType
                      input="icons"
                      name="Preview"
                      props={{ sx: { color: theme.palette.primary.main } }}
                    />
                  }
                  styles={{ padding: 0 }}
                  applyDebounce={false}
                />
              </InputAdornment>
            ),
          },
        }}
      />
      {popup && (
        <MatchPopup
          popupElements={popupElements}
          currentIndex={currentIndex}
          onSelectField={onSelectField}
        />
      )}
    </Box>
  );
};

export default Toolbar;
