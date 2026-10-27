import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectLoaderVisibility } from './selectors';
import { ShowLoader, HideLoader } from './reducers';
import { UseLoaderType } from './types';

const useLoader = (): UseLoaderType => {
  const dispatch = useDispatch();

  return {
    visible: useSelector(selectLoaderVisibility),
    showLoader: useCallback(() => dispatch(ShowLoader()), [dispatch]),
    hideLoader: useCallback(() => dispatch(HideLoader()), [dispatch]),
  };
};

export default useLoader;
