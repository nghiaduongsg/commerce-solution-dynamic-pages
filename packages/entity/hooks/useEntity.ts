import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

import {
  selectError,
  selectErrorMessage,
  selectEntity,
  selectLoading,
  selectIsNewEntity,
  selectEntityId,
  selectExtras,
  selectUrl,
  selectEntityIdKey,
  selectDataAreaKey,
  selectUserHasMadeChanges,
  selectSliceExists,
  selectValidOnDate,
  selectLastUpdate,
  selectServerUpdate,
} from '@pkg-entity/redux/selectors';

import {
  ClearEntity,
  SetEntity,
  DeleteEntity,
  SaveEntity,
  ClearEntityError,
  SetTemporaryAttachment,
  SetValidOnDate,
  ClearStepperForm,
} from '@pkg-entity/redux/actions';
import { AnyType } from '@pkg-common/types';
import { CallApi } from '@pkg-core/apiData/redux/reducers';
import { equalityCheck } from '@pkg-common/utils/utils';
import { getFormIdFromWidgetId } from '@pkg-common/utils';
const useEntity = (entityId = '') => {
  const dispatch = useDispatch();

  return {
    validOnDate: useSelector(selectValidOnDate(entityId), shallowEqual),
    sliceExists: useSelector(selectSliceExists(entityId), shallowEqual),
    id: useSelector(selectEntityId(entityId), shallowEqual),
    dataChanged: useSelector(selectUserHasMadeChanges(entityId)),
    entity: useSelector(selectEntity(entityId), equalityCheck),
    extras: useSelector(selectExtras(entityId), equalityCheck),
    isNew: useSelector(selectIsNewEntity(entityId), shallowEqual),
    error: useSelector(selectError(entityId), equalityCheck),
    errorMessage: useSelector(selectErrorMessage(entityId), shallowEqual),
    loading: useSelector(selectLoading(entityId), shallowEqual),
    url: useSelector(selectUrl(entityId), shallowEqual),
    entityIdKey: useSelector(selectEntityIdKey(entityId), shallowEqual),
    entityDataAreaKey: useSelector(selectDataAreaKey(entityId)),
    serverUpdate: useSelector(selectServerUpdate(entityId), shallowEqual),
    saveEntity: useCallback(
      (uiSchema: AnyType, contextToken?: string) => {
        if (entityId) {
          dispatch(SaveEntity({ entityId, uiSchema, contextToken }));
        }
      },
      [dispatch, entityId],
    ),
    deleteEntity: useCallback(
      (code: string) => {
        if (entityId) {
          dispatch(DeleteEntity({ entityId, code }));
        }
      },
      [dispatch, entityId],
    ),
    clearEntity: useCallback(() => {
      if (entityId) {
        dispatch(ClearEntity({ entityId }));
      }
    }, [dispatch, entityId]),
    clearEntityError: useCallback(() => {
      if (entityId) {
        dispatch(ClearEntityError({ entityId }));
      }
    }, [dispatch, entityId]),
    setEntity: useCallback(
      (initialEntityData: Record<string, AnyType> | Record<string, never>, extraData?: AnyType) => {
        if (entityId) {
          dispatch(SetEntity({ entityId, initialEntityData, extraData }));
        }
      },
      [dispatch, entityId],
    ),
    setValidOnDate: useCallback(
      (date: string | null) => {
        if (entityId) {
          dispatch(SetValidOnDate({ entityId, date }));
        }
      },
      [dispatch, entityId],
    ),
    setTemporaryAttachment: useCallback(
      (attachment: AnyType) => {
        dispatch(SetTemporaryAttachment({ entityId, attachment }));
      },
      [dispatch, entityId],
    ),
    clearFormSteps: useCallback(
      (
        steps: AnyType,
        activeStep: number,
        allowButtonClearByStep: boolean,
        readOnlyWidgets?: Set<string>,
      ) => {
        if (!steps.length || !entityId) return;

        const stepGroups = allowButtonClearByStep
          ? steps[activeStep]?.groups || []
          : steps.flatMap((step) => step.groups || []);
        const currentFormId = getFormIdFromWidgetId(entityId);
        const currentParentId = entityId;

        dispatch(
          ClearStepperForm({
            entityId: currentFormId,
            parentId: currentParentId,
            groups: stepGroups,
            readOnlyWidgets: readOnlyWidgets ?? new Set(),
          }),
        );
      },
      [dispatch, entityId],
    ),
    callApi: useCallback((payload) => dispatch(CallApi(payload)), [dispatch]),
  };
};

export default useEntity;
