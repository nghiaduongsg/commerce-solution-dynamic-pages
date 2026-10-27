import { getLabelsValidationErrors } from './labelsValidationUtils';

describe('Labels Validation Utils', () => {
  describe('getLabelsValidationErrors', () => {
    it('should return allDescriptionsRequired error if not all descriptions have been provided', () => {
      const value = [{ languageCL: 'EN', description: 'test' }];
      expect(getLabelsValidationErrors({ minLength: 2 }, value)).toEqual(['allNamesRequired']);
    });

    it('should return error if any description exceeds the 3 characters', () => {
      const value = [{ languageCL: 'EN', description: 'biiiiiiiiiiig Text' }];
      expect(getLabelsValidationErrors({ maxValue: 3 }, value)).toEqual([
        'descriptionsMaxLength#{"maxLength":"3"}',
      ]);
    });

    it('should return no errors', () => {
      const value = [{ languageCL: 'EN', description: 'test' }];
      expect(getLabelsValidationErrors({ minLength: 1, maxValue: 50 }, value)).toEqual([]);
    });

    it('should return allNamesRequired error if required is true and some descriptions are empty', () => {
      const value = [
        { languageCL: 'EN', description: 'test' },
        { languageCL: 'FR', description: '' },
      ];
      expect(getLabelsValidationErrors({ required: true }, value)).toEqual(['allNamesRequired']);
    });

    it('should return allNamesRequired error if required is true and description is undefined', () => {
      const value = [
        { languageCL: 'EN', description: 'test' },
        { languageCL: 'FR', description: undefined as any },
      ];
      expect(getLabelsValidationErrors({ required: true }, value)).toEqual(['allNamesRequired']);
    });

    it('should return no errors if required is true and all descriptions have values', () => {
      const value = [
        { languageCL: 'EN', description: 'test' },
        { languageCL: 'FR', description: 'test français' },
      ];
      expect(getLabelsValidationErrors({ required: true }, value)).toEqual([]);
    });

    it('should return no errors if required is false even with empty descriptions', () => {
      const value = [
        { languageCL: 'EN', description: 'test' },
        { languageCL: 'FR', description: '' },
      ];
      expect(getLabelsValidationErrors({ required: false }, value)).toEqual([]);
    });

    it('should return no errors if required is not specified', () => {
      const value = [
        { languageCL: 'EN', description: 'test' },
        { languageCL: 'FR', description: '' },
      ];
      expect(getLabelsValidationErrors({}, value)).toEqual([]);
    });
  });
});
