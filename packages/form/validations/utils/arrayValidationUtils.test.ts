import {
  hasSelections,
  selectionsHaveValidMaxLength,
  selectionsHaveValidMinLength,
  selectionsValidRequired,
  getAllArrayItemsValidationErrors,
} from './arrayValidationUtils';

describe('Array Items Validation Utils', () => {
  describe('hasSelections', () => {
    it('should return false if value is null', () => {
      expect(hasSelections(null)).toBe(false);
    });

    it('should return false if value is undefined', () => {
      expect(hasSelections(undefined)).toBe(false);
    });

    it('should return false if value is empty array and multiple is true', () => {
      expect(hasSelections([])).toBe(false);
    });

    it('should return true if value contains some items and multiple is true', () => {
      expect(hasSelections(['this is a value'])).toBe(true);
    });
  });

  describe('selectionsValidRequired', () => {
    it('should return true if required is false', () => {
      expect(selectionsValidRequired(false, [])).toBe(true);
    });

    it('should return true if required is true and value is defined', () => {
      expect(selectionsValidRequired(true, ['value'])).toBe(true);
    });

    it('should return false if required is true and value is not defined', () => {
      expect(selectionsValidRequired(true, [])).toBe(false);
    });
  });

  describe('selectionsHaveValidMinLength', () => {
    it('should return true if minLength is a falsy value', () => {
      expect(selectionsHaveValidMinLength(0, ['abc'])).toBe(true);
    });

    it('should return true if minLength has value and the value has more items than minLength', () => {
      expect(selectionsHaveValidMinLength(3, ['1', '2', '3'])).toBe(true);
    });

    it('should return false if minLength has value and the value has less items than minLength', () => {
      expect(selectionsHaveValidMinLength(3, ['2', '2'])).toBe(false);
    });
  });

  describe('selectionsHaveValidMaxLength', () => {
    it('should return true if maxLength s a falsy value', () => {
      expect(selectionsHaveValidMaxLength(0, ['abc'])).toBe(true);
    });

    it('should return true if maxLength has value and the value has less items than maxLength', () => {
      expect(selectionsHaveValidMaxLength(10, ['1'])).toBe(true);
    });

    it('should return false if maxLength has value and the value has more items than maxLength', () => {
      expect(selectionsHaveValidMaxLength(3, ['1', '2', '3', '4'])).toBe(false);
    });
  });

  describe('getAllArrayItemsValidationErrors', () => {
    it('should return empty errors', () => {
      expect(getAllArrayItemsValidationErrors({}, false, ['abc'])).toStrictEqual([]);
    });

    it('should make some selections on empty array', () => {
      const valRules = {
        required: true,
      };

      expect(getAllArrayItemsValidationErrors(valRules, true, [])).toStrictEqual(['arrayRequired']);
    });

    it('should choose at least 10 selections', () => {
      const valRules = {
        minLength: 10,
      };

      expect(getAllArrayItemsValidationErrors(valRules, true, ['dd'])).toStrictEqual([
        'arrayMinLength#{"minLength": 10}',
      ]);
    });

    it('should choose maximum 2 selections', () => {
      const valRules = {
        maxLength: 2,
      };

      expect(
        getAllArrayItemsValidationErrors(valRules, true, ['dd', 'ccccc', 'gggg']),
      ).toStrictEqual(['arrayMaxLength#{"maxLength": 2}']);
    });
  });
});
