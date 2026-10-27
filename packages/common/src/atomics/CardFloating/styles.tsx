import { alpha, Theme } from '@mui/material';

type CardFloatingTypeKeys =
  | 'card'
  | 'cardHeaderAction'
  | 'cardContent'
  | 'cardActions'
  | 'headerDivider';

export default function useStyles(theme: Theme): Record<CardFloatingTypeKeys, object> {
  return {
    card: {
      position: 'fixed',
      top: theme?.spacing(2 + 8),
      right: theme?.spacing(2),
      width: theme?.spacing(56),
      [theme?.breakpoints.down('sm')]: {
        top: theme?.spacing(2 + 7),
      },
      '&:hover': {
        backgroundColor: theme?.palette.common.white,
      },
    },
    cardHeaderAction: {
      marginTop: 0,
    },
    cardContent: {
      height: '100%',
      overflow: 'auto',
      backgroundColor: alpha(theme?.palette?.primary.light, 0.5),
      scrollbarColor: `${theme?.palette?.primary.main} ${theme?.palette?.grey[300]}`,
      scrollbarWidth: 'thin',
      '&::-webkit-scrollbar': {
        width: '0.4em',
      },
      '&::-webkit-scrollbar-track': {
        borderRadius: 0,
        backgroundColor: theme?.palette?.grey[300],
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 0,
        backgroundColor: theme?.palette.primary.main,
      },
      '&:last-child': {
        paddingBottom: 0,
      },
    },
    cardActions: {
      display: 'flex',
      cursor: 's-resize',
      position: 'absolute',
      bottom: 0,
      width: '100%',
      justifyContent: 'center',
      backgroundColor: theme?.palette.common.white,
      borderTop: `1px solid ${theme?.palette.grey[300]}`,
    },
    headerDivider: {
      backgroundColor: theme?.palette.text.disabled,
    },
  };
}
