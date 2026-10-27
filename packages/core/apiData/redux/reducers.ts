import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Axios from 'axios';
import { handlePayloadErrorsForToolkit, unwrapEntityDataArea } from '@pkg-entity/utils/utils';
import { SystemState } from '@pkg-setup/src/system/types';
import { CallApiDataType } from '@pkg-core/apiData/redux/types';
import { AnyType } from '@pkg-common/types';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { EnqueueSnackbar } from '@pkg-common/notifier/reducers';
import { hasValue } from '@pkg-common/utils';
import { REMOVE_ARRAY_FIELD_ITEM } from '@pkg-entity/redux/actions';
import { USER_ACCESS_PERMISSIONS_RESOURCE_ID } from '@pkg-constants/formCommon';

import axios from 'axios';

export const slice = 'ApiData';
export const CALL_API_PENDING = 'ApiData/CallApi/pending';
export const CALL_API_FULFILLED = 'ApiData/CallApi/fulfilled';
export const CALL_API_REJECTED = 'ApiData/CallApi/rejected';
const PROTECTED_API_DATA_KEYS = [USER_ACCESS_PERMISSIONS_RESOURCE_ID];

export const executeCall = (apiUrl, payload) => {
  const { url, method = 'get', data, queryParams } = payload;

  return axios({
    method: method,
    url: `${apiUrl}/${url}`,
    params: queryParams || {},
    data,
  });
};

export const CallApi: any = createAsyncThunk(
  'ApiData/CallApi',
  async (payload: CallApiDataType, { rejectWithValue, getState, dispatch }) => {
    const {
      id,
      pageId = id,
      url,
      method = 'get',
      data,
      jsonPath,
      metadata,
      callback,
      queryParams,
    } = payload;

    try {
      const state = getState() as { System: SystemState };
      const apiUrl = state.System.apiUrl;

      // Fetch data from the server
      const response = await Axios({
        method: method,
        url: `${apiUrl}/${url}`,
        params: queryParams || {},
        data,
      });

      if (callback && typeof callback === 'function') {
        callback();
      }

      return {
        id,
        pageId,
        jsonPath,
        metadata,
        data: response?.data,
      };
    } catch (error: AnyType) {
      let finalError = error;

      if (error.status === 403) {
        finalError = { ...error, message: 'forbidden' };
      } else if (error.status === 409) {
        finalError = {
          ...error,
          message: error.errorCode === 'ST-E0150' ? error.message : 'conflict',
        };
      }
      // @ts-ignore
      dispatch(EnqueueSnackbar(handlePayloadErrorsForToolkit(finalError)));

      return rejectWithValue({
        id,
        pageId,
        error: finalError,
      });
    }
  },
);

const apiSlice = createSlice({
  name: slice,
  initialState: {},
  reducers: {
    ClearApiData(state, action: { payload: { id: string } }) {
      delete state[action.payload.id];
    },
    ClearMultipleApiData(state, action: { payload: { ids: Array<string> } }) {
      const { ids } = action?.payload || {};
      ids?.forEach((id) => {
        delete state[id];
      });
    },
    ClearAllApiData(state) {
      Object.keys(state).forEach((key) => {
        if (!key.includes('SCHEMAS')) {
          delete state[key];
        }
      });
    },
    ClearFormApiData(state) {
      Object.keys(state).forEach((key) => {
        const isSchema = key.includes('SCHEMAS');
        const isProtected = PROTECTED_API_DATA_KEYS.includes(key);

        if (!isSchema && !isProtected) {
          delete state[key];
        }
      });
    },
    SetApiData(state, action: { payload: { id: string; data: AnyType } }) {
      const { id, data } = action?.payload || {};
      state[id] = { data, finished: true };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(CallApi.pending, (state, action) => {
        state[action.meta.arg.id] = {
          loading: true,
          finished: false,
        };
      })
      .addCase(CallApi.fulfilled, (state, action) => {
        const { id, data } = action?.payload || {};
        state[id] = {
          data: hasValue(data?.formData) ? unwrapEntityDataArea(data) : data,
          loading: false,
          refreshId: new Date().getTime(),
          finished: true,
        };
      })
      .addCase(CallApi.rejected, (state, action) => {
        const { id, pageId, error } = action?.payload || {};
        state[id || pageId] = {
          error,
          loading: false,
          finished: true,
        };
      })
      .addCase(SYSTEM_CLEAR, (state) => {
        Object.keys(state).forEach((key) => {
          if (!key.includes('SCHEMAS')) {
            delete state[key];
          }
        });
      })
      //@ts-ignore
      .addCase(
        REMOVE_ARRAY_FIELD_ITEM,
        (state, action: { payload: { entityId: string; fieldId: string; index: number } }) => {
          const { fieldId, index } = action.payload;
          const arrayFieldItem = `${fieldId}_${index}`;
          Object.keys(state).forEach((key) => {
            if (key.startsWith(arrayFieldItem)) {
              delete state[key];
            }
          });
        },
      );
  },
});

export const { ClearApiData, ClearMultipleApiData, ClearAllApiData, ClearFormApiData, SetApiData } =
  apiSlice.actions;

export default apiSlice.reducer;
