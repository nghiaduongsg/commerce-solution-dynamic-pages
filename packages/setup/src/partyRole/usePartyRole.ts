import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  selectPartyRoles,
  selectedPartyRole,
  selectedPartyRoleId,
  selectedPartyRoleIdentifier,
  selectedPartyId,
  selectLastAccount,
  selectFavouriteAccount,
  selectSubUserCreation,
  detailsFinishedSuccessfully,
  detailsFinishedWithError,
  detailsIsInProgress,
  selectedRevenueTypes,
} from './selectors';
import {
  FetchCurrentAccount,
  FetchPartyRoles,
  FetchPartyRoleDetails,
  SetSelectedPartyRole,
  UpdateDefaultAccount,
  FetchSubUserCreationFlag,
  FetchRevenueTypes,
} from './reducers';
import { useUser } from '@pkg-setup/index';

const usePartyRole = () => {
  const dispatch = useDispatch();
  const { userId } = useUser();

  const setSelectedPartyRole = useCallback(
    (action) => dispatch(SetSelectedPartyRole(action)),
    [dispatch],
  );

  // @ts-ignore
  return {
    partyRole: useSelector(selectedPartyRole),
    revenueTypes: useSelector(selectedRevenueTypes),
    partyRoleIdentifier: useSelector(selectedPartyRoleIdentifier, shallowEqual),
    partyRoleId: useSelector(selectedPartyRoleId, shallowEqual),
    partyId: useSelector(selectedPartyId, shallowEqual),
    detailsFinishedSuccessfully: useSelector(detailsFinishedSuccessfully),
    detailsFinishedWithError: useSelector(detailsFinishedWithError),
    detailsIsInProgress: useSelector(detailsIsInProgress),
    partyRoles: useSelector(selectPartyRoles),
    lastAccount: useSelector(selectLastAccount, shallowEqual),
    favoriteAccount: useSelector(selectFavouriteAccount, shallowEqual),
    subUserCreation: useSelector(selectSubUserCreation, shallowEqual),
    fetchPartyRoles: useCallback(() => dispatch(FetchPartyRoles()), [dispatch]),
    fetchRevenueTypes: useCallback(() => dispatch(FetchRevenueTypes()), [dispatch]),
    fetchSubUserCreationFlag: useCallback(() => dispatch(FetchSubUserCreationFlag()), [dispatch]),
    fetchCurrentAccount: useCallback(() => dispatch(FetchCurrentAccount()), [dispatch]),
    fetchPartyRoleDetails: useCallback(() => dispatch(FetchPartyRoleDetails()), [dispatch]),
    updateDefaultAccounts: useCallback(
      (userId, favoriteAccountId, lastAccountId) =>
        // @ts-ignore
        dispatch(UpdateDefaultAccount({ userId, favoriteAccountId, lastAccountId })),
      [dispatch],
    ),
    setSelectedPartyRole,
  };
};

export default usePartyRole;
