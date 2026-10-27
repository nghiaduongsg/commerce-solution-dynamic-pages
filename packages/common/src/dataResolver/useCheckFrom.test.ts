import { renderHook } from '@testing-library/react';
import useCheckFrom from './useCheckFrom';
import { getMockWrapperAndStore } from '../../../_jestHelpers/reactMockStore';
import { mockMultipleFormDataHook } from '../../../_jestHelpers/useMultipleFormDataMock';
import { CheckFromSchema } from '../types.d';
import { mockDataResolver } from '@_jestHelpers/dataResolverMock';

describe('useCheckFrom', () => {
  const storeData = {
    LoggedInUser: {
      profile: {
        partyRoleId: 'the-best-user',
        id: 'the-best-user',
      },
    },
    System: {
      apiUrl: 'http://localhost:3001',
      useStaticSchemas: true,
    },
  };

  const { wrapper } = getMockWrapperAndStore(storeData);

  const fields = [
    {
      key: 'a',
      checkWhen: [3, 6],
      operator: 'greaterEquals',
      source: {
        code: 'EntityCode',
        jsonPath: ['a'],
      },
    },
    {
      key: 'b',
      checkWhen: [5, 9],
      operator: 'greater',
      source: {
        code: 'EntityCode',
        jsonPath: ['b'],
      },
    },
    {
      key: 'c',
      checkWhen: [2],
      operator: 'lowerEquals',
      source: {
        code: 'EntityCode',
        jsonPath: ['c'],
      },
    },
    {
      key: 'd',
      checkWhen: [20],
      operator: 'lower',
      source: {
        code: 'EntityCode',
        jsonPath: ['d'],
      },
    },
    {
      key: 'e',
      checkWhen: ['value-e', 'other-value-e'],
      source: {
        code: 'EntityCode',
        jsonPath: ['e'],
      },
    },
    {
      key: 'f',
      checkWhen: ['value-f', 'other-value-f'],
      operator: 'not',
      source: {
        code: 'EntityCode',
        jsonPath: ['f'],
      },
    },
    {
      key: 'g',
      operator: 'isNull',
      source: {
        code: 'EntityCode',
        jsonPath: ['g'],
      },
    },
    {
      key: 'h',
      operator: 'isUndefined',
      source: {
        code: 'EntityCode',
        jsonPath: ['h'],
      },
    },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('source is missing', () => {
    it('should return default value true', () => {
      mockMultipleFormDataHook({ a: 'a', b: 'b' });

      const { result } = renderHook(() => useCheckFrom('widgetId', undefined, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual({ a: 'a', b: 'b' });
    });

    it('should return default value false', () => {
      mockMultipleFormDataHook({ a: 'a', b: 'b' });

      const { result } = renderHook(() => useCheckFrom('widgetId', undefined, false), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual({ a: 'a', b: 'b' });
    });
  });

  describe('fields are missing from source', () => {
    const source = {
      operator: 'some',
      fields: [],
    } as CheckFromSchema;

    it('should return default value true', () => {
      mockMultipleFormDataHook({ a: 'a', b: 'b' });

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual({ a: 'a', b: 'b' });
    });

    it('should return default value false', () => {
      mockMultipleFormDataHook({ a: 'a', b: 'b' });

      const { result } = renderHook(() => useCheckFrom('widgetId', source, false), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual({ a: 'a', b: 'b' });
    });
  });

  describe('SOME of the conditions should be truthy (all inner operators used)', () => {
    const source = {
      operator: 'some',
      fields,
    } as CheckFromSchema;

    it('should return true if ALL conditions are realised', () => {
      const data = {
        a: 6,
        b: 10,
        c: 2,
        d: 15,
        e: 'value-e',
        f: 'something-else',
        g: null,
        h: undefined,
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual(data);
    });

    it('should return true if SOME conditions are realised', () => {
      const data = {
        a: 6,
        b: 10,
        c: 2,
        d: 30,
        e: 'value-e',
        f: 'something-else',
        g: 'not-null',
        h: undefined,
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual(data);
    });

    it('should return false if NO conditions are realised', () => {
      const data = {
        a: 3,
        b: 9,
        c: 3,
        d: 21,
        e: 'something-else',
        f: 'value-f',
        g: 'not-null',
        h: 'not-undefined',
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });
  });

  describe('EVERY of the conditions should be truthy (all inner operators used)', () => {
    const source = {
      operator: 'every',
      fields,
    } as CheckFromSchema;

    it('should return true if ALL conditions are realised', () => {
      const data = {
        a: 6,
        b: 10,
        c: 2,
        d: 15,
        e: 'value-e',
        f: 'something-else',
        g: null,
        h: undefined,
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual(data);
    });

    it('should return false if SOME conditions are realised', () => {
      const data = {
        a: 6,
        b: 10,
        c: 2,
        d: 30,
        e: 'value-e',
        f: 'something-else',
        g: 'not-null',
        h: undefined,
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });

    it('should return false if NO conditions are realised', () => {
      const data = {
        a: 3,
        b: 9,
        c: 3,
        d: 21,
        e: 'something-else',
        f: 'value-f',
        g: 'not-null',
        h: 'not-undefined',
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });
  });

  describe('NONE of the conditions should be truthy (all inner operators used)', () => {
    const source = {
      operator: 'none',
      fields,
    } as CheckFromSchema;

    it('should return false if ALL conditions are realised', () => {
      const data = {
        a: 6,
        b: 10,
        c: 2,
        d: 15,
        e: 'value-e',
        f: 'something-else',
        g: null,
        h: undefined,
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });

    it('should return false if SOME conditions are realised', () => {
      const data = {
        a: 6,
        b: 10,
        c: 2,
        d: 30,
        e: 'value-e',
        f: 'something-else',
        g: 'not-null',
        h: undefined,
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });

    it('should return true if NONE of the conditions are realised', () => {
      const data = {
        a: 3,
        b: 9,
        c: 3,
        d: 21,
        e: 'something-else',
        f: 'value-f',
        g: 'not-null',
        h: 'not-undefined',
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual(data);
    });
  });

  describe('Special cases with undefined values', () => {
    it('should return true because all values are undefined at at least one has defaultValue = true', () => {
      const source = {
        operator: 'some',
        fields: [
          {
            key: 'a',
            checkWhen: [3, 6],
            operator: 'greaterEquals',
            source: {
              code: 'EntityCode',
              jsonPath: ['a'],
            },
            defaultValue: true,
          },
          {
            key: 'b',
            checkWhen: ['value-b'],
            source: {
              code: 'EntityCode',
              jsonPath: ['b'],
            },
          },
        ],
      } as CheckFromSchema;

      const data = {
        a: undefined,
        b: undefined,
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual(data);
    });

    it('should return false because all values are undefined with no default values', () => {
      const source = {
        operator: 'some',
        fields: [
          {
            key: 'a',
            source: {
              code: 'EntityCode',
              jsonPath: ['a'],
            },
          },
        ],
      } as CheckFromSchema;

      const data = {
        a: undefined,
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });

    it('should return true because all values are defined with no default values', () => {
      const source = {
        operator: 'some',
        fields: [
          {
            key: 'a',
            source: {
              code: 'EntityCode',
              jsonPath: ['a'],
            },
          },
        ],
      } as CheckFromSchema;

      const data = {
        a: 'something',
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual(data);
    });

    it('should return false if no key is provided', () => {
      const source = {
        operator: 'some',
        fields: [
          {
            source: {
              code: 'EntityCode',
              jsonPath: ['a'],
            },
          },
        ],
      } as CheckFromSchema;

      const data = {
        a: 'something',
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });
  });

  describe('Special cases with logged in user', () => {
    const source = {
      fields: [
        {
          key: 'user',
          operator: 'isNotLoggedInUser',
          source: {
            code: 'EntityCode',
            jsonPath: ['user'],
          },
        },
      ],
    } as CheckFromSchema;

    it('should return false if value is the same as the logged in username', () => {
      const data = {
        user: 'the-best-user',
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });

    it('should return true if value is NOT the same as the logged in username', () => {
      const data = {
        user: 'another-user',
      };

      mockMultipleFormDataHook(data);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual(data);
    });
  });

  describe('Cases with checkWhenSource', () => {
    it('should return true because the source response is the same as checkWhenSource response', () => {
      const source = {
        operator: 'some',
        fields: [
          {
            key: 'a',
            checkWhenSource: {
              code: 'EntityCode',
              jsonPath: ['b'],
            },
            operator: 'greaterEquals',
            source: {
              code: 'EntityCode',
              jsonPath: ['a'],
            },
            defaultValue: true,
          },
        ],
      } as CheckFromSchema;

      const sameResponse = 'user';

      const data = {
        a: sameResponse,
      };

      mockMultipleFormDataHook(data);
      mockDataResolver(sameResponse);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeTruthy();
      expect(values).toEqual(data);
    });

    it('should return false because the source response is different from checkWhenSource response', () => {
      const source = {
        operator: 'some',
        fields: [
          {
            key: 'a',
            checkWhenSource: {
              code: 'EntityCode',
              jsonPath: ['b'],
            },
            operator: 'greaterEquals',
            source: {
              code: 'EntityCode',
              jsonPath: ['a'],
            },
            defaultValue: true,
          },
        ],
      } as CheckFromSchema;

      const response1 = 'user2';
      const response2 = 'user3';

      const data = {
        a: response1,
      };

      mockMultipleFormDataHook(data);
      mockDataResolver(response2);

      const { result } = renderHook(() => useCheckFrom('widgetId', source, true), { wrapper });
      const { check, values } = result.current;

      expect(check).toBeFalsy();
      expect(values).toEqual(data);
    });
  });
});
