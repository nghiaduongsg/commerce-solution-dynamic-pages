import React, { useEffect, useMemo } from 'react';
import useApiData from '@pkg-core/apiData/hooks/useApiData';
import {
  getFormIdFromWidgetId,
  getWidgetIdFromJsonPath,
} from '@pkg-form/validations/utils/widgetUtils';
import { AnyType, ApiValuesSchema } from '@pkg-common/types';
import { useLocation, useParams } from 'react-router';
import { hasValue } from '@pkg-common/utils';
import useEntity from '@pkg-entity/hooks/useEntity';
import { useApiDataState } from '@pkg-core/apiData';

const Resource = ({
  resource,
  widgetId,
  resourceExtras,
}: {
  resource: ApiValuesSchema;
  widgetId?: string;
  resourceExtras?: {
    url: string;
    idKey: string;
    customFieldsKey: string;
    clearProperties?: Array<{ jsonPath: string[]; value?: AnyType }>;
  };
}) => {
  const { state } = useLocation();
  const routeState = useMemo(() => {
    return state || {};
  }, [state]);

  // @ts-ignore
  const { resourceId, resourceToEntity = undefined, resourcePath, type } = resource;
  let apiId = widgetId;
  if (resourcePath && widgetId) {
    apiId = getWidgetIdFromJsonPath(getFormIdFromWidgetId(widgetId), widgetId, resourcePath);
  } else if (resourceId) {
    apiId = resourceId;
  }

  const { setEntity, sliceExists } = useEntity(resourceToEntity);

  const clearProperties = useMemo(() => {
    return routeState.clearProperties || {};
  }, [routeState?.clearProperties]);

  useApiData(apiId || '', resource || {}, {
    ...(resourceExtras || {}),
    clearProperties,
  } as any);
  const { hasError, loading, data } = useApiDataState(apiId || '');

  useEffect(() => {
    if (
      resourceToEntity &&
      !loading &&
      !hasError &&
      !hasValue(data) &&
      !sliceExists &&
      type !== '__DUPLICATE__' &&
      type !== '__CLICK_VALUE__'
    ) {
      setEntity(
        {},
        {
          isNew: true,
          ...resourceExtras,
        },
      );
    }
  }, [hasError, loading, data, resourceToEntity, sliceExists, type]);

  return null;
};

export default Resource;
