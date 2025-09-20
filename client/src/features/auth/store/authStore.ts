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
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  checkTokenExpiry: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null });
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
                // window.location.reload();
              }
            }
          } catch {
            clearTokens();
            // window.location.reload();
          }
        }
      },

      // Refresh access token using refreshToken
      refreshAccessToken: async () => {
        const { refreshToken, setTokens, clearTokens } = get();
        if (!refreshToken) {
          clearTokens();
          // window.location.reload();
          return null;
        }
        try {
          const response = await httpClient.post(`/auth${ROUTES.REFRESH_TOKEN}`, {
            refreshToken,
          });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          setTokens(newAccessToken, newRefreshToken);
          return newAccessToken;
        } catch (error) {
          console.error('Failed to refresh token:', error);
          clearTokens();
          // window.location.reload();
          return null;
        }
      },
    }),
    {
      name: 'authStorage'
    }
  )
);
