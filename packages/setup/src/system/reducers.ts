import { createSlice } from '@reduxjs/toolkit';
import { SystemState } from './types';
import { getAll } from '../user/reducers';
import { AnyType } from '@pkg-common/types';
import { USER_PREFERENCES } from '@pkg-constants/formIds';

export const slice = 'System';

const defaultState: Partial<SystemState> = {
  apiUrl: '',
  allSymbol: '',
  systemUsed: '',
  systemAssets: '', // Window object defined for images, icons, etc.
  applyPermissions: true,
  useStaticSchemas: true,
  useDefaultTranslations: true,
  primaryCurrency: { code: '' },
  selectedLanguage: '',
  lastUpdate: 0,
  retentionPeriod: 1,
  isSignReversed: false,
  securableObjects: {},
};

const systemSlice = createSlice({
  name: slice,
  initialState: defaultState,
  reducers: {
    Update: (state, action: { payload: Partial<SystemState> }) => {
      const props = action?.payload || {};
      Object.keys(props || {}).forEach((key) => (state[key] = props[key]));
      state.lastUpdate = new Date().getTime();
    },
    Init: (state, action: any) => {
      const props = action?.payload?.System || {};
      Object.keys(props || {}).forEach((key) => (state[key] = props[key]));
      state.lastUpdate = new Date().getTime();
      state.securableObjects = getAll(props?.securableObjects);
    },
  },
  extraReducers: (builder) => {
    builder.addCase('ApiData/CallApi/fulfilled', (state, action: AnyType) => {
      if (
        action.payload?.pageId === USER_PREFERENCES ||
        action.payload?.id === USER_PREFERENCES //WIP
      ) {
        try {
          const response = JSON.parse(action.payload?.data?.dataArea);
          state.selectedLanguage = response.preferredLanguage || state.selectedLanguage;
        } catch {}
      }
    });
  },
});

export const { Update, Init } = systemSlice.actions;

export default systemSlice.reducer;
