"use client";

/**
 * RagKbHint — bandeau hint clavier dismissible. Phase 3.B.3.
 *
 * Animation fade 320ms sur dismiss. Auto-hide 12s géré par le parent
 * (page.tsx) — ce composant ne pilote pas le timer lui-même.
 */

import { Keyboard } from "lucide-react";
import type { ReactNode } from "react";
import { NAMI } from "./atoms/_tokens";

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      style={{
        background: "#fff",
        border: `0.5px solid ${NAMI.borderStrong}`,
        borderRadius: 5,
        padding: "1px 6px",
        fontFamily: "Inter, monospace",
        fontWeight: 500,
        fontSize: 11,
        color: NAMI.text,
        margin: "0 2px",
      }}
    >
      {children}
    </kbd>
  );
}

export default function RagKbHint({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  return (
    <div
      className="glass-strong rounded-xl"
      style={{
        position: "relative",
        margin: "16px 0 4px",
        padding: "10px 14px",
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 400,
        fontSize: 12,
        color: NAMI.textMuted,
        display: "flex",
        alignItems: "center",
        gap: 10,
        transform: visible ? "translateY(0)" : "translateY(-4px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: `opacity 320ms, transform 320ms ${NAMI.ease}`,
      }}
    >
      <Keyboard size={14} color={NAMI.violet} aria-hidden />
      <span>
        <Kbd>J</Kbd>
        <Kbd>K</Kbd> naviguer · <Kbd>↵</Kbd> ouvrir · <Kbd>Esc</Kbd> fermer
      </span>
      <button
        onClick={onDismiss}
        style={{
          marginLeft: "auto",
          background: "none",
          border: "none",
          color: NAMI.textFaint,
          cursor: "pointer",
          fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          transition: "color 150ms",
        }}
      >
        compris
      </button>
    </div>
  );
}
