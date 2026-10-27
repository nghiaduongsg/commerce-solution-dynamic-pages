import React from 'react';
import { AnyType } from '@pkg-common/types';
import { SxProps } from '@mui/system';
import { Box } from '@mui/material';

const VirtualScroller = ({ id, items, sx }: { id: string; items: Array<AnyType>; sx: SxProps }) => {
  return (
    <Box id={id} sx={sx}>
      {items?.map((item, _index) => {
        return <Box key={`${item?.id ?? item?.groupCode}_${items?.length}`}>{item}</Box>;
      })}
    </Box>
  );
};

export default VirtualScroller;
