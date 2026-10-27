import { AnyType } from '@common/types';

export type UserState = {
  profile: {
    attributes: {
      locale: string[];
    };
    emailVerified: boolean;
    username: string;
    partyRoleId: string;
    userId: string;
    isAdminUser: boolean;
    id: string;
    allowedServices: Array<string>;
  } | null;
  securableObjects: AnyType;
  loading: boolean;
  error: AnyType;
};

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

export type UserReduxState = {
  LoggedInUser: UserState;
};
