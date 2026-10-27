import React, { useEffect } from 'react';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { AnyType } from '@pkg-common/types';
import setupTranslations from '@pkg-setup/src/system/setupTranslations';
import setupInterceptors from '@pkg-setup/src/interceptors/interceptors';
import Axios from 'axios-observable';
import { setupFirebase } from './firebase';
import { setAuthState } from './authState';
import authClient from './authClient';

const AuthProvider = ({
  children,
  firebaseConfig,
}: {
  children: React.ReactNode;
  firebaseConfig: AnyType;
}) => {
  useEffect(() => {
    const auth = setupFirebase(firebaseConfig);
    setupTranslations();
    setupInterceptors(Axios, authClient);

    const unsubscribeUser = onAuthStateChanged(auth, (user) => {
      setAuthState({
        initialized: true,
        user: user
          ? {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              providerData: user.providerData,
            }
          : null,
      });
    });

    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setAuthState({ token: null, claims: null });
        return;
      }
      try {
        const token = await user.getIdToken();
        setAuthState({ token, claims: (user as AnyType).claims || null });
      } catch {
        // ignore token refresh errors
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeToken();
    };
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
