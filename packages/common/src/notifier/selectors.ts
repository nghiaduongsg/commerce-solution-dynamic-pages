import { Notification, NotifierState } from './types';

export const selectNotifications = (state: { Notifier: NotifierState }) =>
  state.Notifier.notifications || [];

export const selectNotification = (key: string) => (state: { Notifier: NotifierState }) =>
  state.Notifier.notifications.find((notification: Notification) => notification.key === key) || {
    key: '',
    message: '',
    severity: 'dark',
  };
