import { alpha } from '@mui/material/styles';

export const getBulkActionsStyles = (theme) => {
  return {
    menuPaper: {
      borderRadius: 3,
      minWidth: 300,
      mt: 0.5,
      p: 1,
      overflow: 'hidden',
    },
    menuHeader: {
      px: 1.5,
      py: 1,
    },
    menuHeaderTitle: {
      fontWeight: 700,
    },
    menuHeaderDescription: {
      color: 'text.secondary',
    },
    menuDivider: {
      my: 0.5,
    },
    menuItem: {
      borderRadius: 2,
      mx: 0.5,
      my: 0.25,
      px: 1.5,
      py: 1,
      gap: 1.5,
    },
    menuItemIcon: {
      flexShrink: 0,
      width: 34,
      height: 34,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette.primary.main,
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
    },
    menuItemContent: {
      minWidth: 0,
    },
    menuItemLabel: {
      fontWeight: 600,
    },
    menuItemDescription: {
      color: 'text.secondary',
      lineHeight: 1.3,
    },
    stepperToggle: {
      mb: 1,
    },
    stepperContainer: {
      p: 2.5,
      mt: 1,
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    },
    stepsRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    },
    stepConnector: (done: boolean) => ({
      flex: 1,
      height: 2,
      minWidth: 24,
      borderRadius: 1,
      backgroundColor: done ? theme.palette.primary.main : theme.palette.grey[300],
    }),
    stepItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
    },
    stepBadge: (state: 'done' | 'active' | 'locked') => {
      let backgroundColor: string;
      let border: string;
      let color: string;
      if (state === 'done') {
        backgroundColor = 'transparent';
        border = `2px solid ${theme.palette.primary.main}`;
        color = theme.palette.primary.main;
      } else if (state === 'active') {
        backgroundColor = theme.palette.primary.main;
        border = 'none';
        color = theme.palette.common.white;
      } else {
        backgroundColor = theme.palette.grey[200];
        border = 'none';
        color = theme.palette.grey[600];
      }

      return {
        flexShrink: 0,
        width: 30,
        height: 30,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 700,
        backgroundColor,
        border,
        color,
      };
    },
    stepErrorBadge: {
      flexShrink: 0,
      width: 30,
      height: 30,
      borderRadius: '50%',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      border: `1.5px solid ${alpha(theme.palette.error.main, 0.3)}`,
      color: theme.palette.error.main,
    },
    stepLabel: (state: 'done' | 'active' | 'locked') => {
      let color: string;
      if (state === 'done') {
        color = theme.palette.primary.main;
      } else if (state === 'active') {
        color = theme.palette.text.primary;
      } else {
        color = theme.palette.text.disabled;
      }
      return {
        whiteSpace: 'nowrap' as const,
        fontWeight: state === 'active' ? 700 : 600,
        color,
      };
    },
    stepperBottomRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      mt: 1.5,
    },
    stepperDescription: {
      color: 'text.secondary',
    },
    stepperAction: {
      flexShrink: 0,
      ml: 2,
      mt: 1,
    },
    dialogContent: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
    },
    dialogErrorList: {
      mt: 1,
    },
    dialogPadding: {
      p: 2,
    },
    dialogCenteredHeader: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      mb: 3,
    },
    dialogCenteredHeaderCompact: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
    },
    warningIconCircle: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      border: '2px solid #F57C00',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 2,
    },
    errorIconCircle: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      backgroundColor: 'rgba(211, 47, 47, 0.1)',
      border: '2px solid #D32F2F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 2,
    },
    warningIcon: {
      fontSize: 28,
      color: '#F57C00',
    },
    errorIcon: {
      fontSize: 28,
      color: '#D32F2F',
    },
    warningListBox: {
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: 2,
      maxHeight: 240,
      overflowY: 'auto' as const,
      backgroundColor: 'rgba(255, 152, 0, 0.04)',
    },
    errorListBox: {
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      p: 2,
      maxHeight: 240,
      overflowY: 'auto' as const,
      backgroundColor: 'rgba(211, 47, 47, 0.04)',
    },
    listItemRow: {
      display: 'flex',
      alignItems: 'flex-start' as const,
      gap: 1,
    },
    warningBullet: {
      width: 6,
      height: 6,
      minWidth: 6,
      borderRadius: '50%',
      backgroundColor: '#F57C00',
      mt: '0.6em',
    },
    errorBullet: {
      width: 6,
      height: 6,
      minWidth: 6,
      borderRadius: '50%',
      backgroundColor: '#D32F2F',
      mt: '0.6em',
    },
    listItemText: {
      lineHeight: 1.5,
      wordBreak: 'break-all' as const,
    },
    listItemTextNoBreak: {
      lineHeight: 1.5,
    },
  };
};
