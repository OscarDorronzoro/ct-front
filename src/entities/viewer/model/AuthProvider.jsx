import { useCallback, useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from '../api/viewerApi';
import { setSessionExpiredHandler, ApiError } from '@/shared/api';

import { logger } from '@/shared/lib/logger';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // The session could not be checked (no connection, server down): neither logged in nor out
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  const checkSession = useCallback(() => getCurrentUser()
    .then((currentUser) => {
      setUser(currentUser);
      setConnectionError(null);
    })
    .catch((error) => {
      // Not logged in (or the session expired)
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        setConnectionError(null);
        return;
      }

      // Unknown: don't send the user to the login page for a network or server problem
      logger.error('Error verificando sesión:', error);
      setConnectionError(error);
    })
    .finally(() => {
      setLoading(false);
    }), []);

  // Check the logged user on app start up
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Back online: check again
  useEffect(() => {
    if (!connectionError) {
      return undefined;
    }

    window.addEventListener('online', checkSession);
    return () => window.removeEventListener('online', checkSession);
  }, [connectionError, checkSession]);

  async function login(credentials) {
    await loginRequest(credentials);

    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setConnectionError(null);

    return currentUser;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        connectionError,
        retry: checkSession,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
