import {
  getTimeValidationErrors,
  hasValidMaxTimeValue,
  hasValidMinTimeValue,
  hasValidTime,
} from '@pkg-form/validations/utils/timeValidationUtils';

describe('Time Validation Utils', () => {
  describe('hasValidTime', () => {
    it('should return true if value is valid', () => {
      expect(hasValidTime('23:15')).toBe(true);
    });

    it('should return true if value is valid', () => {
      expect(hasValidTime('05:47')).toBe(true);
    });

    it('should return false if value is invalid', () => {
      expect(hasValidTime('56:22')).toBe(false);
    });
  });

  describe('hasValidMinTimeValue', () => {
    it('should return false if no minValue is passed', () => {
      expect(hasValidMinTimeValue(undefined, '23:50', false)).toBe(true);
    });

    it('should return false if minValue is not valid', () => {
      expect(hasValidMinTimeValue('45:30', '10:10', false)).toBe(true);
    });

    it('should return false if value is not valid', () => {
      expect(hasValidMinTimeValue('09:30', '45:33', false)).toBe(true);
    });

    it('should return true if value is after minValue', () => {
      expect(hasValidMinTimeValue('09:30', '10:10', false)).toBe(true);
    });

    it('should return false if value is before minValue', () => {
      expect(hasValidMinTimeValue('09:30', '07:20', false)).toBe(false);
    });

    it('should return false if value is the same as minValue limit is excluded', () => {
      expect(hasValidMinTimeValue('09:30', '09:30', true)).toBe(false);
    });

    it('should return true if value is the same as minValue limit is not excluded', () => {
      expect(hasValidMinTimeValue('09:30', '09:30', false)).toBe(true);
    });
  });

  describe('hasValidMaxTimeValue', () => {
    it('should return false if no maxValue is passed', () => {
      expect(hasValidMaxTimeValue(undefined, '23:50', false)).toBe(true);
    });

    it('should return false if maxValue is not valid', () => {
      expect(hasValidMaxTimeValue('45:30', '10:10', false)).toBe(true);
    });

    it('should return false if value is not valid', () => {
      expect(hasValidMaxTimeValue('09:30', '45:33', false)).toBe(true);
    });

    it('should return true if value is before maxValue', () => {
      expect(hasValidMaxTimeValue('09:30', '07:30', false)).toBe(true);
    });

    it('should return false if value is after maxValue', () => {
      expect(hasValidMaxTimeValue('09:30', '22:20', false)).toBe(false);
    });

    it('should return false if value is the same as maxValue limit is excluded', () => {
      expect(hasValidMaxTimeValue('09:30', '09:30', true)).toBe(false);
    });

    it('should return true if value is the same as maxValue limit is not excluded', () => {
      expect(hasValidMaxTimeValue('09:30', '09:30', false)).toBe(true);
    });
  });

  describe('getTimeValidationErrors', () => {
    it('should check if value is valid', () => {
      const valRules = {
        required: true,
      };

      expect(getTimeValidationErrors(valRules, '55:100')).toStrictEqual(['invalidTime']);
    });

    it('should check value is before minValue', () => {
      const valRules = {
        minValue: '20:50',
        shouldValidate: true,
      };

      expect(getTimeValidationErrors(valRules, '20:49')).toStrictEqual([
        'timeMinValue#{"minValue": "20:50"}',
      ]);
    });

    it('should check value is after maxValue', () => {
      const valRules = {
        maxValue: '20:50',
        shouldValidate: true,
      };

      expect(getTimeValidationErrors(valRules, '20:51')).toStrictEqual([
        'timeMaxValue#{"maxValue": "20:50"}',
      ]);
    });

    it('should check value is before minValue (limit Excluded)', () => {
      const valRules = {
        minValueExcludeLimit: '20:50',
        shouldValidate: true,
      };

      expect(getTimeValidationErrors(valRules, '20:50')).toStrictEqual([
        'timeMinValueExcludeLimit#{"minValueExcludeLimit": "20:50"}',
      ]);
    });

    it('should check value is after maxValue (limit Excluded)', () => {
      const valRules = {
        maxValueExcludeLimit: '20:50',
        shouldValidate: true,
      };

      expect(getTimeValidationErrors(valRules, '20:50')).toStrictEqual([
        'timeMaxValueExcludeLimit#{"maxValueExcludeLimit": "20:50"}',
      ]);
    });
  });
});
