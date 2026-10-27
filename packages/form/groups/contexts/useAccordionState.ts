import { useCallback, useEffect, useMemo, useState } from 'react';

const useAccordionState = () => {
  const [states, setStates] = useState<{ [id: string]: boolean }>({});

  const setAccordionState = useCallback(
    (id: string, state: boolean) => {
      setStates((prev) => ({ ...prev, [id]: state }));
    },
    [setStates],
  );

  const areMostExpanded = useMemo(() => {
    const expandedCount = Object.keys(states).filter((k) => states[k])?.length;
    const collapsedCount = Object.keys(states).filter((k) => !states[k])?.length;
    return expandedCount > collapsedCount;
  }, [states]);

  const toggleAll = useCallback(() => {
    setStates((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => (next[k] = !areMostExpanded));
      return next;
    });
  }, [areMostExpanded]);

  return useMemo(
    () => ({
      toggleAll,
      setAccordionState,
      areMostExpanded,
    }),
    [toggleAll, setAccordionState, areMostExpanded],
  );
};

export default useAccordionState;
