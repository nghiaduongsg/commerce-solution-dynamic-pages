import { UserReduxState } from './types';

export const selectUserProfile = () => (state: UserReduxState) => state.LoggedInUser.profile || {};
export const selectUserPartyRoleId = () => (state: UserReduxState) =>
  state.LoggedInUser.profile?.partyRoleId;
export const selectUsername = () => (state: UserReduxState) =>
  state.LoggedInUser.profile?.username || '';
export const selectUserId = () => (state: UserReduxState) =>
  state.LoggedInUser.profile?.userId || state.LoggedInUser.profile?.id;
export const selectUserError = () => (state: UserReduxState) => state.LoggedInUser.error;
export const selectUserSecurableObjects = () => (state: UserReduxState) =>
  state.LoggedInUser.securableObjects || {};

export const selectUserAllowedServices = () => (state: UserReduxState) =>
  state.LoggedInUser.profile?.allowedServices || [];
export const selectIsAdminUser = () => (state: UserReduxState) =>
  state.LoggedInUser.profile?.isAdminUser || false;
export const selectLoading = () => (state: UserReduxState) => state.LoggedInUser.loading || false;
