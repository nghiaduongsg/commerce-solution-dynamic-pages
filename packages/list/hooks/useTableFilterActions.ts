import { useCallback } from 'react';
import useTable from '@pkg-list/hooks/useTable';

const useTableFilterActions = ({ tableId }: { tableId: string }) => {
  const { applyCriteria, clearCriteria } = useTable(tableId);

  const applyFilters = useCallback(() => applyCriteria(), [applyCriteria]);
  const clearFilters = useCallback(() => clearCriteria(), [clearCriteria]);

  return { applyFilters, clearFilters };
};

export default useTableFilterActions;
