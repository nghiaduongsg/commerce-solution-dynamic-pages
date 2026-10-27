import { AnyType } from '@pkg-common/types';

export type AuthState = {
  initialized: boolean;
  user: AnyType | null;
  token: string | null;
  claims: AnyType | null;
};

let state: AuthState = {
  initialized: false,
  user: null,
  token: null,
  claims: null,
};

const listeners = new Set<(s: AuthState) => void>();

export const setAuthState = (partial: Partial<AuthState>) => {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener(state));
};

export const getAuthState = (): AuthState => state;

export const subscribeAuth = (listener: (s: AuthState) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
