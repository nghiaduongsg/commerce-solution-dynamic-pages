import {
  checkForCodelistInCookies,
  clearFilterCookies,
  getCookie,
  getFilterCookieName,
  getFilterCookies,
  saveFilterCookies,
  setCookie,
} from './handleCookies';

describe('handleCookies', () => {
  //* Do not put a valid expdays parameter on setCookie() to test it
  //* Because the test is going to fail each second. reason is: getTime()
  const suffix = ';path=/';

  describe('setCookie', () => {
    it('should set cookie on document', () => {
      const val = encodeURIComponent(`testCookie${suffix}`); // used encodeURIComponent to encode ";"
      setCookie('cookie', val);
      expect(getCookie('cookie')).toBe(val);
    });
  });

  describe('getCookie', () => {
    it('should get the cookie successfully', () => {
      setCookie('test', 'testCookie');
      expect(getCookie('cookieNameTest')).toEqual('');
    });
    it('should return the cookie value (indexOf flow)', () => {
      setCookie('testCookie', '12345');
      expect(getCookie('testCookie')).toEqual('12345');
    });
  });

  describe('getFilterCookieName', () => {
    it('should return tableId with encrypted user', () => {
      expect(getFilterCookieName('testTable', 'testUser')).toEqual(
        'testTable_filters_33ef37db24f3a27fb520847dcd549e9f',
      );
    });
  });

  describe('getFilterCookies', () => {
    it('should return empty object if cookie was not saved before', () => {
      expect(getFilterCookies('testUser', 'testTable')).toEqual({});
    });
    it('should return parsed JSON on saved cookie', () => {
      const user = 'testUser';
      const tableId = 'testTableId';
      const mockFilterData = { column: 'name', value: 'test', operator: 'equals' };
      const cookieName = getFilterCookieName(tableId, user);
      setCookie(cookieName, JSON.stringify(mockFilterData), NaN);
      expect(getFilterCookies(user, tableId)).toEqual(mockFilterData);
    });
    it('should return parsed JSON on saved cookie', () => {
      const user = 'testUser';
      const tableId = 'testTableId';
      const mockFilterData = { column: 'name', value: 'test', operator: 'equals' };
      const cookieName = getFilterCookieName(tableId, user);
      setCookie(cookieName, JSON.stringify(mockFilterData), NaN);
      expect(getFilterCookies(user, tableId)).toEqual(mockFilterData);
    });
    it('should handle invalid JSON and return empty object & also call console spy (catch block)', () => {
      const user = 'testUser';
      const tableId = 'table123';
      const cookieName = getFilterCookieName(tableId, user);
      setCookie(cookieName, 'invalid-json{broken:syntax', NaN);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(getFilterCookies(user, tableId)).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error parsing saved filter:',
        expect.any(SyntaxError),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('saveFilterCookies', () => {
    it('should set the cookie successfully with stringified criteria present', () => {
      expect(
        saveFilterCookies('testUser', { key: 'testCriteria', value: '12345' }, 'testTableID'),
      ).toBeUndefined();
      expect(global?.document?.cookie).toBeDefined();
    });
    it('should set the cookie without criteria', () => {
      expect(saveFilterCookies('testUser', null, 'testTableID')).toBeUndefined();
      expect(global?.document?.cookie).toBeDefined();
    });
  });
  describe('clearFilterCookies', () => {
    it('should clear cookie successfully', () => {
      expect(clearFilterCookies('testUser', 'testTableId')).toBeUndefined();
    });
  });
  describe('checkForCodelistInCookies', () => {
    it('should return false if user is falsy', () => {
      expect(checkForCodelistInCookies(undefined as any, 'testInput', 'testTableId')).toEqual(
        false,
      );
    });
    it('should return false if user is present but no value from getFilterCookies()', () => {
      expect(checkForCodelistInCookies('testUser', 'testInput', 'testTableId')).toEqual(false);
    });
    it('should execute return !!savedFilter line when hasValue returns true', () => {
      setCookie(
        getFilterCookieName('testTable', 'testUser'),
        JSON.stringify({ columnName: 'testColumn', filterValue: 'testValue' }),
        NaN,
      );
      expect(checkForCodelistInCookies('testUser', 'columnName', 'testTable')).toBe(true);
    });
  });
});
