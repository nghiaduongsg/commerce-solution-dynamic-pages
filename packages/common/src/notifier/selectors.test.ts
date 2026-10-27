import { selectNotifications, selectNotification } from './selectors';
import { NotifierState } from './types';

describe('Notification selectors', () => {
  const state: { Notifier: NotifierState } = {
    Notifier: {
      notifications: [
        {
          key: 'form1-key',
          message: 'form1-message',
          severity: 'dark',
          dismissed: true,
          namespace: 'party',
          successUpdateMessageKey: 'Test',
        },
      ],
    },
  };

  it('selectNotifications - Get all', () => {
    const expected = state.Notifier.notifications;
    expect(selectNotifications(state)).toEqual(expected);
  });

  it('selectNotification - None selected', () => {
    expect(selectNotification('form1')(state)).toEqual({
      key: '',
      message: '',
      severity: 'dark',
    });
  });

  it('selectNotification - Filter result', () => {
    const expected = {
      key: 'form1-key',
      message: 'form1-message',
      severity: 'dark',
      dismissed: true,
      namespace: 'party',
      successUpdateMessageKey: 'Test',
    };
    expect(selectNotification('form1-key')(state)).toEqual(expected);
  });
});
