"use client";

import { Loader2 } from "lucide-react";
import { NOTIFICATION_PREFERENCE_CATEGORIES, type NotificationPreferenceCategory } from "@/lib/api";
import { usePatientNotificationPreferences } from "@/hooks/usePatientNotificationPreferences";
import NotificationPreferencesCategoryRow from "./NotificationPreferencesCategoryRow";

// Labels FR — vocabulaire MDR-safe (cf. CLAUDE.md). On parle d'information
// et de coordination, pas de notification clinique.
const CATEGORY_LABELS_FR: Record<NotificationPreferenceCategory, string> = {
  APPOINTMENTS: "Rendez-vous",
  DOCUMENTS_SHARED: "Documents partagés",
  MESSAGES: "Messages",
  PATHWAY: "Parcours",
  COORDINATION: "Coordination soignants",
};

const CATEGORY_DESCRIPTIONS_FR: Record<NotificationPreferenceCategory, string> = {
  APPOINTMENTS:
    "Rappels et confirmations de vos rendez-vous.",
  DOCUMENTS_SHARED:
    "Quand un soignant ajoute un document à votre dossier de coordination.",
  MESSAGES:
    "Nouveaux messages reçus de votre équipe soignante.",
  PATHWAY:
    "Étapes et questionnaires de votre parcours de coordination.",
  COORDINATION:
    "Mises à jour organisationnelles entre soignants concernant votre dossier.",
};

export default function NotificationPreferencesMatrix() {
  const { matrix, isLoading, isError, toggle } =
    usePatientNotificationPreferences();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
        <Loader2
          size={18}
          className="animate-spin"
          style={{ color: "var(--nami-primary)" }}
        />
      </div>
    );
  }

  if (isError || !matrix) {
    return (
      <div
        style={{
          padding: 16,
          background: "rgba(220,38,38,0.06)",
          borderRadius: 10,
          fontSize: 13,
          color: "#DC2626",
        }}
      >
        Impossible de charger vos préférences. Réessayez plus tard.
      </div>
    );
  }

  return (
    <div>
      <p
        style={{
          fontSize: 13,
          color: "var(--nami-text-muted)",
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        Choisissez par quels canaux vous souhaitez recevoir chaque type
        d&apos;information.
      </p>

      <div>
        {NOTIFICATION_PREFERENCE_CATEGORIES.map((category) => (
          <NotificationPreferencesCategoryRow
            key={category}
            category={category}
            categoryLabel={CATEGORY_LABELS_FR[category]}
            categoryDescription={CATEGORY_DESCRIPTIONS_FR[category]}
            channels={matrix[category]}
            onToggle={(cat, channel, enabled) =>
              toggle({ category: cat, channel, enabled })
            }
          />
        ))}
      </div>

      <p
        style={{
          fontSize: 12,
          color: "var(--nami-text-muted)",
          marginTop: 14,
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        Les notifications obligatoires liées à la sécurité de votre compte
        (changement de mot de passe, connexion suspecte) ne peuvent pas être
        désactivées.
      </p>
    </div>
  );
}
