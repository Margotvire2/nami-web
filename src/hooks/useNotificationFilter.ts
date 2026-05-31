/**
 * useNotificationFilter — persiste le tab actif de /centre-notifications dans localStorage.
 *
 * Pattern SSR-safe : init déterministe ("all") puis hydratation client via useEffect.
 * Évite tout hydration mismatch React 19 + Next.js App Router.
 */

import { useEffect, useState } from "react";
import type { FilterKey } from "@/app/(cockpit)/centre-notifications/FiltersBar";

const STORAGE_KEY = "cockpit-notif-filter";
const VALID_FILTERS: FilterKey[] = [
  "all",
  "unread",
  "rdv",
  "patients",
  "equipe",
  "rcp",
  "consentements",
];

function isValidFilter(value: string): value is FilterKey {
  return (VALID_FILTERS as string[]).includes(value);
}

export function useNotificationFilter(): [FilterKey, (next: FilterKey) => void] {
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && isValidFilter(saved)) {
        setFilter(saved);
      }
    } catch {
      // localStorage indisponible (mode privé Safari, quota dépassé) → fallback "all"
    }
  }, []);

  const updateFilter = (next: FilterKey) => {
    setFilter(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // idem — la valeur reste en state, juste non-persistée
    }
  };

  return [filter, updateFilter];
}
