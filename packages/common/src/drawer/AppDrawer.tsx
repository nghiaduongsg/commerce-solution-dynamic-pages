import React, { useMemo } from 'react';
import { Box, Divider, Drawer, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AssetByType } from '@pkg-common/components/AssetByType/AssetByType';
import GenericIconButton from '@pkg-common/components/GenericIconButton/GenericIconButton';
import useDrawer from '@pkg-common/drawer/useDrawer';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY, COMMON } from '@pkg-constants/translationNamespaces';
import useSystem from '@pkg-setup/src/system/useSystem';
import {
  CLOSE_LIST_COLUMN_CONFIGURATION_SHORTCUT,
  CLOSE_MODALS_SHORTCUT,
} from '@pkg-constants/keyboardShortcuts';
import { focusTrap } from '@pkg-common/utils';

const useStyles = () => {
  return {
    container: {
      overflowY: 'auto',
      overflowX: 'hidden',
      '&:hover': {
        cursor: 'default',
      },
      minWidth: '31vw',
      maxWidth: '50vw',
    },
    header: {
      width: '100%',
      height: 64,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: 'row',
      padding: useTheme().spacing(3),
      position: 'absolute',
      borderBottom: `1px solid ${useTheme().palette?.divider}`,
      background: useTheme().palette.common.white,
      zIndex: 9,
    },
    content: {
      padding: useTheme().spacing(3),
      marginTop: useTheme().spacing(14),
    },
    resizeContainer: {
      width: '4px',
      cursor: 'col-resize',
      position: 'absolute',
      height: '100%',
    },
  };
};

const AppDrawer = ({
  id,
  drawerId,
  onClose,
  children,
  closeButtonId,
  closeButtonAriaLabel,
  title,
  variant,
  keepMounted = false,
  role,
}: {
  id?: string;
  drawerId: string;
  onClose?: () => void;
  children: Array<JSX.Element> | JSX.Element | null;
  closeButtonId: string;
  closeButtonAriaLabel?: string;
  title: string;
  variant?: 'persistent' | 'permanent' | 'temporary';
  keepMounted?: boolean;
  role?: string;
}) => {
  const styles = useStyles();

  const { selectedLanguage } = useSystem();
  const { t: translate } = useTranslation([COMMON, ACCESSIBILITY]);

  const { open, closeDrawer } = useDrawer(drawerId);

  return (
    <Drawer
      id={id || drawerId}
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
      anchor="right"
      variant={variant}
      ModalProps={{
        keepMounted,
      }}
      slotProps={{
        paper: {
          onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => focusTrap(e),
        },
      }}
      role={role}
      aria-labelledby={role === 'dialog' ? `${id || drawerId}-title` : undefined}
    >
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography variant="body1" id={`${id || drawerId}-title`}>
            {translate(title, { ns: COMMON, lng: selectedLanguage })}
          </Typography>
          <GenericIconButton
            id={closeButtonId}
            testId={closeButtonId}
            ariaKeyboardShortcuts={CLOSE_MODALS_SHORTCUT}
            ariaLabel={translate(closeButtonAriaLabel || 'close', {
              ns: closeButtonAriaLabel ? ACCESSIBILITY : COMMON,
              lng: selectedLanguage,
            })}
            onClick={() => {
              closeDrawer();
              onClose && onClose();
            }}
            icon={<AssetByType input="icons" name="Close" />}
          />
        </Box>
        <Divider />
        {open && <Box sx={styles.content}>{children}</Box>}
      </Box>
    </Drawer>
  );
};

export default AppDrawer;
