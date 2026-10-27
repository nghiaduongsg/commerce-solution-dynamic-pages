import { useSelector } from 'react-redux';
import { selectIsFormGroupValidServerErrors } from '@pkg-form/validations/redux/selectors';

const useFormValidity = (fields: Array<string>) => {
  return {
    isGroupValidServerSide: useSelector(selectIsFormGroupValidServerErrors(fields || [])),
  };
};

export default useFormValidity;
