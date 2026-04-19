"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
      setValue(Math.round((1 - Math.pow(1 - progress, 5)) * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return <>{value.toLocaleString("fr-FR")}</>;
}

// ─── Animated Bar ─────────────────────────────────────────────────────────────
function AnimatedBar({ pct, delay = 0 }: { pct: number; delay?: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(pct), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [pct, delay]);

  return (
    <div
      ref={ref}
      style={{ flex: 1, height: 8, borderRadius: 4, background: "#F5F3EF", overflow: "hidden" }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 4,
          background: "linear-gradient(90deg, #5B4EC4, #2BA89C)",
          width: `${width}%`,
          transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        }}
      />
    </div>
  );
}

interface AdminStats {
  knowledge: { entries: number; links: number; observations: number; notes: number; orgs: number };
}

const SOURCES = [
  { key: "HAS",         label: "HAS (référentiels)",       count: 20290 },
  { key: "DOCUMENT",    label: "Documents internes",        count: 16721 },
  { key: "INCA",        label: "INCa",                      count: 4000 },
  { key: "DU_NUTRITION",label: "DU Nutrition",              count: 3854 },
  { key: "DSM5",        label: "DSM-5",                     count: 3292 },
  { key: "ORPHANET",    label: "Orphanet",                  count: 2308 },
  { key: "DU",          label: "DU Autres",                 count: 2081 },
  { key: "ACR_EULAR",   label: "ACR / EULAR",               count: 1773 },
  { key: "FICHE",       label: "Fiches experts",            count: 576  },
  { key: "FFAB",        label: "FFAB",                      count: 125  },
];
const TOTAL_ENTRIES = SOURCES.reduce((s, x) => s + x.count, 0);

export default function AdminDonneesPage() {
  const { accessToken } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetch(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => (r.ok ? r.json() as Promise<AdminStats> : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, [accessToken]);

  const kpis = [
    { label: "Entrées knowledge", value: stats?.knowledge.entries ?? 55089 },
    { label: "Liens cliniques",   value: stats?.knowledge.links ?? 116201 },
    { label: "Chunks pgvector",   value: 32750 },
    { label: "Métriques catalogue", value: 1172 },
    { label: "Annuaire ANS",      value: 582101 },
  ];

  return (
    <div style={{ maxWidth: 1000, fontFamily: "var(--font-jakarta)" }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {kpis.map(({ label, value }, i) => (
          <div
            key={label}
            className="admin-card-static admin-stagger"
            style={{ padding: 16, animationDelay: `${i * 60}ms` }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em", lineHeight: 1 }}>
              <AnimatedCounter target={value} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: "#8A8A96", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 16 }}>
        {/* Coverage bars */}
        <div className="admin-card-static" style={{ padding: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 18 }}>
            Couverture par source
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SOURCES.map(({ key, label, count }, i) => {
              const pct = Math.round((count / TOTAL_ENTRIES) * 100);
              return (
                <div key={key} className="admin-stagger" style={{ animationDelay: `${200 + i * 60}ms` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#4A4A5A", width: 180, flexShrink: 0 }}>{label}</span>
                    <AnimatedBar pct={pct} delay={i * 80} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A2E", width: 36, textAlign: "right", flexShrink: 0 }}>
                      {pct}%
                    </span>
                    <span style={{ fontSize: 11, color: "#8A8A96", width: 52, textAlign: "right", flexShrink: 0 }}>
                      {count.toLocaleString("fr-FR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Pathways */}
          <div className="admin-card-static" style={{ padding: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 12 }}>
              Modèles de parcours
            </p>
            {[
              { label: "Parcours actifs", value: "131" },
              { label: "Pathologies indexées", value: "425" },
              { label: "Métriques catalogue", value: "1 172" },
              { label: "Questionnaires", value: "34" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#8A8A96" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Annuaire ANS */}
          <div className="admin-card-static" style={{ padding: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 12 }}>
              Annuaire ANS
            </p>
            {[
              { label: "Professionnels de santé", value: "582 101" },
              { label: "Correspondance RPPS", value: "Nom (insensible)" },
              { label: "Source", value: "AMELI 2024" },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#8A8A96" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1A1A2E" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
