import React from 'react';
import GenericCheckbox from '@pkg-common/atomics/GenericCheckbox/GenericCheckbox';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps } from '@pkg-form/types';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';

const CheckReadOnlyWidget = ({
  schema,
  id,
  onBlur,
  onFocus,
  options,
  formContext,
  serverErrors,
  diffs,
}: FormWidgetProps) => {
  const { defaultValueFrom = { code: '', jsonPath: [] } } = options;

  const { value, setFieldValue } = useFormField(id, undefined, false);
  const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);

  useDefaultValueFrom(id, defaultValueFrom);

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <GenericCheckbox
        id={id}
        label={readOnlyLabel}
        value={value}
        disabled={true}
        readOnly={true}
        autofocus={false}
        onChange={setFieldValue}
        onBlur={onBlur}
        onFocus={onFocus}
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
    </div>
  );
};

export default CheckReadOnlyWidget;
