import { useEffect, useState } from 'react';
import AuthContext from './AuthContext';

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from '../../services/auth';

import { setSessionExpiredHandler } from '../../services/apiClient';
import ApiError from '../../errors/ApiError';
import logger from '../../utils/logger';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  // Check logged user on app start up
  useEffect(() => {
    getCurrentUser()
      .then(setUser)

      .catch((error) => {
        // User logged out
        if (error instanceof ApiError && error.status === 401) {
          setUser(null);
          return;
        }

        // Another error
        logger.error('Error verificando sesión:', error);
        setUser(null);
      })

      .finally(() => {
        setLoading(false);
      });

  }, []);

  async function login(credentials) {
    await loginRequest(credentials);

    const currentUser = await getCurrentUser();
    setUser(currentUser);

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
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
