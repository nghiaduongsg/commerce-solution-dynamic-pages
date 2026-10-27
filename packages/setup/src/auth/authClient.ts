import { getIdToken, signOut } from 'firebase/auth';
import { AnyType } from '@pkg-common/types';
import { getFirebaseAuth } from './firebase';
import { getAuthState, setAuthState } from './authState';

export const authClient = {
  getToken: async (force = false): Promise<string | null> => {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) return null;
    try {
      const token = await getIdToken(user, force);
      setAuthState({ token, claims: (user as AnyType).claims || null });
      return token;
    } catch {
      return null;
    }
  },

  get token(): string | null {
    return getAuthState().token;
  },

  get claims(): AnyType | null {
    return getAuthState().claims;
  },

  login: () => {
    const loginUrl = window['AUTH_LOGIN_URL'] || `${window['CONTEXT_PATH'] || ''}/login`;
    window.location.href = loginUrl;
  },

  logout: async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await signOut(auth);
      } catch {
        // ignore sign-out errors (e.g. no active session)
      }
    }
    setAuthState({ user: null, token: null, claims: null });
    window.location.href = window['CONTEXT_PATH'] || '/';
  },
};

export default authClient;
