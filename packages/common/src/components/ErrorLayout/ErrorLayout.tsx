import React from 'react';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TranslationsElementController from '@pkg-core/TranslationsElementController';
import { COMMON } from '@pkg-constants/translationNamespaces';
import { useSystem } from '@pkg-setup/index';
import { AnyType } from '@pkg-common/types';

const getStyles = (theme: Theme): Record<string, AnyType> => ({
  container: {
    marginTop: (theme as AnyType)?.topbarHeight || '64px',
    width: '100%',
  },
  innerContainer: {
    marginTop: '100px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '350px',
  },
  messageContainer: {
    maxWidth: '450px',
    textAlign: 'center',
    paddingRight: '50px',
    paddingLeft: '50px',
  },
});

const ErrorLayout = ({ image, message }) => {
  const theme: Theme = useTheme();
  const styles = getStyles(theme);
  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON]);
  const translatedMessage = translate(message, { ns: COMMON, lng: selectedLanguage });

  return (
    <Box sx={styles?.container}>
      <div style={styles?.innerContainer}>
        <img src={image} alt="error description" style={styles?.image} />
        <Box sx={styles?.messageContainer}>
          <TranslationsElementController namespace={COMMON}>
            <Typography variant="body1">{translatedMessage}</Typography>
          </TranslationsElementController>
        </Box>
      </div>
    </Box>
  );
};

export default ErrorLayout;
