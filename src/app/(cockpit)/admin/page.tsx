"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  Users, FolderOpen, Clock, Database, Activity,
  BookOpen, CheckCircle2, ExternalLink,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface AdminStats {
  providers: { total: number; thisWeek: number };
  patients:  { total: number; thisWeek: number };
  careCases: { total: number; thisWeek: number };
  pending: number;
  knowledge: { entries: number; links: number; observations: number; notes: number; orgs: number };
  recentActivity: { type: string; description: string; date: string }[];
}

// ─── AnimatedCounter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // ease-out-quint
      const eased = 1 - Math.pow(1 - progress, 5);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <>{value.toLocaleString("fr-FR")}</>;
}

// ─── Sparkline ───────────────────────────────────────────────────────────────
function Sparkline({ value, total }: { value: number; total: number }) {
  // Génère une courbe simple basée sur la valeur/total
  const pct = total > 0 ? value / total : 0;
  const pts = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    const y = 28 - Math.pow(t, 0.5) * pct * 22 + Math.sin(t * Math.PI * 2) * 2;
    return `${(t * 80).toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const length = 200; // approximation longueur stroke

  return (
    <svg width={80} height={28} viewBox="0 0 80 28" style={{ opacity: 0.6 }}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5B4EC4" />
          <stop offset="100%" stopColor="#2BA89C" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#spark-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
        strokeDasharray={length}
        strokeDashoffset={length}
        style={{
          animation: "spark-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards",
        }}
      />
      <style>{`@keyframes spark-draw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, delta, icon: Icon, color, delay = 0, warning,
}: {
  label: string;
  value: number;
  delta?: number;
  icon: React.ElementType;
  color: string;
  delay?: number;
  warning?: boolean;
}) {
  return (
    <div
      className="admin-card admin-stagger p-5 cursor-default"
      style={{
        animationDelay: `${delay}ms`,
        borderLeft: warning ? "3px solid #E6993E" : undefined,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${color}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} style={{ color }} strokeWidth={1.75} />
        </div>
        <Sparkline value={delta ?? 0} total={value} />
      </div>
      <div
        style={{ fontSize: 36, fontWeight: 800, color: "#1A1A2E", lineHeight: 1, letterSpacing: "-0.02em" }}
      >
        <AnimatedCounter target={value} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#8A8A96", marginTop: 4 }}>{label}</div>
      {delta !== undefined && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: delta > 0 ? "#2BA84A" : "#8A8A96",
            marginTop: 6,
          }}
        >
          {delta > 0 ? `+${delta}` : delta} cette semaine
        </div>
      )}
      {warning && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontWeight: 600,
            color: "#E6993E",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Clock size={11} />
          À valider →{" "}
          <a href="/admin/validations" style={{ color: "#E6993E", textDecoration: "underline" }}>
            Voir
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Activity icon ────────────────────────────────────────────────────────────
function ActivityDot({ type }: { type: string }) {
  const cfg: Record<string, { color: string; bg: string }> = {
    pending:   { color: "#E6993E", bg: "rgba(230,153,62,0.12)" },
    validated: { color: "#2BA84A", bg: "rgba(43,168,74,0.12)" },
    case:      { color: "#5B4EC4", bg: "rgba(91,78,196,0.12)" },
    default:   { color: "#8A8A96", bg: "rgba(138,138,150,0.12)" },
  };
  const { color, bg } = cfg[type] ?? cfg.default;
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {type === "validated" ? (
        <CheckCircle2 size={13} style={{ color }} />
      ) : type === "case" ? (
        <FolderOpen size={13} style={{ color }} />
      ) : (
        <Clock size={13} style={{ color }} />
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  if (d === 1) return "Hier";
  return `Il y a ${d}j`;
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { accessToken } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<{ status: string; db: string; redis: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${accessToken}` } }).then((r) =>
        r.ok ? (r.json() as Promise<AdminStats>) : null
      ),
      fetch(`${API_URL}/health`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([s, h]) => {
        setStats(s);
        setHealth(h);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <div
          style={{
            width: 28,
            height: 28,
            border: "2px solid #5B4EC4",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Date */}
      <p style={{ fontSize: 12, color: "#8A8A96", marginBottom: 20 }}>{today}</p>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <KpiCard
          label="Soignants actifs"
          value={stats?.providers.total ?? 0}
          delta={stats?.providers.thisWeek}
          icon={Users}
          color="#5B4EC4"
          delay={0}
        />
        <KpiCard
          label="Patients suivis"
          value={stats?.patients.total ?? 0}
          delta={stats?.patients.thisWeek}
          icon={Users}
          color="#2BA89C"
          delay={80}
        />
        <KpiCard
          label="Dossiers actifs"
          value={stats?.careCases.total ?? 0}
          delta={stats?.careCases.thisWeek}
          icon={FolderOpen}
          color="#5B4EC4"
          delay={160}
        />
        {(stats?.pending ?? 0) > 0 ? (
          <KpiCard
            label="En attente de validation"
            value={stats?.pending ?? 0}
            icon={Clock}
            color="#E6993E"
            delay={240}
            warning
          />
        ) : (
          <KpiCard
            label="Comptes validés"
            value={stats?.providers.total ?? 0}
            icon={CheckCircle2}
            color="#2BA84A"
            delay={240}
          />
        )}
      </div>

      {/* Activité + Santé système */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Activité récente */}
        <div className="admin-card-static p-5">
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 14 }}>
            Activité récente
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(stats?.recentActivity ?? []).map((act, i) => (
              <div
                key={i}
                className="admin-stagger"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  animationDelay: `${300 + i * 60}ms`,
                }}
              >
                <ActivityDot type={act.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "#4A4A5A", lineHeight: 1.4 }}>{act.description}</p>
                  <p style={{ fontSize: 11, color: "#8A8A96", marginTop: 2 }}>{timeAgo(act.date)}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentActivity?.length) && (
              <p style={{ fontSize: 13, color: "#8A8A96" }}>Aucune activité récente</p>
            )}
          </div>
        </div>

        {/* Santé système */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="admin-card-static p-5">
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 14 }}>
              Santé système
            </p>
            {[
              { label: "Backend", status: health?.status === "ok" },
              { label: "Base de données", status: health?.db === "connectee" },
              { label: "Redis", status: health?.redis === "connecte" },
            ].map(({ label, status }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13, color: "#4A4A5A" }}>{label}</span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: status ? "#2BA84A" : "#D94F4F",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: status ? "#2BA84A" : "#D94F4F",
                      display: "inline-block",
                      animation: status ? "pulse-dot 2s ease-in-out infinite" : undefined,
                    }}
                  />
                  {status ? "UP" : "DOWN"}
                </span>
              </div>
            ))}
            <a
              href={`${API_URL}/health`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#8A8A96",
                textDecoration: "none",
              }}
            >
              <ExternalLink size={11} /> Vérifier /health
            </a>
            <style>{`@keyframes pulse-dot { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>
          </div>

          {/* Base documentaire */}
          <div className="admin-card-static p-5">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Database size={15} style={{ color: "#5B4EC4" }} />
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>Base de connaissances</p>
            </div>
            {[
              { label: "Entrées knowledge", value: stats?.knowledge.entries ?? 0 },
              { label: "Liens cliniques", value: stats?.knowledge.links ?? 0 },
              { label: "Observations", value: stats?.knowledge.observations ?? 0 },
              { label: "Notes cliniques", value: stats?.knowledge.notes ?? 0 },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12, color: "#8A8A96" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A2E" }}>
                  {value.toLocaleString("fr-FR")}
                </span>
              </div>
            ))}
            <a
              href="/admin/donnees"
              style={{
                marginTop: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#5B4EC4",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              <BookOpen size={11} /> Voir les stats détaillées →
            </a>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div
        className="admin-card-static p-5"
        style={{ display: "flex", alignItems: "center", gap: 12 }}
      >
        <Activity size={16} style={{ color: "#5B4EC4", flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: "#4A4A5A", flex: 1 }}>
          {(stats?.pending ?? 0) > 0
            ? `${stats!.pending} compte${stats!.pending > 1 ? "s" : ""} en attente de validation professionnelle.`
            : "Tous les comptes soignants sont validés."}
        </p>
        {(stats?.pending ?? 0) > 0 && (
          <button
            onClick={() => router.push("/admin/validations")}
            className="admin-btn admin-btn-validate"
          >
            Valider maintenant →
          </button>
        )}
      </div>
    </div>
  );
}
