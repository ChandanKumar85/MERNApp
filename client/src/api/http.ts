import axios from "axios";
import { useAuthStore } from "../features/auth/store/authStore";
import { ROUTES } from "../routes/routePaths";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_DATABASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 responses & refresh token
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await useAuthStore.getState().refreshAccessToken();

      if (typeof newAccessToken === "string" || newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest); // retry
      }

      // refresh failed → force logout
      useAuthStore.getState().clearTokens();
      window.location.href = ROUTES.LOGIN;
    }

    return Promise.reject(error);
  }
);