import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Init } from '@pkg-setup/src/system/reducers';
import axios from 'axios';
import { AnyType } from '@pkg-common/types';

export const slice = 'LoggedInPartyRole';

export interface PartyRoleState {
  __status: 'NA' | 'LOADING' | 'SUCCESS' | 'ERROR';
  detailsStatus?: 'LOADING_DETAILS' | 'SUCCESS_DETAILS' | 'ERROR_DETAILS';
  subUserFlagStatus?: 'NA' | 'LOADING' | 'SUCCESS' | 'ERROR';
  revenueTypesStatus?: 'NA' | 'LOADING' | 'SUCCESS' | 'ERROR_REVENUE_TYPES';
  partyRoles: Array<{ code: string; label: string }>;
  error: string | undefined;
  selectedPartyRole: undefined | { [_: string]: string };
  userId: string;
  favoriteAccountId: string | null;
  lastAccountId: string | null;
  subUserCreation: boolean;
  revenueTypes: Array<{ code: string; label: string }>;
  fetchedRevenueTypes: boolean;
}

const initialState: PartyRoleState = {
  __status: 'NA',
  subUserFlagStatus: 'NA',
  partyRoles: [],
  error: '',
  selectedPartyRole: {},
  userId: '',
  favoriteAccountId: null,
  lastAccountId: null,
  subUserCreation: false,
  revenueTypes: [],
  fetchedRevenueTypes: false,
};

const API_URL = window['REACT_APP_API_URL'];

export const FetchPartyRoles: AnyType = createAsyncThunk('partyRole/fetchPartyRoles', () => {
  return axios
    .post(`${API_URL}/iss-service-management/operations/execute-paginated`, {
      operation: 'getUserRoles',
      revenueTypeCodes: [],
      parameters: {},
    })
    .then((response) => response.data?.content);
});

export const FetchRevenueTypes: AnyType = createAsyncThunk(
  'revenueType/fetchRevenueTypes',
  async () => {
    const response = await axios.post(
      `${API_URL}/iss-service-management/operations/execute-paginated`,
      { operation: 'getAllowedRevenueTypeCodes', revenueTypeCodes: [], parameters: {} },
    );
    const content = response.data?.content || [];
    return content.map((item) => item?.revenue_type_cd);
  },
);

export const FetchSubUserCreationFlag: AnyType = createAsyncThunk(
  'subUser/fetchSubUserCreationFlag',
  () => {
    return axios
      .post(`${API_URL}/iss-service-management/operations/execute-simple`, {
        operation: 'checkUserRelationship',
        revenueTypeCodes: [],
        parameters: {},
      })
      .then((response) => response.data?.content[0]);
  },
);

export const FetchCurrentAccount: AnyType = createAsyncThunk('account/FetchCurrentAccount', () => {
  return axios
    .get(`${API_URL}/ss-registry/default-accounts/currentUser`)
    .then((response) => response.data);
});

export const UpdateDefaultAccount: AnyType = createAsyncThunk(
  'account/UpdateDefaultAccount',
  ({
    userId,
    favoriteAccountId,
    lastAccountId,
  }: {
    userId: string;
    favoriteAccountId: string;
    lastAccountId: string;
  }) => {
    return axios
      .put(`${API_URL}/ss-registry/default-accounts`, {
        userId,
        favoriteAccountId,
        lastAccountId,
      })
      .then((response) => response.data);
  },
);

export const FetchPartyRoleDetails: AnyType = createAsyncThunk(
  'partyRole/fetchPartyRoleDetails',
  () => {
    return axios
      .post(`${API_URL}/iss-service-management/operations/execute-simple`, {
        operation: 'getPartyRoleIdentification',
        revenueTypeCodes: [],
        parameters: {},
      })
      .then((response) => response.data.content[0]);
  },
);

const partyRoleReducer = createSlice({
  name: slice,
  initialState,
  reducers: {
    SetSelectedPartyRole: (state, action) => {
      state.selectedPartyRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(FetchPartyRoles.pending, (state) => {
      state.__status = 'LOADING';
    });
    builder.addCase(FetchPartyRoles.fulfilled, (state, action) => {
      state.__status = 'SUCCESS';
      state.partyRoles = action.payload;
      state.error = '';
    });
    builder.addCase(FetchPartyRoles.rejected, (state, action) => {
      state.__status = 'ERROR';
      state.partyRoles = [];
      state.error = action.error.message;
    });
    builder.addCase(FetchCurrentAccount.pending, (state) => {
      state.__status = 'LOADING';
    });
    builder.addCase(FetchCurrentAccount.fulfilled, (state, action) => {
      state.__status = 'SUCCESS';
      state.userId = action.payload?.userId;
      state.favoriteAccountId = action.payload?.favoriteAccountId;
      state.lastAccountId = action.payload?.lastAccountId;
      state.error = '';
    });
    builder.addCase(FetchCurrentAccount.rejected, (state, action) => {
      state.error = action.error.message;
    });
    builder.addCase(UpdateDefaultAccount.pending, (state) => {
      state.__status = 'LOADING';
    });
    builder.addCase(UpdateDefaultAccount.fulfilled, (state, action) => {
      state.__status = 'SUCCESS';
      state.userId = action.payload?.userId;
      state.favoriteAccountId = action.payload?.favoriteAccountId;
      state.lastAccountId = action.payload?.lastAccountId;
      state.error = '';
    });
    builder.addCase(UpdateDefaultAccount.rejected, (state, action) => {
      state.error = action.error.message;
    });
    builder.addCase(FetchPartyRoleDetails.pending, (state) => {
      state.detailsStatus = 'LOADING_DETAILS';
    });
    builder.addCase(FetchPartyRoleDetails.fulfilled, (state, action) => {
      state.detailsStatus = 'SUCCESS_DETAILS';
      state.selectedPartyRole = {
        ...state.selectedPartyRole,
        partyRoleId: action.payload?.id,
        partyId: action.payload?.partyId,
        identificationLabel: action.payload?.identificationLabel,
        partyIdentificationLabel: action.payload?.partyIdentificationLabel,
      };
      state.error = '';
      if (!state.userId) {
        state.userId = action.payload?.userId;
      }
      if (!state.favoriteAccountId) {
        state.favoriteAccountId = action.payload?.favoriteAccountId;
      }
      if (!state.lastAccountId) {
        state.lastAccountId = action.payload?.lastAccountId;
      }
    });
    builder.addCase(FetchPartyRoleDetails.rejected, (state, action) => {
      state.detailsStatus = 'ERROR_DETAILS';
      state.error = action.error.message;
    });
    builder.addCase(FetchSubUserCreationFlag.pending, (state) => {
      state.subUserFlagStatus = 'LOADING';
    });
    builder.addCase(FetchSubUserCreationFlag.fulfilled, (state, action) => {
      state.subUserFlagStatus = 'SUCCESS';
      state.subUserCreation = action.payload.allowSubUserCreation;
      state.error = '';
    });
    builder.addCase(FetchSubUserCreationFlag.rejected, (state) => {
      state.subUserFlagStatus = 'ERROR';
      state.subUserCreation = false;
    });
    builder.addCase(FetchRevenueTypes.pending, (state) => {
      state.revenueTypesStatus = 'LOADING';
      state.fetchedRevenueTypes = false;
    });
    builder.addCase(FetchRevenueTypes.fulfilled, (state, action) => {
      if (Array.isArray(action.payload)) {
        state.revenueTypesStatus = 'SUCCESS';
        state.revenueTypes = action.payload;
        state.fetchedRevenueTypes = true;
        state.error = '';
      } else {
        state.revenueTypesStatus = 'NA';
        state.revenueTypes = [];
        state.fetchedRevenueTypes = false;
        state.error = 'Invalid data format';
      }
    });
    builder.addCase(FetchRevenueTypes.rejected, (state, action) => {
      state.revenueTypesStatus = 'ERROR_REVENUE_TYPES';
      state.revenueTypes = [];
      state.fetchedRevenueTypes = false;
      state.error = action.error.message;
    });
    builder.addCase(Init, (state, action: any) => {
      const loggedInPartyRoleData = action?.payload?.LoggedInPartyRole || {};
      state.lastAccountId = loggedInPartyRoleData.lastAccountId;
      state.userId = loggedInPartyRoleData.userId;
      state.favoriteAccountId = loggedInPartyRoleData.favoriteAccountId;
      state.selectedPartyRole = {
        ...state.selectedPartyRole,
        ...loggedInPartyRoleData.partyRoleDetails,
      };
      state.revenueTypes = loggedInPartyRoleData.revenueTypes;
      state.fetchedRevenueTypes = loggedInPartyRoleData.fetchedRevenueTypes;
      state.subUserCreation = loggedInPartyRoleData.allowSubUserCreation;
    });
  },
});

export const { SetSelectedPartyRole } = partyRoleReducer.actions;

export default partyRoleReducer.reducer;
