import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { createHttpClient, httpClient } from "../libs/axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../libs/auth";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/** Dedicated client for the refresh call itself, with no interceptors attached — a failed
 * refresh must never recursively trigger another refresh attempt. */
const refreshClient = createHttpClient();

// Shared across every Service instance so concurrent 401s from different services trigger a
// single /auth/refresh call instead of one per failed request.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Nenhum refresh token disponível");
  }

  const { data } = await refreshClient.post<RefreshResponse>("/auth/refresh", { refreshToken });
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

/** Clears the stored session and hard-redirects to the logged-out landing page. This lives
 * outside React (see AppLayout's handleSignOut for the in-app equivalent), so a hard redirect —
 * rather than the router's `navigate` — is what's available here. */
function forceLogout(): void {
  clearTokens();
  window.location.href = "/";
}

const clientsWithAuthInterceptors = new WeakSet<AxiosInstance>();

/** Injects the Authorization header and, on a 401, refreshes the session and retries the
 * original request once. Idempotent per client instance, since every concrete Service shares the
 * same default `httpClient` and each would otherwise re-attach its own copy of these
 * interceptors. */
function attachAuthInterceptors(client: AxiosInstance): void {
  if (clientsWithAuthInterceptors.has(client)) return;
  clientsWithAuthInterceptors.add(client);

  client.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        throw error;
      }

      const originalRequest = error.config as RetryableRequestConfig | undefined;

      // A 401 on a request that never carried an access token (e.g. /auth/login,
      // /auth/signup) means the credentials were rejected, not that a session expired —
      // let it reject normally instead of trying to refresh or force-logging out.
      if (!originalRequest?.headers.Authorization) {
        throw error;
      }

      if (originalRequest._retry) {
        forceLogout();
        throw error;
      }
      originalRequest._retry = true;

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return client(originalRequest);
      } catch {
        forceLogout();
        throw error;
      }
    },
  );
}

export abstract class Service {
  protected readonly client: AxiosInstance;

  constructor(client: AxiosInstance = httpClient) {
    attachAuthInterceptors(client);
    this.client = client;
  }
}
