import React, { useMemo } from 'react';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useDate from '@pkg-common/hooks/useDate';
import { format } from 'date-fns';
import useFormField from '@pkg-entity/hooks/useFormField';
import { DateWidgetOptions, FormWidgetProps } from '@pkg-form/types';
import useApplyValueFromComparison from '@pkg-form/hooks/useApplyValueFromComparison';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useDateWidgetValidations from './hooks/useDateWidgetValidations';
import { getFinalValidateFromStructure } from '@pkg-form/validations/utils/widgetUtils';
import { parseDate, ISO_DATETIME_REGEX } from '@pkg-common/utils/utils';
import { useTranslation } from 'react-i18next';
import { useSystem } from '@pkg-setup/index';

const DateReadOnlyWidget = ({
  id,
  options,
  value: innerValue,
  onChange,
  schema,
  uiSchema,
  formContext,
   serverErrors,
   diffs,
}: FormWidgetProps & { options: DateWidgetOptions }) => {
  const {
    slim,
    defaultValueFrom,
    formatAs = 'date',
    applyValueFromComparison,
    validations = {},
    validateFrom = [],
    validateWhen = {},
    noValueText,
  } = options;

  const validateFromArray = useMemo(() => {
    return getFinalValidateFromStructure(validateFrom);
  }, [validateFrom]);

  const defaultValue = uiSchema['ui:value'];
  const useDefaultMechanism = formContext?.mechanism === 'DEFAULT';
  const { value } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const { errors } = useDateWidgetValidations(
    id,
    value,
    validations,
    validateFromArray as any,
    validateWhen as any,
    serverErrors,
    formatAs,
  );

  const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);
  useDefaultValueFrom(id, defaultValueFrom);
  useApplyValueFromComparison(id, 'READ', applyValueFromComparison);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([formContext?.namespace]);

  const dateFormat = useDate(formatAs) || 'dd/MM/yyyy';

  const formattedDate = useMemo(() => {
    if (!value && noValueText) {
      return translate(noValueText, { ns: formContext?.namespace, lng: selectedLanguage });
    }
    try {
      const parsed = ISO_DATETIME_REGEX.test(value) ? new Date(value) : parseDate(value);
      return parsed ? format(parsed, dateFormat || '') : '-';
    } catch (error) {
      return value;
    }
  }, [
    value,
    dateFormat,
    defaultValue,
    noValueText,
    translate,
    formContext?.namespace,
    selectedLanguage,
  ]);
  return (
    <ReadOnlyField
      id={id}
      title={readOnlyLabel}
      value={formattedDate}
      slim={slim}
      uiSchema={uiSchema}
      errors={
        <ValidationErrors
          id={id}
          clientErrors={errors}
          serverErrors={serverErrors}
          diffs={diffs}
          dirty={true}
        />
      }
    />
  );
};

export default DateReadOnlyWidget;
