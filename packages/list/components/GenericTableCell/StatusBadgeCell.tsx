import React from 'react';
import { Box, TableCell, Chip, Tooltip, useTheme } from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { getStyles } from '@pkg-list/components/GenericTableStyles/styles';
import { getStatusColors, getStatusBadgeStyles } from './statusBadgeStyles';
import { AnyType } from '@pkg-common/types';

interface StatusBadgeCellProps {
  value: string;
  config?: { statusField?: string; name?: string; errorsField?: string };
  align?: 'right' | 'left' | 'center' | 'inherit' | 'justify';
  row?: AnyType;
}

const getStatusIcon = (statusCode: string, iconSx: React.CSSProperties) => {
  switch (statusCode) {
    case 'ERROR':
    case 'FAILED':
    case 'REVIEW_POSTED_ERROR':
      return <ErrorOutlineRoundedIcon sx={iconSx} />;
    case 'UNPROCESSED':
      return <WarningAmberRoundedIcon sx={iconSx} />;
    case 'PENDING':
      return <ScheduleRoundedIcon sx={iconSx} />;
    case 'IN_PROGRESS':
      return <SyncRoundedIcon sx={iconSx} />;
    case 'CANCELLED':
    case 'CANCELED':
      return <CancelRoundedIcon sx={iconSx} />;
    case 'PASS':
    case 'COMPLETED':
      return <CheckCircleOutlineRoundedIcon sx={iconSx} />;
    case 'SUPERSEDED':
      return <SwapHorizRoundedIcon sx={iconSx} />;
    default:
      return <WarningAmberRoundedIcon sx={iconSx} />;
  }
};

const formatStatusLabel = (statusCode: string) =>
  statusCode?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const StatusBadgeCell: React.FC<StatusBadgeCellProps> = ({
  value,
  config,
  align = 'left',
  row,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const badgeStyles = getStatusBadgeStyles(theme);
  const { t } = useTranslation([COMMON]);

  const { statusField = '', name = '', errorsField = '' } = config ?? {};

  const statusCode = row?.[statusField ?? ''] || row?.[name] || value;

  if (!statusCode) {
    return (
      <TableCell
        component="td"
        scope="row"
        role="cell"
        align={align}
        tabIndex={0}
        sx={{
          ...styles.tableBodyCell,
        }}
      />
    );
  }

  const statusColors = getStatusColors(theme, statusCode);

  const rawErrors = row?.[errorsField];
  const errorMessages = Array.isArray(rawErrors)
    ? rawErrors.filter((message) => message && String(message).trim())
    : [];

  const isError =
    statusCode === 'ERROR' || statusCode === 'FAILED' || statusCode === 'REVIEW_POSTED_ERROR';

  const chip = (
    <Chip
      icon={getStatusIcon(statusCode, badgeStyles.chipIcon)}
      size="small"
      sx={badgeStyles.chip(statusColors)}
    />
  );

  const isUnprocessed = statusCode === 'UNPROCESSED';
  const tooltipTitle = isUnprocessed
    ? t('bulkActionUnprocessedMessage', { count: 1 })
    : formatStatusLabel(statusCode);

  return (
    <TableCell
      component="td"
      scope="row"
      role="cell"
      align="center"
      tabIndex={0}
      sx={{ ...styles.tableBodyCell, textAlign: 'center' }}
    >
      {isError && errorMessages.length > 0 ? (
        <Tooltip
          title={
            <Box sx={badgeStyles.errorTooltipContent}>
              {errorMessages.map((msg) => (
                <Box key={msg} sx={badgeStyles.errorTooltipItem}>
                  <Box sx={badgeStyles.errorTooltipBullet} />
                  <Box sx={badgeStyles.errorTooltipMessage}>{msg}</Box>
                </Box>
              ))}
            </Box>
          }
          placement="top"
          arrow
          slotProps={{
            tooltip: {
              sx: badgeStyles.errorTooltipPaper,
            },
          }}
        >
          {chip}
        </Tooltip>
      ) : (
        <Tooltip title={tooltipTitle} placement="top" arrow>
          {chip}
        </Tooltip>
      )}
    </TableCell>
  );
};

export default StatusBadgeCell;
