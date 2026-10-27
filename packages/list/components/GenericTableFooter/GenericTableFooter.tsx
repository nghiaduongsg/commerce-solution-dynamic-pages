import React, { useMemo, useState } from 'react';
import { TableFooter, TableRow, TablePagination, Box, TableCell } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TablePaginationActions from './TablePaginationActions';
import useTable from '@pkg-list/hooks/useTable';
import { GenericTableFooterProps } from './GenericTableFooter.d';
import GenericButton from '@pkg-common/components/GenericButton/GenericButton';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';

const buttonsContainer = {
  display: 'flex',
  justifyContent: 'flex-end',
};

const calculateFooterButtonId = (
  parentId: string | undefined,
  tableId: string,
  comparable: boolean | undefined,
) => {
  const footerId = comparable ? 'compare' : 'btn';
  const footerParentId = parentId ? `-${parentId}` : '';
  return `table-footer-${footerId}${footerParentId}-${tableId}`;
};

export default function GenericTableFooter({
  tableId,
  parentId,
  pagination,
  selections,
}: GenericTableFooterProps) {
  const theme = useTheme();
  const {
    comparable,
    onSelectionsApplied,
    onCancel,
    enabled: selectionsEnabled,
    label,
  } = selections;
  const { pageSizes = [5, 10, 15], enabled: paginationEnabled } = pagination;

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { page, pageSize, totalItems, visibleColumns, selectedEntities, setPage, setPageSize } =
    useTable(tableId);

  const [paginationAnnouncement, setPaginationAnnouncement] = useState('');

  const handleChangePage = (_, newPage: number) => {
    setPage && setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize && setPageSize(newSize);

    setPaginationAnnouncement(
      `${newSize} ${translate('rowsPerPage', { ns: COMMON, lng: selectedLanguage })} selected`,
    );
  };
  const footerButtonId = calculateFooterButtonId(parentId, tableId, comparable);

  const footerButtonLabel = comparable ? 'compare' : 'add';
  const footerButtonDisabled = useMemo(() => {
    const minNumberOfSelections = comparable ? 2 : 0;
    return !!(
      selectedEntities &&
      (comparable
        ? selectedEntities.length !== minNumberOfSelections
        : selectedEntities.length === minNumberOfSelections)
    );
  }, [selectedEntities, comparable]);

  const isInModal = useMemo(() => {
    return (selectionsEnabled || comparable) && onSelectionsApplied;
  }, [selectionsEnabled, comparable, onSelectionsApplied]);

  return (
    <TableFooter
      aria-label={translate(`tableFooterAriaLabel`, { ns: ACCESSIBILITY, lng: selectedLanguage })}
    >
      <TableRow>
        {paginationEnabled && (
          <TablePagination
            rowsPerPageOptions={pageSizes || [5, 10, 25]}
            colSpan={visibleColumns?.length + (selectionsEnabled ? 1 : 0)}
            count={totalItems}
            rowsPerPage={pageSize}
            page={page}
            labelRowsPerPage={translate('rowsPerPage', { ns: COMMON, lng: selectedLanguage })}
            slotProps={{
              select: {
                inputProps: {
                  tabIndex: 0,
                  'aria-label': translate('rowsPerPage', { ns: COMMON, lng: selectedLanguage }),
                  'data-testid': `${tableId}-rows-per-page`,
                  height: 20,
                  id: `${tableId}-rows-per-page`,
                },

                native: true,
              },
            }}
            tabIndex={0}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={() => (
              <TablePaginationActions
                parentId={parentId}
                tableId={tableId}
                onChangePage={handleChangePage}
              />
            )}
            aria-label={translate(`tablePaginationAriaLabel`, {
              ns: ACCESSIBILITY,
              lng: selectedLanguage,
            })}
          />
        )}
        {paginationEnabled && (
          <Box sx={{ position: 'absolute', height: 0, overflow: 'hidden' }} aria-live="polite">
            {paginationAnnouncement}
          </Box>
        )}
        {isInModal && (
          <TableCell colSpan={2}>
            <Box sx={buttonsContainer}>
              {onCancel && (
                <GenericButton
                  id={`${parentId}-${tableId}-cancelButton`}
                  testId={'cancelButton'}
                  variant="outlined"
                  label={translate('cancel', {
                    ns: COMMON,
                    lng: selectedLanguage,
                  })}
                  ariaLabel={translate('cancel', {
                    ns: COMMON,
                    lng: selectedLanguage,
                  })}
                  onClick={() => onCancel()}
                />
              )}
              <GenericButton
                id={footerButtonId}
                testId={'addButton'}
                label={translate(label || footerButtonLabel, { ns: COMMON, lng: selectedLanguage })}
                ariaLabel={translate(label || footerButtonLabel, {
                  ns: COMMON,
                  lng: selectedLanguage,
                })}
                variant={'contained'}
                disabled={footerButtonDisabled}
                onClick={() => {
                  onSelectionsApplied?.(selectedEntities);
                }}
                styles={{ marginLeft: theme.spacing(1) }}
              />
            </Box>
          </TableCell>
        )}
      </TableRow>
    </TableFooter>
  );
}
