import { Notification, NotifierState } from './types.d';
import { createSlice } from '@reduxjs/toolkit';

export const slice = 'Notifier';

const initialState: NotifierState = {
  notifications: [],
};

const NotifierSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    EnqueueSnackbar: (
      state: NotifierState = initialState,
      action: { type: string; payload: Notification },
    ) => {
      state.notifications = [...state.notifications, action.payload];
    },
    RemoveSnackbar: (
      state: NotifierState = initialState,
      action: { type: string; payload: { key: string } },
    ) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.key !== action.payload?.key,
      );
    },
  },
});

export const { EnqueueSnackbar, RemoveSnackbar } = NotifierSlice.actions;
export default NotifierSlice.reducer;
