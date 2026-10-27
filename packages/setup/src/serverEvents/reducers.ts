import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AnyType } from '@pkg-common/types';
import axios from 'axios';
import { SystemState } from '@pkg-setup/src/system/types';

export const slice = 'ServerEvents';

export type ServerEvent = {
  entityCL: string;
  entityId: string;
  status: string;
  message: string;
  title: string;
  notificationId?: string;
  notificationTypeCode?: string;
  parameters?: AnyType;
};

export interface ServerEventsState {
  __status: 'NA' | 'LOADING' | 'SUCCESS' | 'ERROR';
  events: Array<ServerEvent>;
  lastUpdated: number;
  count: number;
}

export const FetchNotifications: AnyType = createAsyncThunk(
  'serverEvents/fetchNotifications',
  async (_, { getState }) => {
    const state = getState() as { System: SystemState };
    const { apiUrl, retentionPeriod, systemUsed } = state.System || {};
    const url =
      systemUsed === 'ISS'
        ? 'query-management/queries/ISS_NOTIFL/execute?size=20&sort=creationDate:DESC'
        : 'query-management/queries/NOTIF_LIST/execute?size=20&sort=creationDate:DESC';
    const response = await axios.post(`${apiUrl}/${url}`, {
      retentionPeriod: retentionPeriod || 1,
    });
    return response.data;
  },
);

export const MarkAsReadNotification: AnyType = createAsyncThunk(
  'serverEvents/markAsRead',
  async (id: string, { getState }) => {
    const state = getState() as { System: SystemState };
    const { apiUrl } = state.System || {};
    const response = await axios.put(`${apiUrl}/notification/notifications/${id}`);
    return response.data;
  },
);

const initialState: ServerEventsState = {
  __status: 'NA',
  events: [],
  lastUpdated: 0,
  count: 0,
};

const serverEventsSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    SetNotifications: (state, action) => {
      state.events = action.payload;
      state.lastUpdated = new Date().getTime();
    },
    updateCounterNotifications(state, action) {
      state.count = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(FetchNotifications.fulfilled, (state, action) => {
      state.events = action.payload?.content;
      // update state.count only when the new number
      // of Unread is greater than the one already stored in state.count
      const newUnreadCount = action.payload?.content.filter(
        (event: any) => event.status === 'Unread',
      ).length;

      if (newUnreadCount > state.count) {
        state.count = newUnreadCount;
      }
      state.__status = 'SUCCESS';
    });
    builder.addCase(FetchNotifications.rejected, (state) => {
      state.events = [];
      state.__status = 'ERROR';
    });

    builder.addCase(MarkAsReadNotification.fulfilled, (state) => {
      state.count -= 1;
      state.__status = 'SUCCESS';
    });
    builder.addCase(MarkAsReadNotification.rejected, (state) => {
      state.__status = 'ERROR';
    });
  },
});
export const { SetNotifications, updateCounterNotifications } = serverEventsSlice.actions;
export default serverEventsSlice.reducer;
