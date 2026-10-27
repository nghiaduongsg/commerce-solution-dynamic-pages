import { DynamicFormGroup } from '@pkg-form/types';
import {
  procStringToObj,
  objectHasValues,
  hasValue,
  isJSON,
  getDynamicQueryCode,
  urlHasAllParams,
  formatMessage,
  compareList,
  compareNestedObjects,
  isObjectWithList,
  compareNested,
  isEqualRecursive,
  equalityCheck,
  sortArrayWithArray,
  arrayToMap,
  isExternal,
  isActionAllowedBasedOnSecurableObjects,
  escapeOnlyQlFormulaSpan,
  getTabKeys,
  hasErrorsInsideTab,
  isActionAllowed,
  registerKeyboardShortcuts,
  focusElement,
} from './utils';

describe('Common utils functions', () => {
  it('procStringToObj - returns object', () => {
    const expected = {
      type: 'MY_TYPE',
      user: 'user1',
    };

    expect(procStringToObj('{"type": "MY_TYPE", "user": "user1"}')).toEqual(expected);
  });

  it('procStringToObj - returns null with empty json param', () => {
    expect(procStringToObj('')).toEqual(null);
  });
  it('procStringToObj - return null on error catch', () => {
    expect(procStringToObj(String({}))).toEqual(null);
  });

  it('isJSON - string - returns false', () => {
    expect(isJSON('test')).toEqual(false);
  });

  it('isJSON - number - returns false', () => {
    expect(isJSON('1234')).toEqual(false);
    expect(isJSON(4324)).toEqual(false);
    expect(isJSON(5.67)).toEqual(false);
  });

  it('isJSON - boolean - returns false', () => {
    expect(isJSON(true)).toEqual(false);
    expect(isJSON(false)).toEqual(false);
  });

  it('isJSON - array - returns false', () => {
    expect(isJSON([1, 2])).toEqual(false);
  });

  it('isJSON - json - returns true', () => {
    expect(isJSON('{"user": "user1"}')).toEqual({ user: 'user1' });
  });

  it('getDynamicQueryCode - returns true if contains query-management/queries/', () => {
    expect(getDynamicQueryCode('query-management/queries/execute')).toEqual(true);
  });

  it('getDynamicQueryCode - returns false in any other url', () => {
    expect(getDynamicQueryCode('taxpayer-accounting/parties/')).toEqual(false);
  });

  it('getDynamicQueryCode - returns false with empty string ', () => {
    expect(getDynamicQueryCode('')).toEqual(false);
  });

  it('urlHasAllParams - returns false if "{" exists ', () => {
    expect(urlHasAllParams('taxpayer-accounting/parties/{partyId}')).toEqual(false);
  });

  it('urlHasAllParams - returns true if url is ready', () => {
    expect(urlHasAllParams('taxpayer-accounting/parties/')).toEqual(true);
  });

  it('objectHasValues - checks if the object has values', () => {
    const obj = {
      type: 'MY_TYPE',
      user: 'user1',
    };

    expect(objectHasValues(obj)).toBe(true);
  });
});

describe('hasValue', () => {
  it('returns true if value is array and contains at least one item', () => {
    expect(hasValue(['a', 'b'])).toBe(true);
  });

  it('returns false if value is array and contains no items', () => {
    expect(hasValue([])).toBe(false);
  });

  it('returns true if value is object and contains some properties', () => {
    expect(hasValue({ prop: 'prop' })).toBe(true);
  });

  it('returns false if value is object and contains no properties', () => {
    expect(hasValue({})).toBe(false);
  });

  it('returns true if value is boolean and is false', () => {
    expect(hasValue(false)).toBe(true);
  });

  it('returns true if value is boolean and is true', () => {
    expect(hasValue(true)).toBe(true);
  });

  it('returns true if value is number and is zero', () => {
    expect(hasValue(0)).toBe(true);
  });

  it('returns true if value is number and is not a zero', () => {
    expect(hasValue(365.2)).toBe(true);
  });

  it('returns false if value is string and is empty', () => {
    expect(hasValue('')).toBe(false);
  });

  it('returns true if value is string and not empty', () => {
    expect(hasValue('abc')).toBe(true);
  });
});

describe('formatMessage', () => {
  it('replaces placeholders with corresponding parameters', () => {
    const message = 'Hello {0}, your balance is {1}';
    const parameters = '{"parameters": ["Takis takis", "100"]}';
    const translateFn = null;

    const expected = 'Hello Takis takis, your balance is 100';
    const formattedMessage = formatMessage(message, parameters, translateFn, 'EL', 'namespace');

    expect(formattedMessage).toEqual(expected);
  });

  it('handles missing or empty parameters', () => {
    const message = 'Hello {0}, your balance is {1}';
    const parameters = '{"parameters": ["Takis takis"]}';
    const translateFn = null;

    const expected = 'Hello Takis takis, your balance is ';
    const formattedMessage = formatMessage(message, parameters, translateFn, 'EL', 'namespace');

    expect(formattedMessage).toEqual(expected);
  });
});

describe('urlHasAllParams', () => {
  it('should return false when url is missing a query/path parameter', () => {
    expect(urlHasAllParams('a/url?a={a}')).toEqual(false);
    expect(urlHasAllParams('a/url/{id}')).toEqual(false);
  });

  it('should return true when url is complete', () => {
    expect(urlHasAllParams('a/url/123')).toEqual(true);
  });

  it('should return false when url is undefined', () => {
    expect(urlHasAllParams(undefined as any)).toEqual(false);
  });
});

describe('isObjectWithList', () => {
  it('should return false when both arguments are arrays but without list property', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    expect(isObjectWithList(arr1, arr2)).toBe(false);
  });

  it('should return true when both arguments are arrays with list property', () => {
    const obj1 = Object.assign([1, 2], { list: [1, 2] });
    const obj2 = Object.assign([3, 4], { list: [3, 4] });
    expect(isObjectWithList(obj1, obj2)).toBe(true);
  });

  it('should return false when only first argument has list property', () => {
    const obj1 = Object.assign([1, 2], { list: [1, 2] });
    const obj2 = Object.assign([1, 2], {});

    expect(isObjectWithList(obj1, obj2)).toBe(false);
  });

  it('should return false when arguments are not arrays', () => {
    const obj1 = { list: [1, 2] };
    const obj2 = { list: [3, 4] };
    expect(isObjectWithList(obj1, obj2)).toBe(false);
  });
});

describe('compareList', () => {
  it('should return true for two empty arrays', () => {
    expect(compareList([], [])).toBe(true);
  });

  it('should return true for two identical primitive value arrays', () => {
    expect(compareList([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('should return false for arrays with different primitive values', () => {
    expect(compareList([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it('should return true for arrays with identical nested objects', () => {
    const arr1 = [{ a: 1 }, { b: 2 }];
    const arr2 = [{ a: 1 }, { b: 2 }];
    expect(compareList(arr1, arr2)).toBe(true);
  });

  it('should return false for arrays with different nested objects', () => {
    const arr1 = [{ a: 1 }, { b: 2 }];
    const arr2 = [{ a: 1 }, { b: 3 }];
    expect(compareList(arr1, arr2)).toBe(false);
  });

  it('should handle mixed type arrays', () => {
    expect(compareList([1, 'test', true], [1, 'test', true])).toBe(true);
    expect(compareList([1, 'test', true], [1, 'test', false])).toBe(false);
  });
});

describe('compareNested', () => {
  it('should return true for identical null values', () => {
    expect(compareNested(null, null)).toBe(true);
  });

  it('should return false when one value is null', () => {
    expect(compareNested(null, 1)).toBe(false);
    expect(compareNested(1, null)).toBe(false);
  });

  it('should return true for two empty objects', () => {
    expect(compareNested({}, {})).toBe(true);
  });

  it('should return true for identical simple objects', () => {
    expect(compareNested({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it('should return false for objects with different values', () => {
    expect(compareNested({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
  });

  it('should return false for objects with different keys', () => {
    expect(compareNested({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
  });

  it('should return false for objects with different number of keys', () => {
    expect(compareNested({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(compareNested({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it('should return true for deeply nested identical objects', () => {
    const obj1 = { a: { b: { c: 1 } } };
    const obj2 = { a: { b: { c: 1 } } };
    expect(compareNested(obj1, obj2)).toBe(true);
  });

  it('should return false for deeply nested different objects', () => {
    const obj1 = { a: { b: { c: 1 } } };
    const obj2 = { a: { b: { c: 2 } } };
    expect(compareNested(obj1, obj2)).toBe(false);
  });

  it('should return true for objects with nested arrays', () => {
    const obj1 = { arr: [1, 2, 3] };
    const obj2 = { arr: [1, 2, 3] };
    expect(compareNested(obj1, obj2)).toBe(true);
  });

  it('should return false for objects with different nested arrays', () => {
    const obj1 = { arr: [1, 2, 3] };
    const obj2 = { arr: [1, 2, 4] };
    expect(compareNested(obj1, obj2)).toBe(false);
  });

  it('should compare arrays of objects correctly', () => {
    const arr1 = [{ a: 1 }, { b: 2 }];
    const arr2 = [{ a: 1 }, { b: 2 }];
    expect(compareNested(arr1, arr2)).toBe(true);
  });

  it('should handle complex nested structures', () => {
    const obj1 = {
      data: [
        { id: 1, value: 'value1', other: [1, 2] },
        { id: 2, value: 'value2', other: [1] },
      ],
    };
    const obj2 = {
      data: [
        { id: 1, value: 'value1', other: [1, 2] },
        { id: 2, value: 'value2', other: [1] },
      ],
    };
    expect(compareNested(obj1, obj2)).toBe(true);
  });
});

describe('compareNestedObjects', () => {
  it('should return false when one is object and other is not', () => {
    expect(compareNestedObjects({}, 1)).toBe(false);
    expect(compareNestedObjects(1, {})).toBe(false);
  });

  it('should return true for identical arrays', () => {
    expect(compareNestedObjects([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('should return false for different arrays', () => {
    expect(compareNestedObjects([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it('should return true for identical nested objects', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { b: 1 } };
    expect(compareNestedObjects(obj1, obj2)).toBe(true);
  });

  it('should return false for different nested objects', () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { b: 2 } };
    expect(compareNestedObjects(obj1, obj2)).toBe(false);
  });
});

describe('isEqualRecursive', () => {
  it('should return false when types differ', () => {
    expect(isEqualRecursive(1, '1')).toBe(false);
    expect(isEqualRecursive(true, 1)).toBe(false);
    expect(isEqualRecursive(null, undefined)).toBe(false);
  });

  it('should return true for two empty objects', () => {
    expect(isEqualRecursive({}, {})).toBe(true);
  });

  it('should return true for identical simple objects', () => {
    expect(isEqualRecursive({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it('should return false for objects with different values', () => {
    expect(isEqualRecursive({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
  });

  it('should return false for objects with different keys', () => {
    expect(isEqualRecursive({ a: 1, b: 2 }, { a: 1, c: 2 })).toBe(false);
  });

  it('should return false for objects with different number of keys', () => {
    expect(isEqualRecursive({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(isEqualRecursive({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it('should return false for arrays with different lengths', () => {
    expect(isEqualRecursive([1, 2, 3], [1, 2])).toBe(false);
    expect(isEqualRecursive([1, 2], [1, 2, 3])).toBe(false);
  });

  it('should return false when one is array and other is object', () => {
    expect(isEqualRecursive([], {})).toBe(false);
    expect(isEqualRecursive({}, [])).toBe(false);
  });

  it('should return true for deeply nested identical structures', () => {
    const obj1 = {
      a: {
        b: {
          c: [1, 2, { d: 3 }],
        },
      },
    };
    const obj2 = {
      a: {
        b: {
          c: [1, 2, { d: 3 }],
        },
      },
    };
    expect(isEqualRecursive(obj1, obj2)).toBe(true);
  });

  it('should return false for deeply nested different structures', () => {
    const obj1 = {
      a: {
        b: {
          c: [1, 2, { d: 'test' }],
        },
      },
    };
    const obj2 = {
      a: {
        b: {
          c: [1, 2, { d: 'test2' }],
        },
      },
    };
    expect(isEqualRecursive(obj1, obj2)).toBe(false);
  });
});

describe('sortArrayWithArray', () => {
  it('should sort target array based on source array order', () => {
    const target = [
      { id: 1, value: '1' },
      { id: 2, value: '2' },
      { id: 3, value: '3' },
    ];
    const source = [{ order: 3 }, { order: 1 }, { order: 2 }];

    const result = sortArrayWithArray(target, source, 'order', 'id');

    expect(result).toEqual([
      { id: 3, value: '3' },
      { id: 1, value: '1' },
      { id: 2, value: '2' },
    ]);
  });

  it('should return original target when target is null', () => {
    const source = [{ order: 1 }];
    const result = sortArrayWithArray(null as any, source, 'order', 'id');
    expect(result).toBeNull();
  });

  it('should return original target when source is null', () => {
    const target = [{ id: 1, value: '1' }];
    const result = sortArrayWithArray(target, null as any, '', 'id');
    expect(result).toEqual(target);
  });

  it('should return original target when targetKey is empty string', () => {
    const target = [{ id: 1, value: '1' }];
    const source = [{ order: 1 }];
    const result = sortArrayWithArray(target, source, '', 'id');
    expect(result).toEqual(target);
  });

  it('should return original target when sourceKey is undefined', () => {
    const target = [{ id: 1, value: '1' }];
    const source = [{ order: 1 }];
    const result = sortArrayWithArray(target, source, 'order', undefined as any);
    expect(result).toEqual(target);
  });
});

describe('isExternal', () => {
  it('should return true for http URL', () => {
    expect(isExternal('http://example.com')).toBe(true);
  });

  it('should return true for https URL', () => {
    expect(isExternal('https://example.com')).toBe(true);
  });

  it('should return false for relative path', () => {
    expect(isExternal('/test')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isExternal('')).toBe(false);
  });

  it('should handle undefined by returning false', () => {
    expect(isExternal(undefined as any)).toBe(false);
  });

  it('should return false for URL without protocol', () => {
    expect(isExternal('example.com')).toBe(false);
  });

  it('should return false for URL with only domain', () => {
    expect(isExternal('www.example.com')).toBe(false);
  });
});

describe('arrayToMap', () => {
  it('should convert array to map object using id property', () => {
    const array = [
      { id: 1, value: 'value1' },
      { id: 2, value: 'value2' },
      { id: 3, value: 'value3' },
    ];

    const result = arrayToMap(array, 'id');

    expect(result).toEqual({
      1: { id: 1, value: 'value1' },
      2: { id: 2, value: 'value2' },
      3: { id: 3, value: 'value3' },
    });
  });

  it('should return empty object for empty array', () => {
    const result = arrayToMap([], '');
    expect(result).toEqual({});
  });

  it('should return empty object for null array', () => {
    const result = arrayToMap(null as any, '');
    expect(result).toEqual({});
  });

  it('should return empty object for undefined array', () => {
    const result = arrayToMap(undefined as any, '');
    expect(result).toEqual({});
  });
});

describe('equalityCheck', () => {
  describe('Number Comparisons', () => {
    it('should return true for equal numbers', () => {
      expect(equalityCheck(5, 5)).toBe(true);
    });

    it('should return false for different numbers', () => {
      expect(equalityCheck(5, 10)).toBe(false);
    });

    it('should handle floating point numbers', () => {
      expect(equalityCheck(3.14, 3.14)).toBe(true);
      expect(equalityCheck(3.14, 3.15)).toBe(false);
    });
  });

  describe('String Comparisons', () => {
    it('should return true for equal strings', () => {
      expect(equalityCheck('hello', 'hello')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(equalityCheck('hello', 'world')).toBe(false);
    });

    it('should return true for empty strings', () => {
      expect(equalityCheck('', '')).toBe(true);
    });

    it('should be case-sensitive', () => {
      expect(equalityCheck('Hello', 'hello')).toBe(false);
    });

    it('should handle strings with spaces', () => {
      expect(equalityCheck('hello world', 'hello world')).toBe(true);
      expect(equalityCheck('hello world', 'hello  world')).toBe(false);
    });
  });

  describe('Boolean Comparisons', () => {
    it('should return true for equal booleans', () => {
      expect(equalityCheck(true, true)).toBe(true);
      expect(equalityCheck(false, false)).toBe(true);
    });

    it('should return false for different booleans', () => {
      expect(equalityCheck(true, false)).toBe(false);
      expect(equalityCheck(false, true)).toBe(false);
    });
  });

  describe('Stringified Object Comparisons', () => {
    it('should return true for equal objects', () => {
      const obj1 = { key: 'value' };
      const obj2 = { key: 'value' };
      expect(equalityCheck(obj1, obj2)).toBe(true);
    });

    it('should return false for different objects', () => {
      const obj1 = { key: 'value1' };
      const obj2 = { key: 'value2' };
      expect(equalityCheck(obj1, obj2)).toBe(false);
    });

    it('should return true for empty objects', () => {
      expect(equalityCheck({}, {})).toBe(true);
    });

    it('should return true for nested objects that are the same', () => {
      const obj1 = { test: { key: 'value', deep: { key: 'value' } } };
      const obj2 = { test: { key: 'value', deep: { key: 'value' } } };
      expect(equalityCheck(obj1, obj2)).toBe(true);
    });

    it('should return false for nested objects with differences', () => {
      const obj1 = { test: { key: 'value', deep: { key: 'value1' } } };
      const obj2 = { test: { key: 'value', deep: { key: 'value2' } } };
      expect(equalityCheck(obj1, obj2)).toBe(false);
    });
  });

  describe('isActionAllowedBasedOnSecurableObjects', () => {
    const securableObjects = {
      a: true,
      b: true,
      c: false,
    };

    it('should return true if permissionKey is defaultItemActions', () => {
      expect(
        isActionAllowedBasedOnSecurableObjects({}, 'defaultItemActions', securableObjects, true),
      ).toBe(true);
    });

    it('should return true if applyPermissions is set to false', () => {
      expect(isActionAllowedBasedOnSecurableObjects({}, 'c', securableObjects, false)).toBe(true);
    });

    it('should return true if applyPermissions is set to true and securable object is true', () => {
      expect(isActionAllowedBasedOnSecurableObjects({}, 'a', securableObjects, true)).toBe(true);
    });

    it('should return false if applyPermissions is set to true and securable object is false', () => {
      expect(isActionAllowedBasedOnSecurableObjects({}, 'c', securableObjects, true)).toBe(false);
    });

    it('should return false if applyPermissions is set to true and securable object is undefined', () => {
      expect(isActionAllowedBasedOnSecurableObjects({}, 'd', securableObjects, true)).toBe(false);
    });

    it('should return true if permissionKey is empty and no replacementValues', () => {
      expect(isActionAllowedBasedOnSecurableObjects({}, '', securableObjects, true)).toBe(true);
    });

    it('should return true if replacementValues are used and constructed key is allowed', () => {
      const permissionKey = { url: 'api/{id}/action', replacements: [{ key: '{id}' }] };
      const replacementValues = { '{id}': '123' };
      expect(
        isActionAllowedBasedOnSecurableObjects(
          replacementValues,
          permissionKey,
          { 'api/123/action': true },
          true,
        ),
      ).toBe(true);
    });

    it('should return false if replacementValues are used and constructed key is not allowed', () => {
      const permissionKey = { url: 'api/{id}/action', replacements: [{ key: '{id}' }] };
      const replacementValues = { '{id}': '123' };
      expect(
        isActionAllowedBasedOnSecurableObjects(
          replacementValues,
          permissionKey,
          { 'api/123/action': false },
          true,
        ),
      ).toBe(false);
    });

    it('should return true if replacementValues are used but constructed key is empty', () => {
      const permissionKey = { url: '', replacements: [] };
      const replacementValues = { '{id}': '123' };
      expect(
        isActionAllowedBasedOnSecurableObjects(replacementValues, permissionKey, {}, true),
      ).toBe(true);
    });
  });
  describe('getTabKeys', () => {
    it('should return tab key in lowercase when there are no groups', () => {
      const tab = {
        key: 'TestTab',
        type: 'Default',
      } as DynamicFormGroup;
      const result = getTabKeys(tab);
      expect(result).toEqual('testtab');
    });
    it('should return combined tab and group keys in lowercase', () => {
      const tab = {
        key: 'TestTab',
        type: 'Default',
        groups: [
          { key: 'Group1', type: 'Default' },
          { key: 'Group2', type: 'Default' },
        ],
      } as DynamicFormGroup;
      const result = getTabKeys(tab);
      expect(result).toEqual('testtab_group1_group2');
    });
    it('should handle empty groups array', () => {
      const tab = {
        key: 'TestTab',
        type: 'Default',
        groups: [],
      } as DynamicFormGroup;
      const result = getTabKeys(tab);
      expect(result).toEqual('testtab');
    });
  });
  describe('hasErrorsInsideTab', () => {
    it('should return true if at least one error key matches tab keys', () => {
      const tabKeys = 'testtab_group1_group2';
      const tabKeysWithErrors = ['error1', 'group2'];
      const result = hasErrorsInsideTab(tabKeys, tabKeysWithErrors);
      expect(result).toBe(true);
    });
    it('should return false if no error keys match tab keys', () => {
      const tabKeys = 'testtab_group1_group2';
      const tabKeysWithErrors = ['error1', 'error2'];
      const result = hasErrorsInsideTab(tabKeys, tabKeysWithErrors);
      expect(result).toBe(false);
    });
    it('should handle empty tab keys', () => {
      const tabKeys = '';
      const tabKeysWithErrors = ['error1', 'group2'];
      const result = hasErrorsInsideTab(tabKeys, tabKeysWithErrors);
      expect(result).toBe(false);
    });
    it('should handle empty error keys array', () => {
      const tabKeys = 'testtab_group1_group2';
      const tabKeysWithErrors: string[] = [];
      const result = hasErrorsInsideTab(tabKeys, tabKeysWithErrors);
      expect(result).toBe(false);
    });
  });
});

describe('escapeOnlyQlFormulaSpan', () => {
  it('escapes only ql-formula span', () => {
    const html = '<span class="ql-formula">E = mc^2 & <</span>';
    const expected =
      '<p>&lt;span class="ql-formula"&gt;E = mc^2 &amp;amp; &amp;lt;&lt;/span&gt;</p>';
    expect(escapeOnlyQlFormulaSpan(html)).toBe(expected);
  });

  it('escapes and wraps multiple ql-formula spans', () => {
    const html =
      '<span class="ql-formula">E & = mc^2</span> and <span class="ql-formula">x < y</span>';
    const expected =
      '<p>&lt;span class="ql-formula"&gt;E &amp;amp; = mc^2&lt;/span&gt;</p> and ' +
      '<p>&lt;span class="ql-formula"&gt;x &amp;lt; y&lt;/span&gt;</p>';
    expect(escapeOnlyQlFormulaSpan(html)).toBe(expected);
  });

  it('does not escape other spans', () => {
    const html = '<span class="ql-bold">Bold text & <</span>';
    const expected = '<span class="ql-bold">Bold text &amp; &lt;</span>';
    expect(escapeOnlyQlFormulaSpan(html)).toBe(expected);
  });

  it('works with nested ql-formula spans', () => {
    const html =
      '<div><span class="ql-formula">a & b < c</span><span class="ql-formula">x > y</span></div>';
    const expected =
      '<div>' +
      '<p>&lt;span class="ql-formula"&gt;a &amp;amp; b &amp;lt; c&lt;/span&gt;</p>' +
      '<p>&lt;span class="ql-formula"&gt;x &amp;gt; y&lt;/span&gt;</p>' +
      '</div>';
    expect(escapeOnlyQlFormulaSpan(html)).toBe(expected);
  });
});

describe('formatMessage - extra cases', () => {
  it('uses translate function before replacing placeholders', () => {
    const translateFn = jest.fn(() => 'Hola {0}, saldo {1}');
    const result = formatMessage(
      'message.key',
      '{"parameters":["Maria","50"]}',
      translateFn,
      'es',
      'common',
    );

    expect(result).toBe('Hola Maria, saldo 50');
    expect(translateFn).toHaveBeenCalledWith('message.key', {
      lng: 'es',
      ns: 'common',
    });
  });

  it('supports single-quoted parameters JSON', () => {
    const result = formatMessage('Hello {0}', "{'parameters':['Maria']}", null, 'en', 'common');

    expect(result).toBe('Hello Maria');
  });
});

describe('objectHasValues - extra cases', () => {
  it('returns false when object values are empty strings or empty arrays', () => {
    expect(
      objectHasValues({
        name: '',
        items: [],
      }),
    ).toBe(false);
  });

  it('returns true when at least one value has length', () => {
    expect(
      objectHasValues({
        name: '',
        items: ['A'],
      }),
    ).toBe(true);
  });
});

describe('isJSON - extra cases', () => {
  it('returns false for null JSON text', () => {
    expect(isJSON('null')).toBe(false);
  });

  it('returns false for malformed JSON', () => {
    expect(isJSON('{"a":1')).toBe(false);
  });
});

describe('arrayToMap - extra cases', () => {
  it('last item wins when duplicate keys exist', () => {
    const result = arrayToMap(
      [
        { code: 'A', value: 1 },
        { code: 'A', value: 2 },
      ],
      'code',
    );

    expect(result).toEqual({
      A: { code: 'A', value: 2 },
    });
  });
});

describe('equalityCheck - extra cases', () => {
  it('returns true for null and undefined because both fallback to empty object stringification', () => {
    expect(equalityCheck(null, undefined)).toBe(true);
  });

  it('compares arrays through JSON stringification', () => {
    expect(equalityCheck([1, 2], [1, 2])).toBe(true);
    expect(equalityCheck([1, 2], [2, 1])).toBe(false);
  });
});

describe('isActionAllowed', () => {
  it('returns true when code is empty', () => {
    expect(isActionAllowed('', ['EDIT'], '*')).toBe(true);
  });

  it('returns true when all symbol exists in allowed codes', () => {
    expect(isActionAllowed('DELETE', ['*'], '*')).toBe(true);
  });

  it('returns the matched action when specific code is allowed', () => {
    expect(isActionAllowed('EDIT', ['VIEW', 'EDIT'], '*')).toBe('EDIT');
  });

  it('returns undefined when action is not allowed', () => {
    expect(isActionAllowed('DELETE', ['VIEW', 'EDIT'], '*')).toBeUndefined();
  });
});

describe('registerKeyboardShortcuts', () => {
  afterEach(() => {
    registerKeyboardShortcuts(false);
    document.body.innerHTML = '';
    delete (window as any).LIST;
    delete (window as any).ROW;
    delete (window as any).FORM;
  });

  it('registers keydown listener when enabled', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');

    registerKeyboardShortcuts(true);

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function), false);
  });

  it('removes keydown listener when disabled', () => {
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    registerKeyboardShortcuts(false);

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function), false);
  });

  it('clicks add button on Shift+Alt+A', () => {
    (window as any).LIST = 'my-list';

    const button = document.createElement('button');
    button.id = 'my-list-add-btn';
    const clickSpy = jest.fn();
    button.addEventListener('click', clickSpy);
    document.body.appendChild(button);

    registerKeyboardShortcuts(true);

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'A',
        shiftKey: true,
        altKey: true,
      }),
    );

    expect(clickSpy).toHaveBeenCalled();
  });

  it('clicks close buttons on Escape', () => {
    (window as any).LIST = 'my-list';

    const columnClose = document.createElement('button');
    columnClose.id = 'my-list-column-selector-close-btn';
    const filterClose = document.createElement('button');
    filterClose.id = 'my-list-filter-close-btn';
    const infoClose = document.createElement('button');
    infoClose.id = 'close-info-panel-btn';

    const columnSpy = jest.fn();
    const filterSpy = jest.fn();
    const infoSpy = jest.fn();

    columnClose.addEventListener('click', columnSpy);
    filterClose.addEventListener('click', filterSpy);
    infoClose.addEventListener('click', infoSpy);

    document.body.appendChild(columnClose);
    document.body.appendChild(filterClose);
    document.body.appendChild(infoClose);

    registerKeyboardShortcuts(true);

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
      }),
    );

    expect(columnSpy).toHaveBeenCalled();
    expect(filterSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
  });

  it('clicks form button on Ctrl+Alt+S', () => {
    (window as any).FORM = 'my-form';

    const button = document.createElement('button');
    button.id = 'my-form-form-btn';
    const clickSpy = jest.fn();
    button.addEventListener('click', clickSpy);
    document.body.appendChild(button);

    registerKeyboardShortcuts(true);

    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        altKey: true,
      }),
    );

    expect(clickSpy).toHaveBeenCalled();
  });
});

describe('focusElement', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('focuses the element after timeout', () => {
    const input = document.createElement('input');
    input.id = 'my-input';
    document.body.appendChild(input);

    const focusSpy = jest.spyOn(input, 'focus').mockImplementation(() => {});

    focusElement('my-input');
    jest.runAllTimers();

    expect(focusSpy).toHaveBeenCalled();
  });

  it('does nothing when element does not exist', () => {
    expect(() => {
      focusElement('missing-id');
      jest.runAllTimers();
    }).not.toThrow();
  });
});

describe('escapeOnlyQlFormulaSpan - extra cases', () => {
  it('returns input as-is when html is undefined', () => {
    expect(escapeOnlyQlFormulaSpan(undefined)).toBeUndefined();
  });

  it('returns unchanged html when there is no ql-formula span', () => {
    expect(escapeOnlyQlFormulaSpan('<div>hello</div>')).toBe('<div>hello</div>');
  });
});

describe('hasErrorsInsideTab - extra cases', () => {
  it('matches error keys case-insensitively', () => {
    expect(hasErrorsInsideTab('testtab_group1_group2', ['GROUP2'])).toBe(true);
  });
});
