import { useMemo } from 'react';

import { useLocation, useParams } from 'react-router';
import { useApiDataState } from '@pkg-core/apiData';
import { getSchemasStoreId } from '@pkg-core/schemas/SchemasController';
import useFormField from '@pkg-entity/hooks/useFormField';
import useSystem from '@pkg-setup/src/system/useSystem';
import { getPageView, screenTypeForView } from '@pkg-core/schemas/pageViews';

const usePageSubtype = () => {
  const routeParams = useParams<{ category?: string; idKey?: string }>();
  const location = useLocation();
  const { application } = useSystem();

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

  const { data: schemaData } = useApiDataState(
    getSchemasStoreId(
      pageId,
      screenTypeForView(
        getPageView(pageId, location.pathname, routeParams?.idKey, location.search),
      ),
      querySubType,
    ),
  );

  const pageUiSchema = schemaData?.uiSchema;

  const entitySubTypeKey = useMemo(() => {
    return (
      pageUiSchema?.['ui:schemaSources']?.[0]?.selector ||
      pageUiSchema?.['ui:page']?.subTypeKey ||
      ''
    );
  }, [pageId, pageUiSchema]);

  const formFieldId = `${pageId}_${entitySubTypeKey}`;
  const { value: entitySubTypeFormValue = null } = useFormField(formFieldId, undefined);

  return useMemo(() => {
    return querySubType || entitySubTypeFormValue;
  }, [querySubType, entitySubTypeFormValue]);
};

export default usePageSubtype;
