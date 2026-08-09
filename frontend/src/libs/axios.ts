import axios from "axios";

/** Plain AxiosInstance factory — no auth awareness. Header injection and refresh/retry live in
 * the base `Service` class (see `services/service.ts`), which every concrete service extends. */
export function createHttpClient() {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
  });
}

export const httpClient = createHttpClient();

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === "string") {
    return error.response.data.message;
  }
  return fallback;
}
