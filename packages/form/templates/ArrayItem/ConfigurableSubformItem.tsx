import React, { useCallback, useMemo, useState } from 'react';
import { SINGLE_RECORD_FORM } from '@pkg-constants/screenTypeIds';
import { DynamicSubformItemProps } from '@pkg-form/templates/ArrayItem/DynamicSubformItem.d';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { AnyType } from '@pkg-common/types';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';

import { replaceSpecificCodes } from '@pkg-core/schemas/utils';

const ConfigurableSubformItem = ({
  id,
  subform,
  item,
  disabled,
  namespace,
  formId = '',
}: DynamicSubformItemProps) => {
  const { dependency, mainProperty = '' } = subform ?? {};
  const { entityId = '' } = dependency ?? {};
  const { children } = item ?? {};
  const { formData } = children?.props ?? {};
  const [schemas, setSchemas] = useState<AnyType>(null);
  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const entitySubType = useMemo(() => {
    return (children?.props?.formData || {})[mainProperty];
  }, [children, mainProperty]);

  const newUiSchema = useMemo(() => {
    if (!schemas?.uiSchema) return undefined;

    const replaced = replaceSpecificCodes(schemas.uiSchema, formId);

    return { ...replaced, 'ui:labels': { namespace } };
  }, [schemas?.uiSchema, formId, namespace]);

  return (
    <SchemasController
      pageId={entityId}
      screenType={SINGLE_RECORD_FORM}
      subType={entitySubType}
      includeExtras={false}
      onSchemasReady={setAllSchemas}
    >
      <DynamicForm
        id={id}
        data={formData}
        disabled={disabled}
        schema={schemas?.schema}
        uiSchema={newUiSchema}
      />
    </SchemasController>
  );
};

export default ConfigurableSubformItem;
