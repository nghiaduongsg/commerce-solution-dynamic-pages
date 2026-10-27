import { mockAxios, mockAxiosError } from '@_jestHelpers/axiosMock';
import Axios from 'axios-observable';
import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';

import {
  SaveEntity,
  SaveEntitySuccess,
  SaveEntityError,
  DeleteEntity,
  DeleteEntityError,
  DeleteEntitySuccess,
} from './actions';
import { EnqueueSnackbar } from '@pkg-common/notifier/reducers';
import { LoadTable } from '@pkg-list/src/actions';
import {
  saveEntityEpic,
  saveEntitySuccessEpic,
  saveEntityErrorEpic,
  deleteEntityEpic,
  deleteEntitySuccessEpic,
  deleteEntityErrorEpic,
} from './epics';
import { mockDate } from '@_jestHelpers/dateMock';
import { AnyType, AppError } from '@pkg-common/types';

describe('Entity Epics', () => {
  const serviceResponse = {
    code: 'code',
    description: 'Imagine all the people',
    legalEntity: true,
    singleEffectiveState: true,
  } as AnyType;

  const entitiesStore = 'Entities';
  const tablesStore = 'Tables';

  const transformDataFromServer = (_, data) => {
    return data;
  };
  const transformDataForServer = (_, data) => {
    return data;
  };
  window['transformDataFromServer'] = transformDataFromServer;
  window['transformDataForServer'] = transformDataForServer;

  const store$ = {
    value: {
      UIConfiguration: {
        SOME_ID_SINGLE_RECORD_FORM: {
          details: {
            schemas: [
              {
                schemaTypeCL: 'UI',
                schemaData: {
                  'ui:page': {
                    id: 'SOME_ID',
                    url: 'some-url',
                  },
                },
              },
            ],
          },
        },
      },
      [tablesStore]: {
        SOME_ID: {
          id: 'id',
          criteria: {},
          pagination: {
            requestedPageSize: 10,
            requestedPageNumber: 0,
            totalElements: 6,
            totalPages: 1,
            currentPageNumberOfElements: 6,
            currentPageNumber: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      },
      [entitiesStore]: {
        SOME_OTHER_ID: {
          id: 'id',
          url: 'some-url',
          isNew: false,
          formData: {
            prop: 'prop',
            prop1: 'prop1',
          },
          error: { message: '' },
          entity: {
            id: 'foo',
            prop: 'prop',
            prop1: 'prop1',
          },
        },
        SOME_ID: {
          id: 'id',
          url: 'some-url',
          isNew: true,
          error: { message: '' },
          formData: {
            prop: 'prop',
            prop1: 'prop1',
          },
          entity: {
            id: 'foo',
            prop: 'prop',
            prop1: 'prop1',
          },
        },
      },
    },
  } as AnyType;

  beforeEach(() => {
    jest.resetAllMocks();
    mockDate('mockDate');
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('saveEntity related epics', () => {
    it('should call Axios.post with request url when entity is newly added', (done) => {
      mockAxios(serviceResponse, 'post');

      const action$ = of(
        SaveEntity({
          entityId: 'SOME_ID',
        }),
      );
      const epic$ = saveEntityEpic(action$, store$);

      epic$.subscribe(() => {
        expect(Axios.post).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should call Axios.put with request url when entity is being updated', (done) => {
      mockAxios(serviceResponse, 'put');

      const action$ = of(
        SaveEntity({
          entityId: 'SOME_OTHER_ID',
          uiSchema: {
            'ui:page': {
              id: 'SOME_OTHER_ID',
              url: '',
              idKey: 'id',
            },
          },
        }),
      );
      const epic$ = saveEntityEpic(action$, store$);

      epic$.subscribe(() => {
        expect(Axios.put).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should return SaveEntitySuccess action', (done) => {
      mockAxios(serviceResponse, 'post');

      const action$ = of(
        SaveEntity({
          entityId: 'SOME_ID',
        }),
      );
      const epic$ = saveEntityEpic(action$, store$);

      epic$.subscribe((result: AnyType) => {
        expect(result).toEqual(
          SaveEntitySuccess({
            entityId: 'SOME_ID',
            entity: serviceResponse,
            messageKey: 'createEntitySuccess',
            namespace: 'common',
          }),
        );
        done();
      });
    });

    it('should return EnqueueSnackbar due to SaveEntitySuccess action', (done) => {
      mockAxios(serviceResponse, 'post');

      const action$ = of(
        SaveEntitySuccess({
          entityId: 'SOME_ID',
          entity: serviceResponse,
          messageKey: 'createEntitySuccess',
          namespace: 'common',
        }),
      );
      const epic$ = saveEntitySuccessEpic(action$);

      epic$.subscribe((result: AnyType) => {
        expect(result).toEqual(
          EnqueueSnackbar({
            key: 'mockDate',
            message: 'createEntitySuccess',
            severity: 'dark',
            namespace: 'common',
          }),
        );
        done();
      });
    });

    it('should return SaveEntityError action', (done) => {
      const error: AppError = {
        message: 'error',
      };
      mockAxiosError(error, 'post');

      const action$ = of(
        SaveEntity({
          entityId: 'SOME_ID',
        }),
      );
      const epic$ = saveEntityEpic(action$, store$);

      const expected = SaveEntityError({
        entityId: 'SOME_ID',
        entity: store$.value[entitiesStore].SOME_ID.formData,
        isNew: true,
        error,
      });
      epic$.subscribe((result: AnyType) => {
        expect(result).toEqual(expected);
        done();
      });
    });

    it('should return EnqueueSnackbar due to SaveEntityError action', (done) => {
      const error: AppError = {
        message: 'someError',
        violations: [
          { fieldName: '', message: 'error field name1', rejectedValue: {} },
          { fieldName: '', message: 'error field name2', rejectedValue: {} },
          { fieldName: '', message: 'error field name3', rejectedValue: {} },
        ],
      };

      const action$ = of(SaveEntityError({ entityId: 'SOME_ID', entity: serviceResponse, error }));
      const epic$ = saveEntityErrorEpic(action$);

      const expected = [
        EnqueueSnackbar({
          key: 'mockDate',
          message: 'someError',
          severity: 'error',
        }),
        EnqueueSnackbar({
          key: 'mockDate_0',
          message: 'error field name1',
          severity: 'error',
        }),
        EnqueueSnackbar({
          key: 'mockDate_1',
          message: 'error field name2',
          severity: 'error',
        }),
        EnqueueSnackbar({
          key: 'mockDate_2',
          message: 'error field name3',
          severity: 'error',
        }),
      ];
      epic$.pipe(toArray()).subscribe((result: AnyType) => {
        expect(result).toEqual(expected);
        done();
      });
    });
  });

  describe('deleteEntity related epics', () => {
    it('should call Axios.delete with request url', (done) => {
      mockAxios(serviceResponse, 'delete');

      const action$ = of(DeleteEntity({ entityId: 'SOME_ID', code: 'entityID' }));
      const epic$ = deleteEntityEpic(action$, store$);

      epic$.pipe(toArray()).subscribe(() => {
        expect(Axios.delete).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('DeleteEntity should return LoadTable action', (done) => {
      mockDate(1234);
      mockAxios(serviceResponse, 'delete');

      const action$ = of(DeleteEntity({ entityId: 'SOME_ID', code: 'entityID' }));
      const epic$ = deleteEntityEpic(action$, store$);

      epic$.subscribe((result: AnyType) => {
        const tableId = 'SOME_ID';
        const {
          criteria,
          pagination: { currentPageNumber, requestedPageSize },
        } = store$.value.Tables[tableId];
        expect(result).toEqual(
          // @ts-ignore
          LoadTable({
            tableId,
            criteria,
            page: currentPageNumber,
            pageSize: requestedPageSize,
            loadTimestamp: 1234,
          }),
        );
        done();
      });
    });

    it('should return EnqueueSnackbar due to DeleteEntitySuccess action', (done) => {
      const action$ = of(
        DeleteEntitySuccess({
          code: 'id',
          tableId: store$.value.Tables['SOME_ID'].id,
          entityId: 'SOME_ID',
        }),
      );
      const epic$ = deleteEntitySuccessEpic(action$);

      epic$.subscribe((result: AnyType) => {
        expect(result).toEqual(
          EnqueueSnackbar({
            key: 'mockDate',
            message: 'deleteEntitySuccess',
            severity: 'dark',
          }),
        );
        done();
      });
    });

    it('should return DeleteEntityError action', (done) => {
      const error: AppError = { message: 'error' };
      mockAxiosError(error, 'delete');

      const action$ = of(DeleteEntity({ entityId: 'SOME_ID', code: 'entityID' }));
      const epic$ = deleteEntityEpic(action$, store$);

      const expected = DeleteEntityError({ entityId: 'SOME_ID', error });
      epic$.subscribe((result: AnyType) => {
        expect(result).toEqual(expected);
        done();
      });
    });

    it('should return EnqueueSnackbar action due to DeleteEntitySuccess action', (done) => {
      const action$ = of(
        DeleteEntitySuccess({
          code: 'entityID',
          tableId: 'SOME_ID',
          entityId: 'SOME_ID',
        }),
      );
      const epic$ = deleteEntitySuccessEpic(action$);

      const expected = EnqueueSnackbar({
        key: 'mockDate',
        message: 'deleteEntitySuccess',
        severity: 'dark',
      });

      epic$.subscribe((result: AnyType) => {
        expect(result).toEqual(expected);
        done();
      });
    });

    it('should return EnqueueSnackbar due to DeleteEntityError action', (done) => {
      const error: AppError = {
        message: 'error',
      };

      const action$ = of(DeleteEntityError({ entityId: 'SOME_ID', error }));
      const epic$ = deleteEntityErrorEpic(action$);

      const expected = [
        EnqueueSnackbar({
          key: 'mockDate',
          message: error.message,
          severity: 'error',
        }),
      ];

      epic$.pipe(toArray()).subscribe((result: AnyType) => {
        expect(result).toEqual(expected);
        done();
      });
    });
  });
});
