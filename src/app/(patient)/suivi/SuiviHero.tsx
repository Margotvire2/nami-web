"use client";

import { PERIOD_OPTIONS, type PeriodKey } from "./mock-data";

interface SuiviHeroProps {
  indicatorsCount: number;
  latestMeasurementDate: string | null;
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
}

const REL_FORMATTER = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

function formatLastMeasurement(iso: string | null): string {
  if (!iso) return "Aucune mesure";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffDays = Math.floor((now - then) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return REL_FORMATTER.format(-diffDays, "day");
}

export function SuiviHero({ indicatorsCount, latestMeasurementDate, period, onPeriodChange }: SuiviHeroProps) {
  return (
    <header style={{ marginBottom: 24 }}>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#1A1A2E",
          letterSpacing: "-0.02em",
          marginBottom: 8,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Mon suivi
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "#6B7280",
          lineHeight: 1.5,
          marginBottom: 20,
        }}
      >
        {indicatorsCount} indicateur{indicatorsCount > 1 ? "s" : ""} suivi
        {indicatorsCount > 1 ? "s" : ""} ·{" "}
        {latestMeasurementDate
          ? `Dernière mesure ${formatLastMeasurement(latestMeasurementDate).toLowerCase()}`
          : "Aucune mesure"}
      </p>

      {/* Tabs filter période */}
      <nav
        role="tablist"
        aria-label="Filtrer les indicateurs par période"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(26,26,46,0.08)",
          paddingBottom: 12,
        }}
      >
        {PERIOD_OPTIONS.map((opt) => {
          const active = period === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onPeriodChange(opt.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: `1px solid ${active ? "#5B4EC4" : "rgba(26,26,46,0.1)"}`,
                background: active ? "rgba(91,78,196,0.08)" : "#FFFFFF",
                color: active ? "#5B4EC4" : "#374151",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40"
            >
              {opt.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
