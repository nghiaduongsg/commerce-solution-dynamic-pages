import { slice } from './reducers';

export const selectNotifications = (state) => state[slice]?.events || [];
export const selectUnreadNotifications = () => (state) => {
  const eventsArray = Object.values(state[slice]?.events || {});
  return eventsArray?.filter((event: any) => event.status === 'Unread');
};
export const selectCount = (state) => state[slice]?.count ?? 0;
