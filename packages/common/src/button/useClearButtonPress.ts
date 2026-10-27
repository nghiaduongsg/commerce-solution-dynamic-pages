import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ClearButtonPresses } from './reducers';

const useClearButtonPress = () => {
  const dispatch = useDispatch();

  return {
    clearAllButtonPresses: useCallback(() => dispatch(ClearButtonPresses()), [dispatch]),
  };
};

export default useClearButtonPress;
