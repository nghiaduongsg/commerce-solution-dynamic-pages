import { useEffect, useState } from 'react';

const useExpandAll = (setExpanded) => {
  const [expandAll, setExpandAll] = useState(false);

  useEffect(() => {
    const handleToggleEvent = (event: CustomEvent) => {
      setExpandAll(event.detail);
    };

    window.addEventListener('expandAccordions', handleToggleEvent as EventListener);

    return () => {
      window.removeEventListener('expandAccordions', handleToggleEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    if (expandAll) {
      setExpanded(true);
      setExpandAll(false);
    }
  }, [expandAll, setExpanded]);
};

export default useExpandAll;
