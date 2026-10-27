import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import useTable from '@pkg-list/hooks/useTable';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import { useTheme } from '@mui/material/styles';
import { TableFiltersChips } from './TableFiltersChips';
import { FilterPreferencesActions } from './FilterPreferencesActions';

const TableFiltersSummary = ({
  tableId,
  namespace,
  baseDataTestId = tableId,
  filterUiSchema,
}: {
  tableId: string;
  namespace: string;
  baseDataTestId?: string;
  filterUiSchema?: Record<string, unknown>;
}) => {
  const styles = getStyles(useTheme());

  const { criteria = {}, notPredefinedCriteria } = useTable(tableId);

  const totalCriteria = useMemo(
    () => Object.keys(notPredefinedCriteria || {}).filter((c) => !!notPredefinedCriteria[c]).length,
    [notPredefinedCriteria],
  );

  const hasCriteria = !!Object.keys(criteria).length;

  if (!hasCriteria) {
    return null;
  }

  return (
    <Box sx={styles.tableFiltersSummaryContainer} id="filters-container">
      <Box sx={{ alignSelf: 'flex-end' }}>
        <TableFiltersChips
          tableId={tableId}
          namespace={namespace}
          filterUiSchema={filterUiSchema}
        />
      </Box>
      {totalCriteria > 0 && (
        <FilterPreferencesActions tableId={tableId} baseDataTestId={baseDataTestId} />
      )}
    </Box>
  );
};

export default TableFiltersSummary;
