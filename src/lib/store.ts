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
  setUser: (user: User) => void;
  logout: () => void;
}

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

function getSecureFlag(): string {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${getSecureFlag()}`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${getSecureFlag()}`;
}

function syncCookie(token: string | null) {
  if (token) setCookie("nami-access-token", token);
  else clearCookie("nami-access-token");
}

// Sync user role + provider profile presence en cookies pour que le middleware
// (server-side) puisse router post-login selon le rôle dominant.
function syncRoleCookies(user: User | null) {
  if (!user) {
    clearCookie("nami-user-role");
    clearCookie("nami-has-provider");
    return;
  }
  setCookie("nami-user-role", user.roleType);
  setCookie("nami-has-provider", user.providerProfile ? "1" : "0");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        syncCookie(accessToken);
        syncRoleCookies(user);
        set({ user, accessToken, refreshToken });
      },
      setAccessToken: (accessToken) => {
        syncCookie(accessToken);
        set({ accessToken });
      },
      setUser: (user) => {
        syncRoleCookies(user);
        set({ user });
      },
      logout: () => {
        syncCookie(null);
        syncRoleCookies(null);
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: "nami-auth",
      // Re-sync les cookies après réhydratation depuis localStorage
      // (les cookies ne sont posés qu'au login, pas au rechargement de page)
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) syncCookie(state.accessToken);
        if (state?.user) syncRoleCookies(state.user);
      },
    }
  )
);
