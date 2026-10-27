import axios from 'axios';
import reducer, {
  ServerEventsState,
  SetNotifications,
  updateCounterNotifications,
  FetchNotifications,
  MarkAsReadNotification,
} from './reducers';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ServerEvents reducers', () => {
  const initialState: ServerEventsState = {
    __status: 'NA',
    events: [],
    lastUpdated: 0,
    count: 0,
  };

  describe('ServerEvents reducer', () => {
    it('should return the initial state', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle SetNotifications', () => {
      const mockNotifications = [
        { entityId: '1', status: 'Unread', message: 'Test 1', entityCL: 'IRM', title: 'Title 1' },
        { entityId: '2', status: 'Read', message: 'Test 2', entityCL: 'ISS', title: 'Title 2' },
      ];

      const mockTime = 1234567890;
      jest.spyOn(Date.prototype, 'getTime').mockReturnValue(mockTime);

      const state = reducer(initialState, SetNotifications(mockNotifications));

      expect(state.events).toEqual(mockNotifications);
      expect(state.lastUpdated).toBe(mockTime);
      expect(state.__status).toBe('NA');
      expect(state.count).toBe(0);

      jest.restoreAllMocks();
    });

    it('should handle SetNotifications with empty array', () => {
      const stateWithEvents = {
        ...initialState,
        events: [{ entityId: '1', status: 'Unread', message: 'Old', entityCL: '', title: '' }],
      };

      const state = reducer(stateWithEvents, SetNotifications([]));

      expect(state.events).toEqual([]);
      expect(state.lastUpdated).toBeGreaterThan(0);
    });

    it('should handle updateCounterNotifications', () => {
      const state = reducer(initialState, updateCounterNotifications(5));
      expect(state.count).toBe(5);
    });

    it('should handle FetchNotifications.fulfilled', () => {
      const mockPayload = {
        content: [{ entityId: '1', status: 'Unread', message: 'Hello', entityCL: '', title: '' }],
      };

      const state = reducer(initialState, {
        type: FetchNotifications.fulfilled.type,
        payload: mockPayload,
      });

      expect(state.count).toBe(1);
      expect(state.__status).toBe('SUCCESS');
      expect(state.events).toEqual(mockPayload.content);
    });

    it('should handle FetchNotifications.rejected', () => {
      const state = reducer(initialState, {
        type: FetchNotifications.rejected.type,
        payload: {},
      });

      expect(state.count).toBe(0);
      expect(state.__status).toBe('ERROR');
      expect(state.events).toEqual([]);
    });

    it('should handle MarkAsReadNotification.fulfilled', () => {
      const state = reducer(
        { ...initialState, count: 5 },
        {
          type: MarkAsReadNotification.fulfilled.type,
          payload: {},
        },
      );

      expect(state.count).toBe(4);
      expect(state.__status).toBe('SUCCESS');
    });

    it('should handle MarkAsReadNotification.rejected', () => {
      const state = reducer(
        { ...initialState, count: 5 },
        {
          type: MarkAsReadNotification.rejected.type,
          payload: {},
        },
      );

      expect(state.count).toBe(5);
      expect(state.__status).toBe('ERROR');
    });
  });

  describe('FetchNotifications async thunk', () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          ServerEvents: reducer,
          System: (
            state = { apiUrl: 'https://test-api.com', systemUsed: 'IRM', retentionPeriod: 7 },
          ) => state,
        },
      });
      jest.clearAllMocks();
    });

    it('should create correct action types', () => {
      expect(FetchNotifications.pending.type).toBe('serverEvents/fetchNotifications/pending');
      expect(FetchNotifications.fulfilled.type).toBe('serverEvents/fetchNotifications/fulfilled');
      expect(FetchNotifications.rejected.type).toBe('serverEvents/fetchNotifications/rejected');
    });

    it('should fetch notifications for IRM system successfully', async () => {
      const mockResponse = {
        data: {
          content: [
            {
              entityId: '1',
              status: 'Unread',
              message: 'Test notification',
              entityCL: 'IRM',
              title: 'Test',
            },
          ],
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await store.dispatch(FetchNotifications());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://test-api.com/query-management/queries/NOTIF_LIST/execute?size=20&sort=creationDate:DESC',
        { retentionPeriod: 7 },
      );
      expect(result.type).toBe('serverEvents/fetchNotifications/fulfilled');
      expect(result.payload).toEqual(mockResponse.data);
    });

    it('should fetch notifications for ISS system successfully', async () => {
      const issStore = configureStore({
        reducer: {
          ServerEvents: reducer,
          System: (
            state = { apiUrl: 'https://iss-api.com', systemUsed: 'ISS', retentionPeriod: 5 },
          ) => state,
        },
      });

      const mockResponse = {
        data: {
          content: [
            {
              entityId: '2',
              status: 'Read',
              message: 'ISS notification',
              entityCL: 'ISS',
              title: 'ISS Test',
            },
          ],
        },
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await issStore.dispatch(FetchNotifications());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://iss-api.com/query-management/queries/ISS_NOTIFL/execute?size=20&sort=creationDate:DESC',
        { retentionPeriod: 5 },
      );
      expect(result.type).toBe('serverEvents/fetchNotifications/fulfilled');
      expect(result.payload).toEqual(mockResponse.data);
    });

    it('should use default retention period when not provided', async () => {
      const storeWithoutRetention = configureStore({
        reducer: {
          ServerEvents: reducer,
          System: (state = { apiUrl: 'https://test-api.com', systemUsed: 'IRM' }) => state,
        },
      });

      const mockResponse = { data: { content: [] } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await storeWithoutRetention.dispatch(FetchNotifications());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://test-api.com/query-management/queries/NOTIF_LIST/execute?size=20&sort=creationDate:DESC',
        { retentionPeriod: 1 },
      );
    });

    it('should handle API error', async () => {
      const mockError = new Error('API Error');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      const result = await store.dispatch(FetchNotifications());

      expect(result.type).toBe('serverEvents/fetchNotifications/rejected');
      expect(result.error.message).toBe('API Error');
    });

    it('should handle missing System state', async () => {
      const storeWithoutSystem = configureStore({
        reducer: {
          ServerEvents: reducer,
        },
      });

      const mockResponse = { data: { content: [] } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await storeWithoutSystem.dispatch(FetchNotifications());

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'undefined/query-management/queries/NOTIF_LIST/execute?size=20&sort=creationDate:DESC',
        { retentionPeriod: 1 },
      );
    });
  });

  describe('MarkAsReadNotification async thunk', () => {
    let store: any;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          ServerEvents: reducer,
          System: (state = { apiUrl: 'https://test-api.com' }) => state,
        },
      });
      jest.clearAllMocks();
    });

    it('should create correct action types', () => {
      expect(MarkAsReadNotification.pending.type).toBe('serverEvents/markAsRead/pending');
      expect(MarkAsReadNotification.fulfilled.type).toBe('serverEvents/markAsRead/fulfilled');
      expect(MarkAsReadNotification.rejected.type).toBe('serverEvents/markAsRead/rejected');
    });

    it('should mark notification as read successfully', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const notificationId = 'notification-123';
      const result = await store.dispatch(MarkAsReadNotification(notificationId));

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'https://test-api.com/notification/notifications/notification-123',
      );
      expect(result.type).toBe('serverEvents/markAsRead/fulfilled');
      expect(result.payload).toEqual(mockResponse.data);
    });

    it('should handle API error when marking as read', async () => {
      const mockError = new Error('Failed to mark as read');
      mockedAxios.put.mockRejectedValueOnce(mockError);

      const notificationId = 'notification-456';
      const result = await store.dispatch(MarkAsReadNotification(notificationId));

      expect(result.type).toBe('serverEvents/markAsRead/rejected');
      expect(result.error.message).toBe('Failed to mark as read');
    });

    it('should handle missing System state', async () => {
      const storeWithoutSystem = configureStore({
        reducer: {
          ServerEvents: reducer,
        },
      });

      const mockResponse = { data: { success: true } };
      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const notificationId = 'notification-789';
      await storeWithoutSystem.dispatch(MarkAsReadNotification(notificationId));

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'undefined/notification/notifications/notification-789',
      );
    });

    it('should handle empty notification id', async () => {
      const mockResponse = { data: { success: true } };
      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await store.dispatch(MarkAsReadNotification(''));

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'https://test-api.com/notification/notifications/',
      );
      expect(result.type).toBe('serverEvents/markAsRead/fulfilled');
    });
  });

  describe('Complex reducer scenarios', () => {
    it('should not update count when new unread count is less than current', () => {
      const stateWithHighCount = { ...initialState, count: 10 };
      const mockPayload = {
        content: [
          { entityId: '1', status: 'Unread', message: 'Hello', entityCL: '', title: '' },
          { entityId: '2', status: 'Read', message: 'World', entityCL: '', title: '' },
        ],
      };

      const state = reducer(stateWithHighCount, {
        type: FetchNotifications.fulfilled.type,
        payload: mockPayload,
      });

      expect(state.count).toBe(10);
      expect(state.__status).toBe('SUCCESS');
      expect(state.events).toEqual(mockPayload.content);
    });

    it('should update count when new unread count is greater than current', () => {
      const stateWithLowCount = { ...initialState, count: 1 };
      const mockPayload = {
        content: [
          { entityId: '1', status: 'Unread', message: 'Hello', entityCL: '', title: '' },
          { entityId: '2', status: 'Unread', message: 'World', entityCL: '', title: '' },
          { entityId: '3', status: 'Read', message: 'Test', entityCL: '', title: '' },
        ],
      };

      const state = reducer(stateWithLowCount, {
        type: FetchNotifications.fulfilled.type,
        payload: mockPayload,
      });

      expect(state.count).toBe(2);
      expect(state.__status).toBe('SUCCESS');
      expect(state.events).toEqual(mockPayload.content);
    });

    it('should handle MarkAsReadNotification when count is 0', () => {
      const state = reducer(initialState, {
        type: MarkAsReadNotification.fulfilled.type,
        payload: {},
      });

      expect(state.count).toBe(-1);
      expect(state.__status).toBe('SUCCESS');
    });
  });
});
