import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ClearFormServerErrors } from '@pkg-form/validations/redux/reducers';

const useClearServerErrors = () => {
  const dispatch = useDispatch();
  return {
    clearServerErrors: useCallback(() => dispatch(ClearFormServerErrors()), [dispatch]),
  };
};

export default useClearServerErrors;
