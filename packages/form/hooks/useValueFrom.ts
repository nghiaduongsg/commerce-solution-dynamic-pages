import { useEffect, useMemo } from 'react';

import useFormData from '@pkg-common/dataResolver/useFormData';
import useFormField from '@pkg-entity/hooks/useFormField';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { AnyType, DataSourceSchema } from '@pkg-common/types';
import { hasValue } from '@pkg-common/utils';

const useValueFrom = (widgetId: string, valueFrom?: DataSourceSchema, type?: AnyType) => {
  const { value, setFieldValue } = useFormField(widgetId);
  const { value: defaultValue } = useFormData(widgetId, valueFrom, type);

  const { check: applyUnderCondition } = useCheckFrom(widgetId, valueFrom?.applyWhen, true);

  const shouldApplyValue = useMemo(() => {
    if (!valueFrom || !hasValue(defaultValue)) {
      return false;
    }

    if (valueFrom?.applyWhen && !applyUnderCondition) {
      return false;
    }

    if (defaultValue !== value) {
      return true;
    }

    return true;
  }, [widgetId, defaultValue, value, applyUnderCondition, valueFrom]);

  useEffect(() => {
    if (shouldApplyValue) {
      setFieldValue(defaultValue, 'useValueFrom');
    }
  }, [shouldApplyValue, defaultValue, setFieldValue]);
};

export default useValueFrom;
