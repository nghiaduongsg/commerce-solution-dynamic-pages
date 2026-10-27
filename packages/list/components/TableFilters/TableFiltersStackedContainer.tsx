import React, { useCallback, useState, memo, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import { AnyType } from '@pkg-common/types';
import FilterCard from '@pkg-form/components/FilterSearchPanel/FilterCard';
import FormAccordionProvider from '@pkg-form/groups/contexts/FormAccordionProvider';
import TableFilters from '@pkg-list/components/TableFilters/TableFilters';
import { TableFiltersMode } from '@pkg-list/src/types';
import useTable from '@pkg-list/hooks/useTable';
import useDebouncedAction from '@pkg-common/hooks/useDebouncedAction';
import { getDebounceDelay } from '@pkg-form/validations/utils/widgetUtils';
import { getActiveCriteriaCount } from '@pkg-list/utils/tableRowUtils';
import { useBottomSearchPanelContext } from '@pkg-layout/src/common/contexts/BottomSearchPanelContext';
import BottomSearchPanelProvider from '@pkg-layout/src/common/contexts/BottomSearchPanelProvider';

interface FilterPanelProps {
  id: string;
  schema: AnyType;
  uiSchema: AnyType;
  mode?: TableFiltersMode;
}

interface FilterTopCardProps {
  tableId: string;
  isEditing: boolean;
  onEditFilters: (isEditing: boolean) => void;
}

const FilterPanelInner = memo(({ id, schema, uiSchema, mode }: FilterPanelProps) => {
  const { isBottomSearchPanelVisible } = useBottomSearchPanelContext();
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    setIsEditing(isBottomSearchPanelVisible ?? true);
  }, [isBottomSearchPanelVisible]);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {mode === 'ON_CLICK' && (
        <FilterTopCard tableId={id} isEditing={isEditing} onEditFilters={setIsEditing} />
      )}

      <Box sx={{ marginTop: 4 }}>
        {isEditing && (
          <TableFilters
            id={id}
            jsonSchema={schema || {}}
            uiSchema={uiSchema || {}}
            mode={mode}
            type={'TOP'}
          />
        )}
      </Box>
    </Box>
  );
});
FilterPanelInner.displayName = 'FilterPanelInner';

const FilterTopCard = memo(({ tableId, isEditing, onEditFilters }: FilterTopCardProps) => {
  const { applyCriteria, clearCriteria, criteria } = useTable(tableId);
  const activeFilterCount = useMemo(() => getActiveCriteriaCount(criteria), [criteria]);
  const { hideBottomSearchPanel } = useBottomSearchPanelContext();

  const onApply = useCallback(() => {
    hideBottomSearchPanel();
    if (isEditing) {
      onEditFilters(false);
    }
    applyCriteria();
  }, [applyCriteria, isEditing, onEditFilters, hideBottomSearchPanel]);

  const onClear = useCallback(() => {
    onEditFilters(true);
    clearCriteria();
  }, [clearCriteria, onEditFilters]);

  const onReedit = useCallback(() => {
    onEditFilters(true);
  }, [onEditFilters]);

  const applyFiltersDebounced = useDebouncedAction(onApply, getDebounceDelay(true) + 50);
  const clearFiltersDebounced = useDebouncedAction(onClear, getDebounceDelay(true) + 50);

  return (
    <FilterCard
      activeFilterCount={activeFilterCount}
      isEditing={isEditing}
      onEditFilters={onReedit}
      onSearch={applyFiltersDebounced}
      onStartOver={clearFiltersDebounced}
      id={`${tableId}-filters`}
    />
  );
});
FilterTopCard.displayName = 'FilterTopCard';

const TableFiltersStackedContainer = ({ id, schema, uiSchema, mode }: FilterPanelProps) => {
  return (
    <BottomSearchPanelProvider>
      <FormAccordionProvider>
        <FilterPanelInner id={id} schema={schema} uiSchema={uiSchema} mode={mode} />
      </FormAccordionProvider>
    </BottomSearchPanelProvider>
  );
};
export default TableFiltersStackedContainer;
