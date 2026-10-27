export const BaseCodelists = 'baseCodelists';
export const UserPreferences = 'userPreferences';
export const User = 'user';
export const Menu = 'menu';
export const Language = 'language';
export const SecurableObjects = 'securableObjects';
export const RevenueTypes = 'revenueTypes';
export const PartyRoleDetails = 'partyRoleDetails';
export const CurrentAccount = 'currentAccount';
export const Idle = 'NA';
export const Loading = 'LOADING';
export const Finished = 'FINISHED';
export const ServerError = 'ERROR';

export type InitialSlicesType = {
  securableObjects: LoadingType;
  userPreferences: LoadingType;
  baseCodelists: LoadingType;
  language: LoadingType;
  menu: LoadingType;
  user: LoadingType;
  partyRoleDetails: LoadingType;
  currentAccount: LoadingType;
  revenueTypes: LoadingType;
};

export type LoadingType = 'NA' | 'LOADING' | 'FINISHED' | 'ERROR';
