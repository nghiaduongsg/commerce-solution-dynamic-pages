import React, { ReactElement } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { getStatusBadgeStyles } from '@pkg-list/components/GenericTableCell/statusBadgeStyles';
import { alpha, useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import { tokens } from '@pkg-theme/src/color-schemes';

const COLORS = {
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  INFO: 'info',
};

const IconSign = ({
  title,
  icon,
  status,
  tooltip,
}: {
  title: ReactElement | Array<ReactElement> | string;
  icon: string;
  status: 'ERROR' | 'INFO' | 'WARNING' | 'SUCCESS';
  tooltip: string;
}) => {
  const theme = useTheme();
  const badgeStyles = getStatusBadgeStyles(theme);
  const isString = typeof title === 'string';

  return (
    <Tooltip
      role={'tooltip'}
      title={tooltip}
      placement="top"
      arrow
      slotProps={{
        tooltip: {
          sx: badgeStyles.errorTooltipPaper,
        },
      }}
    >
      <Chip
        icon={
          <AssetByType
            name={icon}
            input={'icons'}
            props={{ sx: { color: theme.palette[COLORS[status]].main } }}
          />
        }
        size="small"
        sx={{
          backgroundColor: alpha(theme.palette[COLORS[status]].light, 0.15),
          padding: '0px 3px 0px 4px',
        }}
        label={
          <Box
            component={isString ? 'span' : 'div'}
            sx={{ color: tokens.neutral[700], marginTop: 1 }}
          >
            {title}
          </Box>
        }
      />
    </Tooltip>
  );
};

export default IconSign;
