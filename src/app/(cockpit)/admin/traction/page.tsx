"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { TrendingUp, TrendingDown, Minus, Users, CalendarCheck, FileText, Sparkles, UserPlus } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface TractionData {
  activeUsers7d: number;
  consultationsThisWeek: number;
  consultationsLastWeek: number;
  consultationsDelta: number | null;
  notesCreatedThisWeek: number;
  patientsCreatedThisMonth: number;
  signupsThisMonth: number;
  aiSummariesThisWeek: number;
  topActiveProviders: { name: string; actions7d: number }[];
  dailyActiveUsers: { date: string; count: number }[];
  generatedAt: string;
}

// ─── Mini bar chart ──────────────────────────────────────────────────────────

function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const recent = data.slice(-30);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 64, width: "100%" }}>
      {recent.map((d, i) => {
        const pct = (d.count / max) * 100;
        const isToday = i === recent.length - 1;
        return (
          <div
            key={d.date}
            title={`${d.date} : ${d.count} utilisateur${d.count > 1 ? "s" : ""}`}
            style={{
              flex: 1,
              height: `${Math.max(pct, 4)}%`,
              background: isToday ? "#5B4EC4" : d.count > 0 ? "rgba(91,78,196,0.35)" : "rgba(26,26,46,0.06)",
              borderRadius: "3px 3px 0 0",
              transition: "height 0.4s cubic-bezier(0.16,1,0.3,1)",
              cursor: "default",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  delta,
  deltaLabel,
  icon: Icon,
  accent = "#5B4EC4",
  sub,
}: {
  label: string;
  value: number;
  delta?: number | null;
  deltaLabel?: string;
  icon: React.ElementType;
  accent?: string;
  sub?: string;
}) {
  const DeltaIcon = delta == null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const deltaColor = delta == null ? "#8A8A96" : delta > 0 ? "#2BA89C" : delta < 0 ? "#D94F4F" : "#8A8A96";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "24px 28px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(91,78,196,0.10), 0 2px 6px rgba(26,26,46,0.06)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(26,26,46,0.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#8A8A96" }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={accent} strokeWidth={1.75} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: 40, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.03em", lineHeight: 1 }}>
          {value}
        </span>
        {delta != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <DeltaIcon size={14} color={deltaColor} strokeWidth={2} />
            <span style={{ fontSize: 13, fontWeight: 600, color: deltaColor }}>
              {delta > 0 ? "+" : ""}{delta}%
            </span>
          </div>
        )}
      </div>

      {(deltaLabel || sub) && (
        <span style={{ fontSize: 12, color: "#8A8A96" }}>{deltaLabel ?? sub}</span>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function TractionPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<TractionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_URL}/admin/analytics/traction-dashboard`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then((d: TractionData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div style={{ padding: 40, display: "flex", alignItems: "center", gap: 10, color: "#8A8A96" }}>
        <div style={{ width: 18, height: 18, border: "2px solid #E8E6F5", borderTopColor: "#5B4EC4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Chargement des métriques…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return <div style={{ padding: 40, color: "#D94F4F", fontSize: 14 }}>Impossible de charger les métriques.</div>;
  }

  return (
    <div style={{ maxWidth: 1100, fontFamily: "var(--font-jakarta)" }}>

      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.02em", margin: 0 }}>
            Traction
          </h2>
          <p style={{ fontSize: 13, color: "#8A8A96", margin: "4px 0 0" }}>
            Mis à jour {new Date(data.generatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* 3 KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <KpiCard
          label="Soignants actifs / 7j"
          value={data.activeUsers7d}
          icon={Users}
          accent="#5B4EC4"
          sub="Providers avec ≥1 note créée"
        />
        <KpiCard
          label="Consultations cette semaine"
          value={data.consultationsThisWeek}
          delta={data.consultationsDelta}
          deltaLabel={`vs sem. précédente (${data.consultationsLastWeek})`}
          icon={CalendarCheck}
          accent="#2BA89C"
        />
        <KpiCard
          label="Notes créées / 7j"
          value={data.notesCreatedThisWeek}
          icon={FileText}
          accent="#7C6FCD"
          sub="Notes cliniques non supprimées"
        />
      </div>

      {/* 2e ligne : métriques secondaires */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <KpiCard
          label="Patients créés ce mois"
          value={data.patientsCreatedThisMonth}
          icon={UserPlus}
          accent="#2BA89C"
        />
        <KpiCard
          label="Inscriptions soignants ce mois"
          value={data.signupsThisMonth}
          icon={Users}
          accent="#5B4EC4"
        />
        <KpiCard
          label="Synthèses IA / 7j"
          value={data.aiSummariesThisWeek}
          icon={Sparkles}
          accent="#9B6FD4"
        />
      </div>

      {/* DAU chart + top providers */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

        {/* DAU 30j */}
        <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.06)", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>Utilisateurs actifs quotidiens</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: "#8A8A96" }}>30 derniers jours (logins)</span>
          </div>
          <BarChart data={data.dailyActiveUsers} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#8A8A96" }}>{data.dailyActiveUsers[0]?.date}</span>
            <span style={{ fontSize: 11, color: "#8A8A96" }}>Aujourd&apos;hui</span>
          </div>
        </div>

        {/* Top providers */}
        <div style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.06)", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>Top soignants actifs</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: "#8A8A96" }}>notes / 7j</span>
          </div>

          {data.topActiveProviders.length === 0 ? (
            <p style={{ fontSize: 13, color: "#8A8A96", margin: 0 }}>Aucune activité cette semaine.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.topActiveProviders.map((p, i) => {
                const max = data.topActiveProviders[0]?.actions7d ?? 1;
                const pct = Math.round((p.actions7d / max) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#2D2B3D" }}>{p.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#5B4EC4" }}>{p.actions7d}</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(26,26,46,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "#5B4EC4", borderRadius: 2, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
