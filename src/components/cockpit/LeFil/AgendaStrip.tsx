"use client";
import Link from "next/link";
import type { DashboardConsultation } from "@/hooks/useDashboard";

const START_H = 8;
const END_H = 18;
const TOTAL_MIN = (END_H - START_H) * 60;
const TICKS = [10, 12, 14, 16, 18];

function pct(h: number, m: number) {
  return (((h - START_H) * 60 + m) / TOTAL_MIN) * 100;
}

const ACCENT_FOR = {
  premiere: "var(--warning)",
  teleconsult: "var(--teal-deep)",
  suivi: "var(--violet)",
} as const;

export function AgendaStrip({ consultations }: { consultations: DashboardConsultation[] }) {
  const now = new Date();
  const nowPct = pct(now.getHours(), now.getMinutes());
  const inRange = nowPct >= 0 && nowPct <= 100;

  return (
    <div
      className="card card-raised"
      style={{ marginBottom: 28, padding: "16px 18px 18px" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 15 }}>
        <svg
          viewBox="0 0 24 24"
          style={{ width: 22, height: 22, color: "var(--violet)", flexShrink: 0 }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
          <path d="M3.5 9h17M8 3v3M16 3v3" />
        </svg>
        <b style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 800, letterSpacing: "-.015em" }}>
          Agenda du jour
        </b>
        <span
          style={{
            fontSize: 12,
            color: "var(--ink-2)",
            fontWeight: 600,
            background: "var(--paper-2)",
            borderRadius: 100,
            padding: "3px 11px",
          }}
        >
          {consultations.length} consultation{consultations.length !== 1 ? "s" : ""}
        </span>
        <Link
          href="/agenda"
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-sans)",
            fontSize: "12.5px",
            fontWeight: 700,
            color: "var(--violet)",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            whiteSpace: "nowrap",
            textDecoration: "none",
          }}
        >
          Ouvrir l&apos;agenda
          <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* Timeline track */}
      <div
        style={{
          position: "relative",
          height: 66,
          borderRadius: 12,
          background: "var(--paper)",
          border: "1px solid var(--hair)",
          overflow: "hidden",
        }}
      >
        {TICKS.map((h) => (
          <div
            key={h}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${pct(h, 0)}%`,
              width: 1,
              background: "var(--hair)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 5,
                left: 6,
                fontFamily: "var(--font-mono)",
                fontSize: "9.5px",
                color: "var(--ink-faint)",
              }}
            >
              {h}h
            </span>
          </div>
        ))}

        {/* Now indicator */}
        {inRange && (
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${nowPct}%`,
              width: 2,
              background: "linear-gradient(180deg, var(--violet), var(--teal))",
              zIndex: 3,
            }}
          >
            <b
              style={{
                position: "absolute",
                bottom: 4,
                left: 5,
                fontSize: 9,
                fontWeight: 700,
                color: "var(--violet)",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-sans)",
                background: "var(--surface)",
                borderRadius: 4,
                padding: "1px 4px",
                boxShadow: "var(--sh-1)",
              }}
            >
              maintenant
            </b>
          </div>
        )}

        {/* Consultation blocks */}
        {consultations.map((c) => {
          const [hh, mm] = c.time.split(":").map(Number);
          const durMin = parseInt(c.duration) || 30;
          const leftPct = pct(hh, mm);
          const widthPct = (durMin / TOTAL_MIN) * 100;
          const accent = ACCENT_FOR[c.type] ?? "var(--violet)";
          return (
            <div
              key={c.id}
              style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                height: 44,
                left: `${leftPct}%`,
                width: `${Math.max(widthPct, 7)}%`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
                padding: "0 10px",
                borderRadius: 10,
                background: "var(--surface)",
                border: "1px solid var(--line-2)",
                boxShadow: "var(--sh-1)",
                cursor: "pointer",
                zIndex: 2,
                borderLeft: `3px solid ${accent}`,
                transition: ".16s var(--ease)",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10.5px",
                  color: "var(--ink-3)",
                  fontWeight: 500,
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {c.time} · {c.duration}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  lineHeight: 1.1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {c.type === "premiere" ? "1ère consultation" : c.patient.split(" ")[0] + " " + (c.patient.split(" ")[1]?.[0] ?? "") + "."}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
