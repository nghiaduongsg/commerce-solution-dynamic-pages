import axios from 'axios';
import { configureStore } from '@reduxjs/toolkit';
import { Init } from '@pkg-setup/src/system/reducers';
import reducer, {
  SetSelectedPartyRole,
  FetchPartyRoles,
  FetchCurrentAccount,
  UpdateDefaultAccount,
  FetchPartyRoleDetails,
  FetchSubUserCreationFlag,
  FetchRevenueTypes,
  PartyRoleState,
} from './reducers';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('partyRoleReducer', () => {
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
    detailsStatus: undefined,
    revenueTypesStatus: undefined,
  };

  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle SetSelectedPartyRole', () => {
    const payload = { code: 'P1', label: 'Party One' };
    const nextState = reducer(initialState, SetSelectedPartyRole(payload));
    expect(nextState.selectedPartyRole).toEqual(payload);
  });

  it('should handle FetchPartyRoles.pending', () => {
    const action = { type: FetchPartyRoles.pending.type };
    const nextState = reducer(initialState, action);
    expect(nextState.__status).toEqual('LOADING');
  });

  it('should handle FetchPartyRoles.fulfilled', () => {
    const payload = [{ code: 'P1', label: 'Party One' }];
    const action = { type: FetchPartyRoles.fulfilled.type, payload };
    const nextState = reducer(initialState, action);
    expect(nextState.__status).toEqual('SUCCESS');
    expect(nextState.partyRoles).toEqual(payload);
    expect(nextState.error).toEqual('');
  });

  it('should handle FetchPartyRoles.rejected', () => {
    const action = { type: FetchPartyRoles.rejected.type, error: { message: 'Error!' } };
    const nextState = reducer(initialState, action);
    expect(nextState.__status).toEqual('ERROR');
    expect(nextState.partyRoles).toEqual([]);
    expect(nextState.error).toEqual('Error!');
  });

  it('should handle FetchCurrentAccount.fulfilled', () => {
    const action = {
      type: FetchCurrentAccount.fulfilled.type,
      payload: {
        userId: 'u1',
        favoriteAccountId: 'f1',
        lastAccountId: 'l1',
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState.__status).toEqual('SUCCESS');
    expect(nextState.userId).toEqual('u1');
    expect(nextState.favoriteAccountId).toEqual('f1');
    expect(nextState.lastAccountId).toEqual('l1');
    expect(nextState.error).toEqual('');
  });

  it('should handle UpdateDefaultAccount.fulfilled', () => {
    const action = {
      type: UpdateDefaultAccount.fulfilled.type,
      payload: {
        userId: 'u2',
        favoriteAccountId: 'f2',
        lastAccountId: 'l2',
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState.__status).toEqual('SUCCESS');
    expect(nextState.userId).toEqual('u2');
    expect(nextState.favoriteAccountId).toEqual('f2');
    expect(nextState.lastAccountId).toEqual('l2');
    expect(nextState.error).toEqual('');
  });

  it('should handle FetchPartyRoleDetails.fulfilled and keep existing account fields', () => {
    const currentState: PartyRoleState = {
      ...initialState,
      selectedPartyRole: { code: 'P1', label: 'Party One' },
      userId: 'existing-user',
      favoriteAccountId: 'existing-fav',
      lastAccountId: 'existing-last',
    };

    const action = {
      type: FetchPartyRoleDetails.fulfilled.type,
      payload: {
        id: 'pr-1',
        partyId: 'pty-1',
        identificationLabel: 'ID-LABEL',
        partyIdentificationLabel: 'PARTY-ID-LABEL',
        userId: 'new-user',
        favoriteAccountId: 'new-fav',
        lastAccountId: 'new-last',
      },
    };

    const nextState = reducer(currentState, action);

    expect(nextState.detailsStatus).toEqual('SUCCESS_DETAILS');
    expect(nextState.selectedPartyRole).toEqual({
      code: 'P1',
      label: 'Party One',
      partyRoleId: 'pr-1',
      partyId: 'pty-1',
      identificationLabel: 'ID-LABEL',
      partyIdentificationLabel: 'PARTY-ID-LABEL',
    });
    expect(nextState.userId).toEqual('existing-user');
    expect(nextState.favoriteAccountId).toEqual('existing-fav');
    expect(nextState.lastAccountId).toEqual('existing-last');
  });

  it('should handle FetchPartyRoleDetails.fulfilled and set empty account fields', () => {
    const action = {
      type: FetchPartyRoleDetails.fulfilled.type,
      payload: {
        id: 'pr-2',
        partyId: 'pty-2',
        identificationLabel: 'LABEL-2',
        partyIdentificationLabel: 'PARTY-LABEL-2',
        userId: 'user-2',
        favoriteAccountId: 'fav-2',
        lastAccountId: 'last-2',
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState.detailsStatus).toEqual('SUCCESS_DETAILS');
    expect(nextState.userId).toEqual('user-2');
    expect(nextState.favoriteAccountId).toEqual('fav-2');
    expect(nextState.lastAccountId).toEqual('last-2');
  });

  it('should handle FetchSubUserCreationFlag.fulfilled', () => {
    const action = {
      type: FetchSubUserCreationFlag.fulfilled.type,
      payload: { allowSubUserCreation: true },
    };

    const nextState = reducer(initialState, action);

    expect(nextState.subUserFlagStatus).toEqual('SUCCESS');
    expect(nextState.subUserCreation).toEqual(true);
    expect(nextState.error).toEqual('');
  });

  it('should handle FetchRevenueTypes.fulfilled with invalid data format', () => {
    const action = {
      type: FetchRevenueTypes.fulfilled.type,
      payload: { invalid: true },
    };

    const nextState = reducer(initialState, action);

    expect(nextState.revenueTypesStatus).toEqual('NA');
    expect(nextState.revenueTypes).toEqual([]);
    expect(nextState.fetchedRevenueTypes).toEqual(false);
    expect(nextState.error).toEqual('Invalid data format');
  });

  it('should handle Init and map persisted state', () => {
    const action = {
      type: Init.type,
      payload: {
        LoggedInPartyRole: {
          lastAccountId: 'la-1',
          userId: 'user-1',
          favoriteAccountId: 'fa-1',
          partyRoleDetails: { code: 'PR', label: 'Role' },
          revenueTypes: ['VAT', 'PAYE'],
          fetchedRevenueTypes: true,
          allowSubUserCreation: true,
        },
      },
    };

    const nextState = reducer(initialState, action);

    expect(nextState.lastAccountId).toEqual('la-1');
    expect(nextState.userId).toEqual('user-1');
    expect(nextState.favoriteAccountId).toEqual('fa-1');
    expect(nextState.selectedPartyRole).toEqual({ code: 'PR', label: 'Role' });
    expect(nextState.revenueTypes).toEqual(['VAT', 'PAYE']);
    expect(nextState.fetchedRevenueTypes).toEqual(true);
    expect(nextState.subUserCreation).toEqual(true);
  });
});

describe('partyRole thunks', () => {
  const apiUrl = (window as any).REACT_APP_API_URL;

  const createStore = () =>
    configureStore({
      reducer: {
        LoggedInPartyRole: reducer,
      },
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('FetchPartyRoles calls endpoint and returns content', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { content: [{ code: 'A', label: 'Role A' }] } });

    const result = await createStore().dispatch(FetchPartyRoles());

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/iss-service-management/operations/execute-paginated`,
      {
        operation: 'getUserRoles',
        revenueTypeCodes: [],
        parameters: {},
      },
    );
    expect(result.type).toBe(FetchPartyRoles.fulfilled.type);
    expect(result.payload).toEqual([{ code: 'A', label: 'Role A' }]);
  });

  it('FetchRevenueTypes maps revenue_type_cd values', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { content: [{ revenue_type_cd: 'VAT' }, { revenue_type_cd: 'PAYE' }] },
    });

    const result = await createStore().dispatch(FetchRevenueTypes());

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/iss-service-management/operations/execute-paginated`,
      {
        operation: 'getAllowedRevenueTypeCodes',
        revenueTypeCodes: [],
        parameters: {},
      },
    );
    expect(result.type).toBe(FetchRevenueTypes.fulfilled.type);
    expect(result.payload).toEqual(['VAT', 'PAYE']);
  });

  it('FetchSubUserCreationFlag returns first content row', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { content: [{ allowSubUserCreation: true }, { allowSubUserCreation: false }] },
    });

    const result = await createStore().dispatch(FetchSubUserCreationFlag());

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/iss-service-management/operations/execute-simple`,
      {
        operation: 'checkUserRelationship',
        revenueTypeCodes: [],
        parameters: {},
      },
    );
    expect(result.type).toBe(FetchSubUserCreationFlag.fulfilled.type);
    expect(result.payload).toEqual({ allowSubUserCreation: true });
  });

  it('FetchCurrentAccount calls current user endpoint', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { userId: 'u1', favoriteAccountId: 'f1', lastAccountId: 'l1' },
    });

    const result = await createStore().dispatch(FetchCurrentAccount());

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/ss-registry/default-accounts/currentUser`,
    );
    expect(result.type).toBe(FetchCurrentAccount.fulfilled.type);
    expect(result.payload).toEqual({ userId: 'u1', favoriteAccountId: 'f1', lastAccountId: 'l1' });
  });

  it('UpdateDefaultAccount sends body and returns response', async () => {
    mockedAxios.put.mockResolvedValueOnce({
      data: { userId: 'u2', favoriteAccountId: 'f2', lastAccountId: 'l2' },
    });

    const payload = { userId: 'u2', favoriteAccountId: 'f2', lastAccountId: 'l2' };
    const result = await createStore().dispatch(UpdateDefaultAccount(payload));

    expect(mockedAxios.put).toHaveBeenCalledWith(`${apiUrl}/ss-registry/default-accounts`, payload);
    expect(result.type).toBe(UpdateDefaultAccount.fulfilled.type);
    expect(result.payload).toEqual(payload);
  });

  it('FetchPartyRoleDetails returns first content row', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        content: [
          {
            id: 'pr-1',
            partyId: 'pty-1',
            identificationLabel: 'ID',
            partyIdentificationLabel: 'PID',
          },
        ],
      },
    });

    const result = await createStore().dispatch(FetchPartyRoleDetails());

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${apiUrl}/iss-service-management/operations/execute-simple`,
      {
        operation: 'getPartyRoleIdentification',
        revenueTypeCodes: [],
        parameters: {},
      },
    );
    expect(result.type).toBe(FetchPartyRoleDetails.fulfilled.type);
    expect(result.payload).toEqual({
      id: 'pr-1',
      partyId: 'pty-1',
      identificationLabel: 'ID',
      partyIdentificationLabel: 'PID',
    });
  });
});
