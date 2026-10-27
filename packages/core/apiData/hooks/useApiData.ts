import { useCallback, useContext, useEffect, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  selectApiData,
  selectApiDataLoading,
  selectApiFinished,
  selectApiHasError,
} from '@pkg-core/apiData/redux/selectors';
import { CallApi } from '../redux/reducers';
import { urlHasAllParams } from '@pkg-common/utils/utils';
import { getContextValue } from '@pkg-form/validations/utils/widgetUtils';
import { ApiValuesSchema } from '@pkg-common/types';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import usePrevious from 'react-use/lib/usePrevious';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { selectPressedSignatureKey } from '@pkg-common/button/selectors';
import useSystem from '@pkg-setup/src/system/useSystem';
import UiSchemaContext from '@pkg-form/UISchemaContext';
import { constructDataToSend } from '@pkg-core/initialization/api/utils';

const useApiData = (
  id: string,
  apiValues?: ApiValuesSchema,
  resourceExtras?: {
    url: string;
    idKey: string;
    customFieldsKey: string;
  },
) => {
  const dispatch = useDispatch();
  const pageUiSchema = useContext(UiSchemaContext);
  const refreshFromButtonPress = useSelector(
    selectPressedSignatureKey(apiValues?.refreshFromButtons || []),
  );

  const response = useSelector(selectApiData(id));
  const loading = useSelector(selectApiDataLoading(id), shallowEqual);
  const hasError = useSelector(selectApiHasError(id), shallowEqual);
  const finished = useSelector(selectApiFinished(id), shallowEqual);
  const callApi = useCallback((payload) => dispatch(CallApi(payload)), [dispatch]);

  const {
    jsonPath,
    dataFrom,
    performQuery = false,
    applyWhen,
    wrapToProperty,
    mode = 'EVERY_TIME',
  } = apiValues || {};

  const { url, method, data, queryParams, dataValuesReady, replacementValues } = useDynamicApi(
    id,
    apiValues,
  );
  const urlPrev = usePrevious(url);
  const dataPrev = usePrevious(data);

  const { apiUrl } = useSystem();

  const urlHasChanged = useMemo(() => {
    return !!((urlPrev || url) && urlPrev !== url);
  }, [url, urlPrev]);

  const dataHasChanged = useMemo(() => {
    return !!(
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

    let shouldLoad =
      url &&
      (!loading || urlHasChanged || dataHasChanged || queryParamsHasChanged) &&
      (!finished || urlHasChanged || dataHasChanged || queryParamsHasChanged) &&
      (!hasError || urlHasChanged || dataHasChanged || queryParamsHasChanged) &&
      urlHasAllParams(url);

    if (mode === 'ONLY_ONCE' && finished) {
      shouldLoad = false;
    }

    if (refreshTriggeredFromButtonPress) {
      shouldLoad = refreshTriggeredFromButtonPress;
    }

    if (dataFrom) {
      return shouldLoad && dataValuesReady && (dataHasChanged || refreshTriggeredFromButtonPress);
    }

    return shouldLoad;
  }, [
    url,
    loading,
    finished,
    hasError,
    dataFrom,
    urlHasChanged,
    dataValuesReady,
    refreshTriggeredFromButtonPress,
    applyWhen,
    applyUnderCondition,
    queryParamsHasChanged,
    mode,
  ]);

  const callMe = useCallback(() => {
    callApi({
      id,
      url,
      method,
      data: constructDataToSend(data, wrapToProperty, pageUiSchema, true),
      queryParams,
      jsonPath,
      metadata: { ...apiValues, resourceExtras, replacementValues },
    });
  }, [
    id,
    url,
    method,
    data,
    queryParams,
    callApi,
    jsonPath,
    apiValues,
    resourceExtras,
    wrapToProperty,
    replacementValues,
  ]);

  useEffect(() => {
    if (shouldCallApi && apiUrl) {
      callMe();
    }
  }, [apiUrl, shouldCallApi]);

  return useMemo(() => {
    if (!jsonPath) {
      return response;
    }

    return getContextValue(id, response, {
      code: id,
      jsonPath,
      performQuery,
    });
  }, [id, response, jsonPath, performQuery]);
};

export default useApiData;
