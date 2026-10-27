import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { selectNotifications, selectUnreadNotifications, selectCount } from './selectors';
import { FetchNotifications, MarkAsReadNotification, updateCounterNotifications } from './reducers';
import { useCallback } from 'react';

const useServerEvents = () => {
  const dispatch = useDispatch();

  return {
    notifications: useSelector(selectNotifications),
    unreadNotifications: useSelector(selectUnreadNotifications()),
    count: useSelector(selectCount, shallowEqual),
    fetchFirst: useCallback(() => dispatch(FetchNotifications()), [dispatch]),
    markAsRead: useCallback((id: string) => dispatch(MarkAsReadNotification(id)), [dispatch]),
    updateCounterNotifications: useCallback(
      (count: number) => dispatch(updateCounterNotifications(count)),
      [dispatch],
    ),
  };
};

export default useServerEvents;
