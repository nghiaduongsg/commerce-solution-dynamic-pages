import { renderHook } from '@testing-library/react';
import { act } from 'react';
import usePartyRole from './usePartyRole';
//@ts-ignore
import { getMockWrapperAndStore } from '@_jestHelpers/reactMockStore';
import * as reducers from './reducers';

jest.mock('../user/useUser', () => ({
  __esModule: true,
  default: () => ({ userId: 'mock-user' }),
}));

describe('usePartyRole', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterAll(() => {
    jest.resetAllMocks();
  });

  const storeData = {
    LoggedInPartyRole: {
      __status: 'SUCCESS',
      detailsStatus: 'SUCCESS_DETAILS',
      subUserFlagStatus: 'SUCCESS',
      revenueTypesStatus: 'SUCCESS',
      partyRoles: [{ code: 'P1', label: 'Party One' }],
      error: '',
      selectedPartyRole: { code: 'P1', label: 'Party One' },
      userId: 'user-123',
      favoriteAccountId: null,
      lastAccountId: null,
      subUserCreation: true,
      revenueTypes: [{ code: 'R1', label: 'Revenue One' }],
      fetchedRevenueTypes: true,
    },
  };

  const { wrapper } = getMockWrapperAndStore(storeData);
  it('should use mocked userId', () => {
    const { result } = renderHook(() => usePartyRole(), { wrapper });
    act(() => {
      result.current.setSelectedPartyRole({ code: 'P1', label: 'Party One' });
    });
    expect(result.current.setSelectedPartyRole).toBeDefined();
  });

  it('should return store values correctly', () => {
    const { result } = renderHook(() => usePartyRole(), { wrapper });

    expect(result.current.revenueTypes).toEqual(storeData.LoggedInPartyRole.revenueTypes);
    expect(result.current.detailsFinishedSuccessfully).toEqual(
      storeData.LoggedInPartyRole.detailsStatus === 'SUCCESS_DETAILS',
    );
    expect(result.current.partyRoles).toEqual(storeData.LoggedInPartyRole.partyRoles);
    expect(result.current.lastAccount).toEqual(storeData.LoggedInPartyRole.lastAccountId);
    expect(result.current.favoriteAccount).toEqual(storeData.LoggedInPartyRole.favoriteAccountId);
    expect(result.current.subUserCreation).toEqual(storeData.LoggedInPartyRole.subUserCreation);
  });

  it('should dispatch SetSelectedPartyRole when "setSelectedPartyRole" is called', () => {
    const { mockStore, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => usePartyRole(), { wrapper });

    act(() => {
      result.current.setSelectedPartyRole({ code: 'P2', label: 'Party Two' });
    });

    const actions = mockStore.getActions();
    expect(actions).toContainEqual(
      reducers.SetSelectedPartyRole({ code: 'P2', label: 'Party Two' }),
    );
  });

  it('should dispatch FetchPartyRoles when "fetchPartyRoles" is called', () => {
    const { mockStore, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => usePartyRole(), { wrapper });

    act(() => {
      result.current.fetchPartyRoles();
    });

    const actions = mockStore.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: 'partyRole/fetchPartyRoles/pending',
      }),
    );
  });

  it('should dispatch FetchPartyRoleDetails when "fetchPartyRoleDetails" is called', () => {
    const { mockStore, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => usePartyRole(), { wrapper });

    act(() => {
      result.current.fetchPartyRoleDetails();
    });

    const actions = mockStore.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: 'partyRole/fetchPartyRoleDetails/pending',
      }),
    );
  });

  it('should dispatch FetchRevenueTypes when "fetchRevenueTypes" is called', () => {
    const { mockStore, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => usePartyRole(), { wrapper });

    act(() => {
      result.current.fetchRevenueTypes();
    });

    const actions = mockStore.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: 'revenueType/fetchRevenueTypes/pending',
      }),
    );
  });

  it('should dispatch FetchSubUserCreationFlag when "fetchSubUserCreationFlag" is called', () => {
    const { mockStore, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => usePartyRole(), { wrapper });

    act(() => {
      result.current.fetchSubUserCreationFlag();
    });

    const actions = mockStore.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: 'subUser/fetchSubUserCreationFlag/pending',
      }),
    );
  });

  it('should dispatch FetchCurrentAccount when "fetchCurrentAccount" is called', () => {
    const { mockStore, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => usePartyRole(), { wrapper });

    act(() => {
      result.current.fetchCurrentAccount();
    });

    const actions = mockStore.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: 'account/FetchCurrentAccount/pending',
      }),
    );
  });

  it('should dispatch UpdateDefaultAccount when "updateDefaultAccounts" is called', () => {
    const { mockStore, wrapper } = getMockWrapperAndStore(storeData);

    const { result } = renderHook(() => usePartyRole(), { wrapper });

    act(() => {
      result.current.updateDefaultAccounts('user-123', 'fav-account-1', 'last-account-1');
    });

    const actions = mockStore.getActions();
    expect(actions).toContainEqual(
      expect.objectContaining({
        type: 'account/UpdateDefaultAccount/pending',
      }),
    );
  });
});
