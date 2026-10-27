import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { executeCall } from '../redux/reducers';
import { urlHasAllParams } from '@pkg-common/utils/utils';
import { getContextValue } from '@pkg-form/validations/utils/widgetUtils';
import { ApiValuesSchema } from '@pkg-common/types';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import usePrevious from 'react-use/lib/usePrevious';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { selectPressedSignatureKey } from '@pkg-common/button/selectors';
import useSystem from '@pkg-setup/src/system/useSystem';

const useApiLocalData = (
  id: string,
  apiValues?: ApiValuesSchema,
  resourceExtras?: {
    url: string;
    idKey: string;
    customFieldsKey: string;
  },
) => {
  const refreshFromButtonPress = useSelector(
    selectPressedSignatureKey(apiValues?.refreshFromButtons || []),
  );

  const { jsonPath, dataFrom, performQuery = false, applyWhen } = apiValues || {};
  const { url, method, data, queryParams } = useDynamicApi(id, apiValues);
  const urlPrev = usePrevious(url);
  const dataPrev = usePrevious(data);

  const { apiUrl } = useSystem();
  const [localResponse, setLocalResponse] = useState();
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const urlHasChanged = useMemo(() => {
    return (urlPrev || url) && urlPrev !== url;
  }, [url, urlPrev]);

  const dataHasChanged = useMemo(() => {
    return (
      (dataPrev || data) &&
      JSON.stringify(dataPrev) !== JSON.stringify(data) &&
      Object.keys(data || {}).length > 0
    );
  }, [data, dataPrev]);

  const refreshTriggeredFromButtonPress = useMemo(() => {
    if (apiValues?.refreshFromButtons && urlHasAllParams(url)) {
      return refreshFromButtonPress;
    }
    return false;
  }, [refreshFromButtonPress, url]);

  const { check: applyUnderCondition } = useCheckFrom(id, applyWhen, true);
  const queryParamsPrev = usePrevious(queryParams);
  const queryParamsHasChanged = useMemo(() => {
    return (
      (queryParamsPrev || queryParams) &&
      JSON.stringify(queryParamsPrev) !== JSON.stringify(queryParams)
    );
  }, [queryParams, queryParamsPrev]);

  const shouldCallApi = useMemo(() => {
    if (applyWhen && !applyUnderCondition) {
      return false;
    }

    const shouldLoad =
      (url && (urlHasChanged || dataHasChanged || queryParamsHasChanged) && urlHasAllParams(url)) ||
      refreshTriggeredFromButtonPress;

    if (dataFrom) {
      return (
        shouldLoad &&
        Object.keys(dataFrom || {}).length === Object.keys(data || {}).length &&
        (dataHasChanged || refreshTriggeredFromButtonPress)
      );
    }

    return shouldLoad;
  }, [
    url,
    data,
    dataFrom,
    urlHasChanged,
    dataHasChanged,
    queryParamsHasChanged,
    refreshTriggeredFromButtonPress,
    applyWhen,
    applyUnderCondition,
  ]);

  const callMe = useCallback(() => {
    setLoading(true);
    executeCall(apiUrl, {
      id,
      url,
      method,
      data,
      queryParams,
      jsonPath,
      metadata: { ...apiValues, resourceExtras },
    })
      .then((r) => {
        setLocalResponse(r?.data);
        setLoading(false);
      })
      .catch((e) => {
        setLocalError(e?.message || 'genericError');
        setLoading(false);
      });
  }, [id, url, method, data, queryParams, jsonPath, apiValues, resourceExtras]);

  useEffect(() => {
    if (shouldCallApi && apiUrl) {
      callMe();
    }
  }, [apiUrl, shouldCallApi]);

  const response = useMemo(() => {
    if (!jsonPath) {
      return localResponse;
    }

    return getContextValue(id, localResponse, {
      code: id,
      jsonPath,
      performQuery,
    });
  }, [id, jsonPath, performQuery, localResponse]);

  return { data: response, loading, error: localError };
};

export default useApiLocalData;
