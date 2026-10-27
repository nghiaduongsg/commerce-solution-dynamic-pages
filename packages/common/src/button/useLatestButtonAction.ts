import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectLatestButtonAction } from './selectors';
import { SetLatestButtonPress, ClearLatestButtonPress } from './reducers';
import { UseLatestButtonActionType } from './types';

const useLatestButtonAction = (): UseLatestButtonActionType => {
  const dispatch = useDispatch();

  return {
    latestButtonAction: useSelector(selectLatestButtonAction()),
    setLatestButtonAction: useCallback(
      (actionId: string) => dispatch(SetLatestButtonPress({ actionId })),
      [dispatch],
    ),
    clearLatestButtonAction: useCallback(() => dispatch(ClearLatestButtonPress()), [dispatch]),
  };
};

export default useLatestButtonAction;
