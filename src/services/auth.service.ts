import { getRuntimeConfig } from '../config/runtime-config';
import { tokenStore } from './token.store';

export class AuthService {
  async loginAndGetToken(username: string, password: string): Promise<string> {
    const keycloakUrl = getRuntimeConfig('VITE_KEYCLOAK_URL');
    const realm = getRuntimeConfig('VITE_KEYCLOAK_REALM');
    const clientId = getRuntimeConfig('VITE_KEYCLOAK_CLIENT_ID');
    const clientSecret = getRuntimeConfig('VITE_KEYCLOAK_CLIENT_SECRET');

    if (!keycloakUrl || !realm || !clientId) {
      throw new Error(
        'Keycloak env vars (VITE_KEYCLOAK_URL / VITE_KEYCLOAK_REALM / VITE_KEYCLOAK_CLIENT_ID) are not set.'
      );
    }

    const tokenEndpoint = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;

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
    tokenStore.setToken(data.access_token);
    console.log(
      '[AuthService] Access Token retrieved successfully (first 20 chars):',
      data.access_token?.substring(0, 20) + '...'
    );
    return data.access_token;
  }
}

export default new AuthService();
