let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: number | null = null; // Unix timestamp (ms) when the token expires

export const tokenStore = {
  getToken(): string | null {
    return accessToken;
  },
  setToken(token: string | null) {
    accessToken = token;
  },
  getRefreshToken(): string | null {
    return refreshToken;
  },
  setRefreshToken(token: string | null) {
    refreshToken = token;
  },
  getTokenExpiry(): number | null {
    return tokenExpiry;
  },
  /**
   * Set token expiry from the expires_in value returned by the token endpoint.
   * @param expiresInSeconds - The number of seconds until the token expires (e.g. 300 for 5 min).
   */
  setTokenExpiryFromExpiresIn(expiresInSeconds: number) {
    tokenExpiry = Date.now() + expiresInSeconds * 1000;
  },
  clearTokenExpiry() {
    tokenExpiry = null;
  },
  isTokenExpired(): boolean {
    if (!accessToken || !tokenExpiry) return true;
    // Consider expired 30 seconds early to be safe
    return Date.now() >= tokenExpiry - 30000;
  },
  clearToken() {
    accessToken = null;
    refreshToken = null;
    tokenExpiry = null;
  },
};
