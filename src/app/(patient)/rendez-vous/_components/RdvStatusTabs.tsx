"use client";

import { useId } from "react";
import type { AppointmentTab } from "@/lib/appointment-status";

interface RdvStatusTabsProps {
  counts: Record<AppointmentTab, number>;
  active: AppointmentTab;
  onChange: (tab: AppointmentTab) => void;
}

const TABS: Array<{ key: AppointmentTab; label: string }> = [
  { key: "upcoming", label: "À venir" },
  { key: "pending", label: "En attente" },
  { key: "past", label: "Passés" },
  { key: "cancelled", label: "Annulés" },
];

/**
 * Onglets de filtrage des rendez-vous patient (V2).
 *
 * Pattern WAI-ARIA tablist : chaque bouton porte role="tab", aria-selected,
 * aria-controls vers le panneau qui sera rendu par la page parente. La page
 * doit utiliser `id={\`rdv-panel-${activeTab}\`}` sur son panel actif.
 *
 * Pas de Framer Motion : la transition d'underline est gérée par CSS.
 */
export function RdvStatusTabs({ counts, active, onChange }: RdvStatusTabsProps) {
  const baseId = useId();

  return (
    <div
      role="tablist"
      aria-label="Filtrer les rendez-vous par statut"
      className="
        flex items-center gap-1 overflow-x-auto
        border-b border-[var(--nami-border)]
      "
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const tabId = `${baseId}-tab-${tab.key}`;
        const panelId = `rdv-panel-${tab.key}`;
        return (
          <button
            key={tab.key}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={[
              "relative shrink-0 px-4 py-3 text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-[var(--nami-primary)]/40 focus-visible:rounded-md",
              isActive
                ? "text-[var(--nami-primary)] font-medium"
                : "text-[var(--nami-text-muted)] hover:text-[var(--nami-text-body)] font-normal",
            ].join(" ")}
          >
            <span className="flex items-center gap-1.5">
              <span>{tab.label}</span>
              <span
                className={[
                  "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5",
                  "rounded-full text-[11px] font-medium tabular-nums",
                  isActive
                    ? "bg-[var(--nami-primary)]/12 text-[var(--nami-primary)]"
                    : "bg-[var(--nami-bg-alt)] text-[var(--nami-text-muted)]",
                ].join(" ")}
                aria-label={`${counts[tab.key]} rendez-vous`}
              >
                {counts[tab.key]}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={[
                "absolute left-2 right-2 -bottom-px h-0.5 rounded-full transition-all duration-200",
                isActive ? "bg-[var(--nami-primary)] opacity-100" : "bg-transparent opacity-0",
              ].join(" ")}
            />
          </button>
        );
      })}
    </div>
  );
}
