import {
  S_ACCESS_TOKEN,
  S_TOKEN_EXPIRY,
  S_REFRESH_TOKEN,
  S_ID_TOKEN,
} from '../components/LandingPageGuard';

export const tokenStore = {
  getToken(): string | null {
    return sessionStorage.getItem(S_ACCESS_TOKEN);
  },
  setToken(token: string | null) {
    if (token) {
      sessionStorage.setItem(S_ACCESS_TOKEN, token);
    } else {
      sessionStorage.removeItem(S_ACCESS_TOKEN);
    }
  },
  getRefreshToken(): string | null {
    return sessionStorage.getItem(S_REFRESH_TOKEN);
  },
  setRefreshToken(token: string | null) {
    if (token) {
      sessionStorage.setItem(S_REFRESH_TOKEN, token);
    } else {
      sessionStorage.removeItem(S_REFRESH_TOKEN);
    }
  },
  getTokenExpiry(): number | null {
    const expiry = sessionStorage.getItem(S_TOKEN_EXPIRY);
    return expiry ? parseInt(expiry, 10) : null;
  },
  setTokenExpiryFromExpiresIn(expiresInSeconds: number) {
    const expiry = Date.now() + expiresInSeconds * 1000;
    sessionStorage.setItem(S_TOKEN_EXPIRY, String(expiry));
  },
  clearTokenExpiry() {
    sessionStorage.removeItem(S_TOKEN_EXPIRY);
  },
  isTokenExpired(): boolean {
    const token = this.getToken();
    const expiry = this.getTokenExpiry();
    if (!token || !expiry) return true;
    return Date.now() >= expiry - 30000;
  },
  clearToken() {
    sessionStorage.removeItem(S_ACCESS_TOKEN);
    sessionStorage.removeItem(S_REFRESH_TOKEN);
    sessionStorage.removeItem(S_TOKEN_EXPIRY);
    sessionStorage.removeItem(S_ID_TOKEN);
  },
};
