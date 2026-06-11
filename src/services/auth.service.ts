import { getRuntimeConfig } from '../config/runtime-config';
import { tokenStore } from './token.store';

export class AuthService {
  private tokenEndpoint: string | null = null;

  private getTokenEndpoint(): string {
    if (this.tokenEndpoint) return this.tokenEndpoint;

    const keycloakUrl = getRuntimeConfig('VITE_KEYCLOAK_URL');
    const realm = getRuntimeConfig('VITE_KEYCLOAK_REALM');

    if (!keycloakUrl || !realm) {
      throw new Error(
        'Keycloak env vars (VITE_KEYCLOAK_URL / VITE_KEYCLOAK_REALM) are not set.'
      );
    }

    this.tokenEndpoint = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
    return this.tokenEndpoint;
  }

  private getClientCredentials() {
    const clientId = getRuntimeConfig('VITE_KEYCLOAK_CLIENT_ID');
    const clientSecret = getRuntimeConfig('VITE_KEYCLOAK_CLIENT_SECRET');

    if (!clientId) {
      throw new Error(
        'Keycloak env vars (VITE_KEYCLOAK_CLIENT_ID) are not set.'
      );
    }

    return { clientId, clientSecret };
  }

  async loginAndGetToken(username: string, password: string): Promise<string> {
    const tokenEndpoint = this.getTokenEndpoint();
    const { clientId, clientSecret } = this.getClientCredentials();

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }
    params.append('username', username);
    params.append('password', password);
    params.append('grant_type', 'password');
    params.append('scope', 'openid');

    console.log('[AuthService] Attempting programmatic login to:', tokenEndpoint);

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        '[AuthService] Token retrieval failed:',
        response.status,
        response.statusText,
        errorData
      );
      throw new Error(
        `Failed to retrieve token: ${response.status} - ${errorData.error_description || response.statusText}`
      );
    }

    const data = await response.json();
    this.storeTokenData(data);

    console.log(
      '[AuthService] Access Token retrieved successfully (first 20 chars):',
      data.access_token?.substring(0, 20) + '...'
    );
    return data.access_token;
  }

  /**
   * Refresh the access token using the stored refresh_token.
   * Falls back to returning null if no refresh token is available or the refresh fails.
   */
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
      console.warn('[AuthService] No refresh token available, cannot refresh.');
      return null;
    }

    const tokenEndpoint = this.getTokenEndpoint();
    const { clientId, clientSecret } = this.getClientCredentials();

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    if (clientSecret) {
      params.append('client_secret', clientSecret);
    }
    params.append('refresh_token', refreshToken);
    params.append('grant_type', 'refresh_token');

    console.log('[AuthService] Attempting token refresh...');

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          '[AuthService] Token refresh failed:',
          response.status,
          response.statusText,
          errorData
        );
        // Clear tokens so consumers know they need to re-authenticate
        tokenStore.clearToken();
        return null;
      }

      const data = await response.json();
      this.storeTokenData(data);

      console.log(
        '[AuthService] Access Token refreshed successfully (first 20 chars):',
        data.access_token?.substring(0, 20) + '...'
      );
      return data.access_token;
    } catch (error) {
      console.error('[AuthService] Token refresh failed with network error:', error);
      tokenStore.clearToken();
      return null;
    }
  }

  /**
   * Store token data (access_token, refresh_token, expires_in) from a successful token response.
   */
  private storeTokenData(data: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  }) {
    if (data.access_token) {
      tokenStore.setToken(data.access_token);
    }
    if (data.refresh_token) {
      tokenStore.setRefreshToken(data.refresh_token);
    }
    if (data.expires_in) {
      tokenStore.setTokenExpiryFromExpiresIn(data.expires_in);
    }
  }
}

export default new AuthService();
