import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';

import i18n from 'i18next';
import {
  CURRENCIES,
  LANGUAGES,
  SYSTEM_PARAMETERS,
  FORM_TYPE_CATEGORIES,
  ENTITIES,
  THEMES,
} from '@pkg-constants/codeListVariables';
import { CallApi } from '@pkg-core/apiData/redux/reducers';
import { SystemState } from '@pkg-setup/src/system/types';
import {
  CodeListState,
  LoadCodeListAction,
  LoadManyCodeListAction,
} from '@pkg-core/codeList/redux/types';
import { AnyType, CodeListItem } from '@pkg-common/types';
import { SYSTEM_CLEAR } from '@pkg-setup/src/system/useSystem';
import { jpValue } from '@pkg-common/dataResolver/utils';
import { Init } from '@pkg-setup/src/system/reducers';

export const sortByLabelOrCode = (items: Array<{ label: string; code: string }> = []) =>
  [...items].sort((a, b) => {
    const aValue = (a.label || a.code)?.toUpperCase();
    const bValue = (b.label || b.code)?.toUpperCase();
    return aValue.localeCompare(bValue, i18n.language);
  });

export const dataToStore = (payload, data) => {
  const list = payload.jsonPath ? jpValue(data, payload.jsonPath) : data;
  return (list || [])?.map((item) => {
    if (typeof item === 'string') {
      return { code: item, label: item, expired: false, attributes: [] };
    }
    return payload.renderWith
      ? {
          code: jpValue(item, payload.renderWith.code),
          label: payload.showCode
            ? `${jpValue(item, payload.renderWith.code)} - ${jpValue(item, payload.renderWith.label)}`
            : jpValue(item, payload.renderWith.label),
          expired: item.expired,
          attributes: item.attributes || [],
          relatedObject: item,
        }
      : {
          code: item.code,
          label: payload.showCode ? `${item.code} - ${item.label}` : item.label,
          expired: item.expired,
          attributes: item.attributes || [],
          relatedObject: item,
        };
  });
};

const CODELIST_LOADING_STATUS = 'LOADING';
const codeListLoadingItem: CodeListItem = {
  code: CODELIST_LOADING_STATUS,
  label: CODELIST_LOADING_STATUS,
  attributes: [],
};

export const slice = 'CodeList';
export const CODELIST_LOAD_PENDING = 'CodeList/Load/pending';
export const CODELIST_LOAD_FULFILLED = 'CodeList/Load/fulfilled';
export const CODELIST_LOAD_REJECTED = 'CodeList/Load/rejected';

// Async thunk for loading codelists
export const LoadCodeList: AnyType = createAsyncThunk(
  'CodeList/Load',
  async (payload: LoadCodeListAction, { getState, rejectWithValue }) => {
    const { CodeList, System } = getState() as { System: SystemState; CodeList: CodeListState };

    const { alwaysReload, code, method = 'get', api, dataValues, queryParams } = payload;
    const codelists = CodeList.lists;
    const apiUrl = System.apiUrl;

    // Check if the codelist is already in the store
    if (!alwaysReload && codelists[code] && codelists[code][0]?.code !== CODELIST_LOADING_STATUS) {
      return { code, list: codelists[code] };
    }

    try {
      // Fetch data from the server
      const { data } = await Axios({
        method: method,
        url: `${apiUrl}/${api}`,
        params: queryParams || {},
        ...(method.toLowerCase() === 'post' && { data: dataValues }),
      });

      const list = dataToStore(payload, data);

      const codelistTranslations = {};
      list.forEach((item) => {
        codelistTranslations[item.code] = item.label;
      });

      i18n.addResources(i18n.language, 'codelists', codelistTranslations);

      return { code, list };
    } catch (error) {
      return rejectWithValue({
        code: code,
        error: error,
      });
    }
  },
  {
    condition: (payload: LoadCodeListAction, { getState }) => {
      const { CodeList } = getState() as { CodeList: CodeListState };
      const { code, alwaysReload } = payload;
      const codelists = CodeList.lists;

      if (codelists[code] && !alwaysReload) {
        return false;
      }

      return true;
    },
  },
);

export const LoadCodeLists: AnyType = createAsyncThunk(
  'CodeList/LoadMany',
  async (payload: LoadManyCodeListAction, { getState, rejectWithValue }) => {
    const { System } = getState() as { System: SystemState; CodeList: CodeListState };
    const { lists: codeListCodes, api, method = 'get', dataValues } = payload;
    const apiUrl = System.apiUrl;

    try {
      // Fetch data from the server
      const { data } = await Axios({
        method: method,
        url: `${apiUrl}/${api}`,
        params: { codeListCodes: codeListCodes ?? [] },
        ...(method.toLowerCase() === 'post' && { data: dataValues }),
      });

      const lists = {};

      data?.forEach((list) => {
        lists[list.code] = sortByLabelOrCode(dataToStore({}, list?.items || []));
      });

      return lists;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// Slice for managing codelists
const codeListSlice = createSlice({
  name: slice,
  initialState: {
    lists: {},
    loading: false,
    componentValueType: {},
  },
  reducers: {
    ClearCodeLists: (state) => {
      state.lists = {
        [SYSTEM_PARAMETERS]: state.lists[SYSTEM_PARAMETERS],
        [CURRENCIES]: state.lists[CURRENCIES],
        [LANGUAGES]: state.lists[LANGUAGES],
        [FORM_TYPE_CATEGORIES]: state.lists[FORM_TYPE_CATEGORIES],
        [ENTITIES]: state.lists[ENTITIES],
        [THEMES]: state.lists[THEMES],
      };
      state.loading = false;
      state.componentValueType = {};
    },
    AddCodeList: (state, action) => {
      const { resourceId, data } = action.payload;
      state.lists[resourceId] = sortByLabelOrCode(data || []);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(LoadCodeList.pending, (state, action) => {
        const { code } = action.meta?.arg ?? {};

        if (code && !state.lists[code]) {
          state.lists[code] = [codeListLoadingItem];
        }

        state.loading = true;
      })
      .addCase(LoadCodeList.fulfilled, (state, action) => {
        const { code, list } = action.payload;
        state.lists[code] = sortByLabelOrCode(list);

        state.loading = false;
      })
      .addCase(LoadCodeList.rejected, (state, action) => {
        const { code } = action.payload ?? {};
        if (code && state.lists?.[code]) {
          delete state.lists[code];
        }

        state.loading = false;
      })
      .addCase(LoadCodeLists.pending, (state) => {
        state.loading = true;
      })
      .addCase(LoadCodeLists.fulfilled, (state, action) => {
        const lists = action.payload;
        Object.keys(lists || {})?.forEach((key) => {
          state.lists[key] = lists[key];
        });

        state.loading = false;
      })
      .addCase(LoadCodeLists.rejected, (state) => {
        state.loading = false;
      })
      .addCase(CallApi.fulfilled, (state, action) => {
        const { data, jsonPath, id, metadata = {} } = action.payload;
        const { saveAs } = metadata || {};

        if (saveAs === 'CODELIST' && id) {
          state.lists[id] = sortByLabelOrCode(dataToStore({ jsonPath, ...metadata }, data));
        }
        if (saveAs === 'CODELISTS') {
          data?.forEach((list) => {
            state.lists[list.code] = sortByLabelOrCode(
              dataToStore({ jsonPath, ...metadata }, list?.items || []),
            );
          });
        }
      })
      .addCase(SYSTEM_CLEAR, (state) => {
        state.lists = {
          [SYSTEM_PARAMETERS]: state.lists[SYSTEM_PARAMETERS],
          [CURRENCIES]: state.lists[CURRENCIES],
          [LANGUAGES]: state.lists[LANGUAGES],
          [FORM_TYPE_CATEGORIES]: state.lists[FORM_TYPE_CATEGORIES],
          [ENTITIES]: state.lists[ENTITIES],
          [THEMES]: state.lists[THEMES],
        };
        state.loading = false;
        state.componentValueType = {};
      })
      .addCase(Init, (state, action: any) => {
        const { CodeList, System } = action.payload || {};

        const lists = CodeList;
        const themes = System?.themes;
        Object.keys(lists || {})?.forEach((key) => {
          state.lists[key] = lists[key];
        });
        if (themes?.length) {
          state.lists[THEMES] = themes;
        }

        state.loading = false;
        state.componentValueType = {};
      });
  },
});

export const { ClearCodeLists, AddCodeList } = codeListSlice.actions;

export default codeListSlice.reducer;
