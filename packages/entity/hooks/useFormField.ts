import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  selectFieldUpdate,
  selectFieldValue,
  selectLastClearUpdate,
} from '@pkg-entity/redux/selectors';
import {
  AddFormItem,
  AddFormItems,
  ClearFormValues,
  ConcatToObject,
  RemoveFormItem,
  ReorderArrayItems,
  UpdateFormValue,
} from '@pkg-entity/redux/actions';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getFormIdFromWidgetId,
  getWidgetImmediateParentId,
  isValidWidgetId,
} from '@pkg-form/validations/utils/widgetUtils';
import { AnyType } from '@pkg-common/types';
import { equalityCheck } from '@pkg-common/utils/utils';
import { useDebounce } from 'react-use';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';

const useFormField = (
  fieldId: string,
  overrides?: { value: AnyType; onChange: (v: AnyType) => void } | undefined,
  debounceUpdates: boolean | number = false,
) => {
  const dispatch = useDispatch();

  const { setFieldDirty, isFieldDirty } = useFormManagerContext();
  const isDirtyIrrispectiveOfParent = isFieldDirty(fieldId, false);
  const isDirty = isFieldDirty(fieldId);

  const entityId = getFormIdFromWidgetId(fieldId);
  const fieldValue = useSelector(selectFieldValue(entityId, fieldId), equalityCheck);
  const fieldUpdatedExternally = useSelector(selectFieldUpdate(entityId, fieldId), shallowEqual);
  const fieldClearedExternally = useSelector(selectLastClearUpdate(entityId), shallowEqual);
  const [localValue, setLocalValue] = useState<AnyType>('__INITIAL__');
  const [localMetadata, setLocalMetadata] = useState<AnyType>({});
  const [localHookName, setLocalHookName] = useState<AnyType>({});
  const lastHandledExternalUpdate = useRef(0);

  const setFieldValue = useCallback(
    (value: AnyType, hookName = '', metadata = {}) => {
      if (!isValidWidgetId(fieldId)) {
        return;
      }

      if (!isDirtyIrrispectiveOfParent && !hookName) {
        const formId = getFormIdFromWidgetId(fieldId);
        const parentId = getWidgetImmediateParentId(fieldId);
        setFieldDirty(fieldId, true);
        setFieldDirty(parentId, true);
        setFieldDirty(formId, true);
      }

      dispatch(UpdateFormValue({ entityId, fieldId, value, hookName, metadata }));
    },
    [dispatch, entityId, fieldId, isDirtyIrrispectiveOfParent],
  );

  const updateFieldValue = useCallback(
    (v: AnyType, hookName?: string, metadata?: AnyType) => {
      if (debounceUpdates) {
        setLocalValue(v);
        setLocalMetadata(metadata);
        setLocalHookName(hookName);
      } else if (overrides?.onChange) {
        overrides?.onChange(v);
      } else {
        setFieldValue(v, hookName, metadata);
      }
    },
    [
      debounceUpdates,
      overrides?.onChange,
      setFieldValue,
      setLocalValue,
      setLocalHookName,
      setLocalMetadata,
    ],
  );

  const onValueChange = (
    thisLocalValue: AnyType,
    localHookName?: AnyType,
    localMetadata?: AnyType,
  ) => {
    if (!isValidWidgetId(fieldId)) {
      return;
    }
    overrides?.onChange
      ? overrides?.onChange(thisLocalValue)
      : setFieldValue(thisLocalValue, localHookName, localMetadata);
  };

  const latency = useMemo(() => {
    return typeof debounceUpdates === 'number' ? debounceUpdates : 300;
  }, [debounceUpdates]);

  const [, cancel] = useDebounce(
    () => {
      if (localValue !== '__INITIAL__') {
        onValueChange(localValue, localHookName, localMetadata);
      }
    },
    latency,
    [localValue, localMetadata, localHookName],
  );

  useEffect(() => {
    return () => {
      if (cancel) {
        cancel();
      }
    };
  }, []);

  const finalValue = useMemo(() => {
    if (debounceUpdates && localValue !== '__INITIAL__') {
      return localValue;
    }
    return overrides?.value || fieldValue;
  }, [localValue, overrides?.value, fieldValue, debounceUpdates]);

  useEffect(() => {
    if (
      fieldUpdatedExternally &&
      fieldUpdatedExternally > 0 &&
      debounceUpdates &&
      fieldUpdatedExternally !== lastHandledExternalUpdate.current
    ) {
      lastHandledExternalUpdate.current = fieldUpdatedExternally;
      if (!equalityCheck(localValue, fieldValue)) {
        setLocalValue(fieldValue);
      }
    }
  }, [fieldUpdatedExternally, fieldValue, localValue, debounceUpdates]);

  useEffect(() => {
    const externalClear = fieldClearedExternally && fieldClearedExternally > 0;
    if (externalClear && debounceUpdates) {
      setLocalValue(fieldValue);
    }
  }, [fieldClearedExternally, fieldValue, debounceUpdates]);

  return {
    value: finalValue,
    storeValue: fieldValue,
    dirty: isDirty,
    setFieldValue: updateFieldValue,
    setFieldDirty: useCallback(() => {
      if (!isDirty) {
        setFieldDirty(fieldId, true);
      }
    }, [isDirty, fieldId]),
    clearFormValues: useCallback(
      (fieldIds: Array<string>) => dispatch(ClearFormValues({ entityId, fieldIds })),
      [dispatch, entityId],
    ),
    reorderItems: useCallback(
      (sortBy) => dispatch(ReorderArrayItems({ entityId, fieldId, sortBy })),
      [dispatch, entityId, fieldId],
    ),
    addItem: useCallback(
      (item) => {
        if (!isDirty) {
          setFieldDirty(fieldId, true);
        }
        dispatch(AddFormItem({ entityId, fieldId, item }));
      },
      [dispatch, entityId, fieldId, isDirty],
    ),
    addItems: useCallback(
      (items) => {
        if (!isDirty) {
          setFieldDirty(fieldId, true);
        }
        dispatch(AddFormItems({ entityId, fieldId, items }));
      },
      [dispatch, entityId, fieldId, isDirty],
    ),
    removeItem: useCallback(
      (index: number) => {
        if (!isDirty) {
          setFieldDirty(fieldId, true);
        }
        dispatch(RemoveFormItem({ entityId, fieldId, index }));
      },
      [dispatch, entityId, fieldId, isDirty],
    ),
    concatToObject: useCallback(
      (property: string, value: AnyType) =>
        dispatch(ConcatToObject({ entityId, fieldId, property, value, stringify: true })),
      [dispatch, entityId, fieldId],
    ),
  };
};

export default useFormField;
