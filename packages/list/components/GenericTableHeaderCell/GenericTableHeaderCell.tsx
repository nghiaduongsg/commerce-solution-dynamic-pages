import React, { useMemo } from 'react';
import { TableCell, Typography, Tooltip, Box, useTheme } from '@mui/material';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import SortButton from '../SortButton/SortButton';
import { GenericTableHeaderCellProps } from './GenericTableHeaderCell.d';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { useTranslation } from 'react-i18next';
import { AnyType } from '@pkg-common/types';
import useSystem from '@pkg-setup/src/system/useSystem';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useTable from '@pkg-list/hooks/useTable';

const useLocalStyles = () => {
  return {
    truncate: (truncate: AnyType) => ({
      maxWidth: truncate?.width ? truncate.width + 50 : '100%',
      maxHeight: truncate?.lines ? `${truncate.lines * 1.5}em` : 'auto',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: truncate?.lines || 1,
      WebkitBoxOrient: 'vertical',
      whiteSpace: 'pre-line',
    }),
  };
};

export default function GenericTableHeaderCell({
  namespaces,
  tableId,
  column,
  sx,
}: Readonly<GenericTableHeaderCellProps>) {
  const theme = useTheme();
  const classes = getStyles(useTheme());
  const styles = useLocalStyles();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([...namespaces, COMMON, ACCESSIBILITY]);
  const { sortBy: appliedSorting, sortTieBreaker } = useTable(tableId);

  const { width, name, align = 'left', truncate, sortBy, tooltip, type } = column;

  const columnName = useMemo(() => {
    return translate(name, {
      lng: selectedLanguage,
      ns: ['actions', 'selections', 'validationStatus'].includes(name)
        ? COMMON
        : namespaces[0] ?? COMMON,
    });
  }, [name, selectedLanguage, namespaces]);

  const sortOrder = useMemo(() => {
    if (appliedSorting.includes(':asc') && appliedSorting.includes(sortBy?.field)) {
      return 'ascending';
    } else if (appliedSorting.includes(':desc') && appliedSorting.includes(sortBy?.field)) {
      return 'descending';
    } else {
      return 'none';
    }
  }, [appliedSorting, sortBy?.field]);

  return (
    <TableCell
      tabIndex={0}
      sx={{ ...classes.tableHeaderCell, ...sx }}
      style={{
        width: width || 'auto',
      }}
      key={name}
      align={align}
      aria-label={columnName || translate('spacerColumn', { ns: ACCESSIBILITY })}
      aria-sort={sortOrder}
      role="columnheader"
    >
      <Box
        sx={{
          ...classes.tableHeaderCellContainer,
          ...(align === 'right' && classes.tableHeaderCellRightAlignment),
        }}
      >
        <Tooltip
          title={translate(columnName || '')}
          placement="top"
          role={columnName ? 'tooltip' : undefined}
        >
          <Typography variant="subtitle1" aria-label={columnName} align={align} component={'span'}>
            {truncate?.enabled ? (
              <Box sx={classes.tableHeaderCellContainer}>
                {tooltip && (
                  <AssetByType
                    input="icons"
                    name="InfoOutlined"
                    props={{ className: classes.tableHeaderCellInfoIcon }}
                  />
                )}
                <Tooltip
                  title={translate(tooltip || '')}
                  placement="top"
                  role={tooltip ? 'tooltip' : undefined}
                >
                  <Box
                    sx={styles.truncate(truncate)}
                    aria-label={translate(columnName || 'defaultColumnName')}
                  >
                    {columnName}
                  </Box>
                </Tooltip>
              </Box>
            ) : (
              <Box sx={classes.tableHeaderCellContainer}>
                {tooltip && (
                  <AssetByType
                    input="icons"
                    name="InfoOutlined"
                    props={{ className: classes.tableHeaderCellInfoIcon }}
                  />
                )}
                <Tooltip
                  title={translate(tooltip || '')}
                  placement="top"
                  role={tooltip ? 'tooltip' : undefined}
                >
                  <span aria-label={translate(columnName || 'defaultColumnName')}>
                    {columnName}
                  </span>
                </Tooltip>
              </Box>
            )}
          </Typography>
        </Tooltip>
        {sortBy && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <SortButton
              tableId={tableId}
              queryParam={sortBy?.field}
              sortingLocally={sortBy?.mode === 'LOCAL'}
              sortTieBreaker={sortTieBreaker}
              dataType={type}
              align={align}
              columnName={columnName}
            />
          </Box>
        )}
      </Box>
    </TableCell>
  );
}
