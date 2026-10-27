import { ValidationRule } from '../../types';
const REQUIRED_NAMES_ERROR = 'allNamesRequired';

export const getLabelsValidationErrors = (
  rules: ValidationRule,
  value: Array<{ languageCL: string; description: string }>,
) => {
  const errors: Array<string> = [];

  if (rules?.minLength && (value?.length || 0) < rules?.minLength) {
    errors.push(REQUIRED_NAMES_ERROR);
  }

  if (rules?.maxValue) {
    const itemExceedingMaxValue = value?.find((v) => v?.description?.length > rules?.maxValue);
    if (itemExceedingMaxValue) {
      errors.push(`descriptionsMaxLength#{"maxLength":"${rules?.maxValue}"}`);
    }
  }

  if (rules?.required) {
    const hasEmptyDescription = value?.some((v) => (v?.description ?? '').length === 0);
    if (hasEmptyDescription) {
      errors.push(REQUIRED_NAMES_ERROR);
    }
  }

  return errors;
};
