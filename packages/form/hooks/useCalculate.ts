import useMultipleFormData from '@pkg-common/dataResolver/useMultipleFormData';
import { CheckFromSchemaWithPrecision, FieldConditionSchema } from '@pkg-common/types';
import { useRef, useEffect, useMemo } from 'react';
import useFormField from '@pkg-entity/hooks/useFormField';
import { AnyType } from '@pkg-common/types';
import { hasValue } from '@pkg-common/utils/utils';
import { isNumber } from 'lodash';

const useCalculate = (id: string, from: CheckFromSchemaWithPrecision | undefined) => {
  const {
    operator = 'add',
    fields = [],
    precision = 2,
    calculationOutputIfEmpty = undefined,
  } = from || {};
  const { setFieldValue } = useFormField(id);

  const fieldsRef = useRef<Array<FieldConditionSchema>>(fields);

  const values = useMultipleFormData(id, fieldsRef.current, true);
  const valuesRef = useRef(values);

  const sourceValuesReady = useMemo(() => {
    if (!hasValue(values)) {
      return false;
    }
    return Object.values(values).filter((v) => !hasValue(v)).length === 0;
  }, [values]);

  const valuesChanged = useMemo(() => {
    return JSON.stringify(valuesRef.current || {}) !== JSON.stringify(values || {});
  }, [values]);

  const initialValue = useMemo(() => {
    if (operator === 'multiply') {
      return 1;
    } else if (operator === 'percentage') {
      return 1 / 100;
    }
    return 0;
  }, [operator]);

  const result = useMemo(() => {
    if (!hasValue(values)) {
      return initialValue;
    }
    return Object.values(values)
      ?.filter((val: AnyType) => !isNaN(val) && isNumber(val))
      .reduce((a: AnyType, b: AnyType) => {
        if (operator === 'add') {
          return a + b;
        } else if (operator === 'percentage' || 'multiply') {
          return a * b;
        }
        return initialValue;
      }, initialValue);
  }, [values, initialValue]);

  useEffect(() => {
    if (from && !sourceValuesReady && valuesChanged) {
      setFieldValue(calculationOutputIfEmpty, 'useCalculate');
      valuesRef.current = values;
    }
    if (from && sourceValuesReady && valuesChanged) {
      let finalResult = result;
      if (isNumber(finalResult) && !isNaN(finalResult)) {
        setFieldValue(Number(finalResult.toFixed(precision)), 'useCalculate');
      }
      valuesRef.current = values;
    }
  }, [result, sourceValuesReady, valuesChanged, values]);
};

export default useCalculate;
