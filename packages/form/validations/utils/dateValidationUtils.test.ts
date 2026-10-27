import {
  hasValidMinValue,
  hasValidMaxValue,
  hasValidDate,
  getDateValidationErrors,
  getDateArrayValidationErrors,
} from './dateValidationUtils';

describe('Date Validation Utils', () => {
  describe('hasValidMinValue', () => {
    it('should return true if value is falsy', () => {
      const value = '';
      const minValue = '2021-06-20';
      expect(hasValidMinValue(minValue, value)).toBe(true);
    });

    it('should return true if minValue is falsy', () => {
      const value = '2021-06-23';
      const minValue = '';
      expect(hasValidMinValue(minValue, value)).toBe(true);
    });

    it('should return true if value & minValue are equal and excludeLimit is false', () => {
      const value = '2021-06-20';
      const minValue = '2021-06-20';
      const excludeLimit = false;
      expect(hasValidMinValue(minValue, value, excludeLimit)).toBe(true);
    });

    it('should return false if value & minValue are equal and excludeLimit is true', () => {
      const value = '2021-06-20';
      const minValue = '2021-06-20';
      const excludeLimit = true;
      expect(hasValidMinValue(minValue, value, excludeLimit)).toBe(false);
    });

    it('should return true if value is later than minValue', () => {
      const value = '2021-06-23';
      const minValue = '2021-06-20';
      expect(hasValidMinValue(minValue, value)).toBe(true);
    });

    it('should return false if value is before minValue', () => {
      const value = '2021-06-20';
      const minValue = '2021-06-23';
      expect(hasValidMinValue(minValue, value)).toBe(false);
    });
  });

  describe('hasValidMaxValue', () => {
    it('should return true if value is falsy', () => {
      const value = '';
      const maxValue = '2021-06-20';
      expect(hasValidMaxValue(maxValue, value)).toBe(true);
    });

    it('should return true if  maxValue is falsy', () => {
      const value = '2021-06-23';
      const maxValue = '';
      expect(hasValidMaxValue(maxValue, value)).toBe(true);
    });

    it('should return true if value & maxValue are equal and excludeLimit is false', () => {
      const value = '2021-06-20';
      const maxValue = '2021-06-20';
      const excludeLimit = false;
      expect(hasValidMaxValue(maxValue, value, excludeLimit)).toBe(true);
    });

    it('should return false if value & maxValue are equal and excludeLimit is true', () => {
      const value = '2021-06-20';
      const maxValue = '2021-06-20';
      const excludeLimit = true;
      expect(hasValidMaxValue(maxValue, value, excludeLimit)).toBe(false);
    });

    it('should return false if value is later than maxValue', () => {
      const value = '2021-06-23';
      const maxValue = '2021-06-20';
      expect(hasValidMaxValue(maxValue, value)).toBe(false);
    });

    it('should return true if value is before maxValue', () => {
      const value = '2021-06-20';
      const maxValue = '2021-06-23';
      expect(hasValidMaxValue(maxValue, value)).toBe(true);
    });
  });

  describe('hasValidDate', () => {
    it('should return false if value is not valid', () => {
      expect(hasValidDate('invalid date')).toBe(false);
    });

    it('should return true if value is valid date', () => {
      expect(hasValidDate('2021-06-23')).toBe(true);
    });

    it('should return true if value is today', () => {
      expect(hasValidDate('today')).toBe(true);
    });

    it('should return true if value is tomorrow', () => {
      expect(hasValidDate('tomorrow')).toBe(true);
    });
  });

  describe('getDateValidationErrors', () => {
    it('should return an empty errors array if rules are empty', () => {
      const rules = {};
      const value = '2021-06-23';
      const expected = [];
      expect(getDateValidationErrors(rules, value)).toStrictEqual(expected);
    });

    it('should return an errors array with specific message if date value is invalid', () => {
      const rules = {};
      const value = '2021-0';

      const expected = ['invalidDate'];
      expect(getDateValidationErrors(rules, value)).toStrictEqual(expected);
    });

    it('should return an errors array with specific message for minValue rule', () => {
      const rules = {
        minValue: '2021-06-21',
      };
      const value = '2021-06-20';

      const expected = [`dateMinValue#{"minValue": "${rules.minValue}"}`];
      expect(getDateValidationErrors(rules, value)).toStrictEqual(expected);
    });

    it('should return an errors array with specific message for maxValue rule', () => {
      const rules = {
        maxValue: '2021-06-20',
      };
      const value = '2021-06-21';

      const expected = [`dateMaxValue#{"maxValue": "${rules.maxValue}"}`];
      expect(getDateValidationErrors(rules, value)).toStrictEqual(expected);
    });

    it('should return an errors array with specific message for minValueExcludeLimit rule', () => {
      const rules = {
        minValueExcludeLimit: '2021-06-21',
      };
      const value = '2021-06-20';

      const expected = [
        `dateMinValueExcludeLimit#{"minValueExcludeLimit": "${rules.minValueExcludeLimit}"}`,
      ];
      expect(getDateValidationErrors(rules, value)).toStrictEqual(expected);
    });

    it('should return an errors array with specific message for maxValueExcludeLimit rule', () => {
      const rules = {
        maxValueExcludeLimit: '2021-06-20',
      };
      const value = '2021-06-21';

      const expected = [
        `dateMaxValueExcludeLimit#{"maxValueExcludeLimit": "${rules.maxValueExcludeLimit}"}`,
      ];
      expect(getDateValidationErrors(rules, value)).toStrictEqual(expected);
    });
  });

  describe('hasValidMinValue with keywords', () => {
    it('should return true if value is today and minValue is today', () => {
      const todayStr = new Date().toISOString().split('T')[0];
      expect(hasValidMinValue('today', todayStr)).toBe(true);
    });

    it('should return true if value is tomorrow and minValue is today', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(hasValidMinValue('today', tomorrowStr)).toBe(true);
    });
  });

  describe('hasValidMaxValue with keywords', () => {
    it('should return true if value is today and maxValue is today', () => {
      const todayStr = new Date().toISOString().split('T')[0];
      expect(hasValidMaxValue('today', todayStr)).toBe(true);
    });

    it('should return false if value is tomorrow and maxValue is today', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      expect(hasValidMaxValue('today', tomorrowStr)).toBe(false);
    });
  });

  describe('getDateArrayValidationErrors', () => {
    it('should return required error when array is empty', () => {
      const rules = {};
      const value: string[] = [];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).toContain('required');
    });

    it('should return invalidDate error when array contains invalid dates', () => {
      const rules = {};
      const value = ['2021-06-23', 'invalid-date'];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).toContain('invalidDate');
    });

    it('should handle array with all invalid dates', () => {
      const rules = {};
      const value = ['invalid-date', 'another-invalid'];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).toContain('invalidDate');
    });

    it('should return minValue error when minimum date is before rule minValue', () => {
      const rules = {
        minValue: '2021-06-25',
      };
      const value = ['2021-06-23', '2021-06-26'];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).toContain('dateMinValue#{"minValue": "2021-06-25"}');
    });

    it('should return maxValue error when maximum date is after rule maxValue', () => {
      const rules = {
        maxValue: '2021-06-25',
      };
      const value = ['2021-06-23', '2021-06-26'];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).toContain('dateMaxValue#{"maxValue": "2021-06-25"}');
    });

    it('should return minValueExcludeLimit error when minimum date equals rule minValueExcludeLimit', () => {
      const rules = {
        minValueExcludeLimit: '2021-06-23',
      };
      const value = ['2021-06-23', '2021-06-26'];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).toContain('dateMinValueExcludeLimit#{"minValueExcludeLimit": "2021-06-23"}');
    });

    it('should return maxValueExcludeLimit error when maximum date equals rule maxValueExcludeLimit', () => {
      const rules = {
        maxValueExcludeLimit: '2021-06-26',
      };
      const value = ['2021-06-23', '2021-06-26'];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).toContain('dateMaxValueExcludeLimit#{"maxValueExcludeLimit": "2021-06-26"}');
    });

    it('should not return validation errors when rules are not violated', () => {
      const rules = {
        minValue: '2021-06-20',
        maxValue: '2021-06-30',
      };
      const value = ['2021-06-23', '2021-06-25'];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).not.toContain('dateMinValue#{"minValue": "2021-06-20"}');
      expect(result).not.toContain('dateMaxValue#{"maxValue": "2021-06-30"}');
    });

    it('should not check min/max value rules when rule values are invalid dates', () => {
      const rules = {
        minValue: 'invalid-min-date',
        maxValue: 'invalid-max-date',
      };
      const value = ['2021-06-23'];

      const result = getDateArrayValidationErrors(rules, value);

      expect(result).not.toContain('dateMinValue#{"minValue": "invalid-min-date"}');
      expect(result).not.toContain('dateMaxValue#{"maxValue": "invalid-max-date"}');
    });
  });
});
