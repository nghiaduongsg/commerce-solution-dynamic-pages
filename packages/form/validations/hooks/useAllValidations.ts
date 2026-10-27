import { useCallback, useState } from 'react';
import { AnyType } from '@pkg-common/types';
import { isParent } from '@pkg-form/validations/utils/widgetUtils';

const clearEntityRelatedEntries = (entityId: string, initial: { [key: string]: AnyType }) => {
  const final = {};
  Object.keys(initial).forEach((fieldId) => {
    if (!fieldId.startsWith(entityId)) {
      final[fieldId] = initial[fieldId];
    }
  });
  return final;
};

const useAllValidations = () => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const setFieldErrors = useCallback(
    (fieldId: string, errors: Array<string>) =>
      setErrors((prev) => ({ ...prev, [fieldId]: errors })),
    [errors],
  );

  const getFieldErrors = useCallback(
    (fieldId: string) => {
      return errors?.[fieldId];
    },
    [errors],
  );

  const addFieldErrors = useCallback(
    (fieldId: string, fieldErrors: Array<string>) => {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: [...(errors[fieldId] || []), ...fieldErrors],
      }));
    },
    [errors],
  );

  const removeFieldErrors = useCallback(
    (fieldId: string, fieldErrors: Array<string>) => {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: (prev[fieldId] || []).filter((error) => !fieldErrors.includes(error)),
      }));
    },
    [errors],
  );

  const removeMultipleFieldErrors = useCallback(
    (fieldIds: Array<string>) => {
      const cleanedErrors = {};
      fieldIds.forEach((fieldId) => (cleanedErrors[fieldId] = []));
      setErrors((prev) => ({
        ...prev,
        ...cleanedErrors,
      }));
    },
    [errors],
  );

  const isFieldValid = useCallback(
    (fieldId: string) => {
      return !errors?.[fieldId]?.length;
    },
    [errors],
  );

  const isFormValid = useCallback(
    (parentField: string) => {
      return (
        Object.keys(errors)
          .filter((key) => isParent(key, parentField))
          .map((field) => errors[field].length > 0)
          .filter((hasErrors) => hasErrors === true).length === 0
      );
    },
    [errors],
  );

  const isGroupValid = useCallback(
    (fields: string[]) => {
      return (
        Object.keys(errors)
          .filter((key) => fields.filter((field) => key.includes(field))?.length > 0)
          .map((field) => errors[field].length > 0)
          .filter((hasErrors) => hasErrors === true).length === 0
      );
    },
    [errors],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  const clearParentFieldErrors = useCallback(
    (fieldId: string) => setErrors(clearEntityRelatedEntries(fieldId, errors)),
    [errors],
  );

  return {
    errors,
    setFieldErrors,
    getFieldErrors,
    addFieldErrors,
    removeFieldErrors,
    removeMultipleFieldErrors,
    isFieldValid,
    isFormValid,
    isGroupValid,
    clearErrors,
    clearParentFieldErrors,
  };
};

export default useAllValidations;
