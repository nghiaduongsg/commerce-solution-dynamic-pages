import React, { useCallback, useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import SingleValueRenderer from '@pkg-common/components/ValuesRenderer/SingleValueRenderer';
import ValuesRenderer from '@pkg-common/components/ValuesRenderer/ValuesRenderer';
import { DetailTableProps, DetailTableRow } from './DetailTable.d';

/**
 * A reusable, read-only table that shows a few columns per row and opens a
 * right-hand side panel with the full record when a row is selected. Column
 * labels and the panel body are supplied by the caller so the component stays
 * presentational and theme/locale agnostic; its own chrome (empty state, panel
 * heading affordances) is translated from the shared `common` namespace.
 */
const DetailTable = ({
  columns,
  rows,
  getRowId,
  rowTitle,
  renderDetail,
  dataTestId,
}: DetailTableProps) => {
  const { t } = useTranslation(COMMON);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const idFor = useCallback(
    (row: DetailTableRow, index: number) => (getRowId ? getRowId(row, index) : String(index)),
    [getRowId],
  );
  const titleFor = useCallback(
    (row: DetailTableRow) => (rowTitle ? rowTitle(row) : ''),
    [rowTitle],
  );
  const close = useCallback(() => setOpenIndex(null), []);

  if (!rows || rows.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" data-testid={dataTestId}>
        {t('detailTable.empty')}
      </Typography>
    );
  }

  const selected = openIndex !== null ? rows[openIndex] : undefined;

  return (
    <Box data-testid={dataTestId}>
      <TableContainer>
        <Table size="small" aria-label={t('detailTable.tableLabel')}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const open = () => setOpenIndex(index);
              return (
                <TableRow
                  key={idFor(row, index)}
                  hover
                  tabIndex={0}
                  selected={openIndex === index}
                  onClick={open}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      open();
                    }
                  }}
                  aria-label={t('detailTable.viewDetails', { name: titleFor(row) })}
                  sx={{ cursor: 'pointer' }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(row) : <SingleValueRenderer value={row[column.key]} />}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Drawer
        anchor="right"
        open={selected !== undefined}
        onClose={close}
        slotProps={{ paper: { sx: { width: { xs: '100vw', sm: 420 }, maxWidth: '100%' } } }}
      >
        {selected !== undefined && (
          <Box
            role="region"
            aria-label={titleFor(selected)}
            sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" component="h2" sx={{ wordBreak: 'break-word' }}>
                {titleFor(selected)}
              </Typography>
              <IconButton onClick={close} aria-label={t('detailTable.close')} size="small">
                <Close fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 2, overflowY: 'auto' }}>
              {renderDetail ? renderDetail(selected) : <ValuesRenderer source={selected} />}
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default DetailTable;
