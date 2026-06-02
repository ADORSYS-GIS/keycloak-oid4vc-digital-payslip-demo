import { useEffect, useState, type ReactNode, useCallback, useRef } from 'react';
import keycloak from '../config/keycloak.config';
import { AuthContext, type UserProfile } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const appBaseUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const isKeycloakInitialized = useRef(false);

  const logout = useCallback(() => {
    keycloak.logout({
      redirectUri: appBaseUrl,
    });
  }, [appBaseUrl]);

  const loadUserProfile = useCallback(async () => {
    try {
      console.log('Loading user profile...');
      const profile = await keycloak.loadUserProfile();
      console.log('User profile loaded:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, []);

  const initKeycloak = useCallback(async () => {
    const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
    const realm = import.meta.env.VITE_KEYCLOAK_REALM;
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

    if (!keycloakUrl || !realm || !clientId) {
      console.warn(
        'Keycloak env vars (VITE_KEYCLOAK_URL / VITE_KEYCLOAK_REALM / VITE_KEYCLOAK_CLIENT_ID) ' +
          'are not set. Skipping Keycloak initialisation.'
      );
      setIsLoading(false);
      return;
    }

    try {
      console.log('Initializing Keycloak...');
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        enableLogging: true,
        // Explicitly set redirect URI to app base URL
        redirectUri: appBaseUrl,
      });

      console.log('Authenticated via init:', authenticated);
      setIsAuthenticated(authenticated);

      if (authenticated) {
        await loadUserProfile();

        setInterval(() => {
          keycloak.updateToken(70).catch(() => {
            console.error('Failed to refresh token');
            logout();
          });
        }, 60000);
      }
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
    } finally {
      setIsLoading(false);
      console.log('Keycloak initialization finished.');
    }
  }, [loadUserProfile, logout, appBaseUrl]);

  useEffect(() => {
    if (isKeycloakInitialized.current) {
      return;
    }
    isKeycloakInitialized.current = true;
    initKeycloak();
  }, [initKeycloak]);

  const login = useCallback(() => {
    console.log('Login called, redirecting to Keycloak...');
    keycloak.login({
      redirectUri: appBaseUrl,
    });
  }, [appBaseUrl]);

  const getToken = (): string | undefined => {
    return keycloak.token;
  };

  const hasRole = (role: string): boolean => {
    return keycloak.realmAccess?.roles?.includes(role) || false;
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
