import { useCallback, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  selectApiData,
  selectApiDataLoading,
  selectApiErrorMessage,
  selectApiFinished,
  selectApiHasError,
  selectApiRefreshId,
  selectNestedApiData,
  selectSliceExists,
} from '../redux/selectors';
import { CallApi, ClearApiData, SetApiData } from '@pkg-core/apiData/redux/reducers';
import { equalityCheck } from '@pkg-common/utils/utils';
import { AnyType } from '@pkg-common/types';

const useApiDataState = (id: string, jsonPath: Array<string> = []) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectApiDataLoading(id), shallowEqual);
  const hasError = useSelector(selectApiHasError(id), shallowEqual);
  const errorMessage = useSelector(selectApiErrorMessage(id), shallowEqual);
  const refreshId = useSelector(selectApiRefreshId(id), shallowEqual);
  const finished = useSelector(selectApiFinished(id), shallowEqual);
  const sliceExists = useSelector(selectSliceExists(id), shallowEqual);
  const data = useSelector(selectApiData(id), equalityCheck);
  const nestedData = useSelector(selectNestedApiData(id, jsonPath), equalityCheck);

  return {
    loading: useMemo(() => {
      return loading;
    }, [loading]),
    sliceExists: useMemo(() => {
      return sliceExists;
    }, [sliceExists]),
    finished: useMemo(() => {
      return finished;
    }, [finished]),
    hasError: useMemo(() => {
      return hasError;
    }, [hasError]),
    errorMessage: useMemo(() => {
      return errorMessage;
    }, [errorMessage]),
    refreshId: useMemo(() => {
      return refreshId;
    }, [refreshId]),
    data: useMemo(() => {
      return data;
    }, [data]),
    nestedData: useMemo(() => {
      return nestedData;
    }, [nestedData]),
    clearApiData: useCallback(() => dispatch(ClearApiData({ id })), [dispatch]),
    setApiData: useCallback(
      (payload: { id: string; data: AnyType }) => dispatch(SetApiData(payload)),
      [dispatch],
    ),
    callApi: useCallback(
      ({ id: identifier, pageId, url, method, data: apiData, queryParams, saveAs }) =>
        dispatch(
          CallApi({ id: identifier, pageId, url, method, data: apiData, queryParams, saveAs }),
        ),
      [dispatch],
    ),
  };
};

export default useApiDataState;
