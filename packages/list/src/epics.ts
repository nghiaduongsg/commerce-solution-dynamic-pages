import { ofType } from 'redux-observable';
import { of } from 'rxjs';
import { map, catchError, mergeMap, switchMap } from 'rxjs/operators';
import { isEmpty } from 'lodash';
import axios from 'axios';
import {
  LOAD_TABLE,
  LOAD_TABLE_ERROR,
  LOAD_DYNAMIC_QUERY_TABLE,
  LoadTable,
  LoadTableSuccess,
  LoadTableError,
  SAVE_TABLE_ROW,
  SaveTableRowSuccess,
  SaveTableRowError,
  SaveTableDataSuccess,
  SaveTableDataError,
  SAVE_TABLE_ROW_SUCCESS,
  SAVE_TABLE_ROW_ERROR,
  SAVE_TABLE_DATA,
  SAVE_TABLE_DATA_SUCCESS,
  SAVE_TABLE_DATA_ERROR,
} from './actions';

import Axios from 'axios-observable';
import { ReduxTablesState } from './types';
import { SystemState } from 'setup/src/system/types';
import { unwrapEntityDataArea, handlePayloadErrors } from '@pkg-entity/utils/utils';
import { hasValue } from '@pkg-common/utils';
import { EnqueueSnackbar } from '@pkg-common/notifier/reducers';
import { AnyType, AppError } from '@pkg-common/types';

const PROPERTY_VALUES = ['id', 'billId', 'locationCode', 'code', 'value'];
const SPECIFIC_PROPERTY_VALUES = ['id', 'billId', 'locationCode'];

interface FlatCriteria {
  revenueTypeCodes?: string[];
  [key: string]: any;
}

const getPropertyValue = (item: any, properties: string[]): any => {
  for (const prop of properties) {
    if (item[prop] !== undefined && item[prop] !== null) {
      return item[prop];
    }
  }
  return item;
};

const flattenLeaves = (
  obj: Record<string, any>,
  res: Record<string, any> = {},
): Record<string, any> => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenLeaves(value, res);
    } else if (Array.isArray(value) && value.every((item) => typeof item === 'object')) {
      res[key] = value.map((item) =>
        getPropertyValue(item, ['id', 'billId', 'locationCode', 'code', 'value']),
      );
    } else if (value !== undefined && value !== null) {
      res[key] = value;
    }
  });

  return res;
};

const replaceDotKeys = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key.replace(/__DOT__/g, '.'), value]),
  );

export const getFlatCriteria = (
  criteria = {},
  isDynamicQuery = false,
  wrappedToFilter?: string,
) => {
  let flatCriteria = { ...criteria };

  // The criteria are usually already flat, apart from one case where it is an object.
  // In order to simplify stuff a bit, we assume that when the criterion value is an object
  // then the inner property is always an 'id'
  // billId was added later because bills is the only entity that the id property is not named
  // `id` but is named `billId`, so it does not help with our assumption.
  // Added locationCode to support some API entities (e.g. locations)
  Object.keys(criteria)
    .filter((key) => !!criteria[key])
    .forEach((key) => {
      const value = criteria[key];
      if (
        Array.isArray(value) &&
        value.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))
      ) {
        const finalCriteria: string[] = [];
        value.forEach((item: { id: string }) => {
          finalCriteria.push(item.id);
        });
        flatCriteria[key] = finalCriteria;
      }
      if (!Array.isArray(value) && typeof value === 'object') {
        const maybeId = getPropertyValue(value, ['id', 'billId', 'locationCode']);

        if (maybeId !== undefined && maybeId !== value) {
          flatCriteria[key] = maybeId;
        } else {
          const leaves = flattenLeaves(value);

          const { [key]: _removed, ...rest } = flatCriteria as any;
          flatCriteria = { ...rest, ...leaves };
        }
      }
      if (
        isDynamicQuery &&
        Array.isArray(value) &&
        !(wrappedToFilter && key === 'revenueTypeCodes')
      ) {
        flatCriteria[key] = value.join(',');
      }
      if (!hasValue(value)) {
        delete flatCriteria[key];
      }
    });

  const { revenueTypeCodes, ...restCriteria } = (flatCriteria as FlatCriteria) || {};
  if (wrappedToFilter && revenueTypeCodes && !isEmpty(restCriteria)) {
    return { [wrappedToFilter]: replaceDotKeys(restCriteria), revenueTypeCodes };
  } else if (wrappedToFilter && !revenueTypeCodes && !isEmpty(restCriteria)) {
    return { [wrappedToFilter]: replaceDotKeys(restCriteria) };
  } else {
    return replaceDotKeys(flatCriteria);
  }
};

export const loadDynamicQueryTableEpic = (
  action$: AnyType,
  state$: { value: ReduxTablesState & { System: SystemState } },
) =>
  action$.pipe(
    ofType(LOAD_DYNAMIC_QUERY_TABLE),
    mergeMap(
      ({
        payload: {
          tableId,
          criteria,
          page,
          pageSize,
          sortBy,
          loadTimestamp,
          url,
          dataValues,
          queryParams,
        },
      }) =>
        Axios.post(
          `${state$.value.System.apiUrl}/${url || state$.value.Tables[tableId]?.url}`,
          {
            ...dataValues,
            ...queryParams,
            ...getFlatCriteria(criteria, true, state$.value.Tables[tableId]?.wrappedToFilter),
          },
          {
            params: {
              page:
                'undefined' === typeof page
                  ? state$.value.Tables[tableId]?.pagination?.requestedPageNumber
                  : page,
              size: pageSize || state$.value.Tables[tableId]?.pagination?.requestedPageSize,
              sort:
                sortBy &&
                (sortBy.includes(':asc') || sortBy.includes(':desc')) &&
                sortBy.split(','),
            },
          },
        ).pipe(
          // @ts-ignore
          map(({ data }) =>
            LoadTableSuccess({
              tableId,
              data,
              loadTimestamp,
              sortBy: sortBy || state$.value.Tables[tableId]?.sortBy,
              url: url || state$.value.Tables[tableId]?.url,
            }),
          ),
          catchError((error: AppError) => {
            if (error.status === 400) return of(LoadTableError({ tableId, error }));

            return of(LoadTableError({ tableId, error: { ...error, message: '' } }));
          }),
        ),
    ),
  );

export const loadTableEpic = (
  action$: AnyType,
  state$: { value: ReduxTablesState & { System: SystemState } },
) =>
  action$.pipe(
    ofType(LOAD_TABLE),
    mergeMap(
      ({
        payload: {
          tableId,
          criteria,
          page,
          pageSize,
          sortBy,
          loadTimestamp,
          url,
          apiValues,
          queryParams,
        },
      }) => {
        return Axios.get(
          `${state$.value.System.apiUrl}/${url || state$.value.Tables[tableId]?.url}`,
          {
            params: {
              ...queryParams,
              ...getFlatCriteria(criteria, false, state$.value.Tables[tableId]?.wrappedToFilter),
              page:
                'undefined' === typeof page
                  ? state$.value.Tables[tableId]?.pagination?.requestedPageNumber
                  : page,
              size: pageSize || state$.value.Tables[tableId]?.pagination?.requestedPageSize,
              sort:
                sortBy &&
                (sortBy.includes(':asc') || sortBy.includes(':desc')) &&
                sortBy.split(','),
            },
          },
        ).pipe(
          // @ts-ignore
          map(({ data }) =>
            LoadTableSuccess({
              tableId,
              data,
              apiValues,
              loadTimestamp,
              sortBy: sortBy || state$.value.Tables[tableId]?.sortBy,
              url: url || state$.value.Tables[tableId]?.url,
            }),
          ),
          catchError((error: AppError) => {
            return of(LoadTableError({ tableId, error }));
          }),
        );
      },
    ),
  );

export const saveTableErrorEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(LOAD_TABLE_ERROR),
    // @ts-ignore
    mergeMap(({ payload }: AnyType) => {
      return handlePayloadErrors(payload.error);
    }),
  );

export const saveTableRowEpic = (
  action$: AnyType,
  state$: { value: ReduxTablesState & { System: SystemState } & { Entities: AnyType } },
) =>
  action$.pipe(
    ofType(SAVE_TABLE_ROW),
    switchMap(({ payload }) => {
      const slice = state$.value.Entities[payload.entityId] || {};
      const { entityDataAreaKey, formData } = slice;
      return Axios[payload.method || 'put'](
        `${state$.value.System.apiUrl}/${payload.url}`,
        payload.data,
      ).pipe(
        mergeMap(({ data }: { data: AnyType }) => [
          SaveTableRowSuccess({
            entityId: payload.entityId,
            entity: unwrapEntityDataArea(data),
            messageKey: 'updateEntitySuccess',
          }),
          LoadTable({
            tableId: payload.entityId,
            criteria: state$.value[payload.entityId]?.criteria,
            loadTimestamp: new Date().getTime(),
          }),
        ]),
        catchError((error: AppError) =>
          of(
            SaveTableRowError({
              error,
              entityId: payload.entityId,
              entity: unwrapEntityDataArea(formData),
            }),
          ),
        ),
      );
    }),
  );

export const saveTableRowSuccessEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(SAVE_TABLE_ROW_SUCCESS),
    map(({ payload }: AnyType) =>
      EnqueueSnackbar({
        key: new Date().getTime(),
        message: payload.messageKey,
        severity: 'dark',
      }),
    ),
  );

export const saveTableRowErrorEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(SAVE_TABLE_ROW_ERROR),
    // @ts-ignore
    mergeMap(({ payload }: AnyType) => handlePayloadErrors(payload.error)),
  );

export const saveTableDataEpic = (
  action$: AnyType,
  state$: { value: ReduxTablesState & { System: SystemState } },
) =>
  action$.pipe(
    ofType(SAVE_TABLE_DATA),
    switchMap(({ payload }) => {
      const slice = state$.value.Tables[payload.tableId] || {};
      const finalData = {
        [payload.tableId]: [...(slice?.pageData ?? {}), ...(slice?.localData ?? {})],
        ...payload.data,
      };

      return Axios[payload.method || 'put'](
        `${state$.value.System.apiUrl}/${payload.url}`,
        finalData,
      ).pipe(
        mergeMap(({ data }: { data: AnyType }) => [
          SaveTableDataSuccess({
            tableId: payload.tableId,
            data: data[payload.tableId] || data,
          }),
        ]),
        catchError((error: AppError) =>
          of(
            SaveTableDataError({
              tableId: payload.tableId,
              entityId: payload.entityId,
              error,
            }),
          ),
        ),
      );
    }),
  );

export const saveTableDataSuccessEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(SAVE_TABLE_DATA_SUCCESS),
    map(({ payload }: AnyType) =>
      EnqueueSnackbar({
        key: new Date().getTime(),
        message: payload.messageKey || 'updateTableSuccess',
        severity: 'dark',
      }),
    ),
  );

export const saveTableDataErrorEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(SAVE_TABLE_DATA_ERROR),
    // @ts-ignore
    mergeMap(({ payload }: AnyType) => {
      return handlePayloadErrors(payload.error);
    }),
  );

export default [
  saveTableDataEpic,
  saveTableDataSuccessEpic,
  saveTableDataErrorEpic,
  loadTableEpic,
  saveTableErrorEpic,
  loadDynamicQueryTableEpic,
  saveTableRowEpic,
  saveTableRowSuccessEpic,
  saveTableRowErrorEpic,
];
