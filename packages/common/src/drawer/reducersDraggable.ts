import { DraggableDrawerState } from './types';
import { createSlice } from '@reduxjs/toolkit';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';

export const slice = 'DraggableDrawer';

const initialState: DraggableDrawerState = {
  id: null,
  item: null,
};

const DraggableDrawerSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    OpenDraggableDrawer: (
      state: DraggableDrawerState = initialState,
      action: { type: string; payload: DraggableDrawerState },
    ) => {
      const { id, item } = action.payload;
      state.id = id;
      state.item = item;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(SYSTEM_CLEAR, (state) => {
      state.id = 'test';
      state.item = null;
    });
  },
});

export const { OpenDraggableDrawer } = DraggableDrawerSlice.actions;

export default DraggableDrawerSlice.reducer;
