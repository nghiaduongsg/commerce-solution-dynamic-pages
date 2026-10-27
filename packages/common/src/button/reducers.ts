import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { ButtonPressState } from './types';
import { createSlice } from '@reduxjs/toolkit';

export const slice = 'ButtonPress';

const initialState: ButtonPressState = {};
const ButtonPressSlice = createSlice({
  name: slice,
  initialState,
  reducers: {
    SetLatestButtonPress: (
      state: ButtonPressState,
      action: { type: string; payload: { actionId: string } },
    ) => {
      const { actionId } = action.payload;
      if (actionId) {
        state.latestButtonAction = actionId;
      }
    },
    ClearLatestButtonPress: (state: ButtonPressState) => {
      state.latestButtonAction = undefined;
    },

    MarkButtonPress: (
      state: ButtonPressState,
      action: { type: string; payload: { id: string } },
    ) => {
      const { id } = action.payload;
      if (id) {
        state[id] = new Date().getTime();
      }
    },
    ClearButtonPresses: (state: ButtonPressState) => {
      Object.keys(state ?? {}).forEach((key) => (state[key] = undefined));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(SYSTEM_CLEAR, (state) => {
      Object.keys(state ?? {}).forEach((key) => (state[key] = undefined));
    });
  },
});

export const { MarkButtonPress, ClearButtonPresses, SetLatestButtonPress, ClearLatestButtonPress } =
  ButtonPressSlice.actions;

export default ButtonPressSlice.reducer;
