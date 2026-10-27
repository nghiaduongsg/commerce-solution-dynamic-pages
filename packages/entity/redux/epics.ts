import { of } from 'rxjs';
import { switchMap, map, catchError, mergeMap } from 'rxjs/operators';
import Axios from 'axios-observable';
import { EntityReduxState } from './types';
import { SystemState } from 'setup/src/system/types';
import { ofType } from 'redux-observable';
import { AnyType } from '@pkg-common/types';

import {
  SAVE_ENTITY,
  SAVE_ENTITY_SUCCESS,
  SAVE_ENTITY_ERROR,
  SaveEntitySuccess,
  SaveEntityError,
  DELETE_ENTITY,
  DELETE_ENTITY_SUCCESS,
  DELETE_ENTITY_ERROR,
  DeleteEntitySuccess,
  DeleteEntityError,
} from './actions';
import { LoadTable } from '@pkg-list/src/actions';
import { EnqueueSnackbar } from '@pkg-common/notifier/reducers';

import { AppError } from '@pkg-common/types';

import {
  handlePayloadErrors,
  unwrapEntityDataArea,
  wrapEntityDataArea,
  mergeSubSchemas,
} from '../utils/utils';

import { COMMON } from '@pkg-constants/translationNamespaces';
import { MarkButtonPress } from '@pkg-common/button/reducers';
import { encodeText } from '@pkg-common/utils';

export const saveEntityEpic = (
  action$: AnyType,
  state$: { value: EntityReduxState & { System: SystemState } },
) => {
  return action$.pipe(
    ofType(SAVE_ENTITY),
    switchMap(({ payload }) => {
      const myWindow: AnyType = window;
      const transformDataForServer = myWindow['transformDataForServer'];
      const transformDataFromServer = myWindow['transformDataFromServer'];
      const { entityId, contextToken } = payload;
      const reduxSlice = state$.value.Entities[entityId];
      const { formData, entity } = reduxSlice;

      const uiSchema = mergeSubSchemas(payload, state$.value);
      const page = uiSchema['ui:page'] || {};
      const { url, editUrl, idKey, customFieldsKey } = page;
      const isNew = !entity || !entity[idKey];

      const wrappedEntity = wrapEntityDataArea(formData, customFieldsKey, uiSchema);
      const transformedEntity = transformDataForServer
        ? transformDataForServer(entityId, wrappedEntity)
        : wrappedEntity;

      return saveEntity(
        transformedEntity,
        isNew,
        url,
        editUrl,
        idKey,
        state$.value.System?.apiUrl,
        contextToken,
        state$.value.System?.contextTokenHeader,
      ).pipe(
        // @ts-ignore
        map(({ data }: { data: AnyType }) => {
          const page = (payload.uiSchema || {})['ui:page'];
          const labels = (payload.uiSchema || {})['ui:labels'];
          const hasCustomKey = !!labels?.successUpdateMessageKey;
          const updateSuccessKey = labels?.successUpdateMessageKey || 'updateEntitySuccess';
          const namespace = hasCustomKey ? labels?.namespace || COMMON : COMMON;
          const customFieldsKey = page?.customFieldsKey;

          const messageKey = isNew ? 'createEntitySuccess' : updateSuccessKey;

          const unwrappedEntity = customFieldsKey ? unwrapEntityDataArea(data) : data;
          const thisEntity = transformDataFromServer
            ? transformDataFromServer(entityId, unwrappedEntity)
            : unwrappedEntity;

          return SaveEntitySuccess({
            entityId,
            entity: thisEntity,
            messageKey,
            namespace,
          });
        }),
        catchError((error: AppError) =>
          of(
            SaveEntityError({
              entityId,
              error: error.status === 403 ? { ...error, message: 'forbidden' } : error,
              isNew,
              entity: unwrapEntityDataArea(formData),
            }),
          ),
        ),
      );
    }),
  );
};

export const saveEntitySuccessEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(SAVE_ENTITY_SUCCESS),
    mergeMap(({ payload }: AnyType) => {
      return [
        EnqueueSnackbar({
          key: new Date().getTime().toString(),
          message: payload.messageKey,
          namespace: payload.namespace,
          severity: 'dark',
        }),
        MarkButtonPress({ id: 'submitButtonPressed' }),
      ];
    }),
  );

export const saveEntityErrorEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(SAVE_ENTITY_ERROR),
    // @ts-ignore
    mergeMap(({ payload }: AnyType) => handlePayloadErrors(payload.error)),
  );

export const deleteAction = (state: AnyType, payload: AnyType, url: AnyType) => {
  return Axios.delete(`${state.value.System?.apiUrl}/${url}/${encodeText(payload.code)}`).pipe(
    // @ts-ignore
    mergeMap(() => {
      const tableId = payload.entityId;
      const {
        criteria,
        pagination: { currentPageNumber, requestedPageSize },
      } = state.value.Tables[tableId];
      return [
        // @ts-ignore
        LoadTable({
          tableId,
          criteria,
          page: currentPageNumber,
          pageSize: requestedPageSize,
          loadTimestamp: new Date().getTime(),
        }),
        DeleteEntitySuccess({
          code: payload.code,
          entityId: payload.entityId,
          tableId,
        }),
      ];
    }),
    catchError((error: AppError) => of(DeleteEntityError({ entityId: payload.entityId, error }))),
  );
};

export const deleteEntityEpic = (
  action$: AnyType,
  state$: { value: EntityReduxState & { System: SystemState } & { Tables: AnyType } },
) =>
  action$.pipe(
    ofType(DELETE_ENTITY),
    switchMap(({ payload }) =>
      deleteAction(state$, payload, state$.value.Tables[payload.entityId].url),
    ),
  );

export const deleteEntitySuccessEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(DELETE_ENTITY_SUCCESS),
    map(({ payload }: AnyType) =>
      EnqueueSnackbar({
        key: new Date().getTime().toString(),
        message: 'deleteEntitySuccess',
        namespace: payload.namespace,
        severity: 'dark',
      }),
    ),
  );

export const deleteEntityErrorEpic = (action$: AnyType) =>
  action$.pipe(
    ofType(DELETE_ENTITY_ERROR),
    // @ts-ignore
    mergeMap(({ payload }: AnyType) => handlePayloadErrors(payload.error)),
  );

const saveEntity = (
  entity,
  isNew: boolean,
  url: string,
  editUrl: string,
  entityIdKey: string,
  apiUrl: string,
  contextToken?: string,
  contextTokenHeader = 'X-Context-Token',
) => {
  const baseUrl = `${apiUrl}/${url}`;
  const editBaseUrl = editUrl ? `${apiUrl}/${editUrl}` : baseUrl;
  const urlToUse = `${editBaseUrl}/${encodeText(entity[entityIdKey])}`;

  const config: any = {};

  if (contextToken) {
    config.headers = {
      ...(config.headers || {}),
      [contextTokenHeader]: contextToken,
    };
  }

  return isNew ? Axios.post(baseUrl, entity, config) : Axios.put(urlToUse, entity, config);
};

export default [
  saveEntityEpic,
  saveEntitySuccessEpic,
  saveEntityErrorEpic,
  deleteEntityEpic,
  deleteEntitySuccessEpic,
  deleteEntityErrorEpic,
];
