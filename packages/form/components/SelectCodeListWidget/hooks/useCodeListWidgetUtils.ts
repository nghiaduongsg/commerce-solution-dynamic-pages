import { useCallback, useMemo } from 'react';
import { AnyType } from '@pkg-common/types';

const useCodeListWidgetUtils = (value, multiple: boolean, mapToProperty?: string) => {
  const getUpdatedValue = useCallback(
    (selectedValue) => {
      if (!mapToProperty) {
        return selectedValue;
      }
      if (!multiple) {
        return { [mapToProperty]: selectedValue };
      } else {
        return (selectedValue || []).map((v: AnyType, i: number) => ({
          ...(value?.[i] || {}),
          [mapToProperty]: v,
        }));
      }
    },
    [mapToProperty, multiple],
  );

  const selectedValue = useMemo(() => {
    if (!value) {
      return multiple ? [] : '';
    }

    if (!mapToProperty) {
      return value;
    }
    if (!multiple) {
      return value[mapToProperty];
    } else {
      return (value || []).map((v) => v[mapToProperty]);
    }
  }, [value, multiple]);

  return {
    selectedValue,
    getUpdatedValue,
  };
};

export default useCodeListWidgetUtils;
