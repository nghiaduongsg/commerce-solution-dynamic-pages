import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import { useCallback, useEffect, useMemo } from 'react';
import jp from 'jsonpath';
import useClearApiData from '@pkg-core/apiData/hooks/useClearApiData';
import { useFormManagerContext } from '@pkg-form/FormManagerContext';
import { isValidWidgetId } from '@pkg-form/validations/utils/widgetUtils';

const useDisableValues = ({ fieldId, items, options, isDisabled = false }) => {
  const { setFieldDisabledValues = () => 0 } = useFormManagerContext();

  const { uniqueFields, uniqueFieldsIf } = options;

  const { check: applyUniqueFields } = useCheckFrom(fieldId, uniqueFieldsIf || {});
  const { apisFinished } = useClearApiData();

  const setDisabledValues = useCallback(
    (items) => {
      setFieldDisabledValues(fieldId, items);
    },
    [fieldId, setFieldDisabledValues],
  );

  const disabledValues = useMemo(() => {
    if (!apisFinished || isDisabled || !isValidWidgetId(fieldId)) {
      return '__NOT_APPLICABLE__';
    }

    if (!uniqueFields?.length || !items) {
      return '__NOT_APPLICABLE__';
    }
    if (uniqueFieldsIf && !applyUniqueFields) {
      return '__NOT_APPLICABLE__';
    }

    const allItemData = items?.map((item) => item?.children?.props?.formData || item);

    const disabledDataValues = {};
    uniqueFields.forEach(
      (f) =>
        (disabledDataValues[f?.replace(/\./g, '_')] = allItemData
          .map((item) => jp.value(item, f))
          .filter((value) => !!value)),
    );
    return JSON.stringify(disabledDataValues || {});
  }, [uniqueFields, items, uniqueFieldsIf, applyUniqueFields, apisFinished, isDisabled, fieldId]);

  useEffect(() => {
    if (disabledValues !== '__NOT_APPLICABLE__') {
      setDisabledValues(JSON.parse(disabledValues));
    }
  }, [disabledValues]);
};

export default useDisableValues;
