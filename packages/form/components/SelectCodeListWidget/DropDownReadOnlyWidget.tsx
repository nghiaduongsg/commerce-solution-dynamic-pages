import React, { useMemo } from 'react';
import ReadOnlyField from '@pkg-form/components/ReadOnlyField/ReadOnlyField';
import useWidgetUtils from '@pkg-form/hooks/useWidgetUtils';
import useDefaultValueFrom from '@pkg-form/hooks/useDefaultValueFrom';
import useFormField from '@pkg-entity/hooks/useFormField';
import { DropDownWidgetOptions, FormWidgetProps } from '@pkg-form/types';
import ValidationErrors from '@pkg-common/components/ValidationErrors/ValidationErrors';
import useCodeList from '@pkg-core/codeList/hooks/useCodeList';
import useCodeListDefaultValue from '@pkg-form/components/SelectCodeListWidget/hooks/useCodeListDisplayValue';
import { NOT_FOUND_KEY } from '@pkg-constants/formCommon';
import Resource from '@pkg-common/components/Resource/Resource';

const DropDownReadOnlyWidget = ({
  schema,
  uiSchema,
  id,
  value: innerValue,
  options,
  onChange,
  formContext,
  serverErrors,
  diffs,
}: FormWidgetProps & { options: DropDownWidgetOptions }) => {
  const {
    slim,
    defaultValueFrom,
    multiple,
    optionsResourceId,
    callApis,
    truncate = { enabled: false },
  } = options;

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

  const { list } = useCodeList(optionsResourceId);
  const displayValue = useCodeListDefaultValue(id, multiple, list, value);

  const { readOnlyLabel } = useWidgetUtils(schema, options, formContext);
  useDefaultValueFrom(id, defaultValueFrom);

  const shouldLoadList = useMemo(() => {
    return displayValue === NOT_FOUND_KEY;
  }, [displayValue]);

  return (
    <>
      {shouldLoadList &&
        callApis?.map((resource) => (
          <Resource key={resource.resourceId} resource={resource} widgetId={id} />
        ))}
      <ReadOnlyField
        id={id}
        title={readOnlyLabel}
        value={displayValue === NOT_FOUND_KEY ? value : displayValue}
        slim={slim}
        uiSchema={uiSchema}
        truncate={truncate?.enabled}
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
    </>
  );
};

export default React.memo(DropDownReadOnlyWidget, (prev, next) => prev.id === next.id);
