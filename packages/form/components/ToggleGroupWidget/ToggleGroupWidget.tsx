import React, { useEffect } from 'react';
import { FormWidgetProps, ToggleGroupWidgetOptions } from '@pkg-form/types';
import useFormField from '@pkg-entity/hooks/useFormField';
import FieldTitle from '@pkg-form/templates/FieldTitle/FieldTitle';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import { FormControl, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { enumeratedOptions } from '@pkg-common/utils';
import StyledFieldLabel from '@pkg-form/templates/FieldTitle/StyledFieldLabel';

const ToggleGroupWidget = ({
  id,
  options,
  formContext,
  value: innerValue,
  onChange,
  schema,
  uiSchema,
}: FormWidgetProps & { options: ToggleGroupWidgetOptions }) => {
  const { defaultValues, showLabel = true } = options;
  const defaultValue = uiSchema['ui:value'];

  const useDefaultMechanism = formContext?.mechanism === 'DEFAULT';
  const { value, setFieldValue } = useFormField(
    id,
    useDefaultMechanism
      ? {
          value: innerValue,
          onChange,
        }
      : undefined,
  );

  const { t: translate } = useTranslation([formContext?.namespace]);
  const { selectedLanguage } = useSystem();

  const {
    labelUppercase: label,
    omitValidationHints,
    required,
  } = useWidgetUtils(schema, options, formContext);
  const list = enumeratedOptions(
    defaultValues,
    formContext?.namespace,
    selectedLanguage,
    translate,
  );

  useEffect(() => {
    if (defaultValue && !value) {
      setFieldValue(defaultValue);
    }
  }, [defaultValue, value, setFieldValue]);

  return (
    <FormControl>
      {showLabel && (
        <FieldTitle
          title={
            <StyledFieldLabel
              label={label}
              required={required}
              omitValidationHints={omitValidationHints}
            />
          }
        />
      )}
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, v) => {
          setFieldValue(v);
        }}
        aria-label={label}
      >
        {list.map((l) => (
          <ToggleButton
            value={l.code}
            aria-label={l.label}
            aria-pressed={l.code === value}
            data-testid={l.code}
            key={l.code}
          >
            {l.label || l.code}
            <span id={`${l.label}-toggle-button}`} style={{ display: 'none' }}>
              {`${l.label}-toggle-button`}
            </span>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </FormControl>
  );
};

export default ToggleGroupWidget;
