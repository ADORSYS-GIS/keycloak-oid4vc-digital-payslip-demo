import { getRuntimeConfig } from '../config/runtime-config';
import { tokenStore } from './token.store';
import authService from './auth.service';

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  /**
   * Internal flag to prevent infinite retry loops on 401.
   */
  _isRetry?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = getRuntimeConfig('VITE_API_BASE_URL')) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(requireAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requireAuth) {
      const token = tokenStore.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    const headers = await this.getHeaders(requireAuth);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });

    // Handle 401 Unauthorized — attempt to refresh the token and retry once
    if (response.status === 401 && requireAuth && !options._isRetry) {
      console.warn('[ApiClient] Received 401, attempting token refresh...');

      const newToken = await authService.refreshAccessToken();

      if (newToken) {
        console.log('[ApiClient] Token refreshed, retrying request...');
        // Retry the request with the new token
        return this.request<T>(endpoint, {
          ...options,
          _isRetry: true,
        });
      }

      console.error('[ApiClient] Token refresh failed, cannot retry request.');
      throw new Error('API Error: Unauthorized - Token refresh failed');
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requireAuth });
  }

  async post<T>(endpoint: string, data: unknown, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth,
    });
  }

  async put<T>(endpoint: string, data: unknown, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      requireAuth,
    });
  }

  async delete<T>(endpoint: string, requireAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requireAuth });
  }
}

export default new ApiClient();
