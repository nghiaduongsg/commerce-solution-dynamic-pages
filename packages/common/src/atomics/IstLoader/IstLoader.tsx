import React from 'react';
import { AnyType } from '@pkg-common/types';
import { Box, CircularProgress } from '@mui/material';

const IstLoader = ({ busy }: AnyType) => {
  if (!busy) {
    return null;
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', padding: 4 }}>
      <CircularProgress size={20} />
    </Box>
  );
};

export default IstLoader;
