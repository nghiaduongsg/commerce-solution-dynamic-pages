import { useEffect, useState } from 'react';
import { AnyType } from '@pkg-common/types';
import { AuthState, getAuthState, subscribeAuth } from './authState';
import authClient from './authClient';

const useAuth = () => {
  const [state, setState] = useState<AuthState>(getAuthState());

  useEffect(() => subscribeAuth(setState), []);

  return {
    ...state,
    isAuthenticated: !!state.user,
    login: authClient.login,
    logout: authClient.logout,
    getIdToken: (force = false) => authClient.getToken(force),
  };
};

export default useAuth;
