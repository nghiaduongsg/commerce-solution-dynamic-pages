import React, { useCallback, useMemo, useState } from 'react';
import GenericTable from '@pkg-list/components/GenericTable';
import { SEARCH_FORM } from '@pkg-constants/screenTypeIds';
import useEntityFormData from '@pkg-entity/hooks/useEntityFormData';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import { REPORTED_FORM_DATA_KEY } from '@pkg-constants/formCommon';
import { AnyType } from '@pkg-common/types';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { replaceSpecificCodes } from '@pkg-core/schemas/utils';

const getFieldValue = (formData: Record<string, any> | undefined, fieldId: string): any => {
  if (!formData || typeof formData !== 'object') return undefined;

  const path = fieldId.split('_');

  return path.reduce((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return value[key];
    }
    return undefined;
  }, formData);
};

const HistoryList: React.FC<AnyType> = (props): JSX.Element => {
  const { id, elements } = props;

  const [schemas, setSchemas] = useState<AnyType>(null);
  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);

  const findElements = (elements || []).filter((item) => item.content.key === id);
  const entity = findElements.length ? findElements[0].content.props.idPrefix : '';

  const fieldIdPath = findElements[0]?.content?.props?.idSchema?.$id || '';
  const fieldId = fieldIdPath ? fieldIdPath.substring(entity.length + 1) : '';

  const { formData } = useEntityFormData(entity);

  const currentSchema = findElements.length
    ? {
        type: 'object',
        properties: {
          [id]: findElements[0].content.props.schema,
        },
      }
    : {};

  const dataType = Array.isArray(formData?.[REPORTED_FORM_DATA_KEY]?.[id]) ? 'array' : 'object';

  const finalData = useMemo(() => {
    if (dataType === 'array') {
      return { [id]: formData?.[REPORTED_FORM_DATA_KEY]?.[id] };
    } else if (fieldId.split('_').includes('activityDetails')) {
      const result = getFieldValue(formData?.[REPORTED_FORM_DATA_KEY], fieldId);
      return { [id]: result };
    } else {
      return formData?.[REPORTED_FORM_DATA_KEY]?.[id];
    }
  }, [formData?.[REPORTED_FORM_DATA_KEY]?.[id], fieldId, id]);

  const finalId = useMemo(() => {
    if (dataType === 'array') {
      return `${entity}_${REPORTED_FORM_DATA_KEY}`;
    } else if (fieldId.split('_').includes('activityDetails')) {
      return `${entity}_${REPORTED_FORM_DATA_KEY}_activityDetails`;
    } else {
      return `${entity}_${REPORTED_FORM_DATA_KEY}_${id}`;
    }
  }, [id, entity]);

  const currentUIJsonSchema = useMemo(() => {
    if (!findElements.length) return {};

    const baseUiSchema = {
      'ui:labels': {
        namespace: 'form',
      },
      'ui:groups': [
        {
          key: 'Initial Data',
          type: 'Accordion',
          widgets: [id],
        },
      ],
      [id]: {
        ...findElements[0].content.props.uiSchema,
        'ui:options': {
          omitAddNew: true,
        },
      },
    };

    return replaceSpecificCodes(baseUiSchema, finalId);
  }, [findElements, id, finalId]);

  return (
    <>
      <DynamicForm
        id={finalId}
        schema={currentSchema}
        uiSchema={currentUIJsonSchema}
        data={finalData}
      />
      <SchemasController pageId={id} screenType={SEARCH_FORM} onSchemasReady={setAllSchemas}>
        <GenericTable configuration={schemas?.configuration} />
      </SchemasController>
    </>
  );
};

export default HistoryList;
