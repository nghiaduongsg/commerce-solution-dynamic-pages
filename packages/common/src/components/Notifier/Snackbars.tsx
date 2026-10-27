import React from 'react';
import { Slide, Snackbar, Typography, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GenericIconButton from '../GenericIconButton/GenericIconButton';
import { AssetByType } from '../AssetByType/AssetByType';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import useSystem from '@pkg-setup/src/system/useSystem';
import { useSnackbar } from 'notistack';

export interface SnackbarsProps {
  id: string;
  message?: string;
  color?: 'dark' | 'error';
}

const Snackbars: React.FC<SnackbarsProps> = ({ id, message, color = 'dark' }) => {
  const theme = useTheme();
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const { closeSnackbar } = useSnackbar();

  return (
    <Slide direction="up" in={true} timeout={useTheme().transitions.duration.complex}>
      <Snackbar open={true} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert
          sx={{
            border: `2px solid ${color === 'error' ? theme.palette.error.main : theme.palette.primary.dark}`,
          }}
          variant="filled"
          icon={false}
          action={
            <GenericIconButton
              id={`closeSnackbarError-btn`}
              testId={`closeSnackbarError-btn`}
              ariaLabel={translate('closeSnackbarErrorAriaLabel', { ns: ACCESSIBILITY })}
              label={translate('closeSnackbarError', {
                ns: ACCESSIBILITY,
                lng: selectedLanguage,
              })}
              ariaDescription={translate('closeSnackbarErrorAriaDescription', {
                ns: ACCESSIBILITY,
                message,
                lng: selectedLanguage,
              })}
              onClick={() => {
                closeSnackbar(id);
              }}
              icon={<AssetByType input="icons" name="Close" />}
            />
          }
        >
          <Typography variant="body2" data-testid={`snackbar-msg`}>
            {message}
          </Typography>
        </Alert>
      </Snackbar>
    </Slide>
  );
};

export default Snackbars;
