import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { useAuthStore } from "../features/auth/store/authStore";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_DATABASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Define proper TypeScript types ---
interface FailedRequest {
  resolve: (token?: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// --- Attach token to every request ---
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Handle 401 and refresh token flow ---
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const authStore = useAuthStore.getState();

    // Handle refresh token expired
    const errorMessage = error?.response?.data?.message;
    if (errorMessage === "REFRESH_TOKEN_EXPIRED") {
      authStore.clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle access token expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If another refresh is ongoing → queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newAccessToken = await authStore.refreshAccessToken();

        if (typeof newAccessToken === "string" && newAccessToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return httpClient(originalRequest);
        } else {
          authStore.clearTokens();
          window.location.href = "/login";
        }
      } catch (err) {
        processQueue(err, null);
        authStore.clearTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
