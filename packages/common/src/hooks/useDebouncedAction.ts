import { useCallback, useRef } from 'react';
import { FILTER_FORM_DEBOUNCE_MS } from '@pkg-constants/formCommon';
import { AnyType } from '@pkg-common/types';

const DEFAULT_DELAY = FILTER_FORM_DEBOUNCE_MS + 50;

const useDebouncedAction = (
  action: (params1?: AnyType, params2?: AnyType, params3?: AnyType) => void,
  delay = DEFAULT_DELAY,
): ((params1?: AnyType, params2?: AnyType, params3?: AnyType) => void) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (params1?: AnyType, params2?: AnyType, params3?: AnyType) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        action?.(params1, params2, params3);

        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }, delay);
    },
    [action, delay],
  );
};

export default useDebouncedAction;
