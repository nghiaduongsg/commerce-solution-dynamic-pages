import React, { ReactElement } from 'react';
import { useInView } from 'react-intersection-observer';
import { Box } from '@mui/material';

const VirtualItem = ({ height, children }: { height: number; children: ReactElement }) => {
  const [ref, inView] = useInView();

  const style = {
    height: `${height}px`,
    paddingBottom: 4,
  };

  return (
    <Box style={style} ref={ref}>
      {inView ? children : null}
    </Box>
  );
};

export default VirtualItem;
