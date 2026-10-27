import { Theme } from '@mui/material';

type NotificationStyleKeys =
  | 'viewAllNotifications'
  | 'notificationsButton'
  | 'menuItem'
  | 'typographyUnread'
  | 'typographyRead';

export default function useStyles(theme: Theme): Record<NotificationStyleKeys, object> {
  return {
    viewAllNotifications: {
      fontWeight: 'bold',
      color: theme?.palette.common.black,
      '&:hover': {
        backgroundColor: theme?.palette.action.hover,
      },
    },
    notificationsButton: {
      '&:hover,&:focus,&:active': {
        backgroundColor: theme?.palette.secondary.light,
      },
    },
    menuItem: {
      borderBottom: `1px solid ${theme?.palette.divider}`,
    },
    typographyUnread: {
      fontWeight: 'bolder',
      fontSize: '17px',
    },
    typographyRead: {
      fontSize: '16px',
    },
  };
}
