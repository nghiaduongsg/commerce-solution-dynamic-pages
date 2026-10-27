import { useEffect, useMemo, useState, useRef } from 'react';

import { DefaultValueFromSchema } from '@pkg-form/types';
import useFormData from '@pkg-common/dataResolver/useFormData';
import usePrevious from '@pkg-common/hooks/usePrevious';
import { hasValue } from '@pkg-common/utils/utils';
import useEntity from '@pkg-entity/hooks/useEntity';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';
import useCodeListQuery from '@pkg-core/codeList/hooks/useCodeListQuery';
import useFormField from '@pkg-entity/hooks/useFormField';
import jp from 'jsonpath';
import { useParams } from 'react-router';
import isEqual from 'lodash/isEqual';

const useDefaultValueFrom = (
  widgetId: string,
  defaultValueFrom?: DefaultValueFromSchema,
  wrapToProperty?: string,
) => {
  const {
    applyChangeWhen,
    mode = 'EVERY_TIME_DEFAULT_VALUE_CHANGES',
    relatedCodeList,
    relatedObject,
    exclude,
    applyEmptyValues = false,
  } = defaultValueFrom || {};

  const routeParams = useParams<{ idKey?: string }>();
  const hasBeenSaved = useMemo(() => {
    return !!routeParams?.idKey;
  }, [routeParams?.idKey]);

  const { value, setFieldValue } = useFormField(widgetId);

  const { value: defaultValue } = useFormData(widgetId, defaultValueFrom);
  const { extras } = useEntity(defaultValueFrom?.code);

  const [valueHasChanged, setValueHasChanged] = useState(false);
  const prevValue = usePrevious(value);

  const { check: applyUnderCondition } = useCheckFrom(widgetId, applyChangeWhen);
  // @ts-ignore
  const applyUnderCodelistCondition = useCodeListQuery(widgetId, relatedCodeList || relatedObject);

  const shouldApplyDefaultValue = useMemo(() => {
    if (!defaultValueFrom || !defaultValueFrom.code) {
      return false;
    }

    let shouldApply = true;

    if (applyChangeWhen) {
      shouldApply = applyUnderCondition;
    }

    if (!applyUnderCodelistCondition) {
      shouldApply = applyUnderCodelistCondition;
    }

    if (mode === 'APPLY_WHEN_FIELD_VALUE_EMPTY' && hasValue(value)) {
      shouldApply = false;
    }

    if (mode === 'ONLY_ONCE' && valueHasChanged) {
      shouldApply = false;
    }

    if (
      (mode === 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES' ||
        mode === 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES_AFTER_SAVE') &&
      valueHasChanged
    ) {
      shouldApply = false;
    }

    if (mode === 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES' && hasBeenSaved) {
      shouldApply = false;
    }

    return shouldApply;
  }, [
    widgetId,
    extras?.widgetId,
    defaultValueFrom,
    applyUnderCondition,
    value,
    valueHasChanged,
    applyUnderCodelistCondition,
    hasBeenSaved,
  ]);

  // This effect is responsible for setting the shouldApplyDefaultValue condition to be truthy only once
  // only if we provide the @applyOnce attribute with value true into the @defaultValueFrom
  useEffect(() => {
    if (prevValue !== value) {
      setValueHasChanged(true);
    }
  }, [mode, prevValue, value]);

  useEffect(() => {
    if (
      mode === 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES' ||
      mode === 'EVERY_TIME_DEFAULT_VALUE_CHANGES_AND_ALLOW_OVERRIDES_AFTER_SAVE'
    ) {
      setValueHasChanged(false);
    }
  }, [mode, defaultValue]);

  const lastSetValue = useRef<any>(undefined);

  useEffect(() => {
    if (!hasValue(value) && hasValue(lastSetValue.current)) {
      lastSetValue.current = undefined;
    }

    if (shouldApplyDefaultValue) {
      const finalValue = hasValue(defaultValue) || applyEmptyValues ? defaultValue : value;

      if (exclude) {
        try {
          const nodes = jp.apply(finalValue, `$..${exclude}`, () => {
            return '';
          });
          nodes.forEach((node) => {
            jp.apply(finalValue, node.path, node.value);
          });
        } catch {}
      }

      const valueToSet =
        wrapToProperty && typeof finalValue !== 'object'
          ? { [wrapToProperty]: finalValue }
          : finalValue;

      if (!isEqual(lastSetValue.current, valueToSet)) {
        lastSetValue.current = valueToSet;
        setFieldValue(valueToSet, 'useDefaultValueFrom');
      }
    }
  }, [shouldApplyDefaultValue, defaultValue, value, setFieldValue]);
};

export default useDefaultValueFrom;
