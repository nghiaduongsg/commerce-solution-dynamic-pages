import { useRef, useEffect } from 'react';
import { AnyType } from '@pkg-common/types';

function usePrevious(value: AnyType) {
  const ref = useRef<AnyType>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default usePrevious;
