/**
 * KpiAlertsList — liste des signaux opérationnels récents (limit 10).
 * Wording MDR-safe : on parle de "signaux", pas d'"alertes cliniques".
 */
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { AdminKpiAlert } from "@/hooks/useAdminKpis";

interface KpiAlertsListProps {
  alerts: AdminKpiAlert[];
  limit?: number;
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function KpiAlertsList({ alerts, limit = 10 }: KpiAlertsListProps) {
  const shown = alerts.slice(0, limit);

  return (
    <div className="admin-card-static p-5" data-testid="kpi-alerts-list">
      <div className="flex items-center justify-between mb-4">
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1A1A2E",
            letterSpacing: "-0.01em",
          }}
        >
          Signaux opérationnels
        </h3>
        <span style={{ fontSize: 12, color: "#6B7280" }}>
          {alerts.length} {alerts.length > 1 ? "signaux" : "signal"}
        </span>
      </div>

      {shown.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 12px",
            fontSize: 13,
            color: "#6B7280",
          }}
          data-testid="kpi-alerts-empty"
        >
          <CheckCircle2 size={14} color="#2BA84A" />
          Aucun signal récent à examiner.
        </div>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {shown.map((a, i) => (
            <li
              key={`${a.type}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(217,79,79,0.03)",
                border: "1px solid rgba(217,79,79,0.08)",
              }}
              data-testid="kpi-alerts-item"
            >
              <AlertCircle size={14} color="#D97706" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "#1A1A2E", fontWeight: 500 }}>
                  {a.type}
                </div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>
                  {a.count} {a.count > 1 ? "occurrences" : "occurrence"} ·{" "}
                  {formatDateTime(a.lastAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
