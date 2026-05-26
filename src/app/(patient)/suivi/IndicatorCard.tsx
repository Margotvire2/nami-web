import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { IndicatorChart } from "./IndicatorChart";
import { filterMeasurementsByPeriod, type MockIndicator, type PeriodKey, type IndicatorTrend } from "./mock-data";

interface IndicatorCardProps {
  indicator: MockIndicator;
  period: PeriodKey;
}

const TREND_CONFIG: Record<
  IndicatorTrend,
  { ariaLabel: string; icon: typeof ArrowUpRight; color: string }
> = {
  up: { ariaLabel: "en augmentation", icon: ArrowUpRight, color: "#5B4EC4" },
  down: { ariaLabel: "en diminution", icon: ArrowDownRight, color: "#5B4EC4" },
  stable: { ariaLabel: "stable", icon: Minus, color: "#6B7280" },
};

const FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffDays = Math.floor((now - then) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 30) return `Il y a ${diffDays} jours`;
  return `Le ${FORMATTER.format(new Date(iso))}`;
}

export function IndicatorCard({ indicator, period }: IndicatorCardProps) {
  const filteredMeasurements = filterMeasurementsByPeriod(indicator.measurements, period);
  const trendCfg = TREND_CONFIG[indicator.trend];
  const TrendIcon = trendCfg.icon;
  const titleId = `indicator-title-${indicator.slug}`;

  return (
    <article
      role="region"
      aria-labelledby={titleId}
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Header — label + trend + last */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            id={titleId}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 6,
            }}
          >
            {indicator.label}
          </h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
                lineHeight: 1,
              }}
            >
              {indicator.latestValue}
            </span>
            <span style={{ fontSize: 14, color: "#6B7280" }}>{indicator.unit}</span>
          </div>
        </div>
        <span
          aria-label={`Tendance ${trendCfg.ariaLabel}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(91,78,196,0.08)",
            color: trendCfg.color,
            flexShrink: 0,
          }}
        >
          <TrendIcon size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>

      {/* Chart */}
      <IndicatorChart
        measurements={filteredMeasurements}
        unit={indicator.unit}
        labelForA11y={indicator.label}
      />

      {/* Footer — last update */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "#9CA3AF",
          borderTop: "1px solid rgba(26,26,46,0.06)",
          paddingTop: 10,
        }}
      >
        <span>Dernière mesure : {formatRelative(indicator.latestDate)}</span>
        {/* CTA "Voir détail" — V2 ticket dérivé F-PATIENT-SUIVI-INDICATOR-DETAIL-PAGE */}
        <span
          aria-label={`Le détail de ${indicator.label} sera disponible bientôt`}
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            fontStyle: "italic",
          }}
        >
          Détail bientôt
        </span>
      </div>
    </article>
  );
}
