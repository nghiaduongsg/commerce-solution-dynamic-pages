import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  createFilterOptions,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { AutocompleteTagsProps, AutocompleteOption } from './GenericAutoComplete.d';
import { getAccessibilityErrorProps } from '@pkg-form/validations/utils/widgetUtils';
import { isExpired, hasValue } from '@pkg-common/utils';
import TruncatedInput from '@pkg-common/components/TruncatedInput/TruncatedInput';
import useInfiniteScroll from '@pkg-common/hooks/useInfiniteScroll';

const isSelected = (option: AutocompleteOption, selected, multiple) => {
  if (multiple) {
    return (selected ?? []).indexOf(option.code) >= 0;
  } else {
    return selected === option.code;
  }
};

const isDisabled = (option: AutocompleteOption, disabledOptions) => {
  return (disabledOptions ?? []).indexOf(option.code) >= 0;
};

const isOptionExpired = (option: AutocompleteOption): boolean => {
  if (option?.expired) return true;
  const endDate = option?.attributes?.find((attr) => attr.key === 'endDate')?.value;
  return isExpired(endDate);
};

const getOptionKey = (option: AutocompleteOption) => option.code;

const GenericAutoComplete = ({
  id,
  testId,
  multiple = false,
  options,
  selectAll,
  disabledOptions = [],
  onChange,
  onFocus,
  value,
  label = '',
  styledFieldLabel,
  showLabel = true,
  loading = false,
  loadingText,
  valid = true,
  disabled = false,
  renderBy = 'label',
  fullWidth = true,
  required = false,
  noOptionsText = '',
  placeholder,
  truncate = { enabled: false },
  additionalInfo,
  lazyLoad,
}: AutocompleteTagsProps & { noOptionsText?: React.ReactNode }) => {
  const { allSymbol, selectedLanguage } = useSystem();

  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    enabled: lazyLoadEnabled = false,
    loadThreshold = 0.75,
    interval = 10,
    rootMargin = '300px 0px',
  } = lazyLoad ?? {};

  const [listboxRef, setListboxRef] = useState<HTMLUListElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(lazyLoadEnabled ? interval : Infinity);

  const getDisplayTitle = (option, renderBy) => {
    const baseLabel = option[renderBy] ?? option?.code ?? '';
    if (isOptionExpired(option)) {
      const expiredText = translate('expired', { ns: COMMON, lng: selectedLanguage });
      return `${baseLabel} (${expiredText})`;
    }
    return baseLabel;
  };

  const getOptionLabel = (option: AutocompleteOption) => {
    if (!option) return '';
    const primaryLabel = option[renderBy];
    if (primaryLabel) return primaryLabel.toString();
    return option?.code ?? '';
  };
  const [filteredListLength, setFilteredListLength] = useState(0);

  const filteredOptions = useMemo(() => {
    return options?.filter(
      (option) => !isSelected(option, value, multiple) && option.code !== allSymbol,
    );
  }, [options, value, allSymbol, multiple]);

  const defaultFilter = useMemo(() => createFilterOptions<AutocompleteOption>(), []);
  const filterOptionsWithLazyLoad = useCallback(
    (opts: AutocompleteOption[], state) => {
      const matched = defaultFilter(opts, state);
      setFilteredListLength(matched.length);
      return lazyLoadEnabled ? matched.slice(0, visibleCount) : matched;
    },
    [defaultFilter, lazyLoadEnabled, visibleCount],
  );

  useEffect(() => {
    setVisibleCount(lazyLoadEnabled ? interval : Infinity);
  }, [dropdownOpen, lazyLoadEnabled, interval]);

  const getItemId = useCallback((index: number) => `${id}-option-${index}`, [id]);

  useInfiniteScroll({
    enabled: lazyLoadEnabled,
    itemCount: filteredListLength,
    visibleCount,
    batchSize: interval,
    loadThreshold,
    root: listboxRef,
    rootMargin,
    getItemId,
    onLoadMore: () =>
      setVisibleCount((current) => Math.min(current + interval, filteredOptions.length)),
  });

  const accessibilityErrorProps = useMemo(() => {
    return getAccessibilityErrorProps(id, !valid);
  }, [valid, id]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  // Common JSX parts
  const commonAutocompleteProps = {
    id,
    multiple,
    fullWidth,
    disableCloseOnSelect: multiple,
    value,
    loading: typeof loading === 'boolean' ? loading : false,
    loadingText,
    disabled,
    noOptionsText,
    ...(multiple && { 'aria-multiselectable': true }),
    onChange: (_event, _value, reason) => {
      onChange(_value);
      if (reason === 'clear') {
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    },
    onFocus,
    onOpen: () => setDropdownOpen(true),
    onClose: () => setDropdownOpen(false),
    onInputChange: () => setVisibleCount(interval),
    options: filteredOptions,
    filterOptions: filterOptionsWithLazyLoad,
    getOptionLabel,
    getOptionKey,
    getOptionDisabled: (option: AutocompleteOption) =>
      isDisabled(option, disabledOptions) || isOptionExpired(option),
    renderInput: (params) => {
      const singleSelectTruncateLabel = !multiple ? getOptionLabel(value as unknown as AutocompleteOption) : '';
      return (
        <TextField
          {...params}
          onKeyDown={(event) => {
            if (event.key.toLowerCase() === 'c') {
              event.stopPropagation();
            }
          }}
          inputRef={inputRef}
          id={`${id}-html-input`}
          multiline={hasValue(value)}
          color="primary"
          variant="outlined"
          label={showLabel ? styledFieldLabel ?? label : ''}
          error={!valid}
          placeholder={placeholder}
          slotProps={{
            inputLabel: {
              required: false,
              error: !valid,
              disabled: false,
              id: `${id}-input-label`,
              'data-testid': `${id}-input-label`,
            },
            htmlInput: {
              ...params.inputProps,
              value:
                truncate?.enabled && !multiple && hasValue(value) ? '' : params.inputProps.value,
              ['data-testid']: testId ?? id,
              id: `${id}-html-input`,
              tabIndex: 0,
              role: 'textbox',
              'aria-labelledby': showLabel ? `${id}-input-label` : undefined,
              'aria-label': showLabel ? undefined : label,
              'aria-disabled': disabled,
              'aria-required': required,
              'aria-expanded': undefined,
              'aria-description': additionalInfo,
              ...accessibilityErrorProps,
            },
            input: {
              id: `${id}-input`,
              tabIndex: -1,
              ...params.InputProps,
              startAdornment: (
                <>
                  {params.InputProps.startAdornment}
                  {truncate?.enabled && !multiple && hasValue(value) && (
                    <InputAdornment position="start">
                      <TruncatedInput truncate={truncate} title={singleSelectTruncateLabel} />
                    </InputAdornment>
                  )}
                </>
              ),
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  {multiple && selectAll && (
                    <InputAdornment position="end">
                      <GenericIconButton
                        id={`${id}-selectAllListButton`}
                        testId={'selectAllListButton'}
                        ariaLabel={translate('selectAll', { ns: COMMON, lng: selectedLanguage })}
                        ariaHasPopup={false}
                        onClick={() => {
                          onChange(
                            multiple
                              ? [{ code: allSymbol, label: allSymbol }]
                              : { code: allSymbol, label: allSymbol },
                          );
                        }}
                        icon={<AssetByType input="icons" name="PlaylistAddCheck" />}
                      />
                    </InputAdornment>
                  )}
                </>
              ),
            },
          }}
        />
      );
    },

    slotProps: {
      chip: {
        variant: 'outlined',
        size: 'medium',
        tabIndex: 0,
      },
      popover: {
        id: `${id}-options-popover`,
      },
      listbox: {
        ref: setListboxRef,
      },
      clearIndicator: {
        'aria-label': translate('clearWidget', { ns: COMMON, label, lng: selectedLanguage }),
        ['data-testid']: `${id}-clear`,
        title: undefined, // Keep this otherwise screen readers announce twice
        id: `${id}-clear`,
        sx: {
          display: hasValue(value) ? 'inline-flex' : 'none',
          visibility: 'inherit',
          '.Mui-hidden &': {
            display: 'none',
          },
        },
        tabIndex: hasValue(value) ? 0 : -1,
      },
      popupIndicator: {
        title: undefined,
        'aria-label': translate('openListButton', {
          ns: COMMON,
          lng: selectedLanguage,
          label,
        }),
        'aria-controls': dropdownOpen ? `${id}-options-popover` : undefined,
        'aria-expanded': dropdownOpen,
        'aria-haspopup': 'listbox',
        tabIndex: 0,
        id: `${id}-openDropDownWidgetList`,
      },
    },
    popupIcon: <AssetByType input="icons" name="List" />,
    renderOption: (props, option, state) => {
      const { key, id: muiId, ...optionProps } = props;
      const menuItemId = lazyLoadEnabled ? getItemId(state.index) : muiId;

      return (
        <MenuItem
          id={menuItemId}
          key={key}
          noWrap={true}
          role="option"
          aria-selected={option?.code === value}
          aria-label={getOptionLabel(option)}
          aria-role="option"
          sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
          onMouseDown={(event) => event.preventDefault()}
          onMouseUp={() => {
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          {...optionProps} // Keep this last, otherwise accessibility options are not announced
        >
          <TruncatedInput truncate={truncate} title={getDisplayTitle(option, renderBy)} />
        </MenuItem>
      );
    },
  };

  return <Autocomplete {...(commonAutocompleteProps as any)} />;
};

export default GenericAutoComplete;
