import React, { useEffect, useMemo, useState } from 'react';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useCodeListWidgetUtils from './hooks/useCodeListWidgetUtils';
import useCodeListWidget from './hooks/useCodeListWidget';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useApplyValueFromComparison from '@pkg-form/hooks/useApplyValueFromComparison';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps, SelectWidgetOptions } from '@pkg-form/types';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useCodeListDefaultValue from './hooks/useCodeListDisplayValue';
import { NOT_FOUND_KEY } from '@pkg-constants/formCommon';
import { hasValue, enumeratedOptions } from '@pkg-common/utils';
import useCodeListWidgetValidations from '@pkg-form/components/SelectCodeListWidget/hooks/useCodeListWidgetValidations';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';

const SelectCodeListReadOnlyWidget = ({
  schema,
  id,
  value: innerValue,
  options,
  onChange,
  uiSchema,
  formContext,
  serverErrors,
  diffs,
}: FormWidgetProps & { options: SelectWidgetOptions }) => {
  const {
    apiValues,
    multiple,
    filterFrom,
    mapToProperty,
    slim,
    labelAlignment = 'top',
    renderWith,
    defaultValueFrom,
    applyValueFromComparison,
    validations,
    validateWhen,
    defaultValues,
    truncate,
  } = options;

  const { selectedLanguage } = useSystem();
  const { mechanism } = formContext || {};
  const useDefaultMechanism = mechanism === 'DEFAULT';
  const { value } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const { readOnlyLabel, showReadOnlyLabel } = useWidgetUtils(schema, options, formContext);
  const { selectedValue } = useCodeListWidgetUtils(value, multiple, mapToProperty);
  const [hasBeenFocused, setHasBeenFocused] = useState(false);

  const { errors } = useCodeListWidgetValidations(
    id,
    selectedValue,
    multiple,
    validations,
    serverErrors,
    validateWhen,
  );

  const { t: translate } = useTranslation([formContext?.namespace]);
  const { list } = useCodeListWidget(id, apiValues, filterFrom, renderWith, hasBeenFocused);

  const optionsFromEnum = enumeratedOptions(
    defaultValues,
    formContext?.namespace,
    selectedLanguage,
    translate,
  );

  useDefaultValueFrom(id, defaultValueFrom);
  useApplyValueFromComparison(id, 'READ', applyValueFromComparison);

  const displayValue = useCodeListDefaultValue(
    id,
    multiple,
    optionsFromEnum?.length ? optionsFromEnum : list,
    selectedValue,
  );

  const finalValue = useMemo(() => {
    const { type, enum: enumValues } = schema || {};
    try {
      if (type === 'boolean') {
        if (enumValues?.length === 2) {
          return value ? enumValues[0] : enumValues[1];
        } else {
          return value ? 'Yes' : 'No';
        }
      } else if (multiple && !mapToProperty) {
        return displayValue === NOT_FOUND_KEY ? value?.join(', ') : displayValue;
      } else if (!multiple && !mapToProperty) {
        return displayValue === NOT_FOUND_KEY ? value : displayValue;
      } else if (multiple && mapToProperty) {
        return displayValue === NOT_FOUND_KEY
          ? value?.map((v) => v[mapToProperty])?.join(', ')
          : displayValue;
      } else if (!multiple && mapToProperty) {
        return displayValue === NOT_FOUND_KEY ? value[mapToProperty] : displayValue;
      }
    } catch {
      return '-';
    }
  }, [schema, displayValue, multiple, mapToProperty]);

  useEffect(() => {
    if (displayValue === NOT_FOUND_KEY && hasValue(selectedValue)) {
      setHasBeenFocused(true);
    }
  }, [displayValue, selectedValue]);

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
      }}
    >
      {labelAlignment === 'left' && <FieldTitle title={readOnlyLabel} isBold={true} />}
      <ReadOnlyField
        id={id}
        title={showReadOnlyLabel ? readOnlyLabel : undefined}
        uiSchema={uiSchema}
        value={finalValue}
        slim={slim}
        truncate={truncate?.enabled}
        errors={
          <ValidationErrors
            id={id}
            clientErrors={errors}
            serverErrors={serverErrors}
            diffs={diffs}
            dirty-true
          />
        }
      />
    </div>
  );
};

export default SelectCodeListReadOnlyWidget;
