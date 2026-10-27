import { useCallback, useRef, useState } from 'react';
import { isParent } from '@pkg-form/validations/utils/widgetUtils';
import { getFormIdFromWidgetId, hasValue } from '@pkg-common/utils';

const useFormManager = () => {
  const [componentTypes, setComponentTypes] = useState({});

  const [disabledValues, setDisabledValues] = useState({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const readOnlyFields = useRef<Set<string>>(new Set());
  const [dirtyFlags, setDirtyFlags] = useState<Record<string, boolean>>({});
  const [forceDirtyOn, setForceDirtyOn] = useState<Record<string, boolean>>({});

  const getFieldDisabledValues = useCallback(
    (fieldId: string, property: string) => {
      const fieldDisabledValues = disabledValues[fieldId] ?? {};
      return fieldDisabledValues[property] ?? [];
    },
    [disabledValues],
  );

  const setFieldDisabledValues = useCallback(
    (fieldId: string, items: { [property: string]: Array<string | boolean | number> }) => {
      setDisabledValues((prev) => ({ ...prev, [fieldId]: items }));
    },
    [setDisabledValues],
  );

  const clearAllDisabledValues = useCallback(() => setDisabledValues({}), [setDisabledValues]);

  const setFieldVisibility = useCallback((fieldId: string, visible = true) => {
    setVisibility((prev) => ({
      ...prev,
      [fieldId]: visible,
    }));
  }, []);

  const setManyFieldsVisibility = useCallback((fieldIds: Array<string> = [], visible = true) => {
    const mapIds = {};
    fieldIds.forEach((id) => (mapIds[id] = visible));
    setVisibility((prev) => ({
      ...prev,
      ...mapIds,
    }));
  }, []);

  const isFieldVisible = useCallback(
    (fieldId: string) => {
      const visible = visibility?.[fieldId];
      return hasValue(visible) ? visible : true;
    },
    [visibility],
  );

  const registerReadOnlyField = useCallback((fieldId: string, readMode: boolean) => {
    if (readMode) {
      readOnlyFields.current.add(fieldId);
    } else {
      readOnlyFields.current.delete(fieldId);
    }
  }, []);

  const getReadOnlyFields = useCallback((): Set<string> => {
    return new Set(readOnlyFields.current);
  }, []);

  const setFieldDirty = useCallback((fieldId: string, dirty = true) => {
    setDirtyFlags((prev) => ({
      ...prev,
      [fieldId]: dirty,
    }));
  }, []);

  const isFieldDirty = useCallback(
    (fieldId: string, checkForce = true) => {
      const formId = getFormIdFromWidgetId(fieldId);
      return dirtyFlags?.[fieldId] || (checkForce && forceDirtyOn[formId]) || false;
    },
    [dirtyFlags, forceDirtyOn],
  );

  const isFormDirty = useCallback(
    (parentField: string) => {
      const formDirty = forceDirtyOn[parentField];
      return (
        formDirty ||
        Object.keys(dirtyFlags)
          .filter((key) => isParent(key, parentField))
          .some((field) => dirtyFlags[field])
      );
    },
    [dirtyFlags, forceDirtyOn],
  );

  const forceDirty = useCallback((parentField: string) => {
    setForceDirtyOn((prev) => ({ ...prev, [parentField]: true }));
  }, []);

  const clearDirtyFlags = useCallback(
    (parentField: string) => {
      setForceDirtyOn((prev) => ({ ...prev, [parentField]: false }));
      setDirtyFlags((prev) => {
        const childrenMap = {};
        Object.keys(prev)
          ?.filter((key) => isParent(key, parentField))
          ?.forEach((key) => (childrenMap[key] = false));
        return { ...prev, ...childrenMap };
      });
    },
    [dirtyFlags],
  );

  const addComponentValueType = useCallback(
    (componentId, code) => {
      if (componentId && !componentTypes[componentId]) {
        setComponentTypes((prev) => ({ ...prev, [componentId]: code }));
      }
    },
    [componentTypes],
  );

  const getComponentValueType = useCallback(
    (componentId) => {
      return componentTypes[componentId];
    },
    [componentTypes],
  );

  return {
    disabledValues,
    setFieldDisabledValues,
    getFieldDisabledValues,
    clearAllDisabledValues,
    visibility,
    setFieldVisibility,
    setManyFieldsVisibility,
    isFieldVisible,
    registerReadOnlyField,
    getReadOnlyFields,
    componentTypes,
    addComponentValueType,
    getComponentValueType,
    dirtyFlags,
    setFieldDirty,
    isFieldDirty,
    isFormDirty,
    forceDirtyOn,
    forceDirty,
    clearDirtyFlags,
  };
};

export default useFormManager;
