import React from 'react';
import { Box } from '@mui/material';
import { ChangeIndicatorsSchema } from '@pkg-form/types';
import { SxProps } from '@mui/system';

const ChangeIndicator = ({
  changeIndicators = { enabled: false },
  status,
  sx = {},
}: {
  changeIndicators?: ChangeIndicatorsSchema;
  status: 'ADDED' | 'EDITED' | undefined;
  sx?: SxProps;
}) => {
  const { enabled, colors } = changeIndicators;

  if (!enabled || !status) {
    return null;
  }

  const indicatorColor =
    status === 'ADDED' ? colors?.ADDED ?? '#4caf50' : colors?.EDITED ?? '#ff9800';

  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: indicatorColor,
        border: '2px solid white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        margin: 3,
        ...sx,
      }}
    />
  );
};

export default ChangeIndicator;
