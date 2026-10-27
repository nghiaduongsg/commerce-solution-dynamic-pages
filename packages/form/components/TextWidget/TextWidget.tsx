import React, { useCallback, useMemo } from 'react';
import GenericTextField from '@pkg-common/atomics/GenericTextField/GenericTextField';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';
import { InputAdornment } from '@mui/material';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import { hasValue } from '@pkg-common/utils/utils';
import useApplyValueFromComparison from '@pkg-form/hooks/useApplyValueFromComparison';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps, TextWidgetOptions } from '@pkg-form/types';
import useFormData from '../../../common/src/dataResolver/useFormData';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';
import { getDebounceDelay } from '@pkg-form/validations/utils/widgetUtils';

const TextWidget = ({
  id,
  readonly = false,
  disabled = false,
  autofocus = false,
  onBlur = () => 0,
  onFocus = () => 0,
  options,
  inputProps,
  schema,
  uiSchema,
  serverErrors,
  serverErrorTypes,
  diffs,
  formContext,
  label: widgetLabel,
  value: innerValue,
  onChange,
}: FormWidgetProps & { options: TextWidgetOptions }) => {
  const {
    validations = undefined,
    showLabel = true,
    validateFrom,
    defaultValueFrom,
    fullWidth,
    mask,
    applyValueFromComparison,
    multiline = false,
    rows = 1,
    emptyValue = undefined,
    widthSize = 'md',
    validateWhen,
    endAdornment,
    startAdornment,
    textToUppercase = false,
  } = options;

  const { selectedLanguage } = useSystem();
  const placeHolder = uiSchema['ui:placeholder'];
  const info = uiSchema['ui:information'];
  const { mechanism, namespace, filterMode = false } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';

  const { value, setFieldValue, storeValue, dirty } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
    getDebounceDelay(filterMode, multiline),
  );

  const { prefixFrom, applyWhen } = mask || {};
  const { check: applyUnderCondition } = useCheckFrom(id, applyWhen, true);
  const { value: prefixFromValue } = useFormData(id, prefixFrom?.source);
  const {
    labelUppercase: label,
    helpText,
    omitValidationHints,
    required,
  } = useWidgetUtils(schema, options, formContext);

  const { valid, errors } = useTextWidgetValidations(
    id,
    storeValue,
    validations,
    serverErrors || [],
    validateFrom,
    validateWhen,
  );

  useApplyValueFromComparison(id, 'EDIT', applyValueFromComparison);
  useDefaultValueFrom(id, defaultValueFrom);
  const { t: translate } = useTranslation(namespace);

  const finalInputProps = { ...inputProps, autoComplete: 'off' };
  if (validations && hasValue(validations.maxLength)) {
    finalInputProps['maxLength'] = validations.maxLength;
  }
  if (validations && hasValue(validations.minLength)) {
    finalInputProps['minLength'] = validations.minLength;
  }
  if (validations && hasValue(validations.minValue)) {
    finalInputProps['min'] = validations.minValue;
  }
  if (validations && hasValue(validations.maxValue)) {
    finalInputProps['max'] = validations.maxValue;
  }
  if (startAdornment) {
    finalInputProps['startAdornment'] = (
      <InputAdornment position="start">{startAdornment}</InputAdornment>
    );
  }
  if (endAdornment) {
    finalInputProps['endAdornment'] = (
      <InputAdornment position="end">{endAdornment}</InputAdornment>
    );
  }
  if (textToUppercase) {
    finalInputProps['style'] = { textTransform: 'uppercase' };
  }

  if (prefixFromValue && applyUnderCondition) {
    finalInputProps['startAdornment'] = (
      <InputAdornment position="start">{prefixFromValue}</InputAdornment>
    );
  }
  const dataTestId = useMemo(() => {
    return widgetLabel ? `${formContext?.dataTestId}_${widgetLabel}` : undefined;
  }, [widgetLabel, formContext, prefixFromValue, applyUnderCondition]);

  const { translatedMessage } = useAdditionalInfo(id, {
    ...info,
    namespace: info?.namespace ?? namespace,
  });

  const handleBlur = useCallback(
    (id: string, value: string) => {
      if (textToUppercase && typeof value === 'string') {
        setFieldValue(value.toUpperCase());
      }
      (onBlur as (id: string, value: string) => void)(id, value);
    },
    [textToUppercase, setFieldValue, onBlur],
  );

  return (
    <GenericTextField
      id={id}
      testId={dataTestId}
      label={label}
      styledFieldLabel={
        <StyledFieldLabel
          label={label}
          required={required}
          omitValidationHints={omitValidationHints}
        />
      }
      value={hasValue(value) ? value : ''}
      required={(validations || {}).required || false}
      readonly={readonly}
      disabled={disabled}
      autofocus={autofocus}
      widthSize={widthSize}
      rows={rows}
      multiline={multiline}
      emptyValue={emptyValue}
      onChange={(value) => {
        setFieldValue(value);
      }}
      onBlur={handleBlur}
      onFocus={onFocus}
      inputProps={finalInputProps}
      type={
        uiSchema['ui:widget'] === 'PasswordWidget'
          ? 'password'
          : Array.isArray(schema.type)
            ? schema.type[0]
            : schema.type || 'string'
      }
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
      valid={valid}
      description={helpText}
      additionalInfo={translatedMessage}
      showLabel={showLabel}
      fullWidth={fullWidth}
      mask={mask}
      placeHolder={translate(placeHolder, { ns: namespace, lng: selectedLanguage })}
    />
  );
};

export default TextWidget;
