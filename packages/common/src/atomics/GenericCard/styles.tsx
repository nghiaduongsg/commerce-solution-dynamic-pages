import { alpha } from '@mui/material';

export const useStyles = (theme) => {
  return {
    cardInvalid: {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: theme.palette.error.main,
    },
    cardActions: {
      float: 'right',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    cardFooter: {
      float: 'right',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderTop: `1px solid ${theme.palette.divider}`,
    },
    cardHeaderText: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    cardResizable: {
      position: 'fixed',
      top: 150,
      right: 50,
      zIndex: 1200,
    },
    cardContentResizable: {
      width: 'calc(100% - 40px)',
      flex: 1,
      minHeight: 0,
      overflow: 'auto',
      backgroundColor: alpha(theme?.palette?.primary.light, 0.5),
      margin: 3,
      zIndex: 2,
    },
  };
};
