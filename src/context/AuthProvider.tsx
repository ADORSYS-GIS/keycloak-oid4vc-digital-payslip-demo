import { useEffect, useState, useRef, type ReactNode, useCallback } from 'react';
import authService from '../services/auth.service';
import { tokenStore } from '../services/token.store';
import { getRuntimeConfig } from '../config/runtime-config';
import { AuthContext, type UserProfile } from './AuthContext';

/**
 * Refresh the token at 80 % of its lifetime so we never hit a 401.
 * E.g. for a 5-minute token we refresh after 4 minutes.
 */
const REFRESH_INTERVAL_MULTIPLIER = 0.8;

/**
 * Fallback refresh interval (2 minutes) if expires_in is not available.
 */
const FALLBACK_REFRESH_MS = 2 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Keep credentials in a ref so we can re-login if the refresh_token stops working
  const credentialsRef = useRef<{ username: string; password: string } | null>(null);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---------------------------------------------------------------------------
  // Schedules the next token refresh based on the stored token expiry
  // ---------------------------------------------------------------------------
  const scheduleTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    const expiry = tokenStore.getTokenExpiry();
    let intervalMs = FALLBACK_REFRESH_MS;

    if (expiry) {
      const timeUntilExpiry = expiry - Date.now();
      if (timeUntilExpiry > 0) {
        intervalMs = timeUntilExpiry * REFRESH_INTERVAL_MULTIPLIER;
      }
    }

    console.log(
      '[AuthProvider] Scheduling token refresh every',
      Math.round(intervalMs / 1000),
      'seconds'
    );

    refreshIntervalRef.current = setInterval(async () => {
      console.log('[AuthProvider] Refresh interval triggered, refreshing token...');
      const newToken = await authService.refreshAccessToken();

      if (newToken) {
        console.log('[AuthProvider] Token refreshed successfully');
        setAuthError(null);
        // Recalculate interval based on the new token's expiry
        scheduleTokenRefresh();
      } else {
        console.warn('[AuthProvider] Token refresh failed, attempting re-login...');

        if (credentialsRef.current) {
          try {
            const token = await authService.loginAndGetToken(
              credentialsRef.current.username,
              credentialsRef.current.password
            );
            if (token) {
              console.log('[AuthProvider] Re-login successful after refresh failure');
              setIsAuthenticated(true);
              setAuthError(null);
              // Recalculate interval based on the new token's expiry
              scheduleTokenRefresh();
              return;
            }
          } catch (reloginError) {
            console.error('[AuthProvider] Re-login also failed:', reloginError);
          }
        }

        setIsAuthenticated(false);
        setAuthError('Token refresh fehlgeschlagen. Bitte laden Sie die Seite neu.');
      }
    }, intervalMs);
  }, []);

  const logout = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    tokenStore.clearToken();
    setIsAuthenticated(false);
    setUserProfile(null);
    setAuthError(null);
  }, []);

  useEffect(() => {
    const performLogin = async () => {
      try {
        if (tokenStore.getToken() && !tokenStore.isTokenExpired()) {
          console.log('[AuthProvider] Valid stored token found, skipping programmatic login.');
          setIsAuthenticated(true);
          setAuthError(null);
          setUserProfile({
            username: getRuntimeConfig('VITE_KEYCLOAK_USERNAME', 'max_mustermann'),
            id: 'demo-user-id',
          });
          scheduleTokenRefresh();
          return;
        }

        console.log('[AuthProvider] Performing programmatic login with hardcoded credentials...');

        const username = getRuntimeConfig('VITE_KEYCLOAK_USERNAME', 'max_mustermann');
        const password = getRuntimeConfig('VITE_KEYCLOAK_USER_PASSWORD');

        if (!password) {
          throw new Error('VITE_KEYCLOAK_USER_PASSWORD is not set in environment.');
        }

        credentialsRef.current = { username, password };

        const token = await authService.loginAndGetToken(username, password);
        if (token) {
          console.log('[AuthProvider] Login successful');
          setIsAuthenticated(true);
          setAuthError(null);

          setUserProfile({
            username,
            id: 'demo-user-id',
          });

          scheduleTokenRefresh();
        } else {
          console.warn('[AuthProvider] Login returned no token, falling back to unauthenticated');
          setIsAuthenticated(false);
          setAuthError('Login returned no token. Please check credentials.');
        }
      } catch (error) {
        console.error('[AuthProvider] Programmatic login failed:', error);
        setIsAuthenticated(false);
        setAuthError(
          `Authentifizierung fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`
        );
        // Set a minimal profile so the UI has a name to display
        setUserProfile({
          username: getRuntimeConfig('VITE_KEYCLOAK_USERNAME', 'max_mustermann'),
          id: 'demo-user-id',
        });

        // Redirect to landing page to trigger login
        console.warn('[AuthProvider] Redirecting to landing page for login.');
        window.location.href = `${window.location.origin}${import.meta.env.BASE_URL}`;
      } finally {
        setIsLoading(false);
      }
    };

    performLogin();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [scheduleTokenRefresh]);

  const login = useCallback(() => {
    console.log('[AuthProvider] login() called - already authenticated via ROPC');
  }, []);

  const getToken = (): string | undefined => {
    return tokenStore.getToken() || undefined;
  };

  const hasRole = (/* role: string */): boolean => {
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userProfile,
        authError,
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
