import { AnyType } from '@common/types';

export type PartyRoleState = {
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
};

export type PartyRoleReduxState = {
  LoggedInPartyRole: PartyRoleState;
};
