import { ValidationRule } from '../../types';
import { getAllTextValidationErrors } from './textValidationUtils';
import { ValueType } from '@pkg-common/types';

export const hasSelections = (value: ValueType) => {
  if (!value) {
    return false;
  }

  return (value || []).length > 0;
};

export const selectionsValidRequired = (required: boolean, value: ValueType) => {
  if (!required) {
    return true;
  }
  return hasSelections(value);
};

export const selectionsHaveValidMinLength = (minLength: number, value: ValueType) => {
  return !(minLength && hasSelections(value) && (value as Array<string>).length < minLength);
};

export const selectionsHaveValidMaxLength = (maxLength: number, value: ValueType) => {
  return !(maxLength && hasSelections(value) && (value as Array<string>).length > maxLength);
};

export const getAllArrayItemsValidationErrors = (
  rules: ValidationRule,
  multiple: boolean,
  value: ValueType | string,
) => {
  const errors: Array<string> = [];

  if (!rules) {
    return errors;
  }

  if (!multiple) {
    return getAllTextValidationErrors(rules, value as string);
  }

  if (!selectionsValidRequired(rules.required || false, value as Array<string>)) {
    errors.push('arrayRequired');
  }

  if (!selectionsHaveValidMinLength(rules.minLength || 0, value as Array<string>)) {
    errors.push(`arrayMinLength#{"minLength": ${rules.minLength}}`);
  }

  if (!selectionsHaveValidMaxLength(rules.maxLength || 0, value as Array<string>)) {
    errors.push(`arrayMaxLength#{"maxLength": ${rules.maxLength}}`);
  }

  return errors;
};
