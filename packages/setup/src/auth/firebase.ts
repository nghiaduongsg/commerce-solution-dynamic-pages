import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { AnyType } from '@pkg-common/types';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export const setupFirebase = (config: AnyType): Auth => {
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
};

export const getFirebaseAuth = (): Auth | null => auth;

export default auth;
