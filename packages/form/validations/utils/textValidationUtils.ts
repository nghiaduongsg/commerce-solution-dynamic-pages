import { ValidationRule } from '@pkg-form/types';
import { hasValue, isJSON } from '@pkg-common/utils/utils';

export const hasTextValue = (
  value: string | null | undefined,
  acceptSingleSpace: boolean = false,
) => {
  const trimmedValue = value?.toString().trim();

  if (acceptSingleSpace && value === ' ') {
    return true;
  }

  return hasValue(trimmedValue);
};

export const isValidRequired = (
  required = false,
  value: string | null | undefined = '',
  acceptSingleSpace,
) => {
  if (!required) {
    return true;
  }
  return hasTextValue(value, acceptSingleSpace);
};

export const hasValidMinValue = (minValue, value) => {
  return !(hasValue(minValue) && hasValue(value) && value < minValue);
};

export const hasValidMaxValue = (maxValue, value) => {
  return !(hasValue(maxValue) && hasValue(value) && value > maxValue);
};

export const hasValidMinValueExcludeLimit = (minValue, value) => {
  return !(hasValue(minValue) && hasValue(value) && value <= minValue);
};

export const hasValidMaxValueExcludeLimit = (maxValue, value) => {
  return !(hasValue(maxValue) && hasValue(value) && value >= maxValue);
};

export const hasValidMinLength = (minLength = 0, value = '') => {
  return !(minLength && hasTextValue(value) && value.length < minLength);
};

export const hasValidMaxLength = (maxLength = 0, value = '') => {
  return !(maxLength && hasTextValue(value) && value.length > maxLength);
};

export const hasValidPattern = (regex: string, value: string) => {
  if (!hasTextValue(value)) {
    return true;
  }
  return new RegExp(regex).test(value);
};

export const getAllTextValidationErrors = (
  rules: ValidationRule,
  value: string,
  acceptSingleSpace?: boolean,
  isSignReversed: boolean = false,
) => {
  const errors: Array<string> = [];

  if (!isValidRequired(rules.required, value, acceptSingleSpace)) {
    errors.push(acceptSingleSpace ? 'acceptSingleSpaceRequired' : 'required');
  }
  if (rules.isJson && hasTextValue(value) && !isJSON(value)) {
    errors.push('invalidJson');
    return errors;
  }

  if (!rules?.shouldValidate) {
    return errors;
  }

  const floatValue: number = parseFloat(value);
  let minValue, maxValue, minValueExclude, maxValueExclude;
  if (isSignReversed && rules.reversibleSign) {
    minValue = -rules.maxValue;
    maxValue = -rules.minValue;
    minValueExclude = -rules.maxValueExcludeLimit;
    maxValueExclude = -rules.minValueExcludeLimit;
  } else {
    minValue = rules.minValue;
    maxValue = rules.maxValue;
    minValueExclude = rules.minValueExcludeLimit;
    maxValueExclude = rules.maxValueExcludeLimit;
  }

  if (!hasValidMinValue(minValue, floatValue)) {
    errors.push(`minValue#{"minValue": ${minValue}}`);
  }

  if (!hasValidMaxValue(maxValue, floatValue)) {
    errors.push(`maxValue#{"maxValue": ${maxValue}}`);
  }

  if (!hasValidMinValueExcludeLimit(minValueExclude, floatValue)) {
    errors.push(`minValueExcludeLimit#{"minValueExcludeLimit": ${minValueExclude}}`);
  }

  if (!hasValidMaxValueExcludeLimit(maxValueExclude, floatValue)) {
    errors.push(`maxValueExcludeLimit#{"maxValueExcludeLimit": ${maxValueExclude}}`);
  }

  if (!hasValidMinLength(rules.minLength, value)) {
    errors.push(`minLength#{"minLength": ${rules.minLength}}`);
  }

  if (!hasValidMaxLength(rules.maxLength, value)) {
    errors.push(`maxLength#{"maxLength": ${rules.maxLength}}`);
  }

  if (rules.requireYesNoValue) {
    const validYesNoValueRegex = '^(YES|NO)$';
    if (!hasValidPattern(validYesNoValueRegex, value)) {
      errors.push('invalidYesNoValue');
    }
  }

  if (rules.regex && !hasValidPattern(rules.regex, value)) {
    if (rules?.errorMessage) {
      errors.push(rules.errorMessage);
    } else {
      errors.push('invalidFormat');
    }
  }

  return errors;
};
