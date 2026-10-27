import {
  createResourceKey,
  encodeText,
  enumeratedOptions,
  filterItems,
  formatDate,
  hasCorrectValue,
  hasValidDate,
  joinWith,
  truncateDecimalPlaces,
  isExpired,
  replaceInObjectRegex,
  appendQueryParams,
  getQueryParamFromUrl,
  disableSidePanelMainButton,
  humanizeKey,
} from './utils';

describe('utils on common/src', () => {
  describe('joinWith', () => {
    it('should return joined string with default separator', () => {
      expect(joinWith(['test', 'testing'])).toEqual('test_testing');
    });

    it('should return joined string with - separator', () => {
      expect(joinWith(['hello', 'world'], '-')).toEqual('hello-world');
    });
  });

  describe('enumeratedOptions', () => {
    const mockTranslate = jest.fn((key) => key);

    it('should return mapped enum options with translated labels', () => {
      const values = {
        enum: [1, 2],
        enumNames: ['One', 'Two'],
      };

      const result = enumeratedOptions(values, 'common', 'en', mockTranslate);

      expect(result).toEqual([
        { code: '1', label: 'One' },
        { code: '2', label: 'Two' },
      ]);
    });

    it('should fall back to enums when enumNames is not provided', () => {
      const values = {
        enum: [10, 20],
      };

      const result = enumeratedOptions(values, 'app', 'fr', mockTranslate);

      expect(result).toEqual([
        { code: '10', label: 10 },
        { code: '20', label: 20 },
      ]);
    });

    it('should handle empty or undefined values', () => {
      const result = enumeratedOptions(undefined, 'ns', 'en', mockTranslate);
      expect(result).toEqual([]);
    });

    it('should handle missing enumNames', () => {
      const values = { enum: ['A', 'B'], enumNames: [] };

      const result = enumeratedOptions(values, 'core', 'de', mockTranslate);

      expect(result).toEqual([
        { code: 'A', label: 'A' },
        { code: 'B', label: 'B' },
      ]);
    });
  });

  describe('truncateDecimalPlaces', () => {
    it('should truncate decimal places successfully', () => {
      expect(truncateDecimalPlaces(123.456789, 2)).toBe('123.45');
    });

    it('should default when error occurs', () => {
      const result = truncateDecimalPlaces('', 2);
      expect(result).toBe('');
    });
  });

  describe('replaceInObjectRegex', () => {
    it('should replace one specific whole word in text', () => {
      const input = {
        code: 'Party',
        type: 'SELF',
        jsonPath: ['something', 'Party', 'else'],
        obj: {
          name: 'Party Bla bla',
        },
      };

      const expected = {
        code: 'PartyCopy',
        jsonPath: ['something', 'PartyCopy', 'else'],
        obj: {
          name: 'Party Bla bla',
        },
        type: 'SELF',
      };
      expect(replaceInObjectRegex(input, 'Party', 'PartyCopy')).toEqual(expected);
    });

    it('should replace specific whole words in text', () => {
      const input = {
        code: 'Party',
        type: 'SELF',
        jsonPath: ['something', 'Party', 'else', 'Asset'],
        obj: {
          name: 'Party Bla bla',
          surname: 'Asset',
        },
      };

      const expected = {
        code: 'PartyCopy',
        jsonPath: ['something', 'PartyCopy', 'else', 'PartyCopy'],
        obj: {
          name: 'Party Bla bla',
          surname: 'PartyCopy',
        },
        type: 'SELF',
      };
      expect(replaceInObjectRegex(input, '(Party|Asset|PartyRole)', 'PartyCopy')).toEqual(expected);
    });
  });

  describe('createResourceKey', () => {
    it('should return the stringified object', () => {
      expect(createResourceKey('testCode', { query1: 'testQuery1', query2: 'testQuery2' })).toEqual(
        'testCode|{"query1":"testQuery1","query2":"testQuery2"}',
      );
    });
  });

  describe('encodeText', () => {
    it('encode text with special characters', () => {
      expect(encodeText('/&hello&/')).toEqual('%252F%2526hello%2526%252F');
    });
    it('should return default behaviour', () => {
      expect(encodeText('test')).toEqual('test');
    });
  });

  describe('hasCorrectValue', () => {
    it('should return false if left value is undefined', () => {
      expect(hasCorrectValue(undefined, null)).toEqual(false);
    });
    it('should return false if right value is null', () => {
      expect(hasCorrectValue(['test', null])).toEqual(false);
    });
    it('should return true if both values inside array are equal', () => {
      expect(hasCorrectValue(['test'], ['test'])).toEqual(true);
    });
  });

  describe('hasValidDate', () => {
    it('should return false if value is not a date', () => {
      expect(hasValidDate('testDate')).toEqual(false);
    });
    it('should return true if value is a date', () => {
      expect(hasValidDate('12-12-2024')).toEqual(true);
    });
  });

  describe('formatDate', () => {
    it('should format valid Date successfully', () => {
      expect(formatDate(new Date('12/12/2024'))).toEqual('12/12/2024');
    });
    it('should return value to string when there is no valid date', () => {
      expect(formatDate(new Date('not-a-date'))).toEqual('Invalid Date');
    });
  });

  describe('filterItems', () => {
    const items = [
      { name: 'John', surname: 'Doe', age: 56, license: 'APB4067' },
      { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754' },
    ];

    it('should return matching items and assign __INDEX__ (case 1)', () => {
      expect(filterItems(items, 'Doe')).toEqual([
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 0 },
      ]);
    });

    it('should return matching items and assign __INDEX__ (case 2)', () => {
      expect(filterItems(items, '40')).toEqual([
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 0 },
        { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754', __INDEX__: 1 },
      ]);
    });

    it('should return matching items and not assign __INDEX__ if already present', () => {
      const items = [
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 5 },
        { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754', __INDEX__: 9 },
      ];
      expect(filterItems(items, 'Jo')).toEqual([
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 5 },
        { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754', __INDEX__: 9 },
      ]);
    });

    it('should return matching items and assign __INDEX__ (keepAll = true)', () => {
      expect(filterItems(items, 'Cur', true)).toEqual([
        {
          name: 'John',
          surname: 'Doe',
          age: 56,
          license: 'APB4067',
          __INDEX__: 0,
          __HIDDEN__: true,
        },
        {
          name: 'Joanna',
          surname: 'Curtis',
          age: 40,
          license: 'APX6754',
          __INDEX__: 1,
          __HIDDEN__: false,
        },
      ]);
    });

    it('should return matching items and not assign __INDEX__ if already present (keepAll = true)', () => {
      const items = [
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 5 },
        { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754', __INDEX__: 9 },
      ];
      expect(filterItems(items, 'Curt', true)).toEqual([
        {
          name: 'John',
          surname: 'Doe',
          age: 56,
          license: 'APB4067',
          __INDEX__: 5,
          __HIDDEN__: true,
        },
        {
          name: 'Joanna',
          surname: 'Curtis',
          age: 40,
          license: 'APX6754',
          __INDEX__: 9,
          __HIDDEN__: false,
        },
      ]);
    });
  });

  describe('filterItems', () => {
    const items = [
      { name: 'John', surname: 'Doe', age: 56, license: 'APB4067' },
      { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754' },
    ];

    it('should return matching items and assign __INDEX__ (case 1)', () => {
      expect(filterItems(items, 'Doe')).toEqual([
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 0 },
      ]);
    });

    it('should return matching items and assign __INDEX__ (case 2)', () => {
      expect(filterItems(items, '40')).toEqual([
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 0 },
        { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754', __INDEX__: 1 },
      ]);
    });

    it('should return matching items and not assign __INDEX__ if already present', () => {
      const items = [
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 5 },
        { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754', __INDEX__: 9 },
      ];
      expect(filterItems(items, 'Jo')).toEqual([
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 5 },
        { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754', __INDEX__: 9 },
      ]);
    });

    it('should return matching items and assign __INDEX__ (keepAll = true)', () => {
      expect(filterItems(items, 'Cur', true)).toEqual([
        {
          name: 'John',
          surname: 'Doe',
          age: 56,
          license: 'APB4067',
          __INDEX__: 0,
          __HIDDEN__: true,
        },
        {
          name: 'Joanna',
          surname: 'Curtis',
          age: 40,
          license: 'APX6754',
          __INDEX__: 1,
          __HIDDEN__: false,
        },
      ]);
    });

    it('should return matching items and not assign __INDEX__ if already present (keepAll = true)', () => {
      const items = [
        { name: 'John', surname: 'Doe', age: 56, license: 'APB4067', __INDEX__: 5 },
        { name: 'Joanna', surname: 'Curtis', age: 40, license: 'APX6754', __INDEX__: 9 },
      ];
      expect(filterItems(items, 'Curt', true)).toEqual([
        {
          name: 'John',
          surname: 'Doe',
          age: 56,
          license: 'APB4067',
          __INDEX__: 5,
          __HIDDEN__: true,
        },
        {
          name: 'Joanna',
          surname: 'Curtis',
          age: 40,
          license: 'APX6754',
          __INDEX__: 9,
          __HIDDEN__: false,
        },
      ]);
    });
  });

  describe('isExpired', () => {
    it('should return true if end date < today', () => {
      expect(isExpired('2000-01-01')).toEqual(true);
    });

    it('should return false if end date > today', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowFormatted = formatDate(tomorrow, 'yyyy-MM-dd') ?? '';
      expect(isExpired(tomorrowFormatted)).toEqual(false);
    });

    it('should return false if end date = today', () => {
      const today = formatDate(new Date(), 'yyyy-MM-dd') ?? '';
      expect(isExpired(today)).toEqual(false);
    });

    it('should return false if end date is undefined', () => {
      const date = undefined;
      expect(isExpired(date)).toEqual(false);
    });
  });

  describe('appendQueryParams', () => {
    test('adds params to URL with no existing query string', () => {
      const url = appendQueryParams('registration/parties', { page: 0, size: 10 });
      expect(url).toBe('registration/parties?page=0&size=10');
    });

    test('preserves existing query string and adds new params', () => {
      const url = appendQueryParams('registration/parties?sort=id:asc', { page: 0, size: 10 });
      expect(url).toBe('registration/parties?sort=id%3Aasc&page=0&size=10');
    });

    test('overrides existing param values', () => {
      const url = appendQueryParams('x?size=5&page=2', { page: 0, size: 10 });
      expect(url).toBe('x?size=10&page=0');
    });

    test('skips undefined, null, and empty string values', () => {
      const url = appendQueryParams('x', {
        page: 0,
        size: 10,
        parentId: '',
        foo: null,
        bar: undefined,
      });
      expect(url).toBe('x?page=0&size=10');
    });

    test('stringifies non-string values (boolean/number)', () => {
      const url = appendQueryParams('x', { enabled: false, count: 3 });
      expect(url).toBe('x?enabled=false&count=3');
    });

    test('returns just the path when all provided params are skipped', () => {
      const url = appendQueryParams('x?sort=id:asc', { a: '', b: null, c: undefined });
      expect(url).toBe('x?sort=id%3Aasc');
    });
  });

  describe('getQueryParamFromUrl', () => {
    it('should return null if url is empty', () => {
      expect(getQueryParamFromUrl('', 'test')).toBeNull();
    });

    it('should return the correct query param from a full URL', () => {
      const url = 'https://example.com?page=1&sort=asc';
      expect(getQueryParamFromUrl(url, 'page')).toBe('1');
      expect(getQueryParamFromUrl(url, 'sort')).toBe('asc');
    });

    it('should return null if param does not exist', () => {
      const url = 'https://example.com?page=1';
      expect(getQueryParamFromUrl(url, 'missing')).toBeNull();
    });

    it('should work with relative query string (fallback case)', () => {
      const url = '?page=2&filter=active';
      expect(getQueryParamFromUrl(url, 'page')).toBe('2');
      expect(getQueryParamFromUrl(url, 'filter')).toBe('active');
    });

    it('should handle malformed URL and fallback correctly', () => {
      const url = 'not-a-valid-url?page=5&sort=desc';
      expect(getQueryParamFromUrl(url, 'page')).toBe('5');
      expect(getQueryParamFromUrl(url, 'sort')).toBe('desc');
    });

    it('should return null if no query string exists', () => {
      const url = 'https://example.com/path';
      expect(getQueryParamFromUrl(url, 'page')).toBeNull();
    });

    it('should return first value if param appears multiple times', () => {
      const url = 'https://example.com?page=1&page=2';
      expect(getQueryParamFromUrl(url, 'page')).toBe('1');
    });
  });

  describe('disableSidePanelMainButton', () => {
    it('should return undefined when uiSchema is undefined', () => {
      expect(disableSidePanelMainButton(undefined)).toBeUndefined();
    });

    it('should disable ui:mainButton', () => {
      const uiSchema = {
        'ui:mainButton': {
          enabled: true,
          label: 'Save',
        },
      };

      expect(disableSidePanelMainButton(uiSchema)).toEqual({
        'ui:mainButton': {
          enabled: false,
          label: 'Save',
        },
      });
    });
  });

  describe('humanizeKey', () => {
    it('should convert camelCase to title case', () => {
      expect(humanizeKey('firstName')).toBe('First Name');
    });

    it('should convert snake_case to title case', () => {
      expect(humanizeKey('first_name')).toBe('First Name');
    });

    it('should convert kebab-case to title case', () => {
      expect(humanizeKey('first-name')).toBe('First Name');
    });

    it('should capitalize a single lowercase word', () => {
      expect(humanizeKey('hello')).toBe('Hello');
    });

    it('should strip leading digits', () => {
      expect(humanizeKey('123abc')).toBe('Abc');
    });

    it('should handle all uppercase letters', () => {
      expect(humanizeKey('ABC')).toBe('A B C');
    });

    it('should remove brackets and digits', () => {
      expect(humanizeKey('key[0]')).toBe('Key');
    });

    it('should return empty string for empty input', () => {
      expect(humanizeKey('')).toBe('');
    });

    it('should handle mixed separators', () => {
      expect(humanizeKey('my_key-name')).toBe('My Key Name');
    });
  });
});
