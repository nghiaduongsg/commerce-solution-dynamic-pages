import React from 'react';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useApplyValueFromComparison from '@pkg-form/hooks/useApplyValueFromComparison';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps, TextWidgetOptions } from '@pkg-form/types';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useTextWidgetValidations from '@pkg-form/validations/hooks/useTextWidgetValidations';

const TextReadOnlyWidget = ({
  id,
  options,
  serverErrors,
  diffs,
  schema,
  uiSchema,
  formContext,
  value: innerValue,
  onChange,
}: FormWidgetProps & { options: TextWidgetOptions }) => {
  const {
    slim,
    defaultValueFrom,
    mask,
    applyValueFromComparison,
    truncate,
    rows,
    validations,
    validateFrom,
    validateWhen,
    showLabel = true,
  } = options;

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

  const { readOnlyLabel, showReadOnlyLabel } = useWidgetUtils(schema, options, formContext);
  const { errors } = useTextWidgetValidations(
    id,
    value,
    validations,
    serverErrors || [],
    validateFrom,
    validateWhen,
  );
  useDefaultValueFrom(id, defaultValueFrom);
  useApplyValueFromComparison(id, 'READ', applyValueFromComparison);

  return (
    <ReadOnlyField
      id={id}
      title={showReadOnlyLabel ? readOnlyLabel : undefined}
      value={value ?? '-'}
      rows={rows}
      slim={slim}
      mask={mask}
      truncate={truncate?.enabled}
      uiSchema={uiSchema}
      showLabel={showLabel}
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

export default TextReadOnlyWidget;
