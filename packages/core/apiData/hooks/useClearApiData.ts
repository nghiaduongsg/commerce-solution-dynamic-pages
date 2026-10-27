import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  ClearAllApiData,
  ClearFormApiData,
  ClearMultipleApiData,
} from '@pkg-core/apiData/redux/reducers';
import { selectAllApisFinished } from '@pkg-core/apiData/redux/selectors';

const useClearApiData = () => {
  const dispatch = useDispatch();
  return {
    clearFormApiData: useCallback(() => dispatch(ClearFormApiData()), [dispatch]),
    clearMultipleApiData: useCallback((ids) => dispatch(ClearMultipleApiData({ ids })), [dispatch]),
    clearAllApiData: useCallback(() => dispatch(ClearAllApiData()), [dispatch]),
    apisFinished: useSelector(selectAllApisFinished(), shallowEqual),
  };
};

export default useClearApiData;
