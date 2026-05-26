"use client";

/**
 * QuickActionsCard — section /accueil patient (F-PATIENT-ACCUEIL-DASHBOARD-V2-LIVE-DATA).
 *
 * 4 raccourcis vers les surfaces patient les plus consultées. Toutes les
 * routes ciblées EXISTENT dans nami-web (vérifié Phase 0). Les actions
 * "/parcours" et "/suivi" mentionnées dans la spec V2 sont volontairement
 * remplacées par "/mes-soignants" et "/rendez-vous" pour ne pas exposer
 * de liens cassés (la sidebar marque les premières comme "Bientôt disponible").
 *
 * Wording MDR-safe : vocabulaire organisationnel uniquement.
 * Vocabulaire warm patient : "Mon équipe", "Mes rendez-vous", "Mes documents",
 * "Trouver un soignant" (route publique existante).
 *
 * A11y : section aria-labelledby + chaque action accessible via Link/Tab.
 */

import Link from "next/link";
import { Calendar, Users, FileText, Search } from "lucide-react";

interface QuickAction {
  href: string;
  icon: React.ElementType;
  label: string;
  helper: string;
}

const ACTIONS: QuickAction[] = [
  {
    href: "/rendez-vous",
    icon: Calendar,
    label: "Mes rendez-vous",
    helper: "Voir mon agenda",
  },
  {
    href: "/mes-soignants",
    icon: Users,
    label: "Mon équipe",
    helper: "Voir mes soignants",
  },
  {
    href: "/mes-documents",
    icon: FileText,
    label: "Mes documents",
    helper: "Documents partagés",
  },
  {
    href: "/trouver-un-soignant",
    icon: Search,
    label: "Trouver un soignant",
    helper: "Annuaire pluridisciplinaire",
  },
];

export function QuickActionsCard() {
  const headingId = "accueil-quickactions-heading";

  return (
    <section aria-labelledby={headingId} style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <h2
          id={headingId}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--nami-dark)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            margin: 0,
          }}
        >
          Accès rapide
        </h2>
      </div>

      <div
        role="list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              role="listitem"
              aria-label={`${action.label} — ${action.helper}`}
              style={{
                background: "var(--nami-card)",
                borderRadius: 16,
                border: "1px solid var(--nami-border)",
                padding: "16px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition:
                  "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                boxShadow: "0 1px 3px rgba(26,26,46,0.05)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: "var(--nami-primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={18} color="var(--nami-primary)" strokeWidth={2} />
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--nami-dark)",
                }}
              >
                {action.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--nami-text-muted)",
                }}
              >
                {action.helper}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
