import React, { useMemo, useEffect, useState, useCallback } from 'react';
import useFormField from '@pkg-entity/hooks/useFormField';
import { GenericFormProps } from './GenericForm.d';
import GenericPage from '@pkg-form/components/GenericPage';
import SchemasController from '@pkg-core/schemas/SchemasController';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';

const getApis = (
  callApis: Array<ApiValuesSchema>,
  relatedId: string,
  pageId: string,
  excludeSystemApis: boolean,
) => {
  const filteredApis = excludeSystemApis
    ? (callApis || []).filter(
        (api) => api.type !== '__DUPLICATE__' && api.type !== '__CLICK_VALUE__',
      )
    : callApis;
  return filteredApis.map((api) => {
    return api.resourceId === pageId
      ? {
          ...api,
          url: api.url.slice(0, api.url.lastIndexOf('/') + 1) + (relatedId || '{undefinedId}'),
        }
      : api;
  });
};
const GenericForm = ({
  pageId,
  requestParams,
  fallbackSchemas,
  relatedId,
  excludeSystemApis = false,
}: GenericFormProps) => {
  const { subTypeKey: entitySubTypeKey } = (fallbackSchemas?.uiSchema || {})['ui:page'] || {};
  const [schemas, setSchemas] = useState<AnyType>(null);
  const setAllSchemas = useCallback((schemas) => {
    setSchemas(schemas);
  }, []);
  const { value: entitySubTypeFormValue } = useFormField(`${pageId}_${entitySubTypeKey}`);
  const entitySubType = useMemo(() => {
    let value = '';

    if (requestParams?.entitySubType) {
      value = requestParams.entitySubType;
    }

    if (entitySubTypeFormValue) {
      value = entitySubTypeFormValue;
    }

    return value;
  }, [entitySubTypeKey, entitySubTypeFormValue, requestParams.entitySubType]);

  useEffect(() => {
    return () => {
      localStorage.removeItem('CLICKED_CELL_ID_' + pageId);
    };
  }, []);

  const apisToCallWithoutRouter = useMemo(() => {
    if (!schemas?.uiSchema) {
      return [];
    }

    if (relatedId) {
      return getApis(schemas?.uiSchema?.callApis ?? [], relatedId, pageId, excludeSystemApis);
    }
    return (schemas?.uiSchema?.callApis || []).filter((api) => {
      return api.resourceId !== pageId;
    });
  }, [schemas, relatedId]);

  return (
    <SchemasController
      pageId={pageId}
      screenType={requestParams?.screenTypeCL}
      subType={entitySubType}
      onSchemasReady={setAllSchemas}
    >
      <GenericPage
        schema={schemas?.schema}
        uiSchema={{ ...schemas?.uiSchema, callApis: apisToCallWithoutRouter }}
        disabled={true}
        hideActionButtons={true}
      />
    </SchemasController>
  );
};

export default GenericForm;
