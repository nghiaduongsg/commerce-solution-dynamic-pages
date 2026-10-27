import { useMemo } from 'react';
import { ValidationRule } from '@pkg-form/types';
import isEmpty from 'lodash/isEmpty';

import {
  getWidgetArrayParentId,
  getWidgetPropertyId,
} from '@pkg-form/validations/utils/widgetUtils';
import { AnyType } from '@pkg-common/types';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import useValidations from '@pkg-form/validations/hooks/useValidations';

const useCodeListWidgetValidations = (
  widgetId: string,
  value,
  multiple: boolean,
  validations: ValidationRule,
  serverErrors?: Array<string> | string,
  validateWhen?: AnyType,
) => {
  const parentId = getWidgetArrayParentId(widgetId);
  const propertyId = getWidgetPropertyId(widgetId);
  const { check: shouldValidate } = useCheckFrom(widgetId, validateWhen, true);
  const { getFieldDisabledValues } = useFormManagerContext();

  const disabledValues = useMemo(() => {
    return getFieldDisabledValues(parentId, propertyId);
  }, [getFieldDisabledValues, parentId, propertyId]);

  const memoizedValidations = useMemo(
    () => ({
      ...validations,
      required: shouldValidate && validations?.required,
    }),
    [shouldValidate, validations],
  );

  const { errors, valid } = useValidations(
    widgetId,
    value,
    'array',
    memoizedValidations,
    undefined,
    serverErrors,
    multiple,
  );

  return {
    valid,
    errors: !memoizedValidations.required || isEmpty(validations) ? [] : errors,
    disabledValues,
  };
};

export default useCodeListWidgetValidations;
