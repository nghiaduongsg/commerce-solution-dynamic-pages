import React, { useCallback, useState } from 'react';
import { usePreventDoubleClick } from '@pkg-common/hooks/usePreventDoubleClick';
import { WarnOnActionSchema } from '@pkg-form/types';
import { AnyType } from '@pkg-common/types';

export const useButtonClick = (
  warning: WarnOnActionSchema | AnyType,
  onClick: ((_: AnyType) => void) | undefined,
  ref?:
    | React.MutableRefObject<HTMLElement | null>
    | ((_: React.MutableRefObject<HTMLElement | null>) => void),
  openInNewTab?: boolean,
) => {
  const { disabled: inProgress, disable } = usePreventDoubleClick();

  const [clicked, setClicked] = useState(false);

  const onButtonClick = useCallback(
    (e) => {
      if (openInNewTab) {
        return;
      }
      e?.preventDefault();
      e?.stopPropagation();

      if (warning) {
        setClicked(true);
      } else {
        if (onClick) {
          disable();
          onClick?.(e);
          setClicked(false);
        }
      }

      if (ref && typeof ref === 'function') {
        ref(e?.currentTarget);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = e?.currentTarget;
      }
    },
    [openInNewTab, warning, ref, onClick, disable],
  );

  const onConfirm = useCallback(
    (e): void => {
      setClicked(false);
      if (onClick) {
        disable();
        onClick(e);
      }
    },
    [onClick, disable],
  );

  const onCancel = useCallback(() => setClicked(false), [setClicked]);

  return { onConfirm, onCancel, onButtonClick, clicked, inProgress };
};
