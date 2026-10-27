import {
  selectPartyRoles,
  selectedPartyRole,
  selectedPartyRoleIdentifier,
  selectedPartyRoleId,
  selectedPartyId,
  selectLastAccount,
  selectFavouriteAccount,
  selectSubUserCreation,
  detailsFinishedSuccessfully,
  detailsFinishedWithError,
  detailsIsInProgress,
  selectedRevenueTypes,
} from './selectors';
import { PartyRoleReduxState } from './types';

describe('PartyRole selectors', () => {
  const baseState: PartyRoleReduxState = {
    LoggedInPartyRole: {
      partyRoles: [
        { partyRoleId: '1', partyId: 'A', identificationLabel: 'Label-1' },
        { partyRoleId: '2', partyId: 'B', identificationLabel: 'Label-2' },
      ],
      selectedPartyRole: { partyRoleId: '1', partyId: 'A', identificationLabel: 'Label-1' },
      detailsStatus: 'SUCCESS_DETAILS',
      lastAccountId: 'last-acc',
      favoriteAccountId: 'fav-acc',
      subUserCreation: true,
      revenueTypes: [{ code: 'rev-1', label: 'Revenue 1' }],
      fetchedRevenueTypes: true,
      __status: 'SUCCESS',
      error: undefined,
      userId: 'mock-user',
    },
  } as unknown as PartyRoleReduxState;

  it('selectPartyRoles returns partyRoles array', () => {
    expect(selectPartyRoles(baseState)).toEqual(baseState.LoggedInPartyRole.partyRoles);
  });

  it('selectedPartyRole returns selectedPartyRole object', () => {
    expect(selectedPartyRole(baseState)).toEqual(baseState.LoggedInPartyRole.selectedPartyRole);
  });

  it('selectedPartyRoleIdentifier returns identificationLabel of selectedPartyRole', () => {
    expect(selectedPartyRoleIdentifier(baseState)).toEqual(
      baseState.LoggedInPartyRole.selectedPartyRole?.identificationLabel,
    );
  });

  it('selectedPartyRoleId returns partyRoleId of selectedPartyRole', () => {
    expect(selectedPartyRoleId(baseState)).toEqual(
      baseState.LoggedInPartyRole.selectedPartyRole?.partyRoleId,
    );
  });

  it('selectedPartyId returns partyId of selectedPartyRole', () => {
    expect(selectedPartyId(baseState)).toEqual(
      baseState.LoggedInPartyRole.selectedPartyRole?.partyId,
    );
  });

  it('detailsFinishedSuccessfully returns true if detailsStatus is SUCCESS_DETAILS', () => {
    expect(detailsFinishedSuccessfully(baseState)).toBe(true);
  });

  it('detailsIsInProgress returns true if detailsStatus is LOADING_DETAILS', () => {
    const loadingState: PartyRoleReduxState = {
      ...baseState,
      LoggedInPartyRole: { ...baseState.LoggedInPartyRole, detailsStatus: 'LOADING_DETAILS' },
    };
    expect(detailsIsInProgress(loadingState)).toBe(true);
  });

  it('detailsFinishedWithError returns true if detailsStatus is ERROR_DETAILS', () => {
    const errorState: PartyRoleReduxState = {
      ...baseState,
      LoggedInPartyRole: { ...baseState.LoggedInPartyRole, detailsStatus: 'ERROR_DETAILS' },
    };
    expect(detailsFinishedWithError(errorState)).toBe(true);
  });

  it('selectLastAccount returns lastAccountId', () => {
    expect(selectLastAccount(baseState)).toEqual('last-acc');
  });

  it('selectFavouriteAccount returns favoriteAccountId', () => {
    expect(selectFavouriteAccount(baseState)).toEqual('fav-acc');
  });

  it('selectSubUserCreation returns subUserCreation', () => {
    expect(selectSubUserCreation(baseState)).toBe(true);
  });

  it('selectedRevenueTypes returns revenueTypes array', () => {
    expect(selectedRevenueTypes(baseState)).toEqual(baseState.LoggedInPartyRole.revenueTypes);
  });
});
