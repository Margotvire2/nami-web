"use client";

import { MessageCircle, MessagesSquare } from "lucide-react";

interface EmptyStateProps {
  /** "no-selection" : threads existent mais aucun sélectionné. */
  /** "no-threads"   : le patient n'a aucun thread (pas encore de RDV). */
  variant: "no-selection" | "no-threads";
}

/**
 * État vide du panneau de conversation. Deux cas explicités :
 *   - no-selection : sidebar contient des threads → invite à en choisir un
 *   - no-threads   : aucune conversation possible (pas de soignant lié)
 *
 * Wording MDR-safe : "conversation" et non "dossier médical".
 */
export function EmptyState({ variant }: EmptyStateProps) {
  const Icon = variant === "no-threads" ? MessagesSquare : MessageCircle;
  const title =
    variant === "no-threads"
      ? "Aucune conversation pour le moment"
      : "Sélectionnez une conversation pour démarrer";
  const subtitle =
    variant === "no-threads"
      ? "Vos conversations apparaîtront ici après votre premier rendez-vous."
      : "Choisissez une équipe soignante ou un soignant dans la liste à gauche.";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        color: "var(--nami-text-muted)",
      }}
    >
      <Icon size={36} strokeWidth={1.5} style={{ opacity: 0.45, marginBottom: 14 }} aria-hidden="true" />
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--nami-dark)",
          letterSpacing: "-0.2px",
          marginBottom: 6,
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 13, color: "var(--nami-text-muted)", maxWidth: 360, lineHeight: 1.55 }}>
        {subtitle}
      </p>
    </div>
  );
}
