import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsPressed } from './selectors';
import { MarkButtonPress } from './reducers';
import { UseButtonPressType } from './types';

const useButtonPress = (id: string): UseButtonPressType => {
  const dispatch = useDispatch();

  return <UseButtonPressType>{
    pressed: useSelector(selectIsPressed(id), (prev, next) => prev === next),
    markButtonPress: useCallback(() => dispatch(MarkButtonPress({ id })), [dispatch]),
  };
};

export default useButtonPress;
