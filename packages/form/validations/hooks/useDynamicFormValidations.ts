import { shallowEqual, useSelector } from 'react-redux';
import {
  selectCustomArrayFieldServerErrors,
  selectFieldServerErrors,
  selectFieldServerErrorTypes,
  selectFieldServerValid,
  selectParentFormErrorTypes,
  selectParentFormServerErrors,
} from '@pkg-form/validations/redux/selectors';
import { equalityCheck } from '@pkg-common/utils/utils';

const useDynamicFormValidations = (fieldId = '', isArrayErrors = false, isObject = false) => {
  const arrayFieldServerErrors = useSelector(
    selectCustomArrayFieldServerErrors(fieldId),
    equalityCheck,
  );
  const fieldServerErrors = useSelector(selectFieldServerErrors(fieldId), equalityCheck);
  const fieldObjectServerErrors = useSelector(selectParentFormServerErrors(fieldId), equalityCheck);

  const arrayFieldServerErrorTypes = useSelector(
    selectCustomArrayFieldServerErrors(fieldId),
    equalityCheck,
  );
  const fieldServerErrorTypes = useSelector(selectFieldServerErrorTypes(fieldId), equalityCheck);
  const fieldObjectServerErrorTypes = useSelector(
    selectParentFormErrorTypes(fieldId),
    equalityCheck,
  );

  const isFieldValid = useSelector(selectFieldServerValid(fieldId), shallowEqual);
  /// TODO: We need to revisit this return when isObject == true
  return {
    errors: isArrayErrors
      ? arrayFieldServerErrors
      : isObject
        ? fieldObjectServerErrors
        : fieldServerErrors,
    errorTypes: isArrayErrors
      ? arrayFieldServerErrorTypes
      : isObject
        ? fieldObjectServerErrorTypes
        : fieldServerErrorTypes,
    isFieldValid,
  };
};

export default useDynamicFormValidations;
