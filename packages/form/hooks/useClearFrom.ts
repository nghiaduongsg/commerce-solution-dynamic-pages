import { useEffect, useRef, useMemo } from 'react';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { ClearFromSchema } from '@pkg-form/types';
import useFormField from '@pkg-entity/hooks/useFormField';
import { hasValue } from '@pkg-common/utils/utils';
import { compareValues } from '@pkg-form/validations/utils/widgetUtils';
import useFieldReady from '@pkg-form/hooks/useFieldReady';
import useTable from '@pkg-list/hooks/useTable';

const useClearFrom = (id: string, clearFrom?: ClearFromSchema) => {
  const { defaultValue, operator = 'every', propertyNumberEquality } = clearFrom || {};

  const { baseId, filterKey } = useMemo(() => {
    if (id?.includes('-filters_')) {
      const [before, after] = id.split('-filters_');
      return { baseId: before, filterKey: after, isFilter: true };
    }
    return { baseId: id, filterKey: null, isFilter: false };
  }, [id]);

  const { setFieldValue, value } = useFormField(baseId, undefined, false);
  const { filterData, removeFilterData } = useTable(baseId);

  const { check: clearUnderCondition, values } = useCheckFrom(id, clearFrom);
  const ready = useFieldReady(id);

  const valuesRef = useRef(values);

  const isFilter = Boolean(filterKey);

  const currentValue = isFilter && filterKey ? filterData?.[filterKey] : value;

  const fieldCleared = useMemo(() => {
    return !hasValue(currentValue) && !hasValue(defaultValue);
  }, [currentValue, defaultValue]);

  const sourceValuesReady = useMemo(() => {
    if (!hasValue(values)) {
      return false;
    }
    return Object.values(values)[operator]((value) => hasValue(value));
  }, [values, operator]);

  const valueHasChanged = useMemo(() => {
    const currentValuesRef = JSON.stringify(valuesRef.current || {});
    const currentValues = JSON.stringify(values || {});
    return compareValues(currentValuesRef, currentValues, propertyNumberEquality);
  }, [propertyNumberEquality, values]);

  useEffect(() => {
    if ((!sourceValuesReady && !valueHasChanged) || !clearFrom) {
      return;
    }

    if (!hasValue(valuesRef.current)) {
      valuesRef.current = values;
      return;
    }

    if (valueHasChanged) {
      valuesRef.current = values;
      if (clearUnderCondition && !fieldCleared && ready) {
        valuesRef.current = {};

        if (isFilter && filterKey) {
          removeFilterData(filterKey);
        } else {
          setFieldValue(defaultValue || undefined, 'useClearFrom');
        }
      }
    }
  }, [
    clearUnderCondition,
    defaultValue,
    values,
    sourceValuesReady,
    valueHasChanged,
    fieldCleared,
    ready,
    isFilter,
    filterKey,
    clearFrom,
    removeFilterData,
    setFieldValue,
  ]);
};

export default useClearFrom;
