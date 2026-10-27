import React, { isValidElement, memo, useMemo } from 'react';
import { TableRow, TableCell, TableBody, Box, Table, Typography } from '@mui/material';
import useTable from '@pkg-list/hooks/useTable';
import { AnyType } from '@pkg-common/types';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import { GenericInnerTableProps } from './GenericInnerTable.d';
import { useTheme } from '@mui/material/styles';
import getStyles from './styles';

const GenericInnerTable = ({
  getCellContentCallback = () => {},
  namespaces = [COMMON, ACCESSIBILITY],
  row,
  tableId,
}: GenericInnerTableProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { t: translate } = useTranslation(namespaces);
  const { innerVisibleColumns } = useTable(tableId);

  const innerColumnGroups = useMemo((): [string | undefined, unknown][] => {
    const groups: Record<string, any[]> = {};
    const ungroupedColumns: any[] = [];

    innerVisibleColumns?.forEach((col: Record<string, any>): void => {
      const groupKey = col?.groupByProperty;

      if (groupKey) {
        const rowMatch = row?.[groupKey];
        const rowHasData = rowMatch && (!Array.isArray(rowMatch) || rowMatch.length > 0);
        if (rowHasData) {
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push(col);
        }
      } else {
        ungroupedColumns.push(col);
      }
    });

    const result: [string | undefined, any[]][] = Object.entries(groups);
    if (ungroupedColumns.length > 0) {
      result.push([undefined, ungroupedColumns]);
    }

    return result;
  }, [innerVisibleColumns, row]);

  return (
    <>
      {innerColumnGroups?.map(
        ([groupByProperty, columnsInGroup]: [string | undefined, AnyType]) => (
          <Table
            key={groupByProperty}
            size="small"
            sx={styles.tableContainer}
            data-testid={'inner-table-container'}
          >
            <TableBody>
              {groupByProperty && (
                <TableRow sx={{ ...styles?.noHover, height: 20 }} tabIndex={0}>
                  <TableCell
                    colSpan={columnsInGroup.length}
                    sx={styles.propertyHeader}
                    tabIndex={0}
                  >
                    <Typography variant="overline" style={{ fontWeight: 'bold' }}>
                      {translate(groupByProperty, { ns: namespaces })}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              <>
                <TableRow sx={{ ...styles?.noHover, ...styles?.rowPaddings }} tabIndex={0}>
                  {columnsInGroup.map((column: Record<string, AnyType>, colIndex: number) => (
                    <TableCell
                      key={`header-${column?.name}-${colIndex}`}
                      sx={{ ...styles?.cell, textAlign: column?.align || 'left' }}
                      tabIndex={0}
                    >
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {translate(column?.name, { ns: namespaces })}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow
                  sx={{ ...styles?.noHover, ...styles?.rowPaddings, ...styles.noBorder }}
                  tabIndex={0}
                >
                  {columnsInGroup.map((column: Record<string, AnyType>, colIndex: number) => {
                    let rowMatch: AnyType[] = [];
                    if (column.groupByProperty) {
                      const colData = row?.[column.groupByProperty];
                      const arrayColData = colData ? [colData] : [];
                      rowMatch = Array.isArray(colData) ? colData : arrayColData;
                    } else {
                      rowMatch = row ? [row] : [];
                    }

                    return (
                      <TableCell
                        key={`data-${column.name}-${colIndex}`}
                        sx={styles.cell}
                        tabIndex={0}
                      >
                        {rowMatch.length > 0 &&
                          rowMatch
                            .filter((m: AnyType) => m && typeof m === 'object')
                            .map((match: Record<string, AnyType>, i: number) => {
                              const fullAccessors = column?.accessors || [];
                              const slicedAccessors = fullAccessors?.slice(1) || [];

                              const content =
                                getCellContentCallback(row, {
                                  ...column,
                                  accessors: fullAccessors,
                                }) ??
                                getCellContentCallback(match, {
                                  ...column,
                                  accessors: slicedAccessors,
                                });

                              return (
                                <Box
                                  key={`${match?.id || i}-${column.name}`}
                                  sx={{ minHeight: '24px' }}
                                >
                                  <Typography>
                                    {content !== null &&
                                    typeof content === 'object' &&
                                    !isValidElement(content)
                                      ? JSON.stringify(content)
                                      : content}
                                  </Typography>
                                </Box>
                              );
                            })}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </>
            </TableBody>
          </Table>
        ),
      )}
    </>
  );
};
export default memo(GenericInnerTable);
