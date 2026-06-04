/**
 * KpiStatCard — carte chiffre clé du tableau de bord PLATFORM_ADMIN.
 * Réutilise les classes globales `.admin-card` / `.admin-stagger` exposées
 * par le layout admin.
 */
import type { ReactNode } from "react";

interface KpiStatCardProps {
  label: string;
  value: number;
  hint?: string;
  icon?: ReactNode;
  delay?: number;
}

export function KpiStatCard({ label, value, hint, icon, delay = 0 }: KpiStatCardProps) {
  return (
    <div
      className="admin-card admin-stagger p-5"
      style={{ animationDelay: `${delay}ms` }}
      data-testid="kpi-stat-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#6B7280",
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1A1A2E",
              marginTop: 6,
              fontVariantNumeric: "tabular-nums",
            }}
            data-testid="kpi-stat-value"
          >
            {value.toLocaleString("fr-FR")}
          </div>
          {hint ? (
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{hint}</div>
          ) : null}
        </div>
        {icon ? (
          <div
            style={{
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(91,78,196,0.08)",
              color: "#5B4EC4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
