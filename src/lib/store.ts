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
  // Secure obligatoire en production (HTTPS only).
  // En dev local (HTTP), Secure empêcherait le cookie d'être setté.
  // Ne pas conditionner sur process.env.NODE_ENV : Next.js l'inline au build,
  // et "production" est aussi le mode d'un build local lancé en HTTP.
  const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
  if (token) {
    document.cookie = `nami-access-token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${secureFlag}`;
  } else {
    document.cookie = `nami-access-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
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
    {
      name: "nami-auth",
      // Re-sync le cookie après réhydratation depuis localStorage
      // (le cookie n'est posé qu'au login, pas au rechargement de page)
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) syncCookie(state.accessToken);
      },
    }
  )
);
