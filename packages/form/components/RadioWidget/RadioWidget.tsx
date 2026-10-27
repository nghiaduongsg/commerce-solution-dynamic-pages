import React from 'react';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import IstRadioButton from '@pkg-common/atomics/IstRadioButton/IstRadioButton';
import useCodeListWidget from '@pkg-form/components/SelectCodeListWidget/hooks/useCodeListWidget';
import useCodeListWidgetValidations from '@pkg-form/components/SelectCodeListWidget/hooks/useCodeListWidgetValidations';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps, RadioWidgetOptions } from '@pkg-form/types';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { enumeratedOptions } from '@pkg-common/utils';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const RadioWidget = ({
  id,
  schema,
  disabled = false,
  readonly = false,
  serverErrors,
  diffs,
  options,
  value: innerValue,
  onChange,
  label: widgetLabel,
  formContext,
  uiSchema,
}: FormWidgetProps & { options: RadioWidgetOptions }) => {
  const {
    apiValues,
    validations,
    filterFrom,
    renderWith,
    defaultValues,
    includeAllOption = true,
    showLabel = true,
  } = options;

  const info = uiSchema['ui:information'] ?? {};

  const { mechanism, debounceUpdates, namespace, dataTestId } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';

  const { t: translate } = useTranslation([namespace]);
  const { selectedLanguage } = useSystem();

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
    required,
    omitValidationHints,
  } = useWidgetUtils(schema, options, formContext);

  const { list } = useCodeListWidget(id, apiValues, filterFrom, renderWith, true);

  const { valid, errors } = useCodeListWidgetValidations(
    id,
    value,
    false,
    validations,
    serverErrors,
  );

  const optionsFromEnum = enumeratedOptions(
    defaultValues,
    formContext?.namespace,
    selectedLanguage,
    translate,
  );

  const finalList = list.length ? list : optionsFromEnum;

  const { translatedMessage } = useAdditionalInfo(id, {
    ...info,
    namespace: info?.namespace ?? namespace,
  });

  return (
    <IstRadioButton
      id={id}
      testId={`${dataTestId}_${widgetLabel}`}
      label={label}
      styledFieldLabel={
        <StyledFieldLabel
          label={label}
          required={required}
          omitValidationHints={omitValidationHints}
        />
      }
      showLabel={showLabel}
      value={value}
      readonly={readonly}
      required={(validations || {}).required || false}
      disabled={disabled || readonly}
      onChange={(e) => setFieldValue(e.target.value)}
      options={finalList}
      includeAllOption={includeAllOption}
      additionalInfo={translatedMessage}
      errors={
        <ValidationErrors
          id={id}
          clientErrors={errors}
          serverErrors={serverErrors}
          diffs={diffs}
          dirty={dirty}
        />
      }
      valid={valid}
    />
  );
};

export default RadioWidget;
