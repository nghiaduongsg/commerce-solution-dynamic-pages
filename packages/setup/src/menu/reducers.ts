import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AnyType } from '@pkg-common/types';
import { MenuState } from '@pkg-setup/src/menu/types';
import { SystemState } from '@pkg-setup/src/system/types';
import { Init } from '@pkg-setup/src/system/reducers';

export const slice = 'Menu';
export const MENU_ITEMS_API = 'ui-configuration/menus/tree';

const initialState: MenuState = {
  loading: false,
  items: [],
  error: null,
};

export const LoadMainMenu: AnyType = createAsyncThunk(
  'Menu/LoadMainMenu',
  async (_, { getState }) => {
    const state = getState() as { System: SystemState };
    const apiUrl = state.System.apiUrl;
    const application = state.System.systemUsed;
    return axios
      .get(
        `${apiUrl}/${MENU_ITEMS_API}?menuTypeCL=${application === 'ISS' ? 'ISS_INTERNAL' : 'INTERNAL'}`,
      )
      .then((response) => response.data);
  },
);

export const menuSlice = createSlice({
  name: slice,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(LoadMainMenu.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(LoadMainMenu.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.error = initialState.error;
    });
    builder.addCase(LoadMainMenu.rejected, (state, action) => {
      state.loading = false;
      state.items = initialState.items;
      // @ts-ignore
      state.error = action.payload?.error?.message;
    });
    builder.addCase(Init, (state, action: any) => {
      state.items = action.payload?.Menu || [];
      state.loading = false;
    });
  },
});

export default menuSlice.reducer;
