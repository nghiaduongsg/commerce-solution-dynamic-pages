import React, { useCallback, useEffect, useMemo } from 'react';
import { Checkbox, Radio, TableCell, Typography } from '@mui/material';
import useTable from '@pkg-list/hooks/useTable';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useSelector } from 'react-redux';
import { selectTableSelectedRows } from '@pkg-list/src/selectors';
import { GenericTableToggleCellProps } from './GenericTableToggleCell.d';
import { useTranslation } from 'react-i18next';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useTheme } from '@mui/material/styles';
import useNotifiers from '@pkg-common/notifier/useNotifiers';

const GenericTableToggleCell = ({
  tableId,
  rowId,
  isMultiSelect,
  columnIndex = 0,
  disabled,
  sticky = true,
  maxLimit,
}: GenericTableToggleCellProps) => {
  const styles = getStyles(useTheme());
  const { toggleTableRow, allExtraData, selectedRowsNumber } = useTable(tableId);
  const { enqueueSnackbar } = useNotifiers();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const selectedRows = useSelector(selectTableSelectedRows(tableId, columnIndex));

  const isSelected = useMemo(() => {
    return !!selectedRows[rowId];
  }, [selectedRows, rowId]);

  const extraValue = useMemo(() => {
    if (!allExtraData) {
      return '';
    }

    if (!allExtraData[columnIndex]) {
      return '';
    }

    return allExtraData[columnIndex][rowId];
  }, [allExtraData, columnIndex, rowId]);

  const onSelectTableRow = useCallback(
    (event) => {
      // Check maxLimit constraint before toggling
      if (maxLimit && !isSelected && selectedRowsNumber >= maxLimit) {
        enqueueSnackbar({
          message: translate('maxSelectionExceeded', {
            ns: COMMON,
            lng: selectedLanguage,
            max: maxLimit,
            count: selectedRowsNumber,
          }),
          severity: 'error',
          key: Date.now(),
        });
        return;
      }

      toggleTableRow?.(event.target.name, isMultiSelect, columnIndex);
    },
    [
      maxLimit,
      isSelected,
      selectedRowsNumber,
      toggleTableRow,
      columnIndex,
      isMultiSelect,
      enqueueSnackbar,
      translate,
      selectedLanguage,
    ],
  );

  const ControlComponent = isMultiSelect ? Checkbox : Radio;
  const disabledBasedOnLimit = useMemo(() => {
    if (!maxLimit) {
      return false;
    }

    return selectedRowsNumber >= maxLimit;
  }, [selectedRowsNumber, maxLimit]);

  const isDisabled = useMemo(() => {
    return disabled || (disabledBasedOnLimit && !isSelected);
  }, [disabled, disabledBasedOnLimit, isSelected]);

  useEffect(() => {
    if (maxLimit && selectedRowsNumber === maxLimit) {
      enqueueSnackbar({
        message: translate('maxSelectionExceeded', {
          ns: COMMON,
          lng: selectedLanguage,
          max: maxLimit,
          count: selectedRowsNumber,
        }),
        severity: 'error',
        key: Date.now(),
      });
    }
  }, [maxLimit, selectedRowsNumber, enqueueSnackbar, translate, selectedLanguage]);

  return (
    <TableCell
      tabIndex={0}
      width={40}
      role="cell"
      aria-label={translate('toggleAll', { ns: COMMON, lng: selectedLanguage })}
      sx={{ ...styles.tableBodyRowCell, ...(sticky ? styles.tableStickyCell : {}) }}
    >
      <div style={extraValue ? { display: 'flex', alignItems: 'center' } : undefined}>
        <Typography>{extraValue}</Typography>

        {!isDisabled && (
          <ControlComponent
            id={`${tableId}-${rowId}-${columnIndex}-checkbox`}
            data-testid={`${tableId}-${rowId}-${columnIndex}-checkbox`}
            style={isSelected ? { pointerEvents: 'auto' } : {}}
            tabIndex={0}
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTableRow(e);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onSelectTableRow(e);
              }
            }}
            name={rowId?.toString()}
            color={extraValue ? 'secondary' : 'default'}
            role={isMultiSelect ? 'radio' : 'checkbox'}
            aria-checked={isSelected}
            inputProps={{
              'aria-label': translate('toggleAll', { ns: COMMON, lng: selectedLanguage }),
            }}
          />
        )}
      </div>
    </TableCell>
  );
};

export default GenericTableToggleCell;
