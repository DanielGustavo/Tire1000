const ACCESS_TOKEN_STORAGE_KEY = "tire1000.accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "tire1000.refreshToken";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

/** Persists both tokens returned by /auth/login, /auth/signup and /auth/refresh. */
export function setTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}
