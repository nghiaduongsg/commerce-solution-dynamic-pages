import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import useTable from '@pkg-list/hooks/useTable';
import { ACCESSIBILITY } from '@pkg-constants/translationNamespaces';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTheme } from '@mui/material/styles';
import { hasValue } from '@pkg-common/utils';
import { jpValue } from '@pkg-common/dataResolver/utils';

const TableSelectionsSummary = ({
  tableId,
  rowId,
  labelPath,
}: {
  tableId: string;
  rowId: string;
  labelPath: Array<string>;
}) => {
  const styles = getStyles(useTheme());

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([ACCESSIBILITY]);

  const { selectedEntities, toggleTableRow } = useTable(tableId);

  return (
    <Box sx={styles.tableSelectionSummaryContainer} id="filters-container">
      {selectedEntities
        ?.filter((s) => !!s)
        ?.map((s) => (
          <Tooltip
            key={s[rowId]}
            title={jpValue(s, labelPath)}
            placement="top"
            role={hasValue(jpValue(s, labelPath)) ? 'tooltip' : undefined}
          >
            <Chip
              key={s[rowId]}
              id={`table-filter-${s[rowId]}`}
              data-testid={`table-filter-${s[rowId]}`}
              clickable
              label={jpValue(s, labelPath)}
              onDelete={() => toggleTableRow(s[rowId], true)}
              size="medium"
              variant="outlined"
              color="primary"
              sx={styles.tableSelectionChip}
              aria-label={jpValue(s, labelPath)}
              aria-description={translate('filterChipAriaDescription', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              onClick={() => toggleTableRow(s[rowId], true)}
            />
          </Tooltip>
        ))}
    </Box>
  );
};

export default TableSelectionsSummary;
