import { useEffect, useState, type ReactNode, useCallback } from 'react';
import authService from '../services/auth.service';
import { tokenStore } from '../services/token.store';
import { getRuntimeConfig } from '../config/runtime-config';
import { AuthContext, type UserProfile } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const logout = useCallback(() => {
    // No-op for demo: we don't redirect to Keycloak logout
    setIsAuthenticated(false);
    setUserProfile(null);
  }, []);

  useEffect(() => {
    const performLogin = async () => {
      try {
        console.log('[AuthProvider] Performing programmatic login with hardcoded credentials...');

        const username = getRuntimeConfig('VITE_KEYCLOAK_USERNAME', 'max_mustermann');
        const password = getRuntimeConfig('VITE_KEYCLOAK_USER_PASSWORD');

        const token = await authService.loginAndGetToken(username, password);
        if (token) {
          console.log('[AuthProvider] Login successful');
          setIsAuthenticated(true);

          // Minimal profile — just the username used for API calls
          setUserProfile({
            username,
            id: 'demo-user-id',
          });
        } else {
          console.warn('[AuthProvider] Login returned no token, falling back to unauthenticated');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[AuthProvider] Programmatic login failed:', error);
        // Still set as authenticated so the user can see the demo pages
        // The QR codes may not load, but the UI will be visible
        setIsAuthenticated(true);
        setUserProfile({
          username: getRuntimeConfig('VITE_KEYCLOAK_USERNAME', 'max_mustermann'),
          id: 'demo-user-id',
        });
      } finally {
        setIsLoading(false);
      }
    };

    performLogin();
  }, []);

  const login = useCallback(() => {
    // Already logged in via ROPC, no redirect needed
    console.log('[AuthProvider] login() called - already authenticated via ROPC');
  }, []);

  const getToken = (): string | undefined => {
    return tokenStore.getToken() || undefined;
  };

  const hasRole = (/* role: string */): boolean => {
    return true; // Allow all roles for demo
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userProfile,
        login,
        logout,
        getToken,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
