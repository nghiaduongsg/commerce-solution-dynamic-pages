import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useCodeListWidgetValidations from './hooks/useCodeListWidgetValidations';
import useCodeListWidgetUtils from './hooks/useCodeListWidgetUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { DropDownWidgetOptions, FormWidgetProps } from '@pkg-form/types';
import Resource from '@pkg-common/components/Resource/Resource';
import useCodeList from '@pkg-core/codeList/hooks/useCodeList';
import { useApiDataState } from '@pkg-core/apiData';
import {
  CircularProgress,
  InputAdornment,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
  TextField,
  Tooltip,
} from '@mui/material';
import GenericTextField from '@pkg-common/atomics/GenericTextField/GenericTextField';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import { isExpired, hasValue } from '@pkg-common/utils';
import { getDisabledValues } from '@pkg-form/components/SelectCodeListWidget/utils';
import useCodeListDefaultValue from './hooks/useCodeListDisplayValue';
import { NOT_FOUND_KEY } from '@pkg-constants/formCommon';
import { BOOLEAN_CODELIST_ATTRIBUTES } from '@pkg-constants/codeListVariables';
import { AnyType } from '@pkg-common/types';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';
import TruncatedInput from '@pkg-common/components/TruncatedInput/TruncatedInput';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';
import useInfiniteScroll from '@pkg-common/hooks/useInfiniteScroll';

const getMenuItemId = (widgetId: string, index: number) => `${widgetId}-option-${index}`;

const useStyles = () => {
  return {
    truncate: (truncate: AnyType) => ({
      maxWidth: truncate?.width ? truncate.width + 50 : '100%',
      maxHeight: truncate?.lines ? `${truncate.lines * 1.4}em` : 'auto',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: truncate?.lines || 1,
      WebkitBoxOrient: 'vertical',
      whiteSpace: 'pre-line',
    }),
  };
};

const DropDownWidget = ({
  schema,
  id,
  options,
  disabled,
  serverErrors,
  serverErrorTypes,
  diffs,
  label: widgetLabel,
  value: innerValue,
  onChange,
  formContext,
  uiSchema,
}: FormWidgetProps & { options: DropDownWidgetOptions }) => {
  const {
    multiple,
    validations,
    mapToProperty,
    defaultValueFrom,
    validateWhen,
    fullWidth,
    callApis,
    optionsResourceId,
    disableOptionWhen,
    ignoreInactive,
    excludeExpired,
    disabledOptions = [],
    truncate = { enabled: false },
    lazyLoad,
  } = options;

  const info = uiSchema['ui:information'] ?? {};

  const {
    enabled: lazyLoadEnabled = false,
    loadThreshold = 0.75,
    interval = 10,
    rootMargin = '300px 0px',
  } = lazyLoad ?? {};

  const styles = useStyles();
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');
  const [popoverPaper, setPopoverPaper] = useState<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(lazyLoadEnabled ? interval : Infinity);

  const open = Boolean(anchor);

  const getItemId = useCallback((index: number) => getMenuItemId(id, index), [id]);

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchor(null);
    setSearchText('');
    setVisibleCount(lazyLoadEnabled ? interval : Infinity);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const { mechanism, debounceUpdates, namespace } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';

  const { value, setFieldValue, dirty } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    debounceUpdates,
  );

  const {
    labelUppercase: label,
    omitValidationHints,
    required,
  } = useWidgetUtils(schema, options, formContext);
  const { getUpdatedValue } = useCodeListWidgetUtils(value, multiple, mapToProperty);

  const { list: codeList } = useCodeList(optionsResourceId);
  // RJSF supplies enumOptions for enum schemas. Support those without requiring
  // a reference-data API just to render a fixed set of choices.
  const list = useMemo(
    () =>
      options.enumOptions?.length
        ? options.enumOptions.map(({ value, label }) => ({
            code: value,
            label,
            attributes: [],
            expired: false,
          }))
        : codeList,
    [options.enumOptions, codeList],
  );
  const { loading, hasError, finished } = useApiDataState(optionsResourceId);

  const displayValue = useCodeListDefaultValue(id, multiple, list, value);

  useDefaultValueFrom(id, defaultValueFrom);

  const { valid, errors, disabledValues } = useCodeListWidgetValidations(
    id,
    value,
    multiple,
    validations,
    serverErrors,
    validateWhen,
  );

  const filteredList = useMemo(() => {
    if (!searchText) {
      return list;
    }
    setVisibleCount(interval);
    const lowerCaseSearchText = searchText?.toLowerCase();
    return list?.filter(
      (item) =>
        item.code.toLowerCase().indexOf(lowerCaseSearchText) >= 0 ||
        item.label.toLowerCase().indexOf(lowerCaseSearchText) >= 0,
    );
  }, [searchText, list]);

  const valueDescription = useMemo(() => {
    return list?.find((item) => item.code === value)?.label;
  }, [value, list]);

  const { selectedLanguage, hideInactive, hideExpired } = useSystem();

  const getValidItems = (finalItems) => {
    let result = finalItems ?? [];

    if (excludeExpired || hideExpired === 'Y') {
      result = result.filter((item) => !item.expired);
    }

    if (hideInactive === 'Y') {
      result = result.filter(
        (item) =>
          item.attributes?.find((attr) => attr.key === 'inactive')?.value !==
          BOOLEAN_CODELIST_ATTRIBUTES.YES,
      );
    }

    return result;
  };

  const { t: translate } = useTranslation([formContext?.namespace || '', ACCESSIBILITY, COMMON]);

  const finalValue = useMemo(() => {
    if (hasValue(value)) {
      return valueDescription || displayValue;
    }
    return value || '';
  }, [value, valueDescription, displayValue]);

  const shouldLoadList = useMemo(() => {
    return (
      (open && !finished && !list?.length) || (open && hasError) || displayValue === NOT_FOUND_KEY
    );
  }, [open, finished, list, displayValue]);

  const extraDisabledValues = useMemo(() => {
    return getDisabledValues(list, disableOptionWhen, ignoreInactive, [
      ...disabledOptions,
      ...disabledValues,
    ]);
  }, [list, disabledOptions, disabledValues, ignoreInactive, hideInactive]);

  const { translatedMessage } = useAdditionalInfo(id, {
    ...info,
    namespace: info?.namespace ?? namespace,
  });

  const getDisplayLabel = (action) => {
    const baseLabel = action.label;
    const endDate = action.attributes?.find((attr) => attr.key === 'endDate')?.value;
    if (isExpired(endDate)) {
      const expiredText = translate('expired', {
        ns: COMMON,
        lng: selectedLanguage,
      });
      return `${baseLabel} (${expiredText})`;
    }
    return baseLabel;
  };
  const visibleItems = useMemo(() => getValidItems(filteredList) ?? [], [filteredList]);

  useEffect(() => {
    setVisibleCount(lazyLoadEnabled ? interval : Infinity);
  }, [open, visibleItems.length, lazyLoadEnabled, interval]);

  useInfiniteScroll({
    enabled: lazyLoadEnabled,
    itemCount: visibleItems.length,
    visibleCount,
    batchSize: interval,
    loadThreshold,
    root: popoverPaper,
    rootMargin,
    getItemId,
    onLoadMore: () => {
      setVisibleCount((currentCount) => Math.min(currentCount + interval, visibleItems.length));
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {shouldLoadList &&
        callApis?.map((resource) => (
          <Resource key={resource.resourceId} resource={resource} widgetId={id} />
        ))}
      <GenericTextField
        id={id}
        testId={`${formContext?.dataTestId}_${widgetLabel}`}
        label={label}
        styledFieldLabel={
          <StyledFieldLabel
            label={label}
            required={required}
            omitValidationHints={omitValidationHints}
          />
        }
        value={truncate?.enabled ? '' : finalValue}
        ref={inputRef}
        multiline={true}
        onChange={onChange}
        valid={dirty ? valid : true}
        disabled={disabled}
        fullWidth={fullWidth}
        additionalInfo={translatedMessage}
        errors={
          <ValidationErrors
            id={id}
            clientErrors={errors}
            serverErrors={serverErrors}
            serverErrorTypes={serverErrorTypes}
            diffs={diffs}
            dirty={dirty}
          />
        }
        inputProps={{
          sx: truncate?.enabled ? { width: '267px', minWidth: '0px' } : {},
          startAdornment: truncate?.enabled ? (
            <InputAdornment position="start">
              <TruncatedInput title={finalValue} truncate={truncate} />
            </InputAdornment>
          ) : null,
          endAdornment: (
            <InputAdornment position="end" onClick={onClick}>
              <>
                {finalValue && (
                  <GenericIconButton
                    id={`${id}-clear`}
                    testId={'clear'}
                    ariaLabel={translate('clear', {
                      ns: COMMON,
                      lng: selectedLanguage,
                    })}
                    onClick={() => {
                      setFieldValue(null);
                      const timeout = setTimeout(() => {
                        handlePopoverClose();
                        if (timeout) {
                          clearTimeout(timeout);
                        }
                      }, 200);
                    }}
                    icon={<AssetByType input="icons" name={'Clear'} />}
                  />
                )}
                {!loading && hasError && (
                  <AssetByType
                    input="icons"
                    name="ErrorOutline"
                    props={{ color: 'red', cursor: 'pointer' }}
                  />
                )}
                {!loading && !hasError && (
                  <GenericIconButton
                    id={`${id}-openDropDownWidgetListButton`}
                    testId="openDropDownWidgetListButton"
                    label={translate('openDropDownWidgetList', {
                      ns: COMMON,
                      label,
                      lng: selectedLanguage,
                    })}
                    ariaLabel={translate('openDropDownWidgetList', {
                      ns: COMMON,
                      label,
                      lng: selectedLanguage,
                    })}
                    ariaDescription={translate('openDropDownWidgetListAriaDescription', {
                      ns: ACCESSIBILITY,
                      lng: selectedLanguage,
                    })}
                    ariaHasPopup={true}
                    ariaExpanded={open && list?.length > 0}
                    ariaControls={id}
                    onClick={onClick}
                    icon={<AssetByType input="icons" name="List" />}
                  />
                )}
                {loading && <CircularProgress size={25} />}
              </>
            </InputAdornment>
          ),
        }}
      />
      <Popover
        id={id}
        open={open && list?.length > 0}
        anchorEl={anchor}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{ maxHeight: 270, minWidth: 'fit-content' }}
        slotProps={{
          paper: {
            ref: setPopoverPaper,
          },
        }}
      >
        <TextField
          id={id}
          style={{ borderBottom: '1px solid #E5E4E2', padding: 8 }}
          size="small"
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          autoFocus
          slotProps={{
            htmlInput: {
              ['data-testid']: `${id}-search`,
              'aria-label': label,
              'aria-required': false,
              tabIndex: 0,
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <AssetByType input="icons" name="Search" />
                </InputAdornment>
              ),
            },
          }}
        />
        <MenuList>
          {visibleItems.slice(0, visibleCount).map((item, index) => (
            <MenuItem
              key={item.code}
              id={getMenuItemId(id, index)}
              onClick={() => {
                setFieldValue(getUpdatedValue(item.code));
                handlePopoverClose();
              }}
              disabled={(extraDisabledValues || []).includes(item.code)}
              aria-label={item.label}
              sx={{ width: '100%' }}
            >
              {truncate?.enabled ? (
                <Tooltip title={item.label} placement="top">
                  <ListItemText
                    slotProps={{
                      primary: {
                        component: 'span',
                        variant: 'inherit',
                        noWrap: false,
                        sx: styles.truncate(truncate),
                      },
                    }}
                    primary={item.label}
                  />
                </Tooltip>
              ) : (
                <ListItemText>{getDisplayLabel(item)}</ListItemText>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </div>
  );
};

export default DropDownWidget;
