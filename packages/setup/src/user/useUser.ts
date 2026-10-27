import { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import {
  selectLoading,
  selectUserError,
  selectUserProfile,
  selectUserSecurableObjects,
  selectUserPartyRoleId,
  selectUserId,
  selectUsername,
  selectUserAllowedServices,
  selectIsAdminUser,
} from './selectors';
import { LoadUserRoleSecurableObjects, SetUserProfile } from './reducers';

const useUser = () => {
  const dispatch = useDispatch();

  return {
    profile: useSelector(selectUserProfile(), shallowEqual),
    partyRoleId: useSelector(selectUserPartyRoleId(), shallowEqual),
    userId: useSelector(selectUserId(), shallowEqual),
    username: useSelector(selectUsername(), shallowEqual),
    securableObjects: useSelector(selectUserSecurableObjects(), shallowEqual),
    allowedServices: useSelector(selectUserAllowedServices(), shallowEqual),
    isAdminUser: useSelector(selectIsAdminUser(), shallowEqual),
    loading: useSelector(selectLoading(), shallowEqual),
    error: useSelector(selectUserError(), shallowEqual),
    loadSecurableObjects: useCallback(
      (partyRoleId: string) => dispatch(LoadUserRoleSecurableObjects(partyRoleId)),
      [dispatch],
    ),
    setUserProfile: useCallback((payload) => dispatch(SetUserProfile(payload)), [dispatch]),
  };
};

export default useUser;
