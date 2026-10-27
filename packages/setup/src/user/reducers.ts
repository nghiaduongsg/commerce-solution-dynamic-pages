import { UserState } from './types.d';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { AnyType } from '@pkg-common/types';
import { SystemState } from '@pkg-setup/src/system/types';
import { Init } from '@pkg-setup/src/system/reducers';

export const slice = 'LoggedInUser';

const initialState: UserState = {
  profile: null,
  error: null,
  securableObjects: {},
  loading: false,
};

export const LoadUserRoleSecurableObjects: AnyType = createAsyncThunk(
  'LoggedInUser/fetchUserRoleSecurableObjects',
  async (partyRoleId: string, { getState }) => {
    const state = getState() as { System: SystemState };
    const apiUrl = state.System.apiUrl;
    return axios
      .get(`${apiUrl}/authorization-management/user-roles/${partyRoleId}/securable-objects`)
      .then((response) => response.data);
  },
);

const loggedInUserSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    SetUserProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(LoadUserRoleSecurableObjects.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(LoadUserRoleSecurableObjects.fulfilled, (state, action) => {
      state.securableObjects = getAll(action.payload);
      state.loading = false;
    });
    builder.addCase(LoadUserRoleSecurableObjects.rejected, (state) => {
      state.securableObjects = initialState.securableObjects;
      state.loading = false;
    });
    builder.addCase(Init, (state, action: any) => {
      const loggedInUserData = action?.payload?.LoggedInUser || {};
      state.securableObjects = getAll(loggedInUserData?.securableObjects);
      state.profile = loggedInUserData?.user;
    });
  },
});

export default loggedInUserSlice.reducer;
export const { SetUserProfile } = loggedInUserSlice.actions;

export const getAll = (securableObjects) => {
  const list = {};
  (securableObjects || []).forEach((s) => {
    (s.securableObjectOperationKeys || []).forEach(
      (operation) => (list[`${s.securableObjectKey}${operation}`] = true),
    );
  });
  return list;
};
