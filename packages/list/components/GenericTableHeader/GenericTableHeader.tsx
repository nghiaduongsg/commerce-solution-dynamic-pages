import React from 'react';
import { TableCell, TableHead, TableRow, Box } from '@mui/material';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import { TableHeaderProps } from './GenericTableHeader.d';
import GenericCheckbox from '@pkg-common/atomics/GenericCheckbox/GenericCheckbox';
import useTable from '@pkg-list/hooks/useTable';
import GenericTableHeaderCell from '../GenericTableHeaderCell/GenericTableHeaderCell';
import { useTheme } from '@mui/material/styles';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';
import { COMMON, ACCESSIBILITY } from '@pkg-constants/translationNamespaces';

const SelectAllCell = ({
  tableId,
  baseDataTestId,
  showCountBadge = false,
  maxLimit,
}: {
  tableId: string;
  baseDataTestId?: string;
  showCountBadge?: boolean;
  maxLimit?: number;
}) => {
  const { allRowsSelected, toggleAllTableRows, selectedRowsNumber } = useTable(tableId);
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const theme = useTheme();

  return (
    <TableCell width={showCountBadge ? 60 : 40} sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <GenericCheckbox
          id={`${baseDataTestId}-toggle-all-rows`}
          value={allRowsSelected ?? false}
          onChange={(checked) => toggleAllTableRows && toggleAllTableRows(checked)}
        />
        {showCountBadge && selectedRowsNumber > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
              fontWeight: 500,
              fontSize: '0.75rem',
              boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
              px: 0.5,
            }}
            aria-label={translate('selectionLimitAriaLabel', {
              ns: ACCESSIBILITY,
              count: selectedRowsNumber,
              max: maxLimit,
            })}
          >
            {selectedRowsNumber}
          </Box>
        )}
      </Box>
    </TableCell>
  );
};

const SelectionCountBadge = ({ tableId, maxLimit }: { tableId: string; maxLimit?: number }) => {
  const { selectedRowsNumber } = useTable(tableId);
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const theme = useTheme();

  return (
    <TableCell width={40} sx={{ textAlign: 'center' }}>
      {selectedRowsNumber > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
            fontWeight: 500,
            fontSize: '0.875rem',
            boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
            margin: '0 auto',
          }}
          aria-label={translate('selectionLimitAriaLabel', {
            ns: ACCESSIBILITY,
            count: selectedRowsNumber,
            max: maxLimit,
          })}
        >
          {selectedRowsNumber}
        </Box>
      )}
    </TableCell>
  );
};

export default function GenericTableHeader({
  namespaces,
  tableId,
  selections,
  baseDataTestId,
  extraHeaderColumns = 0,
  hasRowActions,
  hasMandatoryBulkActionCriterion = false,
}: Readonly<TableHeaderProps>) {
  const styles = getStyles(useTheme());
  const {
    enabled: selectable = false,
    multiple: isMultiSelect = false,
    allowSelectAll = false,
    selectionLabel = {},
    maxLimit,
  } = selections || {};

  const { visibleColumns, innerVisibleColumns = [], tableData } = useTable(tableId);

  return (
    <TableHead sx={styles.tableHeader} tabIndex={0} role={'rowgroup'}>
      <TableRow role="row">
        {selectable && isMultiSelect && (
          <>
            {allowSelectAll && (
              <SelectAllCell
                tableId={tableId}
                baseDataTestId={baseDataTestId}
                showCountBadge={hasMandatoryBulkActionCriterion}
                maxLimit={maxLimit}
              />
            )}
            {!allowSelectAll && hasMandatoryBulkActionCriterion && (
              <SelectionCountBadge tableId={tableId} maxLimit={maxLimit} />
            )}
          </>
        )}
        {selectable && !allowSelectAll && !(isMultiSelect && hasMandatoryBulkActionCriterion) && (
          <GenericTableHeaderCell
            key={!isEmpty(selectionLabel) ? selectionLabel.name : 'selections'}
            namespaces={namespaces}
            tableId={tableId}
            column={
              !isEmpty(selectionLabel)
                ? selectionLabel
                : { name: 'selections', ariaLabel: 'selectionsHeaderAriaLabel' }
            }
            sx={styles.tableCellColored}
          />
        )}
        {innerVisibleColumns?.length > 0 && (
          <TableRow>
            <TableCell width={40} />
          </TableRow>
        )}
        {visibleColumns?.map((column) => (
          <GenericTableHeaderCell
            key={column.name}
            namespaces={namespaces}
            tableId={tableId}
            column={column}
          />
        ))}
        {hasRowActions && tableData.length > 0 && (
          <GenericTableHeaderCell
            key={'actions'}
            namespaces={namespaces}
            tableId={tableId}
            column={{
              name: 'actions',
              ariaLabel: 'tableActionsHeaderAriaLabel',
            }}
            sx={styles.tableStickyCell}
          />
        )}
        {Array.from({ length: extraHeaderColumns }, (_v, i) => i).map((_item, index) => {
          return (
            <GenericTableHeaderCell
              key={`extra_header_${index}`}
              namespaces={namespaces}
              tableId={tableId}
              column={(visibleColumns?.length ?? 0) + (index + 1)}
            />
          );
        })}
      </TableRow>
    </TableHead>
  );
}
