import { useEffect } from 'react';

import { DefaultValueFromSchema, SubformSchema } from '@pkg-form/types';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { getArrayItemData } from '@pkg-form/validations/utils/formUtils';
import useFormField from '@pkg-entity/hooks/useFormField';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { AnyType, DataSourceSchema } from '@pkg-common/types';

const useDefaultArrayItems = (
  fieldId: string,
  defaultValueFrom?: DefaultValueFromSchema,
  items: Array<AnyType> = [],
  subform?: SubformSchema,
) => {
  const { applyChangeWhen } = defaultValueFrom || {};
  const { addItem, removeItem } = useFormField(fieldId);
  const { check: applyUnderCondition } = useCheckFrom(fieldId, applyChangeWhen, true);
  const { value } = useFormData(fieldId, defaultValueFrom as DataSourceSchema);

  useEffect(() => {
    if (!applyUnderCondition) {
      return;
    }
    if (defaultValueFrom && value && value.length <= items.length) {
      for (let i = items.length - 1; i >= value.length; i--) {
        if (subform?.type === 'PARAMETERS') {
          const { currentFormProperty = '', comparedFormProperty = '' } = subform || {};
          const index = items.findIndex(
            (v) =>
              value[i] &&
              getArrayItemData(v[i])[currentFormProperty] === value[i][comparedFormProperty],
          );
          if (index < 0) {
            removeItem(i);
          }
        } else {
          removeItem(i);
        }
      }
    } else if (defaultValueFrom && value && value.length > items.length) {
      for (let i = 0; i < value.length - items.length; i++) {
        addItem({});
      }
    }
  }, [value]);
};

export default useDefaultArrayItems;
