import { mockAxios, mockAxiosError } from '@_jestHelpers/axiosMock';
import Axios from 'axios-observable';
import {
  LoadTable,
  LoadDynamicQueryTable,
  LoadTableSuccess,
  LoadTableError,
  SAVE_TABLE_ROW,
  SAVE_TABLE_ROW_SUCCESS,
  SAVE_TABLE_ROW_ERROR,
  SAVE_TABLE_DATA,
  SAVE_TABLE_DATA_SUCCESS,
  SAVE_TABLE_DATA_ERROR,
} from './actions';
import {
  loadTableEpic,
  loadDynamicQueryTableEpic,
  getFlatCriteria,
  saveTableRowEpic,
  saveTableDataEpic,
} from './epics';
import { mockDate } from '@_jestHelpers/dateMock';
import { AnyType } from '@pkg-common/types';
import { of } from 'rxjs';

const API_URL = 'https://localhost:3001';

jest.mock('@pkg-entity/utils/utils', () => ({
  unwrapEntityDataArea: jest.fn((data) => data),
  handlePayloadErrors: jest.fn(() => of()),
}));

describe('Table Epics', () => {
  const serviceResponse = {
    code: 'code',
    description: 'Imagine all the people',
    legalEntity: true,
    singleEffectiveState: true,
  } as AnyType;

  const store$ = {
    value: {
      Tables: {
        SOME_TABLE: {
          id: 'id',
          columns: [],
          pageData: [],
          selectedRowIds: {},
          loading: false,
          error: {},
          rowInstance: {},
          criteria: {},
          url: 'some-url',
          rowIdKey: 'rowIdKey',
          wrappedToFilter: 'myFilter',
          pagination: {
            requestedPageNumber: 0,
            requestedPageSize: 10,
          },
        },
      },
      System: {
        apiUrl: API_URL,
        useStaticSchemas: true,
      },
      Entities: {
        ENTITY_ID: {
          entityDataAreaKey: 'data',
          formData: { id: '1', name: 'Test' },
        },
      },
    },
  } as AnyType;

  const baseLoadTablePayload = {
    tableId: 'SOME_TABLE',
    url: 'some-url',
    criteria: {},
    page: 5,
    pageSize: 10,
    loadTimestamp: 1234,
  };

  const baseDynamicQueryPayload = {
    tableId: 'SOME_TABLE',
    url: 'some-url',
    page: 5,
    pageSize: 10,
    loadTimestamp: 1234,
  };

  const baseTableDataPayload = {
    tableId: 'SOME_TABLE',
    entityId: 'ENTITY_ID',
    url: 'api/table/save',
    data: { extra: 'data' },
  };

  const baseTableRowPayload = {
    tableId: 'SOME_TABLE',
    entityId: 'ENTITY_ID',
    url: 'api/entity/1',
    data: { id: '1', name: 'Updated' },
  };

  const DYNAMIC_URL = `${API_URL}/some-url`;

  const createLoadTableEpic = (payload = baseLoadTablePayload) =>
    loadTableEpic(of(LoadTable(payload)), store$);

  const createDynamicQueryEpic = (payload: AnyType) =>
    loadDynamicQueryTableEpic(of(LoadDynamicQueryTable(payload)), store$);

  const createSaveTableRowEpic = (payload = baseTableRowPayload) =>
    saveTableRowEpic(of({ type: SAVE_TABLE_ROW, payload }), store$);

  const createSaveTableDataEpic = (payload: AnyType, store = store$) =>
    saveTableDataEpic(of({ type: SAVE_TABLE_DATA, payload }), store);

  beforeEach(() => {
    mockDate(1234);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('loadTableEpic', () => {
    beforeEach(() => {
      mockAxios(serviceResponse, 'get');
    });

    it('should call Axios.get once', (done) => {
      createLoadTableEpic().subscribe(() => {
        expect(Axios.get).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should call Axios.get with the correct url and params', (done) => {
      createLoadTableEpic().subscribe(() => {
        expect(Axios.get).toHaveBeenCalledWith(`${API_URL}/some-url`, {
          params: { page: 5, size: 10 },
        });
        done();
      });
    });

    it('should return LoadTableSuccess action', (done) => {
      createLoadTableEpic().subscribe((result: AnyType) => {
        expect(result).toEqual(
          LoadTableSuccess({
            tableId: 'SOME_TABLE',
            data: serviceResponse,
            loadTimestamp: 1234,
            url: baseLoadTablePayload.url,
          }),
        );
        done();
      });
    });

    it('should return LoadTableSuccess action with sortBy from payload', (done) => {
      const payloadWithSort = { ...baseLoadTablePayload, sortBy: 'name:asc' };

      createLoadTableEpic(payloadWithSort).subscribe((result: AnyType) => {
        expect(result).toEqual(
          LoadTableSuccess({
            tableId: 'SOME_TABLE',
            data: serviceResponse,
            loadTimestamp: 1234,
            sortBy: 'name:asc',
            url: payloadWithSort.url,
          }),
        );
        done();
      });
    });

    it('should return LoadTableError action on failure', (done) => {
      const error: AnyType = { message: 'error', status: 400 };
      mockAxiosError(error, 'get');

      createLoadTableEpic().subscribe((result: AnyType) => {
        expect(result).toEqual(LoadTableError({ tableId: 'SOME_TABLE', error }));
        done();
      });
    });
  });

  describe('loadDynamicQueryTableEpic', () => {
    beforeEach(() => {
      mockAxios(serviceResponse, 'post');
    });

    it('should call Axios.post with the correct url, params and payload', (done) => {
      const payload = { ...baseDynamicQueryPayload, criteria: { test: '12345' } };

      createDynamicQueryEpic(payload).subscribe(() => {
        expect(Axios.post).toHaveBeenCalledWith(
          DYNAMIC_URL,
          { myFilter: { test: '12345' } },
          { params: { page: 5, size: 10, sort: undefined } },
        );
        done();
      });
    });

    it('should remove empty object values from criteria', (done) => {
      const payload = {
        ...baseDynamicQueryPayload,
        criteria: { test: '12345', toRemove: {} },
      };

      createDynamicQueryEpic(payload).subscribe(() => {
        expect(Axios.post).toHaveBeenCalledWith(
          DYNAMIC_URL,
          { myFilter: { test: '12345' } },
          { params: { page: 5, size: 10, sort: undefined } },
        );
        done();
      });
    });

    it('should keep empty string values in criteria', (done) => {
      const payload = {
        ...baseDynamicQueryPayload,
        criteria: { test: '12345', emptyString: '' },
      };

      createDynamicQueryEpic(payload).subscribe(() => {
        expect(Axios.post).toHaveBeenCalledWith(
          DYNAMIC_URL,
          { myFilter: { test: '12345', emptyString: '' } },
          { params: { page: 5, size: 10, sort: undefined } },
        );
        done();
      });
    });

    it('should return LoadTableError with empty message for non-400 errors', (done) => {
      const error: AnyType = { message: 'server error', status: 500 };
      mockAxiosError(error, 'post');

      const payload = { ...baseDynamicQueryPayload, criteria: {} };

      createDynamicQueryEpic(payload).subscribe((result: AnyType) => {
        expect(result).toEqual(
          LoadTableError({
            tableId: 'SOME_TABLE',
            error: { ...error, message: '' },
          }),
        );
        done();
      });
    });
  });

  describe('getFlatCriteria', () => {
    it('should replace __DOT__ in keys with "."', () => {
      const result = getFlatCriteria({ partyState__DOT__stateCL: 'ALIVE' });
      expect(result).toEqual({ 'partyState.stateCL': 'ALIVE' });
    });

    it('should flatten nested objects with flattenLeaves', () => {
      const criteria = {
        nested: {
          level1: { level2: 'value' },
          directValue: 'test',
        },
      };
      expect(getFlatCriteria(criteria)).toEqual({
        level2: 'value',
        directValue: 'test',
      });
    });

    it('should map array of objects to their ids only', () => {
      const criteria = {
        withId: [{ id: '1', name: 'Item 1' }],
        withBillId: [{ billId: '2', name: 'Item 2' }],
        withCode: [{ code: '3', name: 'Item 3' }],
        withValue: [{ value: '4', name: 'Item 4' }],
        withOther: [{ other: '5', name: 'Item 5' }],
      };
      expect(getFlatCriteria(criteria)).toEqual({
        withId: ['1'],
        withBillId: [undefined],
        withCode: [undefined],
        withValue: [undefined],
        withOther: [undefined],
      });
    });

    it('should not join revenueTypeCodes array when wrappedToFilter is provided', () => {
      const criteria = {
        revenueTypeCodes: ['A', 'B', 'C'],
        otherArray: ['X', 'Y', 'Z'],
      };
      expect(getFlatCriteria(criteria, true, 'myFilter')).toEqual({
        myFilter: { otherArray: 'X,Y,Z' },
        revenueTypeCodes: ['A', 'B', 'C'],
      });
    });

    it('should return only revenueTypeCodes when wrappedToFilter is provided but no other criteria', () => {
      const criteria = { revenueTypeCodes: ['A', 'B'] };
      expect(getFlatCriteria(criteria, false, 'myFilter')).toEqual({
        revenueTypeCodes: ['A', 'B'],
      });
    });

    it('should handle criteria with wrappedToFilter and revenueTypeCodes together', () => {
      const criteria = {
        wrappedToFilter: { nested: { value: 'test' } },
        revenueTypeCodes: [{ id: '1', code: 'CODE1' }],
        other: 'data',
      };
      const result = getFlatCriteria(criteria, false, 'myFilter');
      expect(result).toHaveProperty('myFilter');
      expect(result).toHaveProperty('revenueTypeCodes');
    });

    it('should handle criteria with only wrappedToFilter', () => {
      const criteria = { wrappedToFilter: { nested: { value: 'test' } } };
      expect(getFlatCriteria(criteria, false, 'myFilter')).toBeDefined();
    });

    it('should remove empty objects from criteria', () => {
      const criteria = { test: '12345', toRemove: {} };
      expect(getFlatCriteria(criteria)).toEqual({ test: '12345' });
    });
  });

  describe('saveTableRowEpic', () => {
    it('should dispatch SaveTableRowSuccess on successful save', (done) => {
      mockAxios(serviceResponse, 'put');

      createSaveTableRowEpic().subscribe((result: AnyType) => {
        expect(result.type).toBe(SAVE_TABLE_ROW_SUCCESS);
        expect(result.payload.entityId).toBe('ENTITY_ID');
        expect(result.payload.messageKey).toBe('updateEntitySuccess');
        done();
      });
    });

    it('should dispatch SaveTableRowError on failed save', (done) => {
      const error: AnyType = { message: 'Save error', status: 500 };
      mockAxiosError(error, 'put');

      createSaveTableRowEpic().subscribe((result: AnyType) => {
        expect(result.type).toBe(SAVE_TABLE_ROW_ERROR);
        expect(result.payload.error).toEqual(error);
        expect(result.payload.entityId).toBe('ENTITY_ID');
        done();
      });
    });
  });

  describe('saveTableDataEpic', () => {
    it('should merge pageData and localData when saving', (done) => {
      mockAxios(serviceResponse, 'put');

      const storeWithData = {
        value: {
          ...store$.value,
          Tables: {
            SOME_TABLE: {
              ...store$.value.Tables.SOME_TABLE,
              pageData: [{ id: '1', name: 'Page Item' }],
              localData: [{ id: '2', name: 'Local Item' }],
            },
          },
        },
      } as AnyType;

      const payload = { ...baseTableDataPayload, method: 'put' };

      createSaveTableDataEpic(payload, storeWithData).subscribe(() => {
        expect(Axios.put).toHaveBeenCalledWith(
          `${API_URL}/${baseTableDataPayload.url}`,
          expect.objectContaining({
            SOME_TABLE: expect.arrayContaining([
              expect.objectContaining({ id: '1' }),
              expect.objectContaining({ id: '2' }),
            ]),
            extra: 'data',
          }),
        );
        done();
      });
    });

    it('should handle empty pageData in table state', (done) => {
      mockAxios(serviceResponse, 'put');

      const storeWithEmptyPageData = {
        value: {
          ...store$.value,
          Tables: {
            SOME_TABLE: {
              ...store$.value.Tables.SOME_TABLE,
              pageData: undefined,
              localData: [{ id: '2', name: 'Local Item' }],
            },
          },
        },
      } as AnyType;

      createSaveTableDataEpic(baseTableDataPayload, storeWithEmptyPageData).subscribe(() => {
        expect(Axios.put).toHaveBeenCalled();
        done();
      });
    });

    it('should handle empty localData in table state', (done) => {
      mockAxios(serviceResponse, 'put');

      const storeWithEmptyLocalData = {
        value: {
          ...store$.value,
          Tables: {
            SOME_TABLE: {
              ...store$.value.Tables.SOME_TABLE,
              pageData: [{ id: '1', name: 'Page Item' }],
              localData: undefined,
            },
          },
        },
      } as AnyType;

      createSaveTableDataEpic(baseTableDataPayload, storeWithEmptyLocalData).subscribe(() => {
        expect(Axios.put).toHaveBeenCalled();
        done();
      });
    });

    it('should dispatch SaveTableDataSuccess on successful save', (done) => {
      mockAxios(serviceResponse, 'put');

      createSaveTableDataEpic(baseTableDataPayload).subscribe((result: AnyType) => {
        expect(result.type).toBe(SAVE_TABLE_DATA_SUCCESS);
        expect(result.payload.tableId).toBe('SOME_TABLE');
        done();
      });
    });

    it('should dispatch SaveTableDataError on failed save', (done) => {
      const error: AnyType = { message: 'Save error', status: 500 };
      mockAxiosError(error, 'put');

      createSaveTableDataEpic(baseTableDataPayload).subscribe((result: AnyType) => {
        expect(result.type).toBe(SAVE_TABLE_DATA_ERROR);
        expect(result.payload.error).toEqual(error);
        expect(result.payload.tableId).toBe('SOME_TABLE');
        done();
      });
    });

    it('should default to PUT method when method is not specified', (done) => {
      mockAxios(serviceResponse, 'put');

      createSaveTableDataEpic(baseTableDataPayload).subscribe(() => {
        expect(Axios.put).toHaveBeenCalled();
        done();
      });
    });

    it('should use POST method when specified', (done) => {
      mockAxios(serviceResponse, 'post');

      const payload = { ...baseTableDataPayload, method: 'post' };

      createSaveTableDataEpic(payload).subscribe(() => {
        expect(Axios.post).toHaveBeenCalled();
        done();
      });
    });
  });
});
