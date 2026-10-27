import React, { useCallback, useMemo, useState, memo } from 'react';
import { Box } from '@mui/material';
import { AnyType } from '@pkg-common/types';
import { COMMON } from '@pkg-constants/translationNamespaces';
import FilterCard from '@pkg-form/components/FilterSearchPanel/FilterCard';
import DynamicForm from '@pkg-form/components/DynamicForm/DynamicForm';
import useTable from '@pkg-list/hooks/useTable';
import useTableFilterActions from '@pkg-list/hooks/useTableFilterActions';
import { getActiveCriteriaCount } from '@pkg-list/utils/tableRowUtils';
import FormAccordionProvider from '@pkg-form/groups/contexts/FormAccordionProvider';

interface FilterPanelInnerProps {
  id: string;
  namespace: string;
  schema: AnyType;
  uiSchema: AnyType;
  filtersVisible?: boolean;
  onStartOver?: () => void;
}

interface FilterPanelProps {
  id: string;
  namespace: string;
  schema: AnyType;
  uiSchema: AnyType;
  filtersVisible?: boolean;
  filtersType: string;
  onStartOver?: () => void;
}
interface FilterFormWrapperProps {
  id: string;
  namespace: string;
  schema: AnyType;
  uiSchema: AnyType;
  filtersVisible: boolean;
  filterData: AnyType;
  setFilterData: (data: any) => void;
}

interface FilterTopCardProps {
  id: string;
  isEditing: boolean;
  onEditFilters: (isEditing: boolean) => void;
  namespace: string;
  activeFilterCount: number;
  onStartOver?: () => void;
}

const FilterFormWrapper = memo(
  ({
    id,
    namespace,
    schema,
    uiSchema,
    filtersVisible,
    filterData,
    setFilterData,
  }: FilterFormWrapperProps) => {
    const formContext = useMemo(
      () => ({
        mechanism: 'DEFAULT',
        hideButtons: true,
        id,
        namespace,
        filtersVisible,
        filterMode: true,
      }),
      [id, namespace, filtersVisible],
    );

    return (
      <DynamicForm
        id={`${id}-filters`}
        schema={schema}
        uiSchema={uiSchema}
        data={filterData}
        formContext={formContext}
        onChange={setFilterData}
      />
    );
  },
);
FilterFormWrapper.displayName = 'FilterFormWrapper';

const FilterPanelInner = memo(
  ({
    id,
    namespace = COMMON,
    schema,
    uiSchema,
    filtersVisible = true,
    onStartOver,
  }: FilterPanelInnerProps) => {
    const [isEditing, setIsEditing] = useState(true);
    const { filterData, setFilterData, criteria } = useTable(id);

    const activeFilterCount = useMemo(() => getActiveCriteriaCount(criteria), [criteria]);

    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <FilterTopCard
          id={id}
          activeFilterCount={activeFilterCount}
          isEditing={isEditing}
          onEditFilters={setIsEditing}
          namespace={namespace}
          onStartOver={onStartOver}
        />
        {isEditing && (
          <FilterFormWrapper
            id={id}
            namespace={namespace}
            schema={schema}
            uiSchema={uiSchema}
            filtersVisible={filtersVisible}
            filterData={filterData}
            setFilterData={setFilterData}
          />
        )}
      </Box>
    );
  },
);
FilterPanelInner.displayName = 'FilterPanelInner';

const FilterTopCard = memo(
  ({ id, isEditing, onEditFilters, activeFilterCount, onStartOver }: FilterTopCardProps) => {
    const { applyFilters, clearFilters } = useTableFilterActions({ tableId: id });

    const handleOnSearch = useCallback(() => {
      if (isEditing) onEditFilters(false);
      applyFilters();
    }, [applyFilters, isEditing, onEditFilters]);

    const handleStartOver = useCallback(() => {
      onEditFilters(true);
      clearFilters();
      onStartOver?.();
    }, [clearFilters, onEditFilters, onStartOver]);

    const handleOnEditFilters = useCallback(() => {
      onEditFilters(true);
    }, [onEditFilters]);

    return (
      <FilterCard
        activeFilterCount={activeFilterCount}
        isEditing={isEditing}
        onEditFilters={handleOnEditFilters}
        onSearch={handleOnSearch}
        onStartOver={handleStartOver}
        id={`${id}-filters`}
      />
    );
  },
);
FilterTopCard.displayName = 'FilterTopCard';

const FilterPanel = ({
  id,
  namespace = COMMON,
  schema,
  uiSchema,
  filtersVisible = true,
  filtersType,
  onStartOver,
}: FilterPanelProps) => {
  if (filtersType !== 'TOP') return null;
  return (
    <FormAccordionProvider>
      <FilterPanelInner
        id={id}
        namespace={namespace}
        schema={schema}
        uiSchema={uiSchema}
        filtersVisible={filtersVisible}
        onStartOver={onStartOver}
      />
    </FormAccordionProvider>
  );
};
export default FilterPanel;
