import { useMemo } from 'react';
import { useStore } from 'react-redux';
import { resolveSourceData } from '@pkg-common/dataResolver/utils';
import { resolveDefaultCriteria, DefaultCriteriaValue } from '@pkg-common/utils/defaultCriteria';

const useResolvedDefaultCriteria = (
  tableId: string,
  defaultCriteria?: { [key: string]: DefaultCriteriaValue },
) => {
  const store = useStore();

  return useMemo(() => {
    if (!defaultCriteria) return {};
    const state = store.getState();
    return resolveDefaultCriteria(defaultCriteria, (src) =>
      resolveSourceData(tableId, { state }, { source: src?.source }),
    );
  }, [store, tableId, defaultCriteria]);
};

export default useResolvedDefaultCriteria;
