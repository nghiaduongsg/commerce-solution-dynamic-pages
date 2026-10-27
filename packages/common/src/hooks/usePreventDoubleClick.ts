import { useCallback, useEffect, useState } from 'react';

export const usePreventDoubleClick = () => {
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (disabled) {
      const timeout = setTimeout(() => {
        setDisabled(false);
        if (timeout) {
          clearTimeout(timeout);
        }
      }, 500);
    }
  }, [disabled]);

  const disable = useCallback(() => {
    setDisabled(true);
  }, []);

  return { disabled, disable };
};
