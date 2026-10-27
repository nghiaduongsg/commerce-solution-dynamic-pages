import { renderHook, act } from '@testing-library/react';
import useServerEvents from './useServerEvents';
import * as redux from 'react-redux';
import { FetchNotifications, MarkAsReadNotification, updateCounterNotifications } from './reducers';
import { selectNotifications, selectUnreadNotifications, selectCount } from './selectors';
jest.mock('react-redux');
jest.mock('./reducers', () => ({
  FetchNotifications: jest.fn(() => ({ type: 'FETCH_NOTIFICATIONS' })),
  MarkAsReadNotification: jest.fn((id) => ({ type: 'MARK_AS_READ', payload: id })),
  updateCounterNotifications: jest.fn((count) => ({ type: 'UPDATE_COUNT', payload: count })),
}));

jest.mock('./selectors', () => ({
  selectNotifications: jest.fn(),
  selectUnreadNotifications: jest.fn(),
  selectCount: jest.fn(),
}));

describe('useServerEvents', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (redux.useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (redux.useSelector as unknown as jest.Mock).mockImplementation((selector) => {
      if (selector === selectNotifications) return [{ id: 1, message: 'Test Notification' }];
      if (selector === selectUnreadNotifications()) return [{ id: 1 }]; // Κάλεσε τον selector εδώ
      if (selector === selectCount) return 3;
      return null;
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should return notifications, unreadNotifications and count', () => {
    const { result } = renderHook(() => useServerEvents());

    expect(result.current.notifications).toEqual([{ id: 1, message: 'Test Notification' }]);
    expect(result.current.unreadNotifications).toEqual([{ id: 1 }]);
    expect(result.current.count).toEqual(3);
  });

  it('should dispatch FetchNotifications when fetchFirst is called', () => {
    const { result } = renderHook(() => useServerEvents());

    act(() => {
      result.current.fetchFirst();
    });

    expect(mockDispatch).toHaveBeenCalledWith(FetchNotifications());
  });

  it('should dispatch MarkAsReadNotification when markAsRead is called', () => {
    const { result } = renderHook(() => useServerEvents());

    act(() => {
      result.current.markAsRead('123');
    });

    expect(mockDispatch).toHaveBeenCalledWith(MarkAsReadNotification('123'));
  });

  it('should dispatch updateCounterNotifications when updateCounterNotifications is called', () => {
    const { result } = renderHook(() => useServerEvents());

    act(() => {
      result.current.updateCounterNotifications(5);
    });

    expect(mockDispatch).toHaveBeenCalledWith(updateCounterNotifications(5));
  });
});
