import { mockMultipleFormDataHookWithManyCalls } from '../../../_jestHelpers/useMultipleFormDataMock';
import { renderHook } from '@testing-library/react';
import useDynamicApi from './useDynamicApi';
import { ApiValuesSchema } from '../types.d';
import useAlternateUrl from './useAlternateUrl';

jest.mock('./useAlternateUrl');

describe('useDynamicApi', () => {
  const mockUseAlternateUrl = useAlternateUrl as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseAlternateUrl.mockReturnValue(undefined);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('replacements are defined', () => {
    mockMultipleFormDataHookWithManyCalls([
      { '{pathParam1}': 'value1', '{pathParam2}': 'value2' },
      {},
      {},
    ]);

    const apiValues = {
      url: 'some/api/{pathParam1}/results/{pathParam2}',
      codeList: 'CODE',
      resourceId: 'CODE',
      replacements: [
        {
          key: '{pathParam1}',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['a'],
          },
        },
        {
          key: '{pathParam2}',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['b'],
          },
        },
      ],
    };

    const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
    const { url, codeList, queryParams, data } = result.current;

    expect(url).toEqual('some/api/value1/results/value2');
    expect(codeList).toEqual('CODE|{"{pathParam1}":"value1","{pathParam2}":"value2"}');
    expect(queryParams).toEqual({});
    expect(data).toEqual({});
  });

  it('replacements and query params are defined', () => {
    mockMultipleFormDataHookWithManyCalls([
      { '{pathParam1}': 'value1', '{pathParam2}': 'value2' },
      { queryParam1: 'value3', queryParam2: 'value4' },
      {},
    ]);

    const apiValues = {
      url: 'some/api/{pathParam1}/results/{pathParam2}',
      codeList: 'CODE',
      resourceId: 'CODE',
      replacements: [
        {
          key: '{pathParam1}',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['a'],
          },
        },
        {
          key: '{pathParam2}',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['b'],
          },
        },
      ],
      queryFrom: [
        {
          key: 'queryParam1',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['c'],
          },
        },
        {
          key: 'queryParam2',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['d'],
          },
        },
      ],
    };

    const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
    const { url, codeList, queryParams, data } = result.current;

    expect(url).toEqual('some/api/value1/results/value2');
    expect(codeList).toEqual(
      'CODE|{"queryParam1":"value3","queryParam2":"value4","{pathParam1}":"value1","{pathParam2}":"value2"}',
    );
    expect(queryParams).toEqual({ queryParam1: 'value3', queryParam2: 'value4' });
    expect(data).toEqual({});
  });

  it('replacements, query params and hardcoded query params are defined', () => {
    mockMultipleFormDataHookWithManyCalls([
      { '{pathParam1}': 'value1', '{pathParam2}': 'value2' },
      { queryParam1: 'value3', queryParam2: 'value4' },
      {},
    ]);

    const apiValues = {
      url: 'some/api/{pathParam1}/results/{pathParam2}?another=hardcoded',
      codeList: 'CODE',
      resourceId: 'CODE',
      replacements: [
        {
          key: '{pathParam1}',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['a'],
          },
        },
        {
          key: '{pathParam2}',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['b'],
          },
        },
      ],
      queryFrom: [
        {
          key: 'queryParam1',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['c'],
          },
        },
        {
          key: 'queryParam2',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['d'],
          },
        },
      ],
    };

    const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
    const { url, codeList, queryParams, data } = result.current;

    expect(url).toEqual('some/api/value1/results/value2?another=hardcoded');
    expect(codeList).toEqual(
      'CODE|{"queryParam1":"value3","queryParam2":"value4","{pathParam1}":"value1","{pathParam2}":"value2","another":"hardcoded"}',
    );
    expect(queryParams).toEqual({ queryParam1: 'value3', queryParam2: 'value4' });
    expect(data).toEqual({});
  });

  it('replacements, data, query params and hardcoded query params are defined', () => {
    mockMultipleFormDataHookWithManyCalls([
      { '{pathParam1}': 'value1', '{pathParam2}': 'value2' },
      { queryParam1: 'value3', queryParam2: 'value4' },
      { data1: 'value5', data2: 'value6' },
    ]);

    const apiValues = {
      url: 'some/api/{pathParam1}/results/{pathParam2}?another=hardcoded',
      codeList: 'CODE',
      method: 'post',
      replacements: [
        {
          key: '{pathParam1}',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['a'],
          },
        },
        {
          key: '{pathParam2}',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['b'],
          },
        },
      ],
      queryFrom: [
        {
          key: 'queryParam1',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['c'],
          },
        },
        {
          key: 'queryParam2',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['d'],
          },
        },
      ],
      dataFrom: [
        {
          key: 'data1',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['e'],
          },
        },
        {
          key: 'data2',
          source: {
            code: 'ENTITY_CODE',
            jsonPath: ['f'],
          },
        },
      ],
    } as ApiValuesSchema;

    const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
    const { url, codeList, queryParams, data } = result.current;

    expect(url).toEqual('some/api/value1/results/value2?another=hardcoded');
    expect(codeList).toEqual(
      'CODE|{"queryParam1":"value3","queryParam2":"value4","{pathParam1}":"value1","{pathParam2}":"value2","another":"hardcoded"}',
    );
    expect(queryParams).toEqual({ queryParam1: 'value3', queryParam2: 'value4' });
    expect(data).toEqual({ data1: 'value5', data2: 'value6' });
  });

  describe('useDynamicApi - dataValuesReady', () => {
    const apiValues = {
      url: 'some/api',
      codeList: 'CODE',
      method: 'post',
      dataFrom: [
        {
          key: 'retentionPeriod',
          source: {
            type: 'STORE',
            code: 'CodeList',
            jsonPath: [
              'lists',
              'SYSTEM_PARAMETERS',
              "?(@.code=='DAYS_RETENTION_PERIOD_READ_NOTIFICATION')",
              'attributes',
              '0',
              'value',
            ],
          },
        },
        {
          key: 'notificationTypeCD',
          isOptional: true,
          source: {
            type: 'FILTERS',
            code: 'Notification',
            jsonPath: ['notificationTypeCD'],
          },
        },
      ],
    } as ApiValuesSchema;

    it('should set dataValuesReady to true if all mandatory fields have values', () => {
      const dataValues = {
        retentionPeriod: 'value1',
        notificationTypeCD: 'value2',
      };

      mockMultipleFormDataHookWithManyCalls([undefined, undefined, dataValues]);

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
      expect(result.current.dataValuesReady).toBe(true);
    });

    it('should set dataValuesReady to false if any mandatory field is missing a value', () => {
      const dataValues = {
        notificationTypeCD: 'value2',
      };

      mockMultipleFormDataHookWithManyCalls([undefined, undefined, dataValues]);

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
      expect(result.current.dataValuesReady).toBe(false);
    });

    it('should set dataValuesReady to true if any optional field is missing a value', () => {
      const dataValues = {
        retentionPeriod: '1',
        notificationTypeCD: null,
      };

      mockMultipleFormDataHookWithManyCalls([undefined, undefined, dataValues]);

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
      expect(result.current.dataValuesReady).toBe(true);
    });

    it('should set dataValuesReady to false if both optional and mandatory fields are missing their values', () => {
      const dataValues = {};

      mockMultipleFormDataHookWithManyCalls([undefined, undefined, dataValues]);

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
      expect(result.current.dataValuesReady).toBe(false);
    });
  });

  it('apiValues is not defined', () => {
    const { result } = renderHook(() => useDynamicApi('widgetId'));
    const { url, codeList, queryParams, data } = result.current;

    expect(url).toEqual(undefined);
    expect(codeList).toEqual('');
    expect(queryParams).toEqual({});
    expect(data).toEqual(undefined);
  });

  it('url has no replacements and no query parameters', () => {
    const apiValues = {
      url: 'some/api',
      codeList: 'CODE',
    };

    const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
    const { url, codeList, queryParams, data } = result.current;

    expect(url).toEqual('some/api');
    expect(codeList).toEqual('CODE');
    expect(queryParams).toEqual(undefined);
    expect(data).toEqual(undefined);
  });

  it('replacements, queryFrom, and dataFrom are empty arrays', () => {
    const apiValues = {
      url: 'some/api',
      codeList: 'CODE',
      replacements: [],
      queryFrom: [],
      dataFrom: [],
    };

    const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));
    const { url, codeList, queryParams, data } = result.current;

    expect(url).toEqual('some/api');
    expect(codeList).toEqual('CODE');
    expect(queryParams).toEqual(undefined);
    expect(data).toEqual(undefined);
  });

  describe('useDynamicApi - unifyData', () => {
    it('should not unify data when unifyData is set to false', () => {
      mockMultipleFormDataHookWithManyCalls([
        {},
        {},
        {
          scope: 'test',
          data: {
            prop1: 'a',
            prop2: 'b',
          },
        },
      ]);

      const apiValues = {
        url: 'some/api',
        codeList: 'CODE',
        unifyData: false,
        dataFrom: [
          {
            key: 'prop1',
            source: {
              code: 'data',
              jsonPath: ['prop1'],
            },
          },
          {
            key: 'prop2',
            source: {
              code: 'data',
              jsonPath: ['prop2'],
            },
          },
        ],
      };

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));

      const expectedUnifiedData = {
        scope: 'test',
        data: {
          prop1: 'a',
          prop2: 'b',
        },
      };

      expect(result.current.data).toStrictEqual(expectedUnifiedData);
    });

    it('should unify data when unifyData is set to true', () => {
      mockMultipleFormDataHookWithManyCalls([
        {},
        {},
        {
          scope: 'value3',
          data: {
            prop1: 'a',
            prop2: 'b',
          },
        },
      ]);

      const apiValues = {
        unifyData: true,
        url: 'case-management/cases',
        dataFrom: [
          {
            key: 'scope',
            source: {
              code: 'CaseScope',
              jsonPath: ['caseScopeLiability'],
            },
          },
          {
            key: 'prop1',
            source: {
              code: 'data',
              jsonPath: ['prop1'],
            },
          },
          {
            key: 'prop2',
            source: {
              code: 'data',
              jsonPath: ['prop2'],
            },
          },
        ],
      };

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));

      const expectedUnifiedData = {
        scope: 'value3',
        prop1: 'a',
        prop2: 'b',
      };

      expect(result.current.data).toEqual(expectedUnifiedData);
    });
  });

  describe('useDynamicApi - alternateUrls', () => {
    it('uses the alternate URL when its condition is true', () => {
      mockUseAlternateUrl.mockReturnValue({
        condition: {
          operator: 'every',
          fields: [],
        },
        url: 'api/alternate',
      });

      const apiValues: ApiValuesSchema = {
        url: 'api/primary',
        alternateUrls: [
          {
            condition: {
              operator: 'every',
              fields: [],
            },
            url: 'api/alternate',
          },
        ],
      };

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));

      expect(result.current.url).toBe('api/alternate');
    });

    it('uses the primary URL when the alternate condition is false', () => {
      mockUseAlternateUrl.mockReturnValue(undefined);

      const apiValues: ApiValuesSchema = {
        url: 'api/primary',
        alternateUrls: [
          {
            condition: {
              operator: 'every',
              fields: [],
            },
            url: 'api/alternate',
          },
        ],
      };

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));

      expect(result.current.url).toBe('api/primary');
    });

    it('resolves replacements defined only on the alternate URL', () => {
      mockUseAlternateUrl.mockReturnValue({
        condition: {
          operator: 'every',
          fields: [],
        },
        url: 'api/alternate/{id}/details/{detailId}',
        replacements: [
          {
            key: '{detailId}',
            source: { code: 'ENTITY', jsonPath: ['detailId'] },
          },
        ],
      });
      mockMultipleFormDataHookWithManyCalls([{ '{id}': '123', '{detailId}': '456' }, {}, {}]);

      const apiValues: ApiValuesSchema = {
        url: 'api/primary/{id}',
        replacements: [
          {
            key: '{id}',
            source: { code: 'ENTITY', jsonPath: ['id'] },
          },
        ],
        alternateUrls: [
          {
            condition: {
              operator: 'every',
              fields: [],
            },
            url: 'api/alternate/{id}/details/{detailId}',
            replacements: [
              {
                key: '{detailId}',
                source: { code: 'ENTITY', jsonPath: ['detailId'] },
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));

      expect(result.current.url).toBe('api/alternate/123/details/456');
    });

    it('ignores alternate replacements when primary url is used', () => {
      mockUseAlternateUrl.mockReturnValue(undefined);
      const multipleFormDataHookMock = mockMultipleFormDataHookWithManyCalls([
        { '{id}': '123' },
        {},
        {},
      ]);

      const apiValues: ApiValuesSchema = {
        url: 'api/primary/{id}',
        replacements: [
          {
            key: '{id}',
            source: { code: 'ENTITY', jsonPath: ['id'] },
          },
        ],
        alternateUrls: [
          {
            condition: {
              operator: 'every',
              fields: [],
            },
            url: 'api/alternate/{id}/details/{detailId}',
            replacements: [
              {
                key: '{detailId}',
                source: { code: 'ENTITY', jsonPath: ['detailId'] },
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));

      expect(result.current.url).toBe('api/primary/123');

      expect(multipleFormDataHookMock).toHaveBeenNthCalledWith(
        1,
        'widgetId',
        [
          expect.objectContaining({
            key: '{id}',
          }),
        ],
        false,
        undefined,
      );
    });

    it('alternate replacements with same key is prioritized', () => {
      mockUseAlternateUrl.mockReturnValue({
        condition: {
          operator: 'every',
          fields: [],
        },
        url: 'api/alternate/{id}/details',
        replacements: [
          {
            key: '{id}',
            source: { code: 'ENTITY', jsonPath: ['otherPath', 'id'] },
          },
        ],
      });
      const multipleFormDataHookMock = mockMultipleFormDataHookWithManyCalls([
        { '{id}': '123' },
        {},
        {},
      ]);

      const apiValues: ApiValuesSchema = {
        url: 'api/primary/{id}',
        replacements: [
          {
            key: '{id}',
            source: { code: 'ENTITY', jsonPath: ['id'] },
          },
        ],
        alternateUrls: [
          {
            condition: {
              operator: 'every',
              fields: [],
            },
            url: 'api/alternate/{id}/details',
            replacements: [
              {
                key: '{id}',
                source: { code: 'ENTITY', jsonPath: ['otherPath', 'id'] },
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useDynamicApi('widgetId', apiValues));

      expect(result.current.url).toBe('api/alternate/123/details');

      expect(multipleFormDataHookMock).toHaveBeenNthCalledWith(
        1,
        'widgetId',
        [
          {
            key: '{id}',
            source: {
              code: 'ENTITY',
              jsonPath: ['otherPath', 'id'],
            },
          },
        ],
        false,
        undefined,
      );
    });
  });
});
