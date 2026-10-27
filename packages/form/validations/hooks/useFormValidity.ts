import { useCallback, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { SetFormServerErrors, SetValidationStep } from '@pkg-form/validations/redux/reducers';
import {
  selectIsFormValidServerErrors,
  selectParentFormServerErrors,
  selectValidationStep,
} from '@pkg-form/validations/redux/selectors';
import { equalityCheck } from '@pkg-common/utils/utils';
import { useValidationsContext } from '@pkg-form/validations/ValidationsContext';

const useFormValidity = (parentField?: string) => {
  const dispatch = useDispatch();
  // @ts-ignore
  const { isFormValid } = useValidationsContext();

  const isValid = useMemo(() => {
    return isFormValid(parentField ?? '');
  }, [isFormValid, parentField]);

  return {
    validationStep: useSelector(selectValidationStep, shallowEqual),
    isFormValidServerSide: useSelector(selectIsFormValidServerErrors(parentField || '')),
    isFormValid: isValid,
    serverErrors: useSelector(selectParentFormServerErrors(parentField || ''), equalityCheck),
    setServerErrors: useCallback(
      (errors) => dispatch(SetFormServerErrors({ errors, errorTypes: {} })),
      [dispatch],
    ),
    setValidationStep: useCallback((step: string) => dispatch(SetValidationStep(step)), [dispatch]),
    resetValidationStep: useCallback(() => dispatch(SetValidationStep(null)), [dispatch]),
  };
};

export default useFormValidity;
