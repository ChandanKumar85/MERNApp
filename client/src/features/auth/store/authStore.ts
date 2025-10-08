import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { DecodedToken } from '../models/auth.interface';
import { httpClient } from '../../../api/http';
import { ROUTES } from '../../../routes/routePaths';

// Define the AuthState interface
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  id: string | null;
  setTokens: (accessToken: string, refreshToken: string, id: string) => void;
  clearTokens: () => void;
  checkTokenExpiry: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      id: null,

      setTokens: (accessToken, refreshToken, id) => {
        set({ accessToken, refreshToken, id });
      },

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null, id: null });
      },

      checkTokenExpiry: async () => {
        const { accessToken, refreshAccessToken, clearTokens } = get();
        if (accessToken) {
          try {
            const decoded: DecodedToken = jwtDecode(accessToken);
            const now = Date.now() / 1000;
            if (decoded.exp && decoded.exp < now) {
              const newToken = await refreshAccessToken();
              if (!newToken) {
                clearTokens();
              }
            }
          } catch {
            clearTokens();
          }
        }
      },

      // ✅ Refresh access token using refreshToken (updated for better error handling)
      refreshAccessToken: async () => {
        const { refreshToken, setTokens, clearTokens } = get();

        // 🚨 Early exit if refreshToken missing
        if (!refreshToken) {
          clearTokens();
          return null;
        }

        try {
          // ✅ API call to refresh token
          const response = await httpClient.post(`/auth${ROUTES.REFRESH_TOKEN}`, {
            refreshToken,
          });

         // ✅ Handle refresh token expired case explicitly
         if (response.data?.message === 'REFRESH_TOKEN_EXPIRED') {
           clearTokens();
           window.location.href = '/login';
           return null;
         }

         // ✅ Extract tokens safely
          const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            id: newId,
          } = response.data;

         // ✅ Guard against empty response or missing tokens
         if (!newAccessToken || !newRefreshToken) {
           clearTokens();
           return null;
         }

         // ✅ Persist new tokens
          setTokens(newAccessToken, newRefreshToken, newId);
          return newAccessToken;
        } catch (error: any) {
          console.error('Failed to refresh token:', error);

         // ✅ Handle backend "refresh token expired" response
         if (error?.response?.data?.message === 'REFRESH_TOKEN_EXPIRED') {
           clearTokens();
           window.location.href = '/login';
           return null;
         }

          clearTokens();
          return null;
        }
      },
    }),
    {
      name: 'authStorage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        id: state.id,
      }),
    }
  )
);
