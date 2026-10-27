import React from 'react';
import { Box, Typography } from '@mui/material';
import ScrollTop from '@pkg-common/components/ScrollTop/ScrollTop';
import usePageAnnounce from '@pkg-layout/src/common/hooks/usePageAnnounce';

export const openMail = (mail: string) => {
  document.location = `mailto:${mail}?subject=Accessibility Feedback`;
};

/** The host application supplies its own accessibility statement and audit results. */
const AccessibilityPage = ({
  title = 'Accessibility Statement',
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) => {
  usePageAnnounce(title);
  return (
    <Box sx={{ textAlign: 'left', padding: 3, color: 'text.primary' }}>
      <Typography component="h1" variant="h1" color="primary" sx={{ marginBottom: 3 }}>
        {title}
      </Typography>
      {children}
      <ScrollTop />
    </Box>
  );
};

export default AccessibilityPage;
