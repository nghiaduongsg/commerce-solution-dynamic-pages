import { LoaderState } from './types.d';
import { createSlice } from '@reduxjs/toolkit';
import { CallApi } from '@pkg-core/apiData/redux/reducers';

export const slice = 'Loader';

const initialState: LoaderState = {
  isVisible: false,
};

const LoaderSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    ShowLoader: (state: LoaderState = initialState) => {
      state.isVisible = true;
    },
    HideLoader: (state: LoaderState = initialState) => {
      state.isVisible = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(CallApi.pending, (state) => {
        state.isVisible = true;
      })
      .addCase(CallApi.fulfilled, (state) => {
        state.isVisible = false;
      })
      .addCase(CallApi.rejected, (state) => {
        state.isVisible = false;
      });
  },
});

export const { ShowLoader, HideLoader } = LoaderSlice.actions;
export default LoaderSlice.reducer;
