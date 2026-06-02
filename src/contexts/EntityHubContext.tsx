"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EntityHubDrawer } from "@/components/EntityHubDrawer";
import type { EntityHubTarget } from "@/hooks/useEntityHub";

interface EntityHubContextValue {
  current: EntityHubTarget | null;
  /** Empile une nouvelle entité au-dessus de la pile (back possible). */
  openEntityHub: (target: EntityHubTarget) => void;
  /** Ferme le drawer et vide la pile. */
  closeEntityHub: () => void;
  /** Dépile une entité (revient à la précédente, ou ferme si pile vide). */
  backEntityHub: () => void;
  /** True si plus d'une entité dans la pile — la flèche back doit s'afficher. */
  canGoBack: boolean;
}

const EntityHubContext = createContext<EntityHubContextValue | null>(null);

/**
 * Provider du drawer EntityHub (Provider/Consultation/Document). Gère une pile
 * d'entités pour permettre la navigation back (ex: Provider → click consultation
 * → Consultation hub stackée, back revient au Provider hub).
 *
 * À monter une seule fois, au plus haut niveau de l'espace patient (layout).
 */
export function EntityHubProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<EntityHubTarget[]>([]);

  const openEntityHub = useCallback((target: EntityHubTarget) => {
    setStack((prev) => [...prev, target]);
  }, []);

  const closeEntityHub = useCallback(() => {
    setStack([]);
  }, []);

  const backEntityHub = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const current = stack.length > 0 ? stack[stack.length - 1] : null;
  const canGoBack = stack.length > 1;

  const value = useMemo<EntityHubContextValue>(
    () => ({
      current,
      openEntityHub,
      closeEntityHub,
      backEntityHub,
      canGoBack,
    }),
    [current, openEntityHub, closeEntityHub, backEntityHub, canGoBack],
  );

  return (
    <EntityHubContext.Provider value={value}>
      {children}
      <EntityHubDrawer />
    </EntityHubContext.Provider>
  );
}

/**
 * Hook d'accès au drawer EntityHub. Doit être appelé dans un sous-arbre de
 * EntityHubProvider (sinon throw : symptôme d'un layout patient non mounté).
 */
export function useEntityHubControls(): EntityHubContextValue {
  const ctx = useContext(EntityHubContext);
  if (!ctx) {
    throw new Error(
      "useEntityHubControls must be used inside <EntityHubProvider> (patient layout).",
    );
  }
  return ctx;
}
