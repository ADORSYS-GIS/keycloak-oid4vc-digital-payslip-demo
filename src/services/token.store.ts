let accessToken: string | null = null;

export const tokenStore = {
  getToken(): string | null {
    return accessToken;
  },
  setToken(token: string | null) {
    accessToken = token;
  },
  clearToken() {
    accessToken = null;
  },
};
