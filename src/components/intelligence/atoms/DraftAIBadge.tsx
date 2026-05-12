"use client";

/**
 * DraftAIBadge — badge "Brouillon IA — à vérifier".
 * Phase 3.B.3 — wording standard Nami (cf. ViewConsultation.tsx, AI Act Art. 50).
 */

import { Sparkles } from "lucide-react";
import { NAMI } from "./_tokens";

export default function DraftAIBadge() {
  return (
    <span
      title="AI Act Art. 50 — contenu généré par IA, à vérifier par un professionnel de santé"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
        fontWeight: 500,
        fontSize: 10,
        color: NAMI.violet,
        background: NAMI.violetSoft,
        padding: "3px 8px",
        borderRadius: 999,
        marginLeft: 8,
      }}
    >
      <Sparkles size={10} aria-hidden />
      Brouillon IA — à vérifier
    </span>
  );
}
