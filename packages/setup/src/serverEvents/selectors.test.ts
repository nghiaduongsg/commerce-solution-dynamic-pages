import { selectNotifications, selectUnreadNotifications, selectCount } from './selectors';
import { slice } from './reducers';

describe('Server Events selectors', () => {
  const mockState = {
    ServerEvents: {
      events: [
        {
          entityCL: 'CL1',
          entityId: '1',
          status: 'Unread',
          message: 'Test Notification',
          title: 'Test Title',
        },
        {
          entityCL: 'CL2',
          entityId: '2',
          status: 'Read',
          message: 'Another Notification',
          title: 'Another Title',
        },
      ],
      count: 1,
      __status: 'SUCCESS',
      lastUpdated: Date.now(),
    },
  };

  describe('ServerEvents selectors', () => {
    it('selectNotifications returns all events', () => {
      expect(selectNotifications(mockState)).toEqual(mockState.ServerEvents.events);
    });

    it('selectUnreadNotifications returns only unread events', () => {
      const selector = selectUnreadNotifications();
      expect(selector(mockState)).toEqual([
        {
          entityCL: 'CL1',
          entityId: '1',
          status: 'Unread',
          message: 'Test Notification',
          title: 'Test Title',
        },
      ]);
    });

    it('selectCount returns the count', () => {
      expect(selectCount(mockState)).toEqual(1);
    });
  });
});
