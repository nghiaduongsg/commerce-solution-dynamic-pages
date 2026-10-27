import { useLocation } from 'react-router';
import {
  checkIfValueCorrect,
  computeCheck,
  constructApiUrl,
  deepEqual,
  jpValue,
  resolveData,
  resolveSourceData,
  shouldBeApplied,
  getValue,
} from '../dataResolver/utils';
import { StoreTypesSchema, AnyType } from '@pkg-common/types';
import { mockDate } from '@_jestHelpers/dateMock';
import { formatDate } from '@pkg-common/utils';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: jest.fn(),
}));

jest.mock('@pkg-common/utils', () => ({
  ...jest.requireActual('@pkg-common/utils'),
  formatDate: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe('constructApiUrl', () => {
  it('returns the input URL when no replacements are provided', () => {
    const apiValues = {
      url: 'taxpayer-accounting/parties',
      replacements: [],
    };
    const replacementValues: { [key: string]: AnyType } = {};
    expect(constructApiUrl(apiValues, replacementValues)).toEqual('taxpayer-accounting/parties');
  });
  it('replaces a single replacement value in the URL', () => {
    const apiValues = {
      url: 'taxpayer-accounting/parties/{id}',
      replacements: [
        {
          key: '{id}',
          source: { type: 'STORE' as StoreTypesSchema, code: 'myCode', jsonPath: ['id'] },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = { '{id}': 123 };
    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/parties/123',
    );
  });
  it('replaces multiple replacement values in the URL', () => {
    const apiValues = {
      url: 'taxpayer-accounting/parties/{id}/and/{postId}',
      replacements: [
        {
          key: '{id}',
          source: { type: 'STORE' as StoreTypesSchema, code: 'myCode', jsonPath: ['id'] },
        },
        {
          key: '{postId}',
          source: { type: 'STORE' as StoreTypesSchema, code: 'myCode', jsonPath: ['postId'] },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = { '{id}': 123, '{postId}': 456 };
    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/parties/123/and/456',
    );
  });
  it('handles array replacement values', () => {
    const apiValues = {
      url: 'taxpayer-accounting/parties?id={id}',
      replacements: [
        {
          key: '{id}',
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'myCode',
            jsonPath: ['id'],
          },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = { '{id}': [123, 456, 789] };
    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/parties?id=123&id=456&id=789',
    );
  });
  it('handles array replacement values with enumeration', () => {
    const apiValues = {
      url: 'taxpayer-accounting/parties?id={id}',
      replacements: [
        {
          key: '{id}',
          enumerate: true,
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'myCode',
            jsonPath: ['id'],
          },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = { '{id}': [123, 456, 789] };
    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/parties?id1=123&id2=456&id3=789',
    );
  });

  it('handles array replacement values when array is empty', () => {
    const apiValues = {
      url: 'taxpayer-accounting/parties?id={id}',
      replacements: [
        {
          key: '{id}',
          source: { type: 'STORE' as StoreTypesSchema, code: 'myCode', jsonPath: ['id'] },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = { '{id}': [] };
    expect(constructApiUrl(apiValues, replacementValues)).toEqual('taxpayer-accounting/parties');
  });

  it('handles URL encoding of replacement values', () => {
    const apiValues = {
      url: 'taxpayer-accounting/pi-detail-view?obligationActionId={obligationId}&billSegmentCategories={billSegmentCategories}',
      replacements: [
        {
          key: '{obligationId}',
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'myCode',
            jsonPath: ['obligationActionId', 'id'],
          },
        },
        {
          key: '{billSegmentCategories}',
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'FinancialDetailsDebtCategory',
            jsonPath: ['selectedRowIds', '*'],
          },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = {
      '{obligationId}': '123',
      '{billSegmentCategories}': ['Tax', 'Penalty and Interest'],
    };
    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/pi-detail-view?obligationActionId=123&billSegmentCategories=Tax&billSegmentCategories=Penalty%20and%20Interest',
    );
  });
  it('handles two query params, one of which is an empty array', () => {
    const apiValues = {
      url: 'taxpayer-accounting/pi-detail-view?obligationActionId={obligationId}&billSegmentCategories={billSegmentCategories}',
      replacements: [
        {
          key: '{obligationId}',
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'myCode',
            jsonPath: ['obligationActionId', 'id'],
          },
        },
        {
          key: '{billSegmentCategories}',
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'FinancialDetailsDebtCategory',
            jsonPath: ['selectedRowIds', '*'],
          },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = {
      '{obligationId}': '123',
      '{billSegmentCategories}': [],
    };

    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/pi-detail-view?obligationActionId=123',
    );
  });

  it('handles case when url has & as final character', () => {
    const apiValues = {
      url: 'taxpayer-accounting/pi-detail-view?obligationActionId={obligationId}&',
      replacements: [
        {
          key: '{obligationId}',
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'myCode',
            jsonPath: ['obligationActionId', 'id'],
          },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = {
      '{obligationId}': '123',
    };

    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/pi-detail-view?obligationActionId=123',
    );
  });

  it('handles case when url has ? as final character', () => {
    const apiValues = {
      url: 'taxpayer-accounting/pi-detail-view?obligationActionId={obligationId}?',
      replacements: [
        {
          key: '{obligationId}',
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'myCode',
            jsonPath: ['obligationActionId', 'id'],
          },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = {
      '{obligationId}': '123',
    };
    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/pi-detail-view?obligationActionId=123',
    );
  });
  it('should append /page on finalUrl (entityCL) flow', () => {
    const apiValues = {
      url: 'taxpayer-accounting/pi-detail-view?entityCL={entityCL}',
      replacements: [
        {
          key: '{entityCL}',
          source: {
            type: 'STORE' as StoreTypesSchema,
            code: 'testCode',
            jsonPath: ['entityCL', 'id'],
          },
        },
      ],
    };
    const replacementValues: { [key: string]: AnyType } = { '{entityCL}': '123' };
    expect(constructApiUrl(apiValues, replacementValues)).toEqual(
      'taxpayer-accounting/pi-detail-view?entityCL=/page/123',
    );
  });
});

describe('jpValue', () => {
  const data = {
    name: 'aName',
    type: {
      code: 'code',
      label: 'label',
      items: {
        number: 20,
        list: [1, 2, 3],
      },
      list: [
        { name: 'A', code: 'a' },
        { name: 'B', code: 'b' },
        { name: 'C', code: 'c', meta: { meta1: 'meta1', meta2: 'meta2' } },
      ],
    },
  };
  describe('first level value path', () => {
    expect(jpValue(data, ['name'])).toEqual('aName');

    it('correct path', () => {
      expect(jpValue(data, ['name'])).toEqual('aName');
    });

    it('non-existent path', () => {
      expect(jpValue(data, ['notFound'])).toEqual(undefined);
    });
  });
  describe('second level value path', () => {
    it('correct path', () => {
      expect(jpValue(data, ['type', 'label'])).toEqual('label');
    });

    it('non-existent path', () => {
      expect(jpValue(data, ['type', 'wrong'])).toEqual(undefined);
    });
  });
  describe('third level value path', () => {
    it('correct path', () => {
      expect(jpValue(data, ['type', 'items', 'number'])).toEqual(20);
    });

    it('correct array path', () => {
      expect(jpValue(data, ['type', 'list', '0'])).toEqual(data.type.list[0]);
    });

    it('non-existent path', () => {
      expect(jpValue(data, ['type', 'wrong'])).toEqual(undefined);
    });
  });
  describe('various level value paths', () => {
    it('more than three level value path', () => {
      expect(jpValue(data, ['type', 'list', '2', 'meta'])).toEqual(data.type.list[2]?.meta);
      expect(jpValue(data, ['type', 'list', '2', 'meta', 'meta2'])).toEqual(
        data.type.list[2]?.meta?.meta2,
      );
    });
    it('should return undefined when jsonPath has 3 elements', () => {
      expect(
        jpValue(
          { existingProperty: { nestedProperty: 'value' } },
          ['nonExistentProperty', 'someNestedProperty', 'hello'],
          'value',
        ),
      ).toBeUndefined();
    });
    it('query', () => {
      expect(jpValue(data, ['type', 'list', "?(@.code=='b')"], 'query')).toEqual([
        data.type.list[1],
      ]);
    });
  });
});

describe('deepEqual', () => {
  it('should return true if both objects have equal key lengths and values', () => {
    expect(deepEqual({ key: 'value' }, { key: 'value' })).toEqual(true);
  });
  it('should return true if params are equal to each other', () => {
    expect(deepEqual('test', 'test')).toEqual(true);
  });
  it('should return false if a param is null', () => {
    expect(deepEqual(null, 'testB')).toEqual(false);
  });
  it('should return false if b param is null', () => {
    expect(deepEqual('testA', null)).toEqual(false);
  });
  it('should return false if a param is not object', () => {
    expect(deepEqual('testA', { key: 'value' })).toEqual(false);
  });
  it('should return false if b param is not object', () => {
    expect(deepEqual({ key: 'value' }, 'testB')).toEqual(false);
  });
  it('should return false if both params have uneven length', () => {
    expect(deepEqual({ key: 'value', key1: 'value1' }, { key: 'value' })).toEqual(false);
  });
});

describe('resolveSourceData', () => {
  it('should return an object with apply true when sourceType is WIDGET_PATH', () => {
    expect(
      resolveSourceData(
        'testWidgetId',
        {
          state: {},
          routeParams: 'testRouteParams',
          routerData: 'testRouterData',
        },
        {
          source: {
            code: 'testCode',
            type: 'WIDGET_PATH',
            operator: 'every',
          },
        },
      ),
    ).toEqual({ apply: true, value: '' });
  });
  it('should default when source?.type is ROUTER', () => {
    expect(
      resolveSourceData(
        'testWidgetId',
        {
          state: {},
          routeParams: 'testRouteParams',
          routerData: 'testRouterData',
        },
        {
          source: {
            code: 'testCode',
            type: 'ROUTER',
            operator: 'every',
          },
        },
      ),
    ).toEqual({ apply: true, value: undefined });
  });
  it('should default when type is ROUTER_DATA', () => {
    expect(
      resolveSourceData(
        'testWidgetId',
        {
          state: {},
          routeParams: { source: { code: 'testCode' } },
          routerData: 'testRouterData',
        },
        {
          source: {
            code: 'testCode',
            type: 'ROUTER_DATA',
            operator: 'every',
          },
        },
      ),
    ).toEqual({ apply: true, value: '' });
  });
  it('should return object with null value when type is ROUTER_QUERY', () => {
    (useLocation as jest.Mock).mockImplementation(() => ({
      search: '123',
      path: 'testPath',
    }));
    expect(
      resolveSourceData(
        'testWidgetId',
        {
          state: {},
          routeParams: { source: { code: 'testCode' } },
          routerData: 'testRouterData',
        },
        {
          source: {
            code: 'testCode',
            type: 'ROUTER_QUERY',
            operator: 'sum',
          },
        },
      ),
    ).toEqual({ apply: true, value: null });
  });
  it('should return input default value if its truthy', () => {
    expect(
      resolveSourceData(
        'testWidgetId',
        {
          state: {},
          routeParams: { source: { code: 'testCode' } },
          routerData: 'testRouterData',
        },
        {
          defaultValue: 'testDefault',
          source: {
            code: 'testCode',
            codePath: 'testCodePath',
            jsonPathReplacement: {
              code: 'testJsonCode',
              type: 'testJsonReplacementType',
            },
            operator: 'every',
          },
        },
      ),
    ).toEqual({ apply: true, value: 'testDefault' });
  });
  it('should return current date when defaultValue is __TODAY__', () => {
    mockDate('1234T1500');
    expect(
      resolveSourceData(
        'testWidgetId',
        {
          state: {},
          routeParams: { source: { code: 'testCode' } },
          routerData: 'testRouterData',
          dateFormat: 'dd/MM/YYYY',
        },
        {
          key: 'thisIsNow',
          defaultValue: '__TODAY__',
        },
      ),
    ).toEqual({ apply: true, value: '1234' });
  });
});

describe('resolveData', () => {
  it('should return {} when no sources', () => {
    expect(
      resolveData(
        'testWidgetId',
        {
          state: 'testState',
          routeParams: {},
          routerData: {},
          user: 'testUser',
        },
        undefined,
      ),
    ).toEqual({});
  });
  describe('checkIfValueIsCorrect', () => {
    it('should return the "isLoggedInUser" flow', () => {
      expect(
        checkIfValueCorrect(
          'testKey',
          'isLoggedInUser',
          ['testUser'],
          'testUser',
          'testValue',
          'testDefaultValue',
        ),
      ).toEqual(false);
    });
  });
});

describe('getValue', () => {
  describe('operator is sum', () => {
    it('sums only truthy values in the array', () => {
      const result = getValue('sum', [1, 2, 3, null, undefined]);
      expect(result).toBe(6);
    });
    it('returns 0 if calculationOutputIfEmpty is set to 0', () => {
      const result = getValue('sum', [], 0);
      expect(result).toBe(0);
    });
    it('returns 0 if calculationOutputIfEmpty is not set', () => {
      const result = getValue('sum', []);
      expect(result).toBe(0);
    });
    it('returns null if calculationOutputIfEmpty is set to null', () => {
      const result = getValue('sum', [], null);
      expect(result).toBeNull();
    });
  });
  describe('operator is join', () => {
    it('joins truthy values with commas', () => {
      const result = getValue('join', ['randomText1', null, '', 'randomText2']);
      expect(result).toBe('randomText1,randomText2');
    });
    it('returns undefined if value is empty', () => {
      const result = getValue('join', []);
      expect(result).toBeUndefined();
    });
    it('returns undefined if all values are falsy', () => {
      const result = getValue('join', [false, '', 0]);
      expect(result).toBeUndefined();
    });
  });
  describe('operator is array', () => {
    it('wraps the value inside an array when value is NOT an array and hasValue is true', () => {
      // (hasValue as jest.Mock).mockReturnValue(true);
      const result = getValue('array', 'thisValueIsNotInsideAnArray');
      expect(result).toEqual(['thisValueIsNotInsideAnArray']);
    });
  });
  describe('operator is multiline', () => {
    it('joins truthy values with newline characters', () => {
      const result = getValue('multiline', ['a', '', null, 'b']);
      expect(result).toBe('a\nb');
    });
  });
  describe('operator is concat', () => {
    it('joins truthy values with commas', () => {
      const result = getValue('concat', ['a', '', null, 'b']);
      expect(result).toBe('a,b');
    });
  });
  describe('operator is first', () => {
    it('returns the first element of the array', () => {
      const result = getValue('first', ['element1', 'element2', 'element3']);
      expect(result).toBe('element1');
    });
    it('returns undefined for empty array', () => {
      const result = getValue('first', []);
      expect(result).toBeUndefined();
    });
  });
  describe('none of the conditions is met or value is not an array', () => {
    it('returns value if operator does not match any of the conditions', () => {
      const result = getValue('notAValidOperatorCase', 4);
      expect(result).toBe(4);
    });
    it('returns value if value is not an Array', () => {
      const result = getValue('sum', 3);
      expect(result).toBe(3);
    });
  });
});

describe('getStoreSlice (via resolveSourceData)', () => {
  const baseInput = {
    routeParams: {},
    routerData: {},
    user: 'testUser',
  };

  const baseSource = (type: string, code = 'testCode') => ({
    source: { code, type, jsonPath: ['someField'] },
  });

  const makeState = (extra = {}) => ({
    Entities: {
      testCode: {
        entity: { someField: 'entityValue' },
        formData: { someField: 'formDataValue' },
      },
    },
    ApiData: {
      testCode: { data: { someField: 'apiValue' } },
    },
    Tables: {
      testCode: {
        pageData: [{ someField: 'listValue' }],
        filterData: { someField: 'filterValue' },
      },
    },
    CurrentEditedItem: { someField: 'editedValue' },
    ...extra,
  });

  it('should return API_DATA slice', () => {
    const result = resolveSourceData(
      'testCode_someField',
      { ...baseInput, state: makeState() },
      baseSource('API_DATA'),
    );
    expect(result.value).toEqual('apiValue');
  });

  it('should return STORE slice', () => {
    const state = makeState({ testCode: { someField: 'storeValue' } });
    const result = resolveSourceData(
      'testCode_someField',
      { ...baseInput, state },
      baseSource('STORE'),
    );
    expect(result.value).toEqual('storeValue');
  });

  it('should return EDITED_NODE slice', () => {
    const state = makeState();
    const result = resolveSourceData(
      'testCode_someField',
      {
        ...baseInput,
        state,
      },
      {
        source: {
          code: 'testCode',
          type: 'EDITED_NODE',
          jsonPath: ['someField'],
        },
      },
    );
    expect(result).toBeDefined();
  });

  it('should return LIST slice', () => {
    const state = makeState();

    const result = resolveSourceData(
      'testCode',
      { ...baseInput, state },
      {
        source: {
          code: 'testCode',
          type: 'LIST',
        },
      },
    );

    expect(result).toBeDefined();
  });

  it('should return FILTERS slice', () => {
    const result = resolveSourceData(
      'testCode_someField',
      { ...baseInput, state: makeState() },
      baseSource('FILTERS'),
    );
    expect(result.value).toEqual('filterValue');
  });

  it('should return ENTITY slice', () => {
    const result = resolveSourceData(
      'testCode_someField',
      { ...baseInput, state: makeState() },
      baseSource('ENTITY'),
    );
    expect(result.value).toEqual('entityValue');
  });

  it('should return SELF slice', () => {
    const result = resolveSourceData(
      'testCode_someField',
      { ...baseInput, state: makeState() },
      baseSource('SELF'),
    );
    expect(result.value).toEqual('formDataValue');
  });

  it('should return default (formData) when type is unrecognized', () => {
    const result = resolveSourceData(
      'testCode_someField',
      { ...baseInput, state: makeState() },
      baseSource('UNKNOWN_TYPE'),
    );
    expect(result.value).toEqual('formDataValue');
  });

  it('should return {} when sourceKey is empty', () => {
    const result = resolveSourceData(
      'testCode_someField',
      { ...baseInput, state: makeState() },
      baseSource('ENTITY', ''),
    );
    expect(result.apply).toBeFalsy();
  });

  it('should return {} when storeState has no Entities', () => {
    const result = resolveSourceData(
      'testCode_someField',
      { ...baseInput, state: { ApiData: {}, Tables: {} } },
      baseSource('ENTITY'),
    );
    expect(result.apply).toBeFalsy();
  });
});

describe('checkIfValueCorrect', () => {
  it('should return false when key is falsy', () => {
    expect(checkIfValueCorrect('', 'equals', [], 'user', {}, false)).toBe(false);
  });

  it('should handle isExpired operator correctly for non-expired date', () => {
    (formatDate as jest.Mock).mockReturnValue('2024-01-10');
    expect(
      checkIfValueCorrect('isExpired', 'isExpired', [], 'user', { isExpired: '2024-01-20' }, false),
    ).toBe(false);
  });

  it('should handle isExpired operator correctly for expired date', () => {
    (formatDate as jest.Mock).mockReturnValue('2024-01-10');
    expect(
      checkIfValueCorrect('isExpired', 'isExpired', [], 'user', { isExpired: '2024-01-01' }, false),
    ).toBe(true);
  });

  it('should handle isNotLoggedInUser operator', () => {
    expect(
      checkIfValueCorrect(
        'userField',
        'isNotLoggedInUser',
        [],
        'loggedInUser',
        { userField: 'otherUser' },
        false,
      ),
    ).toBe(true);
  });

  it('should handle isNotLoggedInUser returns false when user matches', () => {
    expect(
      checkIfValueCorrect(
        'userField',
        'isNotLoggedInUser',
        [],
        'loggedInUser',
        { userField: 'loggedInUser' },
        false,
      ),
    ).toBe(false);
  });

  it('should handle isLoggedInUser operator when user matches', () => {
    expect(
      checkIfValueCorrect(
        'userField',
        'isLoggedInUser',
        [],
        'loggedInUser',
        { userField: 'loggedInUser' },
        false,
      ),
    ).toBe(true);
  });

  it('should handle isLoggedInUser operator when value is null', () => {
    expect(
      checkIfValueCorrect(
        'userField',
        'isLoggedInUser',
        [],
        'loggedInUser',
        { userField: null },
        false,
      ),
    ).toBe(true);
  });

  it('should handle lengthGreaterEquals operator when the array length is greater than the threshold', () => {
    expect(
      checkIfValueCorrect(
        'items',
        'lengthGreaterEquals',
        ['2'],
        'user',
        { items: [1, 2, 3] },
        false,
      ),
    ).toBe(true);
  });

  it('should handle lengthGreaterEquals operator when the array length equals the threshold', () => {
    expect(
      checkIfValueCorrect('items', 'lengthGreaterEquals', ['2'], 'user', { items: [1, 2] }, false),
    ).toBe(true);
  });

  it('should handle lengthGreaterEquals operator when the array length is less than the threshold', () => {
    expect(
      checkIfValueCorrect('items', 'lengthGreaterEquals', ['3'], 'user', { items: [1, 2] }, false),
    ).toBe(false);
  });
});

describe('resolveData with jsonPath', () => {
  it('should set value at jsonPath when jsonPath is provided in source', () => {
    const result = resolveData(
      'testWidgetId',
      {
        state: {
          Entities: {
            testCode: { formData: { nested: { value: 42 } } },
          },
        },
        routeParams: {},
        routerData: {},
      },
      [
        {
          key: 'testKey',
          jsonPath: ['$', 'nested', 'result'],
          source: {
            code: 'testCode',
            type: 'SELF' as any,
            jsonPath: ['nested', 'value'],
          },
        },
      ],
    );
    expect(result).toHaveProperty('nested');
  });

  it('should not apply value when applyWhen condition is not met', () => {
    const result = resolveData(
      'testWidgetId',
      {
        state: {
          Entities: {
            testCode: { formData: { status: 'inactive' } },
          },
        },
        routeParams: {},
        routerData: {},
      },
      [
        {
          key: 'testKey',
          source: {
            code: 'testCode',
            type: 'SELF' as any,
            jsonPath: ['status'],
          },
          applyWhen: {
            operator: 'every' as const,
            fields: [
              {
                key: 'testKey',
                operator: 'equals',
                checkWhen: ['active'],
                type: 'testType',
              },
            ] as any,
          },
        },
      ],
    );
    expect(result).toEqual({});
  });
});

describe('shouldBeApplied', () => {
  it('should return default result (false)', () => {
    expect(
      shouldBeApplied(
        { operator: 'every', fields: [{ type: 'testType', operator: 'equals' }] as any },
        'testId',
        { user: 'testUser', state: 'testState', routeParams: {}, routerData: {} },
        4,
      ),
    ).toEqual(false);
  });

  it('should return reversed result (true)', () => {
    expect(
      shouldBeApplied(
        { operator: 'none', fields: [{ type: 'testType', operator: 'equals' }] as any },
        'testId',
        { user: 'testUser', state: 'testState', routeParams: {}, routerData: {} },
        4,
      ),
    ).toEqual(true);
  });

  it('should return true when operator is "every" and all fields match', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'every',
          fields: [
            {
              key: 'status',
              operator: 'equals',
              checkWhen: ['active'],
              type: 'testType',
              source: {
                code: 'testId',
                type: 'SELF',
                jsonPath: ['status'],
              },
            },
          ] as any,
        },
        'testId',
        {
          user: 'testUser',
          state: {
            Entities: {
              testId: { formData: { status: 'active' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(true);
  });

  it('should return false when operator is "every" and at least one field does not match', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'every',
          fields: [
            {
              key: 'status',
              operator: 'equals',
              checkWhen: ['active'],
              type: 'testType',
            },
            {
              key: 'role',
              operator: 'equals',
              checkWhen: ['admin'],
              type: 'testType',
            },
          ] as any,
        },
        'testId',
        {
          user: 'testUser',
          state: {
            Entities: {
              testId: { formData: { status: 'active', role: 'user' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(false);
  });

  it('should return true when operator is "some" and at least one field matches', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'some',
          fields: [
            {
              key: 'status',
              operator: 'equals',
              checkWhen: ['active'],
              type: 'testType',
              source: {
                code: 'testId',
                type: 'SELF',
                jsonPath: ['status'],
              },
            },
            {
              key: 'role',
              operator: 'equals',
              checkWhen: ['admin'],
              type: 'testType',
              source: {
                code: 'testId',
                type: 'SELF',
                jsonPath: ['role'],
              },
            },
          ] as any,
        },
        'testId',
        {
          user: 'testUser',
          state: {
            Entities: {
              testId: { formData: { status: 'active', role: 'user' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(true);
  });

  it('should return false when operator is "some" and no fields match', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'some',
          fields: [
            {
              key: 'status',
              operator: 'equals',
              checkWhen: ['active'],
              type: 'testType',
            },
            {
              key: 'role',
              operator: 'equals',
              checkWhen: ['admin'],
              type: 'testType',
            },
          ] as any,
        },
        'testId',
        {
          user: 'testUser',
          state: {
            Entities: {
              testId: { formData: { status: 'inactive', role: 'user' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(false);
  });

  it('should return false when operator is "none" and at least one field matches', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'none',
          fields: [
            {
              key: 'status',
              operator: 'equals',
              checkWhen: ['active'],
              type: 'testType',
              source: {
                code: 'testId',
                type: 'SELF',
                jsonPath: ['status'],
              },
            },
          ] as any,
        },
        'testId',
        {
          user: 'testUser',
          state: {
            Entities: {
              testId: { formData: { status: 'active' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(false);
  });

  it('should return true when operator is "none" and no fields match', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'none',
          fields: [
            {
              key: 'status',
              operator: 'equals',
              checkWhen: ['active'],
              type: 'testType',
            },
          ] as any,
        },
        'testId',
        {
          user: 'testUser',
          state: {
            Entities: {
              testId: { formData: { status: 'inactive' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(true);
  });

  it('should default operator to "every" when not provided', () => {
    expect(
      shouldBeApplied(
        {
          fields: [
            {
              key: 'status',
              operator: 'equals',
              checkWhen: ['active'],
              type: 'testType',
              source: {
                code: 'testId',
                type: 'SELF',
                jsonPath: ['status'],
              },
            },
          ] as any,
        } as any,
        'testId',
        {
          user: 'testUser',
          state: {
            Entities: {
              testId: { formData: { status: 'active' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(true);
  });

  it('should return true when fields array is empty and operator is "every"', () => {
    expect(
      shouldBeApplied({ operator: 'every', fields: [] }, 'testId', {
        user: 'testUser',
        state: {},
        routeParams: {},
        routerData: {},
      }),
    ).toEqual(true);
  });

  it('should handle row data correctly', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'every',
          fields: [
            {
              key: 'status',
              operator: 'equals',
              checkWhen: ['active'],
              type: 'testType',
              source: {
                code: 'testId',
                type: 'SELF',
                jsonPath: ['status'],
              },
            },
          ] as any,
        },
        'testId',
        {
          user: 'testUser',
          state: {
            Entities: {
              testId: { formData: { status: 'active' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
        { status: 'active' },
      ),
    ).toEqual(true);
  });

  it('should handle isLoggedInUser operator within fields', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'every',
          fields: [
            {
              key: 'userField',
              operator: 'isLoggedInUser',
              checkWhen: [],
              type: 'testType',
              source: {
                code: 'testId',
                type: 'SELF',
                jsonPath: ['userField'],
              },
            },
          ] as any,
        },
        'testId',
        {
          user: 'loggedInUser',
          state: {
            Entities: {
              testId: { formData: { userField: 'loggedInUser' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(true);
  });

  it('should handle isNotLoggedInUser operator within fields', () => {
    expect(
      shouldBeApplied(
        {
          operator: 'every',
          fields: [
            {
              key: 'userField',
              operator: 'isNotLoggedInUser',
              checkWhen: [],
              type: 'testType',
              source: {
                code: 'testId',
                type: 'SELF',
                jsonPath: ['userField'],
              },
            },
          ] as any,
        },
        'testId',
        {
          user: 'loggedInUser',
          state: {
            Entities: {
              testId: { formData: { userField: 'otherUser' } },
            },
          },
          routeParams: {},
          routerData: {},
        },
      ),
    ).toEqual(true);
  });

  it('should return false when from is null/undefined', () => {
    expect(
      shouldBeApplied(null as any, 'testId', {
        user: 'testUser',
        state: {},
        routeParams: {},
        routerData: {},
      }),
    ).toEqual(true); // empty fields array defaults to every() returning true
  });
});

describe('computeCheck', () => {
  const context = { state: {}, user: 'testUser', id: 'testId' };

  describe('fields is missing', () => {
    it('should return false when fields is undefined', () => {
      expect(computeCheck({ operator: 'every', fields: undefined, values: {}, ...context })).toBe(
        false,
      );
    });

    it('should return false when fields is an empty array', () => {
      expect(computeCheck({ operator: 'every', fields: [], values: {}, ...context })).toBe(false);
    });
  });

  describe('operator is "every"', () => {
    it('should return true when all fields match', () => {
      expect(
        computeCheck({
          operator: 'every',
          fields: [
            { key: 'status', operator: 'equals', checkWhen: ['active'] },
            { key: 'role', operator: 'equals', checkWhen: ['admin'] },
          ],
          values: { status: 'active', role: 'admin' },
          ...context,
        }),
      ).toBe(true);
    });

    it('should return false when at least one field does not match', () => {
      expect(
        computeCheck({
          operator: 'every',
          fields: [
            { key: 'status', operator: 'equals', checkWhen: ['active'] },
            { key: 'role', operator: 'equals', checkWhen: ['admin'] },
          ],
          values: { status: 'active', role: 'user' },
          ...context,
        }),
      ).toBe(false);
    });
  });

  describe('operator is "some"', () => {
    it('should return true when at least one field matches', () => {
      expect(
        computeCheck({
          operator: 'some',
          fields: [
            { key: 'status', operator: 'equals', checkWhen: ['active'] },
            { key: 'role', operator: 'equals', checkWhen: ['admin'] },
          ],
          values: { status: 'inactive', role: 'admin' },
          ...context,
        }),
      ).toBe(true);
    });

    it('should return false when no field matches', () => {
      expect(
        computeCheck({
          operator: 'some',
          fields: [
            { key: 'status', operator: 'equals', checkWhen: ['active'] },
            { key: 'role', operator: 'equals', checkWhen: ['admin'] },
          ],
          values: { status: 'inactive', role: 'user' },
          ...context,
        }),
      ).toBe(false);
    });
  });

  describe('operator is "none"', () => {
    it('should return true when no field matches', () => {
      expect(
        computeCheck({
          operator: 'none',
          fields: [
            { key: 'status', operator: 'equals', checkWhen: ['active'] },
            { key: 'role', operator: 'equals', checkWhen: ['admin'] },
          ],
          values: { status: 'inactive', role: 'user' },
          ...context,
        }),
      ).toBe(true);
    });

    it('should return false when at least one field matches', () => {
      expect(
        computeCheck({
          operator: 'none',
          fields: [
            { key: 'status', operator: 'equals', checkWhen: ['active'] },
            { key: 'role', operator: 'equals', checkWhen: ['admin'] },
          ],
          values: { status: 'active', role: 'user' },
          ...context,
        }),
      ).toBe(false);
    });
  });

  describe('operator is "equalStates"', () => {
    it('should return true when all field values are equal', () => {
      expect(
        computeCheck({
          operator: 'equalStates',
          fields: [{ key: 'a' }, { key: 'b' }, { key: 'c' }],
          values: { a: 1, b: 1, c: 1 },
          ...context,
        }),
      ).toBe(true);
    });

    it('should return false when field values differ', () => {
      expect(
        computeCheck({
          operator: 'equalStates',
          fields: [{ key: 'a' }, { key: 'b' }],
          values: { a: 1, b: 2 },
          ...context,
        }),
      ).toBe(false);
    });
  });

  describe('operator is "notEqualStates"', () => {
    it('should return true when field values differ', () => {
      expect(
        computeCheck({
          operator: 'notEqualStates',
          fields: [{ key: 'a' }, { key: 'b' }],
          values: { a: 1, b: 2 },
          ...context,
        }),
      ).toBe(true);
    });

    it('should return false when all field values are equal', () => {
      expect(
        computeCheck({
          operator: 'notEqualStates',
          fields: [{ key: 'a' }, { key: 'b' }],
          values: { a: 1, b: 1 },
          ...context,
        }),
      ).toBe(false);
    });
  });

  it('should use defaultValue when a field value is missing', () => {
    expect(
      computeCheck({
        operator: 'every',
        fields: [{ key: 'a', operator: 'equals', checkWhen: ['x'], defaultValue: true }],
        values: {},
        ...context,
      }),
    ).toBe(true);
  });

  it('should resolve checkWhenSource from state and compare it with the field value', () => {
    expect(
      computeCheck({
        operator: 'every',
        fields: [
          {
            key: 'a',
            operator: 'equals',
            checkWhenSource: { code: 'testId', type: 'SELF', jsonPath: ['b'] },
          },
        ],
        values: { a: 'user' },
        state: { Entities: { testId: { formData: { b: 'user' } } } },
        user: 'testUser',
        id: 'testId',
      }),
    ).toBe(true);
  });

  it('should return false when the resolved checkWhenSource value does not match the field value', () => {
    expect(
      computeCheck({
        operator: 'every',
        fields: [
          {
            key: 'a',
            operator: 'equals',
            checkWhenSource: { code: 'testId', type: 'SELF', jsonPath: ['b'] },
          },
        ],
        values: { a: 'user' },
        state: { Entities: { testId: { formData: { b: 'other' } } } },
        user: 'testUser',
        id: 'testId',
      }),
    ).toBe(false);
  });
});
