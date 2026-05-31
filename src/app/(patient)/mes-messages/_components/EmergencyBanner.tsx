"use client";

import { AlertTriangle } from "lucide-react";

/**
 * Bannière urgence permanente non-dismissible — exigence MDR/CLAUDE.md :
 * « Messagerie patient = bannière "En cas d'urgence vitale : 15 / 112"
 *   visible en permanence ».
 *
 * Placée en haut de /mes-messages, au-dessus du layout 2 colonnes. Rouge
 * léger pour signal visuel sans agresser ; texte WCAG AA. Pas de bouton
 * close — c'est le point : le patient ne doit jamais penser que cette
 * messagerie remplace l'urgence vitale.
 */
export function EmergencyBanner() {
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: "#FEF2F2",
        borderBottom: "1px solid #FECACA",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
      }}
    >
      <AlertTriangle
        size={16}
        strokeWidth={2}
        color="#B91C1C"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      />
      <p style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.5, margin: 0 }}>
        En cas d&apos;urgence médicale, appelez le <strong>15</strong> ou le{" "}
        <strong>112</strong>. Cette messagerie n&apos;est pas un canal d&apos;urgence.
      </p>
    </div>
  );
}
