import {
  hasTextValue,
  hasValidMaxLength,
  hasValidMinLength,
  isValidRequired,
  hasValidPattern,
  hasValidMinValue,
  hasValidMaxValue,
  hasValidMinValueExcludeLimit,
  hasValidMaxValueExcludeLimit,
  getAllTextValidationErrors,
} from './textValidationUtils';

describe('Text Validation Utils', () => {
  it('allows an empty optional JSON field and still rejects malformed values', () => {
    expect(getAllTextValidationErrors({ isJson: true } as any, '')).toEqual([]);
    expect(getAllTextValidationErrors({ isJson: true } as any, '{bad}')).toContain('invalidJson');
    expect(getAllTextValidationErrors({ isJson: true, required: true } as any, '')).toEqual([
      'required',
    ]);
  });
  describe('hasTextValue', () => {
    it('should return false if value is null', () => {
      expect(hasTextValue(null)).toBe(false);
    });

    it('should return false if value is undefined', () => {
      expect(hasTextValue(undefined)).toBe(false);
    });

    it('should return false if value is empty string', () => {
      expect(hasTextValue('')).toBe(false);
    });

    it('should return false if value is white characters only', () => {
      expect(hasTextValue('    ')).toBe(false);
    });

    it('should return true if value contains some characters', () => {
      expect(hasTextValue('this is a value')).toBe(true);
    });

    it('should return true if value is zero string', () => {
      expect(hasTextValue('0')).toBe(true);
    });

    it('should return true if value is the false as string', () => {
      expect(hasTextValue('false')).toBe(true);
    });
  });

  describe('isValidRequired', () => {
    it('should return true if required is false', () => {
      expect(isValidRequired(false, '', false)).toBe(true);
    });

    it('should return true if required is true and value is defined', () => {
      expect(isValidRequired(true, 'value', false)).toBe(true);
    });

    it('should return false if required is true and value is not defined', () => {
      expect(isValidRequired(true, '', false)).toBe(false);
    });

    it('should return true if required is true, acceptSingleSpace is true and value is a single space', () => {
      expect(isValidRequired(true, ' ', true)).toBe(true);
    });

    it('should return true if required is true, acceptSingleSpace is true and value is more than one single space', () => {
      expect(isValidRequired(true, '  ', true)).toBe(false);
    });
  });

  describe('hasValidMinValue', () => {
    it('should return true if minValue is undefined', () => {
      expect(hasValidMinValue(undefined, 2)).toBe(true);
    });

    it('should return true if value is undefined', () => {
      expect(hasValidMinValue(5, undefined)).toBe(true);
    });

    it('should return true if minValue is zero and value is greater than zero', () => {
      expect(hasValidMinValue(0, 2)).toBe(true);
    });

    it('should return true if minValue is zero and value is also zero', () => {
      expect(hasValidMinValue(0, 0)).toBe(true);
    });

    it('should return true if minValue is defined and value is greater than minValue', () => {
      expect(hasValidMinValue(-5, -3)).toBe(true);
    });

    it('should return false if minValue is defined and the value is less than minValue', () => {
      expect(hasValidMinValue(3, 2)).toBe(false);
    });
  });

  describe('hasValidMaxValue', () => {
    it('should return true if maxValue is undefined', () => {
      expect(hasValidMaxValue(undefined, 2)).toBe(true);
    });

    it('should return true if value is undefined', () => {
      expect(hasValidMaxValue(5, undefined)).toBe(true);
    });

    it('should return true if maxValue is zero and value is less than zero', () => {
      expect(hasValidMaxValue(0, -2)).toBe(true);
    });

    it('should return true if maxValue is zero and value is also zero', () => {
      expect(hasValidMaxValue(0, 0)).toBe(true);
    });

    it('should return true if maxValue is defined and value is less than maxValue', () => {
      expect(hasValidMaxValue(-5, -15)).toBe(true);
    });

    it('should return false if maxValue is defined and the value is greater than maxValue', () => {
      expect(hasValidMaxValue(3, 3.5)).toBe(false);
    });
  });

  describe('hasValidMinValueExcludeLimit', () => {
    it('should return true if minValueExcludeLimit is undefined', () => {
      expect(hasValidMinValueExcludeLimit(undefined, 2)).toBe(true);
    });

    it('should return true if value is undefined', () => {
      expect(hasValidMinValueExcludeLimit(5, undefined)).toBe(true);
    });

    it('should return true if minValueExcludeLimit is zero and value is greater than zero', () => {
      expect(hasValidMinValueExcludeLimit(0, 2)).toBe(true);
    });

    it('should return true if minValueExcludeLimit is defined and value is greater than minValueExcludeLimit', () => {
      expect(hasValidMinValueExcludeLimit(-5, -3)).toBe(true);
    });

    it('should return false if minValueExcludeLimit is defined and the value is less than minValueExcludeLimit', () => {
      expect(hasValidMinValueExcludeLimit(3, 2)).toBe(false);
    });

    it('should return false if minValueExcludeLimit is defined and the value is equal to minValueExcludeLimit', () => {
      expect(hasValidMinValueExcludeLimit(3, 3)).toBe(false);
    });
  });

  describe('hasValidMaxValueExcludeLimit', () => {
    it('should return true if maxValueExcludeLimit is undefined', () => {
      expect(hasValidMaxValueExcludeLimit(undefined, 2)).toBe(true);
    });

    it('should return true if value is undefined', () => {
      expect(hasValidMaxValueExcludeLimit(5, undefined)).toBe(true);
    });

    it('should return true if maxValueExcludeLimit is zero and value is less than zero', () => {
      expect(hasValidMaxValueExcludeLimit(0, -2)).toBe(true);
    });

    it('should return true if maxValueExcludeLimit is defined and value is less than maxValueExcludeLimit', () => {
      expect(hasValidMaxValueExcludeLimit(-5, -15)).toBe(true);
    });

    it('should return false if maxValueExcludeLimit is defined and the value is greater than maxValueExcludeLimit', () => {
      expect(hasValidMaxValueExcludeLimit(3, 3.5)).toBe(false);
    });

    it('should return false if maxValueExcludeLimit is defined and the value is equal to maxValueExcludeLimit', () => {
      expect(hasValidMaxValueExcludeLimit(3, 3)).toBe(false);
    });
  });

  describe('hasValidMinLength', () => {
    it('should return true if minLength is a falsy value', () => {
      expect(hasValidMinLength(0, 'abc')).toBe(true);
    });

    it('should return true if minLength has value and the value has more characters than minLength', () => {
      expect(hasValidMinLength(3, 'value')).toBe(true);
    });

    it('should return false if minLength has value and the value has less characters than minLength', () => {
      expect(hasValidMinLength(3, 'ab')).toBe(false);
    });
  });

  describe('hasValidMaxLength', () => {
    it('should return true if maxLength s a falsy value', () => {
      expect(hasValidMaxLength(0, 'abc')).toBe(true);
    });

    it('should return true if maxLength has value and the value has less characters than maxLength', () => {
      expect(hasValidMaxLength(10, 'value')).toBe(true);
    });

    it('should return false if maxLength has value and the value has more characters than maxLength', () => {
      expect(hasValidMaxLength(3, 'abcd')).toBe(false);
    });
  });

  describe('hasValidPattern', () => {
    it('should return true if pattern is empty', () => {
      expect(hasValidPattern('', '1234')).toBe(true);
    });

    it('should check when accepting numbers if true', () => {
      expect(hasValidPattern('[0-9]', '1234')).toBe(true);
    });

    it('should check when accepting numbers if false', () => {
      expect(hasValidPattern('[0-9]', 'abc')).toBe(false);
    });
  });

  describe('getAllTextValidationErrors', () => {
    it('should check when accepting numbers if true', () => {
      const valRules = {
        required: true,
      };

      expect(getAllTextValidationErrors(valRules, '')).toStrictEqual(['required']);
    });

    it('should check value has less than minimum length', () => {
      const valRules = {
        minLength: 10,
        shouldValidate: true,
      };

      expect(getAllTextValidationErrors(valRules, 'dd')).toStrictEqual([
        'minLength#{"minLength": 10}',
      ]);
    });

    it('should check value has more than maximum length', () => {
      const valRules = {
        maxLength: 10,
        shouldValidate: true,
      };

      expect(getAllTextValidationErrors(valRules, 'ddddffffgggg')).toStrictEqual([
        'maxLength#{"maxLength": 10}',
      ]);
    });

    it('should check value has more than maximum length', () => {
      const valRules = {
        regex: '[0-9]',
        shouldValidate: true,
      };

      expect(getAllTextValidationErrors(valRules, 'ddddffffgggg')).toStrictEqual(['invalidFormat']);
    });

    it('should return max value error given min value validation when sign is reversed', () => {
      const valRules = {
        required: true,
        shouldValidate: true,
        minValue: 0,
        reversibleSign: true,
      };

      expect(getAllTextValidationErrors(valRules, '10', false, true)).toStrictEqual([
        'maxValue#{"maxValue": 0}',
      ]);
    });

    it('should return min value error given max value validation when sign is reversed', () => {
      const valRules = {
        required: true,
        shouldValidate: true,
        maxValue: 100,
        reversibleSign: true,
      };

      expect(getAllTextValidationErrors(valRules, '-101', false, true)).toStrictEqual([
        'minValue#{"minValue": -100}',
      ]);
    });

    it('should return max value exclude error given min value exclude validation when sign is reversed', () => {
      const valRules = {
        required: true,
        shouldValidate: true,
        minValueExcludeLimit: 0,
        reversibleSign: true,
      };

      expect(getAllTextValidationErrors(valRules, '0', false, true)).toStrictEqual([
        'maxValueExcludeLimit#{"maxValueExcludeLimit": 0}',
      ]);
    });

    it('should return error when requireYesNoValue is true and value is invalid', () => {
      const valRules = {
        requireYesNoValue: true,
        shouldValidate: true,
      };

      expect(getAllTextValidationErrors(valRules, '!YES')).toStrictEqual(['invalidYesNoValue']);
    });

    it('should return min value exclude error given max value exclude validation when sign is reversed', () => {
      const valRules = {
        required: true,
        shouldValidate: true,
        maxValueExcludeLimit: 100,
        reversibleSign: true,
      };

      expect(getAllTextValidationErrors(valRules, '-100', false, true)).toStrictEqual([
        'minValueExcludeLimit#{"minValueExcludeLimit": -100}',
      ]);
    });
  });
});
