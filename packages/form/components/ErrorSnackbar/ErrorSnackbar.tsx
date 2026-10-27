import React, { useState } from 'react';
import { Slide, Snackbar, Typography, Collapse, Divider, Box, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Error, Close } from '@mui/icons-material';
import useEntity from '@pkg-entity/hooks/useEntity';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import { useTranslation } from 'react-i18next';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import useSystem from '@pkg-setup/src/system/useSystem';

const useStyles = (theme) => {
  return {
    alert: {
      backgroundColor: 'white',
      color: theme.palette?.error.main,
      border: `2px solid ${theme.palette?.error.main}`,
      borderRadius: '15px',
      minWidth: 300,
    },
    closeIcon: {
      pointerEvents: 'none',
      color: 'white',
      backgroundColor: 'black',
      borderRadius: 16,
      border: 'black solid 2px',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    title: {
      display: 'flex',
      alignItems: 'center',
    },
    collapse: {
      paddingTop: theme.spacing(2),
      marginTop: theme.spacing(2),
      width: '100%',
    },
    headerDivider: {
      backgroundColor: theme.palette?.divider,
      margin: -theme.spacing(2),
      marginTop: 12,
    },
    message: {
      color: theme.palette?.common.black,
    },
    fieldName: {
      color: theme.palette?.common.black,
      fontWeight: 'bold',
    },
  };
};

const ErrorSnackbar = ({ pageId, message, violations, open }) => {
  const [cardCollapsed, setCardCollapsed] = useState(false);

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);
  const { clearEntityError } = useEntity(pageId);

  const onToggleCollapse = () => {
    setCardCollapsed((prev) => !prev);
  };
  const testId = cardCollapsed ? 'Collapse' : 'Expand';
  const styles = useStyles(useTheme());
  return (
    <Slide direction="down" in={true} timeout={1000}>
      <Snackbar open={open} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert sx={styles.alert} variant="filled" icon={false}>
          <Box sx={styles.header}>
            <Box sx={styles.title}>
              <Error style={{ paddingRight: 4 }} />
              <Typography variant="body1">{message}</Typography>
            </Box>
            <GenericIconButton
              id={`${testId}-btn`}
              testId={`${testId}-btn`}
              label={translate(cardCollapsed ? 'expand' : 'collapse', {
                ns: COMMON,
                lng: selectedLanguage,
              })}
              ariaLabel={translate(cardCollapsed ? 'expand' : 'collapse', {
                ns: COMMON,
                lng: selectedLanguage,
              })}
              ariaDescription={translate(
                cardCollapsed ? 'expandAriaDescription' : 'collapseAriaDescription',
                {
                  ns: ACCESSIBILITY,
                  error: message,
                  lng: selectedLanguage,
                },
              )}
              onClick={onToggleCollapse}
              icon={
                cardCollapsed ? (
                  <AssetByType input="icons" name="KeyboardArrowUp" />
                ) : (
                  <AssetByType input="icons" name="KeyboardArrowDown" />
                )
              }
            />
            <GenericIconButton
              id="close-button"
              testId="close-button"
              label={translate('close', { ns: COMMON, lng: selectedLanguage })}
              ariaLabel={translate('close', { ns: COMMON, lng: selectedLanguage })}
              ariaDescription={translate('closeSnackbarAriaDescription', {
                ns: ACCESSIBILITY,
                error: message,
                lng: selectedLanguage,
              })}
              onClick={() => {
                clearEntityError();
              }}
              icon={<Close style={{ fontSize: '19px' }} sx={styles.closeIcon} />}
            />
          </Box>
          <Collapse in={cardCollapsed} unmountOnExit>
            <Divider sx={styles.headerDivider} />
            <Box sx={styles.collapse}>
              {violations.map((item, index) => (
                <>
                  <Typography variant="body2" sx={styles.fieldName} key={index}>
                    {item.fieldName + ':'}
                  </Typography>
                  <Typography variant="body2" sx={styles.message} key={index}>
                    {item.message}
                  </Typography>
                </>
              ))}
            </Box>
          </Collapse>
        </Alert>
      </Snackbar>
    </Slide>
  );
};

export default ErrorSnackbar;
