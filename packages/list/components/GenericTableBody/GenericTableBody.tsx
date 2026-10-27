import React, { useMemo } from 'react';
import { TableBody } from '@mui/material';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import { TableBodyProps } from './GenericTableBody.d';
import useTable from '@pkg-list/hooks/useTable';
import GenericTableRow from '../GenericTableRow/GenericTableRow';
import hash from 'object-hash';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTheme } from '@mui/material/styles';
import TableMessage from '../TableMessage/TableMessage';

const GenericTableBody = ({
  tableId,
  namespaces = [COMMON, ACCESSIBILITY],
  selections,
  actionDetails,
  configuration,
  parentId,
  rowButtons,
  mode = 'DEFAULT',
  rowContent,
  changeIndicators,
}: TableBodyProps) => {
  const { tableData, localTableData, rowIdKey, columns, hasNoData, error, loading } =
    useTable(tableId);

  const classes = getStyles(useTheme());
  const { boldRows } = configuration;

  const styledTableData = useMemo(() => {
    const data = Array.isArray(tableData) ? tableData : [];

    return data.map((rowData: any, index) => {
      const localIndex = localTableData.findIndex((localRow: any) => localRow.__ID__ === rowData.__ID__);

      const updatedRowData = {
        ...rowData,
        localRowIndex: localIndex === -1 ? undefined : localIndex,
      };

      const isBold =
        (boldRows === 'LAST' && index === data.length - 1) ||
        (boldRows === 'EVEN' && index % 2 === 0) ||
        (boldRows === 'ODD' && index % 2 !== 0);

      return isBold ? { ...updatedRowData, isBold: true } : updatedRowData;
    });
  }, [tableData, localTableData, boldRows]);

  if (styledTableData?.length <= 0) {
    return (
      <TableBody sx={classes.tableBody}>
        <TableMessage
          hasNoData={hasNoData}
          error={error}
          colSpan={columns?.length + 1}
          loading={loading}
        />
      </TableBody>
    );
  }

  return (
    <TableBody sx={classes.tableBody}>
      {(styledTableData || []).map((row, index) => (
        <GenericTableRow
          key={`${row[rowIdKey]}_${index}_${hash(row)}`}
          tableId={tableId}
          row={{ ...row, __INDEX__: row?.__INDEX__ || index }}
          configuration={configuration}
          selections={selections}
          actionDetails={actionDetails}
          parentId={parentId}
          namespaces={namespaces}
          rowButtons={rowButtons}
          rowContent={rowContent}
          mode={mode}
          changeIndicators={changeIndicators}
        />
      ))}
    </TableBody>
  );
};

export default GenericTableBody;
