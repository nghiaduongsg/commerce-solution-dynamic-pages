import { prepareCorrectionsObject } from './correctionsUtils';

describe('correctionsUtils', () => {
  describe('prepareCorrectionsObject', () => {
    it('should return the object with no correctedValue', () => {
      const mockTempFormData = {
        reason: 'testReason',
        description: 'this is a test description',
        explanation: 'this is a test explanation',
      };
      expect(prepareCorrectionsObject(mockTempFormData, 'test_parent_id', {}, {})).toEqual({
        '$.parent.id': [
          {
            active: true,
            correctedValue: '[{}]',
            formCorrectionReasonCL: 'testReason',
            description: 'this is a test description',
            explanation: 'this is a test explanation',
            listActionCL: 'DELETED',
          },
        ],
      });
    });
    it('should return object with bad values when having only parentId present', () => {
      expect(prepareCorrectionsObject({}, 'id', {}, {})).toEqual({
        '$.undefined': [
          {
            active: true,
            correctedValue: '[{}]',
            description: undefined,
            explanation: undefined,
            formCorrectionReasonCL: undefined,
            listActionCL: 'DELETED',
          },
        ],
      });
    });
  });
});
