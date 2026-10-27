import React from 'react';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import { FormWidgetProps } from '@pkg-form/types';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import { AnyType } from '@pkg-common/types';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';

const constructSchemas = (namespace: string, data: AnyType) => {
  const schema = {
    type: 'object',
    properties: {},
  };
  const uiSchema = {
    'ui:labels': {
      namespace,
    },
  };
  for (const property in data) {
    schema.properties[`${property}`] = {
      type: 'string',
    };
    uiSchema[`${property}`] = {
      'ui:readonly': true,
      'ui:disabled': true,
      'ui:value': data[property] || '',
    };
  }

  return { schema, uiSchema };
};

const DynamicSchemaWidget = ({ id, options, formContext }: FormWidgetProps) => {
  const { dataFrom } = options;

  const data = useApiData(id, dataFrom);
  const { loading, hasError } = useApiDataState(id);

  if (loading) {
    return <div>Data Loading ...</div>;
  }

  if (hasError) {
    return <div>Failed to load data ...</div>;
  }

  const { schema, uiSchema } = constructSchemas(formContext?.namespace, data);

  return <DynamicForm id={id} schema={schema || {}} uiSchema={uiSchema || {}} />;
};

export default React.memo(DynamicSchemaWidget, (prev, next) => {
  return prev.id === next.id && JSON.stringify(prev.options) === JSON.stringify(next.options);
});
