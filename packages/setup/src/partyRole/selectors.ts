import { PartyRoleReduxState } from './types';

export const selectPartyRoles = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.partyRoles || [];

export const selectedPartyRoleIdentifier = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.selectedPartyRole?.identificationLabel;

export const selectedPartyRole = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.selectedPartyRole;

export const detailsFinishedSuccessfully = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.detailsStatus === 'SUCCESS_DETAILS';

export const detailsIsInProgress = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.detailsStatus === 'LOADING_DETAILS';

export const detailsFinishedWithError = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.detailsStatus === 'ERROR_DETAILS';

export const selectedPartyRoleId = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.selectedPartyRole?.partyRoleId;

export const selectedPartyId = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.selectedPartyRole?.partyId;

export const selectLastAccount = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.lastAccountId;

export const selectFavouriteAccount = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.favoriteAccountId;

export const selectSubUserCreation = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.subUserCreation;

export const selectedRevenueTypes = (state: PartyRoleReduxState) =>
  state.LoggedInPartyRole.revenueTypes;
