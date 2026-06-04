/**
 * Kpi24hActivity — 4 mini cartes d'activité sur les dernières 24 h.
 * Volontairement compact (1 colonne large mobile, 4 colonnes desktop).
 */
import { UserPlus, FolderOpen, Stethoscope, CalendarCheck } from "lucide-react";
import type { AdminKpiActivity24h } from "@/hooks/useAdminKpis";

interface Kpi24hActivityProps {
  data: AdminKpiActivity24h;
}

interface Item {
  label: string;
  value: number;
  icon: React.ElementType;
}

export function Kpi24hActivity({ data }: Kpi24hActivityProps) {
  const items: Item[] = [
    { label: "Nouveaux comptes", value: data.newSignups, icon: UserPlus },
    { label: "Nouveaux dossiers", value: data.newCareCases, icon: FolderOpen },
    { label: "Nouvelles RCPs", value: data.newRCPs, icon: Stethoscope },
    { label: "Nouveaux RDVs", value: data.newAppointments, icon: CalendarCheck },
  ];

  return (
    <div className="admin-card-static p-5" data-testid="kpi-24h-activity">
      <div className="flex items-center justify-between mb-4">
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1A1A2E",
            letterSpacing: "-0.01em",
          }}
        >
          Activité 24 h
        </h3>
        <span style={{ fontSize: 12, color: "#6B7280" }}>Glissant</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              style={{
                padding: 12,
                borderRadius: 12,
                background: "rgba(91,78,196,0.03)",
                border: "1px solid rgba(91,78,196,0.06)",
              }}
              data-testid="kpi-24h-item"
            >
              <Icon size={14} strokeWidth={1.75} color="#5B4EC4" />
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  marginTop: 6,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {it.value.toLocaleString("fr-FR")}
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                {it.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
