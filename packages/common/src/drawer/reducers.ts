import { createSlice } from '@reduxjs/toolkit';
import { DrawerState } from './types';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';

export const slice = 'Drawer';

const initialState: DrawerState = {};

const drawerReducer = createSlice({
  name: slice,
  initialState,
  reducers: {
    OpenDrawer: (state: DrawerState, action) => {
      const { id } = action.payload;
      if (id) {
        state[id] = true;
      }
    },
    CloseDrawer: (state: DrawerState, action) => {
      const { id } = action.payload;
      if (id) {
        state[id] = false;
      }
    },
    ToggleDrawer: (state: DrawerState, action) => {
      const { id } = action.payload;
      if (id) {
        state[id] = !state[id];
      }
    },
    OpenUniqueDrawer: (state: DrawerState, action) => {
      const { id } = action.payload;
      if (id) {
        Object.keys(state || {}).forEach((key) => (state[key] = false));
        state[id] = true;
      }
    },
    CloseAllDrawers: (state: DrawerState) => {
      Object.keys(state || {}).forEach((key) => (state[key] = false));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(SYSTEM_CLEAR, (state) => {
      Object.keys(state || {}).forEach((key) => (state[key] = false));
    });
  },
});

export const { OpenDrawer, CloseDrawer, ToggleDrawer, OpenUniqueDrawer, CloseAllDrawers } =
  drawerReducer.actions;

export default drawerReducer.reducer;
