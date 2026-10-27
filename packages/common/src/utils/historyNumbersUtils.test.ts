import {
  addEditLocallySavedRow,
  addEditLocallySavedTextRow,
  deleteLocallySavedRow,
  deleteLocallySavedTextRow,
} from './historyNumbersUtils';

describe('historyNumbersUtils', () => {
  describe('deleteLocallySavedTextRow', () => {
    it('should delete properly the locally saved row', () => {
      expect(
        deleteLocallySavedTextRow([{ sequence: 1 }, { sequence: 2 }], { sequence: 2 }),
      ).toEqual([{ sequence: 1 }]);
    });
  });
  describe('deleteLocallySavedRow', () => {
    it('should return object without deleted row (inactive)', () => {
      expect(
        deleteLocallySavedRow([{ sequence: '1' }, { sequence: '2' }], { sequence: '2' }, true),
      ).toEqual([{ active: false, correctedValue: 0, sequence: 1, user: null }]);
    });
    it('should return object without deleted row (active)', () => {
      expect(
        deleteLocallySavedRow(
          [{ sequence: '1', active: true }, { sequence: '2' }],
          { sequence: '2' },
          false,
        ),
      ).toEqual([{ active: true, correctedValue: 0, sequence: 1, user: null }]);
    });
  });
  describe('addEditLocallySavedRow', () => {
    it('should add a new row if tableData is falsy', () => {
      expect(
        addEditLocallySavedRow([], { sequence: '1', id: 'testUser1', user: 'testUser1' }, true),
      ).toEqual([
        {
          active: false,
          correctedValue: 0,
          id: 'testUser1',
          user: 'testUser1',
          sequence: 1,
        },
      ]);
    });
    it('should edit existing row based on sequence', () => {
      expect(
        addEditLocallySavedRow(
          [{ sequence: '1' }],
          { sequence: '1', id: 'testUserId', user: 'testUser' },
          true,
        ),
      ).toEqual([
        { active: false, correctedValue: 0, id: 'testUserId', user: 'testUser', sequence: 1 },
      ]);
    });
    it('should add new on existing list', () => {
      expect(
        addEditLocallySavedRow([{ sequence: 1 }], { id: 'testUserId', user: 'testUser' }, true),
      ).toEqual([
        { sequence: 1, user: null, correctedValue: 0, active: false },
        { sequence: 2, correctedValue: 0, user: 'testUser', id: 'testUserId', active: false },
      ]);
    });
  });
  describe('addEditLocallySavedTextRow', () => {
    it('should add new complete textRow if tableData is falsy', () => {
      expect(
        addEditLocallySavedTextRow([], {
          sequence: 1,
          correctedValue: 1,
          id: 'testUserId',
          user: 'testUser',
          active: true,
        }),
      ).toEqual([
        { sequence: 1, correctedValue: 1, id: 'testUserId', user: 'testUser', active: true },
      ]);
    });
    it('should add new row with partial properties', () => {
      expect(addEditLocallySavedTextRow([], { correctedValue: 0, sequence: 1 })).toEqual([
        { correctedValue: 0, sequence: 1, active: false, user: null },
      ]);
    });
    it('should edit existing textRow based on sequence', () => {
      expect(
        addEditLocallySavedTextRow([{ sequence: 1 }], {
          sequence: 1,
          correctedValues: 1,
          active: true,
          user: 'testUser',
          id: 'testUserId',
        }),
      ).toEqual([
        { sequence: 1, correctedValues: 1, active: true, user: 'testUser', id: 'testUserId' },
      ]);
    });
    it('should add new textRow on existing list', () => {
      expect(
        addEditLocallySavedTextRow([{ sequence: 1 }], { id: 'testUserId', user: 'testUser' }),
      ).toEqual([
        { active: false, correctedValue: undefined, sequence: 1, user: null },
        {
          active: false,
          correctedValue: undefined,
          sequence: 2,
          id: 'testUserId',
          user: 'testUser',
        },
      ]);
    });
  });
});
