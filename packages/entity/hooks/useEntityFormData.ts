import { shallowEqual, useDispatch, useSelector, useStore } from 'react-redux';
import {
  selectDataExists,
  selectFormData,
  selectDiffsData,
  selectFormDataForCodeInjection,
  selectLastUpdate,
  selectGroupedDiffsData,
  selectHasChanges,
} from '@pkg-entity/redux/selectors';
import {
  ClearEntityFormData,
  SetEntityFormData,
  AppendEntityFormData,
  TriggerEntityFormData,
} from '@pkg-entity/redux/actions';
import { useCallback } from 'react';
import { equalityCheck } from '@pkg-common/utils/utils';
import { AnyType } from '@pkg-common/types';

const useEntityFormData = (entityId = '') => {
  const dispatch = useDispatch();
  const store = useStore();

  // @ts-ignore
  return {
    diffs: useSelector(selectDiffsData(entityId), equalityCheck),
    groupedDiffs: useSelector(selectGroupedDiffsData(entityId), equalityCheck),
    hasChanges: useSelector(selectHasChanges(entityId), shallowEqual),
    dataExists: useSelector(selectDataExists(entityId), shallowEqual),
    formData: useSelector(selectFormData(entityId), equalityCheck),
    formDataForCodeInjection: useSelector(selectFormDataForCodeInjection(entityId), equalityCheck),
    lastUpdate: useSelector(selectLastUpdate(entityId), shallowEqual),
    setEntityFormData: useCallback(
      (data, concat = false, customFieldsKey = undefined) => {
        if (entityId) {
          dispatch(SetEntityFormData({ entityId, data, concat, customFieldsKey }));
        }
      },
      [dispatch, entityId],
    ),
    appendEntityFormData: useCallback(
      (data) => {
        if (entityId) {
          dispatch(AppendEntityFormData({ entityId, data }));
        }
      },
      [dispatch, entityId],
    ),
    clearEntityFormData: useCallback(() => {
      if (entityId) {
        dispatch(ClearEntityFormData({ entityId }));
      }
    }, [dispatch, entityId]),
    triggerUpdate: useCallback(() => {
      if (entityId) {
        dispatch(TriggerEntityFormData({ entityId }));
      }
    }, [dispatch, entityId]),
    //Returns the latest snapshot of the entity's formData directly from the Redux store.
    getLatestEntityFormData: () => selectFormData(entityId)(store.getState() as AnyType),
  };
};

export default useEntityFormData;
