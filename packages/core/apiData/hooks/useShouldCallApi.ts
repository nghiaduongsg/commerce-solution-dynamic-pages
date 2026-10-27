import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import {
  selectApiDataLoading,
  selectApiFinished,
  selectApiHasError,
} from '@pkg-core/apiData/redux/selectors';
import { urlHasAllParams } from '@pkg-common/utils/utils';
import { ApiValuesSchema } from '@pkg-common/types';
import useDynamicApi from '@pkg-common/dataResolver/useDynamicApi';
import usePrevious from 'react-use/lib/usePrevious';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { selectPressedSignatureKey } from '@pkg-common/button/selectors';

const useShouldCallApi = (id: string, apiValues?: ApiValuesSchema) => {
  const refreshFromButtonPress = useSelector(
    selectPressedSignatureKey(apiValues?.refreshFromButtons || []),
  );

  const loading = useSelector(selectApiDataLoading(id), shallowEqual);
  const hasError = useSelector(selectApiHasError(id), shallowEqual);
  const finished = useSelector(selectApiFinished(id), shallowEqual);

  const { dataFrom, applyWhen } = apiValues || {};
  const { url, data } = useDynamicApi(id, apiValues);
  const urlPrev = usePrevious(url);
  const dataPrev = usePrevious(data);

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

  return useMemo(() => {
    if (applyWhen && !applyUnderCondition) {
      return false;
    }

    const shouldLoad =
      (url &&
        (!loading || urlHasChanged || dataHasChanged) &&
        (!finished || urlHasChanged || dataHasChanged) &&
        (!hasError || urlHasChanged || dataHasChanged) &&
        urlHasAllParams(url)) ||
      refreshTriggeredFromButtonPress;

    if (dataFrom) {
      return (
        shouldLoad &&
        Object.keys(dataFrom || {}).length === Object.keys(data || {}).length &&
        dataHasChanged
      );
    }

    return shouldLoad;
  }, [
    applyWhen,
    applyUnderCondition,
    url,
    loading,
    urlHasChanged,
    dataHasChanged,
    refreshTriggeredFromButtonPress,
    dataFrom,
    data,
  ]);
};

export default useShouldCallApi;
