import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import type { AuthState, DecodedToken } from '../models/auth.interface';

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
      checkTokenExpiry: () => {
        const { accessToken } = get();
        if (accessToken) {
          try {
            const decoded: DecodedToken = jwtDecode(accessToken);
            const now = Date.now() / 1000;
            if (decoded.exp && decoded.exp < now) {
              set({ accessToken: null, refreshToken: null });
            }
          } catch {
            set({ accessToken: null, refreshToken: null });
          }
        }
      },
    }),
    {
      name: 'authStorage'
    }
  )
);
