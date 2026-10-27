// ProgressDialog.tsx
import React from 'react';
import SimpleDialog from '@pkg-common/components/SimpleDialog/SimpleDialog';
import { Typography, Box } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useSystem } from '@pkg-setup/index';

interface ProgressDialogProps {
  id: string;
  open: boolean;
  onClose: () => void;
  message?: string;
  status: 'loading' | 'success' | 'error';
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({ id, open, onClose, status, message }) => {
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle sx={{ color: 'success.main', mr: 1 }} />;
      case 'error':
        return <Error sx={{ color: 'error.main', mr: 1 }} />;
      default:
        return null;
    }
  };

  return (
    <SimpleDialog
      id={`${id}-progress`}
      title={translate('exportProgress', { ns: COMMON, lng: selectedLanguage })}
      open={open}
      onClose={status !== 'loading' ? onClose : undefined}
    >
      <Box sx={{ minWidth: 300, p: 2 }}>
        <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
          {getStatusIcon()}
          <Typography
            variant="body1"
            sx={{
              color: status === 'error' ? 'error.main' : 'text.primary',
            }}
          >
            {`${translate(`${status}Message`, { ns: COMMON, lng: selectedLanguage })} ${translate(`${message}`, { ns: COMMON, lng: selectedLanguage })}  `}
          </Typography>
        </Box>
      </Box>
    </SimpleDialog>
  );
};

export default ProgressDialog;
