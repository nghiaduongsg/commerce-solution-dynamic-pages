import { mockDataResolverShouldBeApplied } from '@_jestHelpers/dataResolverMock';
import {
  buildJsonPath,
  cleanId,
  clearData,
  extractRouteId,
  extractRoutePath,
  getActiveCriteriaCount,
  getCellContent,
  getCorrectColorConfiguration,
  getRelatedColumnValue,
  hasEmptyMandatoryFilters,
  resolveRouteInfo,
} from './tableRowUtils';
import { AnyType } from '@pkg-common/types';

describe('CodeList selectors', () => {
  const rowData = {
    DATA1: 'DATA_VALUE1',
    DATA2: 'DATA_VALUE2',
    DATA3: 'INACTIVE',
    DATA4: true,
  } as AnyType;

  const column = {
    type: 'string',
    accessors: ['DATA1'],
    fallbackAccessors: ['DATA2'],
  } as AnyType;

  const columnWithoutDefaultAccessor = {
    type: 'string',
    accessors: ['DATA1'],
  } as AnyType;

  const columnStringAsBoolean = {
    type: 'boolean',
    accessors: ['DATA3'],
  } as AnyType;

  const columnBoolean = {
    type: 'boolean',
    accessors: ['DATA4'],
  } as AnyType;

  const selectedLanguage = 'EN';
  const namespaces = ['parties'];
  const translateFn = (str) => str;

  it('getCellContent with accessors', () => {
    const expected = 'DATA_VALUE1';
    expect(getCellContent(rowData, column, selectedLanguage, translateFn, namespaces)).toEqual(
      expected,
    );
  });

  it('getCellContent with fallbackAccessors', () => {
    const expected = 'DATA_VALUE2';
    expect(
      getCellContent(rowData, column, selectedLanguage, translateFn, namespaces, true),
    ).toEqual(expected);
  });

  it('getCellContent with undefined defaultAccessors', () => {
    const expected = 'DATA_VALUE1';
    expect(
      getCellContent(
        rowData,
        columnWithoutDefaultAccessor,
        selectedLanguage,
        translateFn,
        namespaces,
        true,
      ),
    ).toEqual(expected);
  });

  it('getCellContent of boolean column and value = true', () => {
    const expected = 'true';
    expect(
      getCellContent(rowData, columnBoolean, selectedLanguage, translateFn, namespaces, true),
    ).toEqual(expected);
  });

  it('getCellContent of boolean column and value = INACTIVE', () => {
    const expected = 'false';
    expect(
      getCellContent(
        rowData,
        columnStringAsBoolean,
        selectedLanguage,
        translateFn,
        namespaces,
        true,
      ),
    ).toEqual(expected);
  });

  it('getCellContent with filterByUserLanguage and value = INACTIVE', () => {
    const expected = 'INACTIVE';
    expect(
      getCellContent(
        rowData,
        { ...columnStringAsBoolean, filterByUserLanguage: true },
        selectedLanguage,
        translateFn,
        namespaces,
        true,
      ),
    ).toEqual(expected);
  });

  it('getCellContent of type = object', () => {
    const rowData = { rowData: { row: 1, id: 1 } };
    expect(
      getCellContent(
        rowData,
        { accessors: ['DATA5'], type: 'object', name: '', align: 'left', visible: true },
        selectedLanguage,
        translateFn,
        namespaces,
        true,
      ),
    ).toEqual(rowData);
  });

  it('getCellContent with [*] in accessors and type boolean', () => {
    const rowData = { test: { inner: 'value' } };
    expect(
      getCellContent(
        rowData,
        { accessors: ['*'], type: 'boolean', name: '', align: 'left', visible: true },
        selectedLanguage,
        translateFn,
        namespaces,
        true,
      ),
    ).toEqual('true');
  });

  it('getCellContent with parameters and type placeholder', () => {
    const rowData = { parameters: "{'parameters': 'test'}", translatedMessage: 'message' };
    expect(
      getCellContent(
        rowData,
        {
          accessors: ['translatedMessage'],
          type: 'placeholder',
          name: '',
          align: 'left',
          visible: true,
        },
        selectedLanguage,
        translateFn,
        namespaces,
        true,
      ),
    ).toEqual('message');
  });

  it('getCellContent with populatedBy', () => {
    const rowData = { a: 'A', b: { test1: 'Test 1', test2: 'Test 2' } };
    expect(
      getCellContent(
        rowData,
        {
          accessors: [],
          populatedBy: ['a', 'b.test2'],
          type: 'placeholder',
          name: '',
          align: 'left',
          visible: true,
        },
        selectedLanguage,
        translateFn,
        namespaces,
        true,
      ),
    ).toEqual('A Test 2');
  });
});
describe('extractRoutePath', () => {
  it('should return undefined when pathToRoute is undefined', () => {
    const row = {};

    const result = extractRoutePath(undefined, row);

    expect(result).toBeUndefined();
  });

  it('should return route path', () => {
    const pathToRoute = ['route', 'id'];

    const row = {
      route: {
        id: 'route/123',
      },
    };

    const result = extractRoutePath(pathToRoute, row);
    expect(result).toBe('route/123');
  });
});
describe('extractRouteId', () => {
  it('should return undefined when pathParam is undefined', () => {
    const result = extractRouteId(undefined, {});

    expect(result).toBeUndefined();
  });

  it('should return undefined when pathParam is an empty array', () => {
    const result = extractRouteId([], {});

    expect(result).toBeUndefined();
  });

  it('should return value when pathParam has length', () => {
    const pathParam = ['route', 'id'];
    const row = {
      route: {
        id: '423',
      },
    };
    const result = extractRouteId(pathParam, row);

    expect(result).toBe('423');
  });
});
describe('getRelatedColumnValue', () => {
  it('should return row column relatedColumn is a string', () => {
    const row = { testColumn: 'value' };
    const column = {
      relatedColumn: 'testColumn',
    };
    expect(
      //@ts-ignore
      getRelatedColumnValue(row, column),
    ).toEqual('value');
  });
  it('should return undefined when there is no relatedColumn', () => {
    const row = { testColumn: 'value' };
    const column = undefined;
    expect(
      //@ts-ignore
      getRelatedColumnValue(row, column),
    ).toEqual(undefined);
  });

  it('should return undefined when relatedColumn is neither object nor string', () => {
    const row = { testColumn: 'value' };
    const column = {
      relatedColumn: 123,
    };

    expect(
      // @ts-ignore
      getRelatedColumnValue(row, column),
    ).toBeUndefined();
  });

  it('should return a stringified value when relatedColumn is an object', () => {
    const row = { testColumn: 'value' };
    const column = {
      relatedColumn: { test1: 'value1', test2: 'value2' },
    };
    expect(
      //@ts-ignore
      getRelatedColumnValue(row, column),
    ).toEqual(undefined);
  });
});
describe('buildJsonPath', () => {
  it('should return root path when no segments are provided', () => {
    const result = buildJsonPath([]);

    expect(result).toBe('$');
  });

  it('should build a simple dot-separated json path', () => {
    const result = buildJsonPath(['user', 'id']);

    expect(result).toBe('$.user.id');
  });

  it('should handle wildcard segments', () => {
    const result = buildJsonPath(['users', '*', 'id']);

    expect(result).toBe('$.users[*].id');
  });

  it('should handle a single wildcard segment', () => {
    const result = buildJsonPath(['*']);

    expect(result).toBe('$[*]');
  });

  it('should handle mixed normal and wildcard segments', () => {
    const result = buildJsonPath(['a', '*', 'b', '*']);

    expect(result).toBe('$.a[*].b[*]');
  });
});
describe('cleanId', () => {
  it('should remove leading "undefined_"', () => {
    expect(cleanId('undefined_abc')).toBe('abc');
  });

  it('should remove numeric segments surrounded by underscores', () => {
    expect(cleanId('abc_123_def')).toBe('abc_def');
  });

  it('should handle string with both rules applied', () => {
    expect(cleanId('undefined_abc_123_def')).toBe('abc_def');
  });
});
describe('hasEmptyMandatoryFilters', () => {
  it('should return true as "b" is a missing mandatory filter', () => {
    const requiredFilters = ['a', 'b'];
    const data = { a: 1 };

    const result = hasEmptyMandatoryFilters(requiredFilters, data);

    expect(result).toBe(true);
  });

  it('should return false when all required filters are present', () => {
    const requiredFilters = ['a', 'b'];
    const data = { a: 1, b: 2 };

    const result = hasEmptyMandatoryFilters(requiredFilters, data);

    expect(result).toBe(false);
  });

  it('should return true when param requiredFilters is an empyy array', () => {
    const requiredFilters = [];
    const data = { a: 1 };

    const result = hasEmptyMandatoryFilters(requiredFilters, data);

    expect(result).toBe(false);
  });
});
describe('clearData', () => {
  it('should return a cloned object and does not mutate original', () => {
    const initialData = { key: 'value' };
    const result = clearData(initialData, []);

    expect(result).toStrictEqual(initialData);
  });

  it('should return nothing if paths is not array or object', () => {
    const initialData = { key: 'val' };

    //@ts-ignore
    const result = clearData(initialData, undefined);
    expect(result).toEqual(initialData);
  });

  it('should return valid prop path entry', () => {
    const initialData = { data: { key: 'value' } };
    const paths = [{ jsonPath: ['data', 'key'], value: 'test' }];

    expect(clearData(initialData, paths)).toStrictEqual({ data: { key: 'test' } });
  });

  it('should exit loop if jsonPath is missing from the paths param', () => {
    const initialData = { test: 'value' };
    const paths = [{ key: 'value' }];

    //@ts-ignore
    expect(clearData(initialData, paths)).not.toHaveProperty('jsonPath');
    //@ts-ignore
    expect(clearData(initialData, paths)).toHaveProperty('test');
  });
});
describe('resolveRouteInfo', () => {
  const actions = {
    edit: 'edit',
    read: 'read',
    redirect: 'redirect',
    duplicate: 'duplicate',
  };

  const baseArgs = {
    entityId: '123',
    entityUrl: '/entity',
    action: 'edit' as const,
    actionDetails: undefined,
    row: {},
  };

  it('should return return route based on entityId when no actionDetails', () => {
    const result = resolveRouteInfo(baseArgs);

    expect(result).toEqual({
      routePath: '/entity/123',
      routeState: {},
    });
  });

  it('should return exacRoutePath and exactRouteID when actionDetails exist', () => {
    const args = {
      ...baseArgs,
      entityUrl: '/entity/path',
      actionDetails: {
        [actions.edit]: { jsonPath: [], pathParam: [] },
      },
    };

    const result = resolveRouteInfo(args);

    expect(result).toStrictEqual({
      routePath: '/entity/path/123',
      routeState: {},
    });
  });

  it('should return just entityId as there is no entityUrl and no routePath', () => {
    const args = {
      ...baseArgs,
      entityUrl: null,
    };
    const result = resolveRouteInfo(args);

    expect(result.routePath).toBe('/123');
  });

  it('returns duplicate route state when action is duplicate', () => {
    const args = {
      ...baseArgs,
      entityUrl: '/entity/path',
      action: 'duplicate',
      actionDetails: {
        [actions.duplicate]: { jsonPath: [], pathParam: [] },
      },
    };

    //@ts-ignore
    const result = resolveRouteInfo(args);

    expect(result).toStrictEqual({
      routePath: '/entity/path',
      routeState: { id: '123' },
    });
  });
});

describe('getCorrectColorConfiguration', () => {
  it('should return colors', () => {
    mockDataResolverShouldBeApplied([true, true, true]);
    const colors = [
      {
        color: 'red',
        icon: 'Description',
        border: true,
        iconStyles: {
          color: 'grey',
        },
        title: 'Amendment',
      },
    ];

    const extraData = {
      user: 'userId',
      state: {},
      routeParams: { id: '123' },
      routerData: {},
    };

    //@ts-ignore
    expect(getCorrectColorConfiguration('tableId', {}, extraData, colors)).toStrictEqual(colors[0]);
  });
});

describe('getActiveCriteriaCount', () => {
  it('should return 0 when criteria is null', () => {
    expect(getActiveCriteriaCount(null)).toBe(0);
  });

  it('should return 0 when criteria is undefined', () => {
    expect(getActiveCriteriaCount(undefined)).toBe(0);
  });

  it('should return 0 when criteria is empty object', () => {
    expect(getActiveCriteriaCount({})).toBe(0);
  });

  it('should return 1 for single string criterion', () => {
    expect(getActiveCriteriaCount({ name: 'John' })).toBe(1);
  });

  it('should return 2 for two string criteria', () => {
    expect(getActiveCriteriaCount({ name: 'John', age: '30' })).toBe(2);
  });

  it('should ignore null and undefined criteria', () => {
    expect(getActiveCriteriaCount({ name: 'John', age: null, email: undefined })).toBe(1);
  });

  it('should count 1 for object criterion with identificationLabel', () => {
    expect(
      getActiveCriteriaCount({
        party: { identificationLabel: 'Party Label', id: 1 },
      }),
    ).toBe(1);
  });

  it('should count properties in object criterion without identificationLabel', () => {
    expect(
      getActiveCriteriaCount({
        party: { id: 1, name: 'Test' },
      }),
    ).toBe(2);
  });

  it('should ignore empty properties in object criterion', () => {
    expect(
      getActiveCriteriaCount({
        party: { id: 1, name: '', description: undefined },
      }),
    ).toBe(1);
  });

  it('should count 1 for array with single string item', () => {
    expect(getActiveCriteriaCount({ items: ['value1'] })).toBe(1);
  });

  it('should count items in array with multiple values', () => {
    expect(getActiveCriteriaCount({ items: ['value1', 'value2', 'value3'] })).toBe(3);
  });

  it('should count 1 for array item with identificationLabel', () => {
    expect(
      getActiveCriteriaCount({
        items: [{ identificationLabel: 'Label', id: 1 }],
      }),
    ).toBe(1);
  });

  it('should count properties for array item without identificationLabel', () => {
    expect(
      getActiveCriteriaCount({
        items: [{ id: 1, name: 'Test' }],
      }),
    ).toBe(2);
  });

  it('should handle mixed array with multiple items', () => {
    expect(
      getActiveCriteriaCount({
        items: [
          { identificationLabel: 'Label 1', id: 1 },
          { id: 2, name: 'Test', description: 'Desc' },
          'simple_value',
        ],
      }),
    ).toBe(5);
  });

  it('should count complex criteria with multiple types', () => {
    expect(
      getActiveCriteriaCount({
        name: 'John',
        age: '30',
        party: { identificationLabel: 'Party Label', id: 1 },
        items: ['value1', 'value2'],
      }),
    ).toBe(5);
  });

  it('should ignore falsy values in criteria', () => {
    expect(
      getActiveCriteriaCount({
        name: 'John',
        empty: '',
        zero: 0,
        false: false,
        null_val: null,
        undefined_val: undefined,
      }),
    ).toBe(1);
  });
});
