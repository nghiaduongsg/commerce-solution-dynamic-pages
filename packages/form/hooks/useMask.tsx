import { useEffect, useState } from 'react';
import useFormData from '@pkg-common/dataResolver/useFormData';
import { IMask, useIMask } from 'react-imask';
import { FieldConditionSchema } from '@pkg-common/types';
import useCheckFrom from '@pkg-common/dataResolver/useCheckFrom';

function useMask(
  id: string,
  maskProps: {
    pattern: string;
    prefixFrom?: FieldConditionSchema;
    applyWhen?: FieldConditionSchema;
    mode?: string;
  },
  onChange?: (_: string) => void,
) {
  const { prefixFrom, pattern, applyWhen } = maskProps || {};
  const { check: applyUnderCondition } = useCheckFrom(id, applyWhen, true);
  const { value: prefixFromValue } = useFormData(id, prefixFrom?.source || {});

  const [options, setOptions] = useState({});

  useEffect(() => {
    if (!applyUnderCondition) {
      setOptions({});
    } else {
      if (pattern === 'mm/dd') {
        setOptions({
          mask: 'mm-dd',
          lazy: false,
          blocks: {
            mm: { mask: IMask.MaskedRange, from: 1, to: 12 },
            dd: { mask: IMask.MaskedRange, from: 1, to: 31 },
          },
        });
      } else if (pattern === 'HH:mm') {
        setOptions({
          mask: 'HH:mm',
          lazy: false,
          blocks: {
            HH: { mask: IMask.MaskedRange, from: 0, to: 23, maxLength: 2 },
            mm: { mask: IMask.MaskedRange, from: 0, to: 59, maxLength: 2 },
          },
        });
      } else {
        setOptions({
          mask: pattern,
          lazy: false,
        });
      }
    }
  }, [applyUnderCondition, pattern]);

  const handleValueChange = (value: string) => {
    setTimeout(() => {
      let finalValue = value;
      if (prefixFrom && !value?.includes(prefixFromValue)) {
        finalValue = `${prefixFromValue}${value}`;
      }
      onChange?.(finalValue?.replace(/-/g, ''));
    }, 0);
  };

  const { ref, value, unmaskedValue } = useIMask(options ?? {}, {
    [maskProps?.mode === 'accept' ? 'onAccept' : 'onComplete']: handleValueChange,
  });

  return {
    ref,
    value,
    unmaskedValue,
    shouldApplyMask: applyUnderCondition,
  };
}

export default useMask;
