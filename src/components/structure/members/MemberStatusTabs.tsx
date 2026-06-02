"use client";

import { CheckCircle2, Moon, Ban, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MemberTab = "ACTIVE" | "DORMANT" | "SUSPENDED" | "EXITED";

interface TabConfig {
  key: MemberTab;
  label: string;
  icon: LucideIcon;
  count: number | null;
  comingSoon?: boolean;
  comingSoonHint?: string;
}

interface MemberStatusTabsProps {
  active: MemberTab;
  onChange: (next: MemberTab) => void;
  counts: {
    active: number | null;
    suspended: number | null;
    exited: number | null;
  };
}

// "En sommeil" = comingSoon V1 : nécessite l'extension du payload BE
// (lastActivityAt côté GET /organizations/:id/members) pour distinguer
// les membres ACTIVE inactifs des membres ACTIVE réellement actifs.
// Cf. ticket V3-B-1-EXTEND-MEMBERS-PAYLOAD.
export function MemberStatusTabs({
  active,
  onChange,
  counts,
}: MemberStatusTabsProps) {
  const tabs: TabConfig[] = [
    {
      key: "ACTIVE",
      label: "Actifs",
      icon: CheckCircle2,
      count: counts.active,
    },
    {
      key: "DORMANT",
      label: "En sommeil",
      icon: Moon,
      count: null,
      comingSoon: true,
      comingSoonHint:
        "Disponible après l'extension du payload backend (lastActivityAt).",
    },
    {
      key: "SUSPENDED",
      label: "Suspendus",
      icon: Ban,
      count: counts.suspended,
    },
    {
      key: "EXITED",
      label: "Sortis",
      icon: LogOut,
      count: counts.exited,
    },
  ];

  return (
    <nav
      role="tablist"
      aria-label="Statut des membres"
      className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E8ECF4] bg-white p-2"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        const base =
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors";

        if (tab.comingSoon) {
          return (
            <span
              key={tab.key}
              role="tab"
              aria-selected={false}
              aria-disabled
              title={tab.comingSoonHint}
              className={`${base} text-[#6B7280] opacity-50 cursor-not-allowed`}
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              <Icon size={13} />
              {tab.label}
              <span className="ml-1 text-[10px] uppercase tracking-wide bg-[#F0F2FA] px-1 py-0.5 rounded">
                Bientôt
              </span>
            </span>
          );
        }

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`${base} ${
              isActive
                ? "bg-[#5B4EC4] text-white"
                : "text-[#374151] hover:bg-[#F0F2FA] hover:text-[#5B4EC4]"
            }`}
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            <Icon size={13} />
            {tab.label}
            {tab.count !== null && (
              <span
                className={`ml-1 text-[10px] tabular-nums rounded px-1 py-0.5 ${
                  isActive ? "bg-white/20" : "bg-[#F0F2FA]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
