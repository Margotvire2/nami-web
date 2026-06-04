/**
 * /admin/dashboard — F-ADMIN-NAMI-DASHBOARD-KPIS
 *
 * Tableau de bord global Nami pour PLATFORM_ADMIN :
 *   - 6 KPI cards (Vue d'ensemble)
 *   - Courbe d'inscriptions 30 jours (LineChart Recharts)
 *   - Activité 24 h
 *   - Signaux opérationnels (≤ 10)
 *
 * Le layout admin parent gère déjà l'auth + nav. Ce composant se contente
 * de consommer le hook `useAdminKpis` (polling 60 s).
 */
"use client";

import {
  Building2,
  Users,
  Stethoscope,
  FolderOpen,
  CalendarCheck,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";
import { useAdminKpis } from "@/hooks/useAdminKpis";
import { KpiStatCard } from "@/components/admin/KpiStatCard";
import { KpiTrendChart } from "@/components/admin/KpiTrendChart";
import { Kpi24hActivity } from "@/components/admin/Kpi24hActivity";
import { KpiAlertsList } from "@/components/admin/KpiAlertsList";

function formatTime(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useAdminKpis();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header : titre + last refresh + bouton */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1A1A2E",
              letterSpacing: "-0.02em",
            }}
          >
            Tableau de bord
          </h2>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
            Vue exécutive en temps réel — actualisation automatique chaque minute.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 12, color: "#6B7280" }}>
            Dernière mise à jour :{" "}
            <strong style={{ color: "#1A1A2E", fontVariantNumeric: "tabular-nums" }}>
              {formatTime(
                dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : data?.generatedAt,
              )}
            </strong>
          </span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="admin-btn admin-btn-contact"
            data-testid="kpi-refresh"
            style={{ opacity: isFetching ? 0.6 : 1 }}
          >
            <RefreshCw size={13} strokeWidth={1.75} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Vue d'ensemble */}
      <section>
        <h3
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6B7280",
            marginBottom: 10,
          }}
        >
          Vue d&apos;ensemble
        </h3>
        {error ? (
          <div
            className="admin-card-static p-5"
            style={{ color: "#D94F4F", fontSize: 13 }}
            data-testid="kpi-error"
          >
            Impossible de charger les compteurs : {(error as Error).message}
          </div>
        ) : isLoading || !data ? (
          <div
            className="admin-card-static p-5"
            style={{ fontSize: 13, color: "#6B7280" }}
            data-testid="kpi-loading"
          >
            Chargement…
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <KpiStatCard
              label="Organisations"
              value={data.totals.organizations}
              icon={<Building2 size={16} />}
              delay={0}
            />
            <KpiStatCard
              label="Soignants"
              value={data.totals.providers}
              icon={<Stethoscope size={16} />}
              delay={40}
            />
            <KpiStatCard
              label="Patients"
              value={data.totals.patients}
              icon={<Users size={16} />}
              delay={80}
            />
            <KpiStatCard
              label="Dossiers actifs"
              value={data.totals.careCasesActive}
              icon={<FolderOpen size={16} />}
              delay={120}
            />
            <KpiStatCard
              label="RDV à venir (30j)"
              value={data.totals.eventsUpcoming}
              icon={<CalendarCheck size={16} />}
              delay={160}
            />
            <KpiStatCard
              label="RCPs planifiées"
              value={data.totals.rcpsScheduled}
              icon={<ClipboardCheck size={16} />}
              delay={200}
            />
          </div>
        )}
      </section>

      {/* Croissance + Activité 24h */}
      {data ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: 12,
          }}
        >
          <KpiTrendChart data={data.growth30d} />
          <Kpi24hActivity data={data.activity24h} />
        </section>
      ) : null}

      {/* Signaux */}
      {data ? <KpiAlertsList alerts={data.alerts} /> : null}
    </div>
  );
}
