import { useMemo } from 'react';

import { useLocation, useParams } from 'react-router';
import { useApiDataState } from '@pkg-core/apiData';
import { getSchemasStoreId } from '@pkg-core/schemas/SchemasController';
import useFormField from '@pkg-entity/hooks/useFormField';
import useSystem from '@pkg-setup/src/system/useSystem';
import { getPageView, screenTypeForView } from '@pkg-core/schemas/pageViews';

const usePage = () => {
  const routeParams = useParams<{ category?: string; idKey?: string }>();
  const location = useLocation();
  const { application } = useSystem();

  const isList = useMemo(() => {
    return location?.pathname?.indexOf('/list') > 0;
  }, [location]);

  const pageId = useMemo(() => {
    if (application === 'ISS' && !routeParams?.category) {
      return 'IssPartyRoleAccount';
    }
    return routeParams?.category || '';
  }, [routeParams, application]);

  const querySubType = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get('subType') as string;
  }, [location]);
  const view = getPageView(pageId, location.pathname, routeParams?.idKey, location.search);
  const screenType = screenTypeForView(view);

  const { data: schemaData } = useApiDataState(
    isList ? '' : getSchemasStoreId(pageId, screenType, querySubType),
  );

  const pageUiSchema = isList ? undefined : schemaData?.uiSchema;
  const entitySubTypeKey = useMemo(() => {
    return (
      pageUiSchema?.['ui:schemaSources']?.[0]?.selector ||
      pageUiSchema?.['ui:page']?.subTypeKey ||
      ''
    );
  }, [pageId, pageUiSchema]);

  const formFieldId = `${pageId}_${entitySubTypeKey}`;
  const { value: entitySubTypeFormValue = null } = useFormField(formFieldId, undefined);

  const subTypeKey = useMemo(() => {
    return querySubType || entitySubTypeFormValue;
  }, [querySubType, entitySubTypeFormValue]);

  const { data, finished, hasError } = useApiDataState(
    getSchemasStoreId(pageId, screenType, subTypeKey),
  );

  const finalPageId = useMemo(() => {
    if (window['FALLBACK_SCHEMAS']) {
      return pageId;
    }
    return subTypeKey ? `${pageId}_${subTypeKey}` : pageId;
  }, [subTypeKey, pageId]);

  return useMemo(() => {
    if (finished && !hasError) {
      const apiDataResult = isList ? data?.configuration : data?.uiSchema;
      if (apiDataResult) return apiDataResult;
    }
    const fallback = window['FALLBACK_SCHEMAS']?.[finalPageId];
    if (fallback) {
      if (fallback.views) return fallback.views[view]?.uiSchema || {};
      const fallbackResult = isList ? fallback?.configuration : fallback?.pageUiSchema;
      if (fallbackResult) return fallbackResult;
    }
    return {};
  }, [data, finished, hasError, isList, finalPageId, view]);
};

export default usePage;
