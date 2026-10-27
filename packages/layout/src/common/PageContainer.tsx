import React from 'react';
import { Box } from '@mui/material';
import { SystemStyleObject, Theme } from '@mui/system';
import { pageContainerSx } from '@pkg-theme/src/pageLayout';

const PageContainer = ({
  children,
  sx,
}: {
  children?: React.ReactNode;
  sx?: SystemStyleObject<Theme>;
}) => {
  return <Box sx={[pageContainerSx, ...(sx ? [sx] : [])]}>{children}</Box>;
};

export default PageContainer;
