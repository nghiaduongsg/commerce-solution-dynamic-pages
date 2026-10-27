import { useSelector } from 'react-redux';
import {
  selectFieldServerErrors,
  selectFieldServerValid,
} from '@pkg-form/validations/redux/selectors';
import { equalityCheck } from '@pkg-common/utils/utils';

const useFieldServerValidations = (fieldId: string) => {
  return {
    errors: useSelector(selectFieldServerErrors(fieldId), equalityCheck),
    isFieldValid: useSelector(selectFieldServerValid(fieldId)),
  };
};

export default useFieldServerValidations;
