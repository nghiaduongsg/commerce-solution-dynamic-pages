import React, { useCallback, useMemo, useState } from 'react';
import { format, isValid, isDate } from 'date-fns';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useDateWidgetValidations from './hooks/useDateWidgetValidations';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useDate from '@pkg-common/hooks/useDate';
import useFormField from '@pkg-entity/hooks/useFormField';
import { DateWidgetOptions, FormWidgetProps } from '@pkg-form/types';
import useApplyValueFromComparison from '@pkg-form/hooks/useApplyValueFromComparison';
import useSystem from '@pkg-setup/src/system/useSystem';
import { getFinalValidateFromStructure } from '@pkg-form/validations/utils/widgetUtils';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';
import { COMMON } from '@pkg-constants/translationNamespaces';
import GenericDate from '@pkg-common/atomics/GenericDate/GenericDate';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const DateWidget = ({
  id,
  readonly,
  disabled,
  inputProps,
  options,
  serverErrors,
  serverErrorTypes,
  diffs,
  schema,
  uiSchema,
  label: widgetLabel,
  value: innerValue,
  onChange,
  formContext,
}: FormWidgetProps & { options: DateWidgetOptions }) => {
  const { selectedLocale: locale } = useSystem();
  const {
    validations = {},
    validateFrom = [],
    validateWhen = {},
    defaultValueFrom,
    formatAs = 'date',
    applyValueFromComparison,
    fullWidth,
    widthSize,
    minutesStep,
  } = options;

  const validateFromArray = useMemo(() => {
    return getFinalValidateFromStructure(validateFrom);
  }, [validateFrom]);

  const info = uiSchema['ui:information'] ?? {};

  const { mechanism, debounceUpdates, namespace = COMMON, dataTestId } = formContext || {};
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

  const validationResult = useDateWidgetValidations(
    id,
    value,
    validations,
    validateFromArray as any,
    validateWhen as any,
    serverErrors,
    formatAs,
  );

  const {
    errors = [],
    valid = true,
    minDate,
    maxDate,
    disableDates = () => false,
    minTime,
    maxTime,
  } = validationResult || {};

  const {
    labelUppercase: label,
    helpText,
    omitValidationHints,
    required,
  } = useWidgetUtils(schema, options, formContext);
  useDefaultValueFrom(id, defaultValueFrom);
  useApplyValueFromComparison(id, 'EDIT', applyValueFromComparison);

  const [validInputDate, setValidInputDate] = useState(true);

  const dateFormat = useDate(formatAs) || 'dd/MM/yyyy';
  const isRequired = useMemo(() => {
    return validations?.required;
  }, [validations]);

  const onDateChange = useCallback(
    (date) => {
      if (date === null && !isRequired) {
        setFieldValue(undefined);
        setValidInputDate(true);
        return;
      }
      if (!isDate(date) || !isValid(date)) {
        setFieldValue(undefined);
        setValidInputDate(false);
        return;
      }
      try {
        if (formatAs === 'monthDay') {
          setFieldValue(format(date, 'yyyy-MM-dd'));
        } else if (formatAs === 'time') {
          setFieldValue(format(date as Date, 'HH:mm'));
        } else if (formatAs === 'dateTimeNoTimeZone') {
          setFieldValue(format(date as Date, "yyyy-MM-dd'T'HH:mm:ss"));
        } else if (formatAs === 'datetime') {
          setFieldValue((date as Date).toISOString());
        } else if (formatAs === 'dateTimeWithTimeZone') {
          setFieldValue(format(date as Date, "yyyy-MM-dd'T'HH:mm:ssxxx"));
        } else {
          setFieldValue(format(date as Date, dateFormat));
        }
        setValidInputDate(true);
      } catch {
        setValidInputDate(false);
      }
    },
    [setFieldValue, isRequired, formatAs, dateFormat],
  );

  const clientErrors = useMemo(() => {
    if (!validInputDate && (errors || []).indexOf('invalidFormat') < 0) {
      return ['invalidFormat'];
    }
    return errors;
  }, [validInputDate, errors]);

  const { translatedMessage } = useAdditionalInfo(id, {
    ...info,
    namespace: info?.namespace ?? namespace,
  });

  return (
    <GenericDate
      id={id}
      dataTestId={`${dataTestId}_${widgetLabel}`}
      label={label}
      styledFieldLabel={
        <StyledFieldLabel
          label={label}
          required={required}
          omitValidationHints={omitValidationHints}
        />
      }
      description={translatedMessage}
      value={value}
      inputProps={inputProps}
      minDate={minDate as any}
      maxDate={maxDate as any}
      minTime={minTime}
      maxTime={maxTime}
      widthSize={widthSize}
      fullWidth={fullWidth}
      formatAs={formatAs}
      disabled={disabled}
      readonly={readonly}
      helpText={helpText}
      valid={valid && validInputDate}
      onChange={onDateChange}
      errors={
        <ValidationErrors
          id={id}
          clientErrors={clientErrors}
          serverErrors={serverErrors}
          serverErrorTypes={serverErrorTypes}
          diffs={diffs}
          dirty={dirty}
        />
      }
      locale={locale}
      dateFormat={dateFormat}
      minutesStep={minutesStep}
      disableDates={disableDates}
    />
  );
};

export default DateWidget;
