import { useEffect, useMemo } from 'react';
import { getWidgetArrayPosition } from '@pkg-form/validations/utils/widgetUtils';
import { ApplyValueFromComparisonSchema } from '@pkg-form/types';
import useFormField from '@pkg-entity/hooks/useFormField';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { isArray } from 'lodash';

const useApplyValueFromComparison = (
  widgetId: string,
  mode: 'READ' | 'EDIT',
  applyValueFromComparison?: ApplyValueFromComparisonSchema,
) => {
  const { currentForm, comparedForm } = applyValueFromComparison || {};
  const index = getWidgetArrayPosition(widgetId);

  const { property: currentFormProperty = '' } = currentForm || {};
  const { property: comparedFormProperty = '' } = comparedForm || {};

  const { value: currentData } = useFormData(widgetId, currentForm);
  const { value: data } = useFormData(widgetId, comparedForm);

  const { value, setFieldValue } = useFormField(widgetId, undefined);

  const foundValue = useMemo(() => {
    if (!index || !currentData || !data || !isArray(currentData) || !isArray(data)) {
      return null;
    }

    const valueToCompare = data[index] && data[index][comparedFormProperty];

    const valueToCompareIndex = currentData.findIndex(
      (v) => v[currentFormProperty] === valueToCompare,
    );

    if (valueToCompareIndex > -1) {
      return currentData[valueToCompareIndex].value;
    } else {
      return null;
    }
  }, [index, currentData, data]);

  useEffect(() => {
    if (applyValueFromComparison) {
      setFieldValue(mode === 'EDIT' ? value : foundValue);
    }
  }, [applyValueFromComparison, setFieldValue, value, foundValue, mode]);
};

export default useApplyValueFromComparison;
