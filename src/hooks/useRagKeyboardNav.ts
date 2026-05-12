"use client";

/**
 * useRagKeyboardNav — navigation clavier J/K + ↵ + Esc pour la liste RAG.
 * Phase 3.B.3.
 *
 * Préserve explicitement le focus quand l'utilisateur tape dans un INPUT
 * (search bar) → empêche que J/K interrompent la saisie.
 *
 *   J / ArrowDown → next item
 *   K / ArrowUp   → previous item
 *   ↵ Enter       → onActivate(focusedIdx)
 *   Esc           → onEscape() ou reset focus
 */

import { useCallback, useEffect, useState } from "react";

interface UseRagKeyboardNavOptions {
  itemCount: number;
  onActivate?: (index: number) => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useRagKeyboardNav({
  itemCount,
  onActivate,
  onEscape,
  enabled = true,
}: UseRagKeyboardNavOptions) {
  const [focusedIdx, setFocusedIdx] = useState<number>(-1);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Guard : ne JAMAIS intercepter quand un input/textarea/contentEditable est focus
      // (saisie search bar prioritaire — invariant verrouillé du brief F2).
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement as HTMLElement | null)?.isContentEditable
      ) {
        return;
      }

      if (e.key === "j" || e.key === "J" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((i) =>
          Math.min(i < 0 ? 0 : i + 1, Math.max(0, itemCount - 1)),
        );
      } else if (e.key === "k" || e.key === "K" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        if (focusedIdx >= 0 && focusedIdx < itemCount) {
          e.preventDefault();
          onActivate?.(focusedIdx);
        }
      } else if (e.key === "Escape") {
        if (onEscape) {
          onEscape();
        } else {
          setFocusedIdx(-1);
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [enabled, itemCount, focusedIdx, onActivate, onEscape]);

  const reset = useCallback(() => setFocusedIdx(-1), []);

  return { focusedIdx, setFocusedIdx, reset };
}
