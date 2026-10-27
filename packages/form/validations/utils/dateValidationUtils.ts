import { ValidationRule } from '../../types';
import { getAllTextValidationErrors } from '@pkg-form/validations/utils/textValidationUtils';
import { isBefore, isAfter, isEqual, isValid, addDays, format, parse } from 'date-fns';
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(minMax);
const resolveDateKeyword = (value: string, now: Date = new Date()): Date => {
  let date: Date;
  if (value === 'today') date = now;
  else if (value === 'tomorrow') date = addDays(now, 1);
  else date = parse(value, 'yyyy-MM-dd', new Date());

  if (!isValid(date)) {
    date = new Date(value);
  }

  date.setHours(12, 0, 0, 0);
  return date;
};

export const hasValidMinValue = (
  minValue: string,
  value: string | undefined,
  excludeLimit = false,
  now: Date = new Date(),
) => {
  if (!value || !minValue || typeof minValue === 'object') return true;

  const valueDate = resolveDateKeyword(value, now);
  const minDate = resolveDateKeyword(minValue, now);

  if (isEqual(valueDate, minDate) && !excludeLimit) return true;
  return isAfter(valueDate, minDate);
};

export const hasValidMaxValue = (
  maxValue: string,
  value: string | undefined,
  excludeLimit = false,
  now: Date = new Date(),
) => {
  if (!value || !maxValue || typeof maxValue === 'object') return true;

  const valueDate = resolveDateKeyword(value, now);
  const maxDate = resolveDateKeyword(maxValue, now);

  if (isEqual(valueDate, maxDate) && !excludeLimit) return true;
  return isBefore(valueDate, maxDate);
};

export const hasValidDate = (value: string) => {
  if (value === 'today' || value === 'tomorrow') {
    return true;
  }
  if (value && !isValid(new Date(value))) {
    return false;
  }
  return true;
};

export const applyOffset = (date, offset) => {
  if (!offset || !date) return date;

  const baseDate = date === 'today' ? new Date() : parse(date, 'yyyy-MM-dd', new Date());
  return format(addDays(baseDate, Number.parseInt(offset)), 'yyyy-MM-dd');
};

const normalizeRulesWithOffset = (rules) => {
  return {
    ...rules,
    minValue: applyOffset(rules.minValue, rules['offsetminValue']),
    maxValue: applyOffset(rules.maxValue, rules['offsetmaxValue']),
    minValueExcludeLimit: applyOffset(
      rules.minValueExcludeLimit,
      rules['offsetminValueExcludeLimit'],
    ),
    maxValueExcludeLimit: applyOffset(
      rules.maxValueExcludeLimit,
      rules['offsetmaxValueExcludeLimit'],
    ),
  };
};

export const getDateValidationErrors = (rules: ValidationRule, value: string) => {
  const errors: Array<string> = getAllTextValidationErrors(rules, value);

  const computedRules = normalizeRulesWithOffset(rules);

  if (!hasValidDate(value)) {
    errors.push('invalidDate');
  }
  if (!hasValidMinValue(computedRules.minValue, value) && hasValidDate(computedRules.minValue)) {
    errors.push(`dateMinValue#{"minValue": "${computedRules.minValue}"}`);
  }

  if (!hasValidMaxValue(computedRules.maxValue, value) && hasValidDate(computedRules.maxValue)) {
    errors.push(`dateMaxValue#{"maxValue": "${computedRules.maxValue}"}`);
  }

  if (
    !hasValidMinValue(computedRules.minValueExcludeLimit, value, true) &&
    hasValidDate(computedRules.minValueExcludeLimit)
  ) {
    errors.push(
      `dateMinValueExcludeLimit#{"minValueExcludeLimit": "${computedRules.minValueExcludeLimit}"}`,
    );
  }

  if (
    !hasValidMaxValue(computedRules.maxValueExcludeLimit, value, true) &&
    hasValidDate(computedRules.maxValueExcludeLimit)
  ) {
    errors.push(
      `dateMaxValueExcludeLimit#{"maxValueExcludeLimit": "${computedRules.maxValueExcludeLimit}"}`,
    );
  }

  return errors;
};

export const getDateArrayValidationErrors = (rules: ValidationRule, value: string[]) => {
  const errors: Array<string> = [];

  const arrayValue: string[] = Array.isArray(value) ? value : [value].filter(Boolean);

  if (!(arrayValue.length > 0)) {
    errors.push('required');
  }

  const hasInvalidDate = arrayValue.some((d) => !hasValidDate(d));

  if (hasInvalidDate) {
    errors.push('invalidDate');
  }

  const dates = arrayValue.filter((d) => hasValidDate(d)).map((d) => dayjs(new Date(d)));

  if (
    !hasValidMinValue(rules.minValue, dayjs.min(dates)?.format('YYYY-MM-DD')) &&
    hasValidDate(rules.minValue)
  ) {
    errors.push(`dateMinValue#{"minValue": "${rules.minValue}"}`);
  }

  if (
    !hasValidMaxValue(rules.maxValue, dayjs.max(dates)?.format('YYYY-MM-DD')) &&
    hasValidDate(rules.maxValue)
  ) {
    errors.push(`dateMaxValue#{"maxValue": "${rules.maxValue}"}`);
  }

  if (
    !hasValidMinValue(rules.minValueExcludeLimit, dayjs.min(dates)?.format('YYYY-MM-DD'), true) &&
    hasValidDate(rules.minValueExcludeLimit)
  ) {
    errors.push(
      `dateMinValueExcludeLimit#{"minValueExcludeLimit": "${rules.minValueExcludeLimit}"}`,
    );
  }

  if (
    !hasValidMaxValue(rules.maxValueExcludeLimit, dayjs.max(dates)?.format('YYYY-MM-DD'), true) &&
    hasValidDate(rules.maxValueExcludeLimit)
  ) {
    errors.push(
      `dateMaxValueExcludeLimit#{"maxValueExcludeLimit": "${rules.maxValueExcludeLimit}"}`,
    );
  }

  return errors;
};
