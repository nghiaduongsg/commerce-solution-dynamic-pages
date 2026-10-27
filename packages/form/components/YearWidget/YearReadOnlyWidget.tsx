import React from 'react';

import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps } from '@pkg-form/types';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';

const YearReadOnlyWidget = ({
  id,
  options,
  schema,
  uiSchema,
  value: innerValue,
  onChange,
  formContext,
  serverErrors,
  diffs,
}: FormWidgetProps) => {
  const { slim } = options;
  const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);
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

  return (
    <ReadOnlyField
      id={id}
      title={readOnlyLabel}
      value={value || '-'}
      slim={slim}
      uiSchema={uiSchema}
      errors={
        <ValidationErrors
          id={id}
          clientErrors={[]}
          serverErrors={serverErrors}
          diffs={diffs}
          dirty={true}
        />
      }
    />
  );
};

export default YearReadOnlyWidget;
