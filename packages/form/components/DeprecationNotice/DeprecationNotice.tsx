import { useTranslation } from 'react-i18next';
import React from 'react';
import { Alert } from '@mui/material';

interface DeprecationNoticeProps {
  message: string;
}

const DeprecationNotice: React.FC<DeprecationNoticeProps> = ({ message }) => {
  const { t: localizeUi } = useTranslation('common');

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Alert
      severity="warning"
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: 'warning.main',
        borderRadius: 2,
        fontSize: '0.875rem',
      }}
    >
      <strong>{localizeUi('ui.deprecated')}</strong> {message}
    </Alert>
  );
};

export default DeprecationNotice;
