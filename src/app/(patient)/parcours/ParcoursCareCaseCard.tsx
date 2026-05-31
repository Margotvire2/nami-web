"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import type { PatientPathwaySummary } from "@/lib/api";

interface ParcoursCareCaseCardProps {
  pathway: PatientPathwaySummary;
}

/**
 * Carte d'un CareCase patient — vue "Mes parcours" (mode N > 1).
 * Wording strictement organisationnel (concept multi-CareCase acté 30/05).
 * Le titre vient de pathway.careCaseTitle (déjà nettoyé backend via
 * computePatientFacingTitle, PR backend #93).
 */
export function ParcoursCareCaseCard({ pathway }: ParcoursCareCaseCardProps) {
  const { completed, total, percent } = useMemo(() => {
    let done = 0;
    let count = 0;
    for (const phase of pathway.phases) {
      for (const step of phase.steps) {
        count += 1;
        if (step.status === "completed") done += 1;
      }
    }
    return {
      completed: done,
      total: count,
      percent: count > 0 ? Math.round((done / count) * 100) : 0,
    };
  }, [pathway.phases]);

  const startedLabel = useMemo(() => {
    if (!pathway.pathwayStartedAt) return null;
    try {
      const d = new Date(pathway.pathwayStartedAt);
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  }, [pathway.pathwayStartedAt]);

  const statusColor = useMemo(() => {
    const s = (pathway.pathwayStatus ?? "").toLowerCase();
    if (s === "active" || s === "in_progress") return "#5B4EC4";
    if (s === "completed" || s === "done") return "#2BA89C";
    if (s === "paused" || s === "on_hold") return "#D97706";
    return "#9CA3AF";
  }, [pathway.pathwayStatus]);

  const statusLabel = useMemo(() => {
    const s = (pathway.pathwayStatus ?? "").toLowerCase();
    if (s === "active" || s === "in_progress") return "En cours";
    if (s === "completed" || s === "done") return "Terminé";
    if (s === "paused" || s === "on_hold") return "En pause";
    if (s === "not_started") return "À démarrer";
    return null;
  }, [pathway.pathwayStatus]);

  const href = `/parcours/${encodeURIComponent(pathway.careCaseId)}`;

  return (
    <Link
      href={href}
      role="article"
      aria-label={`Ouvrir le parcours : ${pathway.careCaseTitle}`}
      className="parcours-care-case-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
      style={{
        display: "block",
        textDecoration: "none",
        background: "#FFFFFF",
        border: "1px solid rgba(26,26,46,0.06)",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
        transition:
          "box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease",
        fontFamily: "var(--font-jakarta)",
        color: "#1A1A2E",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1A1A2E",
              lineHeight: 1.3,
              marginBottom: 4,
              fontFamily: "var(--font-jakarta)",
              wordBreak: "break-word",
            }}
          >
            {pathway.careCaseTitle}
          </h2>
          {statusLabel && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 500,
                color: statusColor,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: statusColor,
                }}
              />
              {statusLabel}
            </div>
          )}
        </div>
        <ArrowRight
          size={18}
          strokeWidth={2}
          color="#9CA3AF"
          aria-hidden="true"
          style={{ flexShrink: 0, marginTop: 2 }}
        />
      </div>

      {total > 0 && (
        <div style={{ marginTop: 8, marginBottom: startedLabel ? 12 : 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "#374151",
                fontWeight: 500,
              }}
            >
              {completed} étapes sur {total} terminées
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "#5B4EC4",
              }}
              aria-hidden="true"
            >
              {percent}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label={`Progression du parcours : ${completed} étapes sur ${total} terminées`}
            style={{
              position: "relative",
              height: 6,
              background: "#F5F3EF",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${percent}%`,
                background: "#5B4EC4",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}

      {startedLabel && (
        <p
          style={{
            fontSize: 13,
            color: "#6B7280",
            margin: 0,
            marginTop: total > 0 ? 0 : 8,
          }}
        >
          Démarré le {startedLabel}
        </p>
      )}

      <style jsx>{`
        .parcours-care-case-card:hover {
          box-shadow: 0 4px 12px rgba(91, 78, 196, 0.08);
          transform: translateY(-1px);
          border-color: rgba(91, 78, 196, 0.18);
        }
      `}</style>
    </Link>
  );
}
