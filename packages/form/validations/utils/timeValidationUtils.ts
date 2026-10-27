import { ValidationRule } from '../../types';
import { getAllTextValidationErrors } from '@pkg-form/validations/utils/textValidationUtils';

export const hasValidTime = (value: string): boolean => {
  if (!value) return false;

  // Regex for HH:mm or HH:mm:ss format (24-hour)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$/;
  return timeRegex.test(value);
};

export const hasValidMinTimeValue = (
  minValue: string | undefined,
  value: string,
  excludeLimit: boolean = false,
): boolean => {
  if (!minValue || !hasValidTime(minValue) || !hasValidTime(value)) {
    return true;
  }

  const minTime = convertTimeToMinutes(minValue);
  const currentTime = convertTimeToMinutes(value);

  return excludeLimit ? currentTime > minTime : currentTime >= minTime;
};

export const hasValidMaxTimeValue = (
  maxValue: string | undefined,
  value: string,
  excludeLimit: boolean = false,
): boolean => {
  if (!maxValue || !hasValidTime(maxValue) || !hasValidTime(value)) {
    return true;
  }

  const maxTime = convertTimeToMinutes(maxValue);
  const currentTime = convertTimeToMinutes(value);

  return excludeLimit ? currentTime < maxTime : currentTime <= maxTime;
};

const convertTimeToMinutes = (timeString: string): number => {
  const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
  return hours * 60 + minutes + seconds / 60;
};

export const getTimeValidationErrors = (rules: ValidationRule, value: string) => {
  const errors: Array<string> = getAllTextValidationErrors(rules, value);

  if (!hasValidTime(value)) {
    errors.push('invalidTime');
    return errors;
  }

  if (!hasValidMinTimeValue(rules.minValue, value)) {
    errors.push(`timeMinValue#{"minValue": "${rules.minValue}"}`);
  }

  if (!hasValidMaxTimeValue(rules.maxValue, value)) {
    errors.push(`timeMaxValue#{"maxValue": "${rules.maxValue}"}`);
  }

  if (!hasValidMinTimeValue(rules.minValueExcludeLimit, value, true)) {
    errors.push(
      `timeMinValueExcludeLimit#{"minValueExcludeLimit": "${rules.minValueExcludeLimit}"}`,
    );
  }

  if (!hasValidMaxTimeValue(rules.maxValueExcludeLimit, value, true)) {
    errors.push(
      `timeMaxValueExcludeLimit#{"maxValueExcludeLimit": "${rules.maxValueExcludeLimit}"}`,
    );
  }

  return errors;
};
