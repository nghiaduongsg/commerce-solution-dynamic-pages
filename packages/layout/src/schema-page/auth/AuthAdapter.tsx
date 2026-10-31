import React, { createContext, useContext } from 'react';

export const AUTH_ERROR_CODES = [
  'accountPending',
  'emailInUse',
  'invalidCredentials',
  'invalidEmail',
  'network',
  'tooManyRequests',
  'unavailable',
  'userDisabled',
  'weakPassword',
  'unknown',
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export class AuthActionError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthActionError';
  }
}

export type AuthAdapter = {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (credentials: { displayName: string; email: string; password: string }) => Promise<void>;
};

const AuthAdapterContext = createContext<AuthAdapter | null>(null);

export function AuthAdapterProvider({
  adapter,
  children,
}: {
  adapter: AuthAdapter;
  children: React.ReactNode;
}) {
  return <AuthAdapterContext.Provider value={adapter}>{children}</AuthAdapterContext.Provider>;
}

export const useAuthAdapter = () => useContext(AuthAdapterContext);
