import { DefaultValueFromSchema } from '@pkg-form/types';
import { hasValue } from '@pkg-common/utils/utils';
import { useEffect, useMemo } from 'react';
import useFormData from '@pkg-common/dataResolver/useFormData';
import useEntity from '@pkg-entity/hooks/useEntity';
import useFormField from '@pkg-entity/hooks/useFormField';
import { DataSourceSchema } from '@pkg-common/types';

const useItemsPrefilling = (fieldId: string, items, defaultValueFrom: DefaultValueFromSchema) => {
  const { addItem, removeItem } = useFormField(fieldId);
  const { value } = useFormData(fieldId, defaultValueFrom as DataSourceSchema);
  const { extras } = useEntity(defaultValueFrom?.code);

  const shouldApplyDefaultValues = useMemo(() => {
    return defaultValueFrom && defaultValueFrom.code;
  }, [defaultValueFrom]);

  const shouldApplyDefaultValuesToWidget = useMemo(() => {
    return extras?.widgetId === fieldId;
  }, [extras, fieldId]);

  useEffect(() => {
    const shouldApply = !(!shouldApplyDefaultValues || !shouldApplyDefaultValuesToWidget);

    if (shouldApply) {
      if (hasValue(value) && value.length < items.length) {
        for (let i = items.length - 1; i >= value.length; i--) {
          removeItem(i);
        }
      } else if (hasValue(value) && value.length > items.length) {
        for (let i = 0; i < value.length - items.length; i++) {
          addItem({});
        }
      }
    }
  }, [value, shouldApplyDefaultValues, shouldApplyDefaultValuesToWidget]);
};

export default useItemsPrefilling;
