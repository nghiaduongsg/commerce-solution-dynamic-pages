import React, { useEffect, useMemo } from 'react';
import GenericCheckbox from '@pkg-common/atomics/GenericCheckbox/GenericCheckbox';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import {
  getWidgetArrayParentId,
  getWidgetPropertyId,
} from '@pkg-form/validations/utils/widgetUtils';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { FormWidgetProps } from '@pkg-form/types';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { hasValue } from '@pkg-common/utils';
import useAdditionalInfo from '@pkg-form/hooks/useAdditionalInfo';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const CheckWidget = ({
  schema,
  id,
  disabled,
  readonly,
  autofocus,
  onBlur,
  onFocus,
  options,
  uiSchema,
  value: innerValue,
  onChange,
  serverErrors,
  diffs,
  formContext,
}: FormWidgetProps) => {
  const { defaultValueFrom = { code: '', jsonPath: [] }, validations } = options;
  const defaultValue = uiSchema['ui:value'];
  const info = uiSchema['ui:information'] ?? {};

  const { mechanism, debounceUpdates, namespace } = formContext || {};
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

  const { getFieldDisabledValues } = useFormManagerContext();
  const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);

  useDefaultValueFrom(id, defaultValueFrom);

  const parentId = getWidgetArrayParentId(id);
  const propertyId = getWidgetPropertyId(id);
  const disabledValues = useMemo(() => {
    return getFieldDisabledValues(parentId, propertyId);
  }, [getFieldDisabledValues, parentId, propertyId]);

  useEffect(() => {
    if (hasValue(defaultValue) && !hasValue(value)) {
      setFieldValue(defaultValue, 'CheckWidget');
    } else if (!hasValue(defaultValue) && !hasValue(value)) {
      setFieldValue(false, 'CheckWidget');
    }
  }, [defaultValue, value]);

  const { translatedMessage } = useAdditionalInfo(id, {
    ...info,
    namespace: info?.namespace ?? namespace,
  });

  return (
    <>
      <div style={{ display: 'flex', flex: 1 }}>
        <GenericCheckbox
          id={id}
          label={readOnlyLabel}
          value={value}
          disabled={
            disabled ||
            (disabledValues.length > 0 && (disabledValues as any[]).includes(true) && !value)
          }
          readOnly={readonly}
          required={(validations || {}).required}
          autofocus={autofocus}
          onChange={(value) => {
            setFieldValue(value);
          }}
          onBlur={onBlur}
          onFocus={onFocus}
          invalid={(serverErrors || [])?.length > 0}
          additionalInfo={translatedMessage}
        />
        {options?.icon && (
          <AssetByType input="icons" name={options.icon} props={{ fontSize: 'large' }} />
        )}
      </div>
      <ValidationErrors
        id={id}
        clientErrors={[]}
        serverErrors={serverErrors}
        diffs={diffs}
        dirty={dirty}
      />
    </>
  );
};

export default CheckWidget;
