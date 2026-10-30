import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { Box, Typography } from '@mui/material';
import ScrollTop from '@pkg-common/components/ScrollTop/ScrollTop';
import usePageAnnounce from '@pkg-layout/src/common/hooks/usePageAnnounce';

export const openMail = (mail: string) => {
  document.location = `mailto:${mail}?subject=${encodeURIComponent(i18n.t('common:ui.accessibilityFeedback'))}`;
};

/** The host application supplies its own accessibility statement and audit results. */
const AccessibilityPage = ({
  title = 'ui.accessibilityStatement',
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation('common');
  usePageAnnounce(t(title));
  return (
    <Box sx={{ textAlign: 'left', padding: 3, color: 'text.primary' }}>
      <Typography component="h1" variant="h1" color="primary" sx={{ marginBottom: 3 }}>
        {t(title)}
      </Typography>
      {children}
      <ScrollTop />
    </Box>
  );
};

export default AccessibilityPage;
