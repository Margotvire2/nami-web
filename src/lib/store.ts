"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

// Sync cookie for Next.js middleware (middleware can't read localStorage)
function syncCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `nami-access-token=${token}; path=/; max-age=${15 * 60}; SameSite=Lax`;
  } else {
    document.cookie = "nami-access-token=; path=/; max-age=0";
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        syncCookie(accessToken);
        set({ user, accessToken, refreshToken });
      },
      setAccessToken: (accessToken) => {
        syncCookie(accessToken);
        set({ accessToken });
      },
      logout: () => {
        syncCookie(null);
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    { name: "nami-auth" }
  )
);
