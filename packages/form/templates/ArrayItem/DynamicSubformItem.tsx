import React, { useMemo } from 'react';
import { getSchemas } from '@pkg-form/validations/utils/schemaUtils';
import { DynamicSubformItemProps } from './DynamicSubformItem.d';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import {
  getFormIdFromWidgetId,
  getWidgetIdFromJsonPath,
} from '@pkg-form/validations/utils/widgetUtils';
import useSystem from '@pkg-setup/src/system/useSystem';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import { replaceSpecificCodes } from '@pkg-core/schemas/utils';

const DynamicSubformItem = ({
  id,
  subform,
  disabled,
  namespace,
  schema,
  uiSchema,
  formData,
  formContext,
  onChange,
  uiSchemaOptions,
  formId = '',
}: DynamicSubformItemProps) => {
  const { mainProperty, dependency, type } = subform || {};
  const { callApi, entityMainProperty = '', elementsProperty = 'elements' } = dependency || {};

  const { resourceId, resourcePath } = callApi || {};
  let apiId = id;
  if (resourcePath) {
    apiId = getWidgetIdFromJsonPath(getFormIdFromWidgetId(id), id, resourcePath);
  } else if (resourceId) {
    apiId = resourceId;
  }

  const selectedDependency = useApiData(apiId, callApi);
  const { selectedLanguage } = useSystem();
  const preUiSchema = useMemo(() => {
    return { ...uiSchema, 'ui:labels': { namespace } };
  }, [uiSchema, namespace]);

  const finalSchemas = useMemo(() => {
    if (!formData || !formData[entityMainProperty] || !selectedDependency) {
      return {
        schema: JSON.parse(JSON.stringify(schema)),
        uiSchema: JSON.parse(JSON.stringify(preUiSchema)),
      };
    }

    let { schema: newSchema, uiSchema: newUiSchema } = getSchemas(
      selectedDependency[elementsProperty],
      JSON.parse(JSON.stringify(schema)),
      JSON.parse(JSON.stringify(preUiSchema)),
      mainProperty,
      selectedLanguage,
      type === 'BANK_ELEMENTS',
      uiSchemaOptions,
    );

    newUiSchema = replaceSpecificCodes(newUiSchema, formId);

    return { schema: newSchema, uiSchema: newUiSchema };
  }, [selectedLanguage, selectedDependency, formData, formId, entityMainProperty]);

  return (
    <DynamicForm
      id={id}
      data={formData}
      disabled={disabled}
      schema={finalSchemas.schema}
      uiSchema={finalSchemas.uiSchema}
      formContext={formContext}
      onChange={onChange}
    />
  );
};

export default DynamicSubformItem;
