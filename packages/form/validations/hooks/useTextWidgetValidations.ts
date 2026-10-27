import { useMemo } from 'react';
import { AnyType, CheckFromSchema } from '@pkg-common/types';
import { ValidateFromSchema, ValidationRule } from '@pkg-form/types';
import useValidations from '@pkg-form/validations/hooks/useValidations';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';

const useTextWidgetValidations = (
  widgetId: string,
  value,
  validations: Partial<ValidationRule> | undefined,
  serverErrors: Array<string>,
  validateFrom?: ValidateFromSchema | AnyType,
  validateWhen?: CheckFromSchema,
) => {
  const { check: shouldValidate } = useCheckFrom(widgetId, validateWhen, true);

  const memoizedValidations = useMemo(
    () => ({
      ...validations,
      required: shouldValidate && validations?.required,
      shouldValidate: shouldValidate,
    }),
    [shouldValidate, validations],
  );

  const { errors, valid } = useValidations(
    widgetId,
    value,
    'string',
    memoizedValidations || {},
    validateFrom,
    serverErrors,
  );

  return {
    errors,
    valid,
    shouldValidate,
  };
};

export default useTextWidgetValidations;
