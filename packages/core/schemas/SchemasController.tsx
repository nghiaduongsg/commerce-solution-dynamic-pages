import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DETAIL_FORM, SEARCH_FORM } from '@pkg-constants/screenTypeIds';
import cloneDeep from 'lodash/cloneDeep';
import LoadingBackdrop from '@pkg-common/components/LoadingBackdrop/LoadingBackdrop';
import useSchemaSources from './useSchemaSources';
import axios from 'axios';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';
import useSystem from '@pkg-setup/src/system/useSystem';
import useApiDataState from '@pkg-core/apiData/hooks/useApiDataState';
import { hasValue } from '@pkg-common/utils';
import useFormField from '@pkg-entity/hooks/useFormField';
import { Skeleton } from '@mui/material';
import {
  attachObjectAccessGroups,
  attachAttachments,
  attachLogs,
  attachHistory,
} from '@pkg-core/schemas/utils';

export const getSchemasStoreId = (pageId, screenType, entitySubType?) => {
  if (entitySubType) {
    return `${pageId}_${screenType}_${entitySubType}_SCHEMAS`;
  }
  return `${pageId}_${screenType}_SCHEMAS`;
};

export const getSchema = (schemas: AnyType, type: AnyType) => {
  const schema = schemas?.find((s) => s?.schemaTypeCL === type)?.schemaData;
  if (!schema) {
    return {};
  }

  try {
    return JSON.parse(schema);
  } catch {
    return {};
  }
};

const ignoreOwner = (schema) => {
  if (typeof schema !== 'string') {
    schema = JSON.stringify(schema);
  }
  return schema.indexOf('MultiLanguageWidget') > 0;
};

const addExtraFunctionality = (input: AnyType, schema?: AnyType) => {
  const uiSchema = cloneDeep(input || {});
  const callApis = uiSchema?.callApis || [];
  const entityId = uiSchema?.['ui:page']?.id;
  const pageUrl = uiSchema?.['ui:page']?.url;
  const entityIdKey = uiSchema?.['ui:page']?.idKey;
  const autoAttachFunctionalities = uiSchema?.['ui:page']?.autoAttachFunctionalities;
  const objectType = uiSchema?.['ui:page']?.objectType;
  const baseSidePanels = uiSchema?.sidePanelInfo ?? [];

  const createAttachLogs =
    (entityIdKey: string, pageUrl: string, objectType?: string) => (entityCode: string) =>
      attachLogs(entityIdKey, entityCode, pageUrl, uiSchema, objectType);

  const createAttachObjectAccessGroups =
    (entityIdKey: string, pageUrl: string) => (entityId: string) =>
      attachObjectAccessGroups(entityIdKey, entityId, pageUrl);
  const createAttachAttachments = (entityIdKey: string, pageUrl: string) => (entityId: string) =>
    attachAttachments(entityIdKey, entityId, pageUrl);
  const createAttachChangesHistory = () => () => ({
    key: 'changesHistory',
    schema: {},
    uiSchema: {},
  });
  const autoAttachConfig = [
    {
      key: 'objectAccessGroups',
      fn: createAttachObjectAccessGroups(entityIdKey, pageUrl),
    },
    { key: 'attachments', fn: createAttachAttachments(entityIdKey, pageUrl) },
    { key: 'logs', fn: createAttachLogs(entityIdKey, pageUrl, objectType) },
    { key: 'changesHistory', fn: createAttachChangesHistory() },
  ];

  const additionalPanels =
    entityId && entityIdKey && autoAttachFunctionalities
      ? autoAttachConfig
          .filter((config) => autoAttachFunctionalities[config.key])
          .map((config) => config.fn(entityId))
      : [];

  const aggregatedSidePanelInfo = [...baseSidePanels, ...additionalPanels];
  const historyApis = callApis?.filter((api) => api.initiateClone);
  if (historyApis?.length) {
    aggregatedSidePanelInfo.push(
      attachHistory({ ...schema }, { ...uiSchema }, entityId, historyApis),
    );
  }

  // @ts-ignore
  const duplicateStructure = callApis.find((api: ApiValuesSchema) => api?.type === '__DUPLICATE__');
  if (duplicateStructure) {
    return { ...uiSchema };
  }
  callApis.forEach((api: ApiValuesSchema) => {
    const { replacements = [], url, resourceId } = api;
    const routerReplacement = replacements.find((r) => r?.source?.type === 'ROUTER');

    if (routerReplacement) {
      const { key } = routerReplacement;

      const duplicate: ApiValuesSchema = {
        // @ts-ignore
        type: '__DUPLICATE__',
        url: url.replace(key, '{id}'),
        replacements: [
          {
            key: '{id}',
            source: {
              type: 'ROUTER_DATA',
              code: 'id',
              jsonPath: ['id'],
            },
          },
        ],
        resourceId: resourceId,
        resourceToEntity: resourceId,
      };

      const clickValue: ApiValuesSchema = {
        // @ts-ignore
        type: '__CLICK_VALUE__',
        url: url.replace(key, '{id}'),
        replacements: [
          {
            key: '{id}',
            source: {
              type: 'ROUTER_DATA',
              code: 'CLICKED_CELL_ID_' + resourceId,
              jsonPath: ['value'],
            },
          },
        ],
        resourceId: `${resourceId}_click`,
        resourceToEntity: resourceId,
      };

      callApis.push(duplicate);
      callApis.push(clickValue);
    }
  });

  return {
    ...uiSchema,
    'ui:ignoreOwnerCL': ignoreOwner(uiSchema),
    sidePanelInfo: aggregatedSidePanelInfo,
  };
};

export const getStaticSchemas = (
  pageId: string,
  screenType: string,
  subType: string,
  fallbackSchemas: AnyType = window['FALLBACK_SCHEMAS'],
) => {
  const hasSubType = subType?.length > 0;
  const schemaId = hasSubType ? `${pageId}_${subType}` : pageId;

  const views = fallbackSchemas?.[pageId]?.views;
  if (views) {
    const view =
      screenType === SEARCH_FORM ? 'list' : screenType === DETAIL_FORM ? 'detail' : 'form';
    const declared = views[view];
    return {
      listSchema: view === 'list' ? cloneDeep(declared?.uiSchema || {}) : {},
      schema: cloneDeep(declared?.schema || {}),
      uiSchema: addExtraFunctionality(
        view === 'list' ? declared?.uiSchema?.['ui:filters'] || {} : declared?.uiSchema || {},
        declared?.schema,
      ),
      helpURL: declared?.helpURL,
    };
  }

  if (!fallbackSchemas) {
    return {
      listSchema: {},
      schema: {},
      uiSchema: {},
      helpURL: undefined,
    };
  }

  if (!fallbackSchemas[schemaId] && !fallbackSchemas[pageId]) {
    return {
      listSchema: {},
      schema: {},
      uiSchema: {},
      helpURL: undefined,
    };
  }

  const { configuration, schema, uiSchema, pageSchema, pageUiSchema, helpURL } =
    fallbackSchemas[schemaId] || {};

  if (pageSchema && pageUiSchema && subType) {
    if (screenType === SEARCH_FORM) {
      return {
        listSchema: configuration || {},
        schema: schema || {},
        uiSchema: addExtraFunctionality(uiSchema || {}, schema || {}),
        helpURL,
      };
    } else {
      return {
        schema: pageSchema || {},
        uiSchema: addExtraFunctionality(pageUiSchema || {}, pageSchema || {}),
        helpURL,
      };
    }
  }
  const {
    configuration: defaultConfiguration = {},
    schema: defaultSchema = {},
    uiSchema: defaultUiSchema = {},
    pageSchema: defaultPageSchema = {},
    pageUiSchema: defaultPageUiSchema = {},
    helpURL: defaultHelpURL = undefined,
  } = fallbackSchemas[pageId];

  if (screenType === SEARCH_FORM) {
    return {
      listSchema: defaultConfiguration || {},
      schema: defaultSchema,
      uiSchema: addExtraFunctionality(defaultUiSchema, defaultSchema),
      helpURL: defaultHelpURL,
    };
  } else {
    return {
      schema: defaultPageSchema,
      uiSchema: addExtraFunctionality(defaultPageUiSchema, defaultPageSchema),
      helpURL: defaultHelpURL,
    };
  }
};

const getSchemas = (
  pageId,
  screenType,
  entitySubType,
  apiUrl,
  onSuccess,
  onError,
  includeExtras,
) => {
  return axios
    .get(
      hasValue(entitySubType)
        ? `${apiUrl}/ui-configuration/ui-entities/unique?code=${pageId}&screenTypeCL=${screenType}&entitySubType=${entitySubType}&onAbsenceGetDefault=true`
        : `${apiUrl}/ui-configuration/ui-entities/unique?code=${pageId}&screenTypeCL=${screenType}&onAbsenceGetDefault=true`,
    )
    .then((response) => {
      const data = response?.data;
      const configuration = getSchema(data?.schemas, 'LIST');
      const uiSchemaInitial = getSchema(data?.schemas, 'UI');
      const schema = getSchema(data?.schemas, 'JSON');
      const uiSchema = includeExtras
        ? addExtraFunctionality(uiSchemaInitial, schema)
        : getSchema(data?.schemas, 'UI');

      onSuccess({ configuration, uiSchema, schema, helpURL: data?.helpURL }, entitySubType);
    })
    .catch(() => {
      onError();
    });
};

const SchemasController = ({
  pageId,
  screenType,
  subType = '',
  includeExtras = true,
  onSchemasReady,
  children,
  errorLayout,
}: {
  pageId: string;
  screenType: string;
  subType?: string;
  includeExtras?: boolean;
  onSchemasReady: (_: { schema: AnyType; uiSchema: AnyType; configuration: AnyType }) => void;
  children: JSX.Element | Array<JSX.Element> | null | undefined;
  errorLayout?: JSX.Element | null;
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setError] = useState(false);
  const [subTypeKey, setSubTypeKey] = useState(null);

  const { useStaticSchemas, apiUrl } = useSystem();

  const { setApiData } = useApiDataState(getSchemasStoreId(pageId, screenType, subType));
  const formFieldId = useMemo(() => {
    return `${pageId}_${subTypeKey}`;
  }, [pageId, subTypeKey]);

  const { value: entitySubTypeFormValue = null } = useFormField(formFieldId, undefined);

  const onSuccess = useCallback(
    (schemas, subType) => {
      setApiData({
        id: getSchemasStoreId(pageId, screenType, subType),
        data: { ...schemas },
      });

      const { uiSchema } = schemas || {};

      setSubTypeKey(uiSchema['ui:schemaSources']?.[0]?.selector || uiSchema['ui:page']?.subTypeKey);
      setError(false);
      setLoading(false);
      onSchemasReady(schemas);
    },
    [pageId, screenType, setApiData, onSchemasReady],
  );

  const sourceBase = useMemo(() => {
    if (!useStaticSchemas) return null;
    const { listSchema, schema, uiSchema } = getStaticSchemas(pageId, screenType, subType);
    return { configuration: listSchema, schema, uiSchema };
  }, [pageId, screenType, subType, useStaticSchemas]);
  const schemaSources = useSchemaSources(
    sourceBase,
    entitySubTypeFormValue || subType,
    apiUrl,
    useStaticSchemas,
    onSuccess,
  );

  const onError = useCallback(() => {
    setError(true);
    setLoading(false);

    const { listSchema, uiSchema, schema } = getStaticSchemas(pageId, screenType, subType) || {};
    onSchemasReady({ configuration: listSchema, uiSchema, schema });
  }, [onSchemasReady, pageId, screenType, subType]);

  useEffect(() => {
    if (useStaticSchemas) {
      const { listSchema, uiSchema, schema, helpURL } =
        getStaticSchemas(pageId, screenType, subType) || {};
      if (!hasValue(listSchema) && !hasValue(uiSchema) && !hasValue(schema)) {
        getSchemas(pageId, screenType, subType, apiUrl, onSuccess, onError, includeExtras);
      } else {
        onSuccess({ configuration: listSchema, uiSchema, schema, helpURL }, subType);
      }
    } else {
      getSchemas(pageId, screenType, subType, apiUrl, onSuccess, onError, includeExtras);
    }
  }, [
    apiUrl,
    includeExtras,
    onError,
    onSchemasReady,
    onSuccess,
    pageId,
    screenType,
    setApiData,
    subType,
    useStaticSchemas,
  ]);

  useEffect(() => {
    if (sourceBase?.uiSchema?.['ui:schemaSources']?.length) return;
    if (!subType && subTypeKey && entitySubTypeFormValue) {
      if (useStaticSchemas) {
        const { listSchema, uiSchema, schema } = getStaticSchemas(
          pageId,
          screenType,
          entitySubTypeFormValue,
        );
        onSuccess({ configuration: listSchema, uiSchema, schema }, entitySubTypeFormValue);
        return;
      }
      getSchemas(
        pageId,
        screenType,
        entitySubTypeFormValue,
        apiUrl,
        onSuccess,
        onError,
        includeExtras,
      );
    }
  }, [
    pageId,
    screenType,
    subTypeKey,
    subType,
    entitySubTypeFormValue,
    apiUrl,
    onSuccess,
    onError,
    includeExtras,
    useStaticSchemas,
    sourceBase,
  ]);

  if (loading) {
    return <Skeleton variant="rectangular" sx={{ flex: 1 }} height={'100%'} aria-busy={true} />;
  }

  if (hasError || schemaSources.error) {
    return errorLayout;
  }

  return (
    <>
      <LoadingBackdrop open={schemaSources.loading} />
      {children}
    </>
  );
};

export default SchemasController;
