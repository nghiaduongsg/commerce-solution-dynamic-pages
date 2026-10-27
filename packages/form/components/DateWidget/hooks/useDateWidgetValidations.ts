import { useCallback } from 'react';
import { format, isBefore, isValid, parse, startOfDay } from 'date-fns';
import useValidations from '@pkg-form/validations/hooks/useValidations';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { ValidateFromSchema, ValidationRule } from '@pkg-form/types';
import { AnyType, CheckFromSchema } from '@pkg-common/types';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { applyOffset } from '@pkg-form/validations/utils/dateValidationUtils';

const parseDate = (dateValue) => {
  if (!dateValue) return undefined;
  if (dateValue === 'today') return new Date();
  if (dateValue === 'tomorrow') {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }
  const parsed = parse(dateValue, 'yyyy-MM-dd', new Date());
  if (isValid(parsed)) return parsed;
  const fallback = new Date(dateValue);
  return isValid(fallback) ? startOfDay(fallback) : undefined;
};

const calculateBoundaryDate = (
  boundaryDate,
  dynamicBoundaryDate,
  offset,
  dynamicOffset,
  isMin = true,
) => {
  let baseDate: Date | undefined;

  const isBaseDateValid = isMin
    ? boundaryDate === 'today' || boundaryDate === 'tomorrow'
    : boundaryDate === 'today';

  if (isBaseDateValid) baseDate = parseDate(boundaryDate);
  if (offset) baseDate = applyOffset(baseDate, offset);

  let dynamicDate = parseDate(dynamicBoundaryDate);
  if (dynamicOffset) dynamicDate = applyOffset(dynamicDate, dynamicOffset);

  if (dynamicDate && baseDate) {
    const dynamicIsBefore = isBefore(startOfDay(dynamicDate), startOfDay(baseDate));
    return isMin === dynamicIsBefore ? baseDate : dynamicDate;
  }

  return dynamicDate || baseDate;
};

export default function useDateWidgetValidations(
  widgetId: string,
  value: AnyType,
  validations: ValidationRule = {},
  validateFrom: ValidateFromSchema,
  validateWhen: CheckFromSchema,
  serverErrors?: Array<string>,
  formatAs?: AnyType,
) {
  const { value: relatedFieldValue } = useFormData(widgetId, validateFrom?.source);
  const { check: shouldValidate } = useCheckFrom(widgetId, validateWhen, true);

  const { errors, valid, dynamicValidations } = useValidations(
    widgetId,
    value,
    formatAs,
    shouldValidate ? { ...validations, shouldValidate } : {},
    shouldValidate ? validateFrom : undefined,
    serverErrors,
  );

  const parseTime = (timeStr: string | undefined): Date | undefined => {
    if (!timeStr) return undefined;
    const parsed = parse(timeStr, 'HH:mm', new Date());
    return isValid(parsed) ? parsed : undefined;
  };

  const disableDates = useCallback(
    (date) => {
      if (
        (dynamicValidations.minValueExcludeLimit || dynamicValidations.maxValueExcludeLimit) &&
        shouldValidate
      ) {
        const formattedDate = format(date, formatAs === 'time' ? 'HH:mm' : 'yyyy-MM-dd');
        return formattedDate === relatedFieldValue;
      }
      return false;
    },
    [dynamicValidations, shouldValidate, relatedFieldValue],
  );

  const getMinDate = useCallback(() => {
    if (!shouldValidate) return undefined;

    return calculateBoundaryDate(
      validations?.minValue || validations?.minValueExcludeLimit,
      dynamicValidations?.minValue || dynamicValidations?.minValueExcludeLimit,
      validations?.offset,
      dynamicValidations?.offsetminValue || dynamicValidations?.offsetminValueExcludeLimit,
      true,
    );
  }, [validations, dynamicValidations, shouldValidate]);

  const getMaxDate = useCallback(() => {
    if (!shouldValidate) return undefined;

    return calculateBoundaryDate(
      validations?.maxValue || validations?.maxValueExcludeLimit,
      dynamicValidations?.maxValue || dynamicValidations?.maxValueExcludeLimit,
      validations?.offset,
      dynamicValidations?.offsetmaxValue || dynamicValidations?.offsetmaxValueExcludeLimit,
      false,
    );
  }, [validations, dynamicValidations, shouldValidate]);

  const getMinTime = useCallback(() => {
    if (!shouldValidate) return undefined;
    return (
      parseTime(dynamicValidations.minValue) ??
      parseTime(dynamicValidations.minValueExcludeLimit) ??
      parseTime(validations?.minValue)
    );
  }, [shouldValidate, dynamicValidations, validations]);

  const getMaxTime = useCallback(() => {
    if (!shouldValidate) return undefined;
    return (
      parseTime(dynamicValidations.maxValue) ??
      parseTime(dynamicValidations.maxValueExcludeLimit) ??
      parseTime(validations?.maxValue)
    );
  }, [shouldValidate, dynamicValidations, validations]);

  return {
    errors,
    disableDates,
    valid,
    minDate: getMinDate(),
    maxDate: getMaxDate(),
    minTime: getMinTime(),
    maxTime: getMaxTime(),
  };
}
