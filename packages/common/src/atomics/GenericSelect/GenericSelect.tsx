import React, { useCallback, useMemo } from 'react';
import { FormControl, FormHelperText } from '@mui/material';
import { GenericSelectProps } from './GenericSelect.d';
import GenericAutoComplete from './GenericAutoComplete';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import { AutocompleteOption } from './GenericAutoComplete.d';
import { useGenericSelectStyles } from './styles';
import { AnyType } from '@pkg-common/types';
import useSystem from '@pkg-setup/src/system/useSystem';
import { getWidgetSize } from '@pkg-form/validations/utils/widgetUtils';

const transformToAutocompleteValue = (selectedValue: AnyType, listOptions: AnyType, multiple) => {
  if (!multiple) {
    return (listOptions ?? []).find((option: AnyType) => option.code === selectedValue) ?? '';
  } else {
    return (listOptions ?? []).filter((option: AnyType) =>
      (selectedValue ?? []).includes(option.code),
    );
  }
};

const GenericSelect = ({
  id = '',
  testId,
  value = '',
  selectAll,
  label,
  styledFieldLabel,
  showLabel = true,
  options = [],
  widthSize,
  disabledOptions = [],
  required = false,
  disabled = false,
  readonly = false,
  multiple = false,
  onChange = () => void 0,
  onFocus = () => void 0,
  renderBy = 'label',
  errors = null,
  valid = true,
  fullWidth = false,
  helpText = '',
  loading = false,
  truncate = { enabled: false },
  placeholder,
  additionalInfo,
  lazyLoad,
}: GenericSelectProps) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY, COMMON]);

  const onChangeCallback = useCallback(onChange, [onChange]);
  const onFocusCallback = useCallback(() => onFocus && onFocus(), []);

  const memoizedWidgetSize = useMemo(() => {
    return getWidgetSize(widthSize, fullWidth || multiple);
  }, [widthSize, fullWidth, multiple]);

  return (
    <FormControl
      id={`${id}-select-control`}
      variant="outlined"
      required={required}
      disabled={disabled || readonly}
      error={!valid}
      sx={memoizedWidgetSize}
      title={label}
      fullWidth={fullWidth}
    >
      <GenericAutoComplete
        id={id}
        testId={testId}
        multiple={multiple}
        value={transformToAutocompleteValue(value, options, multiple)}
        label={label}
        styledFieldLabel={styledFieldLabel}
        renderBy={renderBy}
        selectAll={selectAll}
        showLabel={showLabel}
        required={required}
        loading={loading}
        placeholder={placeholder}
        loadingText={translate('loading', { ns: COMMON, lng: selectedLanguage })}
        disabled={disabled || readonly}
        options={options}
        disabledOptions={disabledOptions}
        onChange={(selected) =>
          onChangeCallback({
            target: {
              value: multiple
                ? (selected as Array<AutocompleteOption>)?.map((item) => item.code)
                : (selected as AutocompleteOption)?.code,
            },
          })
        }
        onFocus={onFocusCallback}
        valid={valid}
        errors={errors}
        noOptionsText={translate('noOptions', { ns: COMMON, lng: selectedLanguage })}
        truncate={truncate}
        additionalInfo={additionalInfo}
        lazyLoad={lazyLoad}
      />
      <FormHelperText>{helpText}</FormHelperText>
      {errors}
    </FormControl>
  );
};

export default GenericSelect;
