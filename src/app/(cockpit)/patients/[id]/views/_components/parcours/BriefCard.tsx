"use client";

import { useState } from "react";
import type { ProtocolContent } from "@/lib/api";
import { deriveCardType } from "@/lib/parcours";
import { EvaluationBrief } from "./EvaluationBrief";
import { SuiviBrief } from "./SuiviBrief";
import { RcpBrief } from "./RcpBrief";

const TYPE_LABEL: Record<string, string> = {
  EVALUATION: "Évaluation",
  SUIVI: "Suivi",
  RCP: "RCP",
};

interface BriefCardProps {
  actLabel: string;
  clinicalActType: string;
  protocol: ProtocolContent | null;
}

export function BriefCard({ actLabel, clinicalActType, protocol }: BriefCardProps) {
  const [open, setOpen] = useState(false);
  const cardType = deriveCardType({ clinicalActType, protocolContent: protocol });
  const typeLabel = TYPE_LABEL[cardType] ?? cardType;

  return (
    <div
      className="card"
      style={{
        marginTop: 8,
        marginLeft: 24,
        padding: "14px 18px",
        borderColor: open ? "rgba(91,78,196,0.30)" : undefined,
        transition: "border-color 260ms cubic-bezier(.16,1,.3,1)",
      }}
    >
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
        }}
        aria-expanded={open}
      >
        <span className="badge-ia">Brouillon IA — à vérifier</span>
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-sans)", color: "var(--ink-2)" }}>
          Comment faire · {typeLabel}
        </span>
        <ChevronIcon open={open} />
      </button>

      {/* Content */}
      {open && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          {protocol ? (
            <>
              {cardType === "EVALUATION" && <EvaluationBrief protocol={protocol} actLabel={actLabel} />}
              {cardType === "SUIVI" && <SuiviBrief protocol={protocol} />}
              {cardType === "RCP" && <RcpBrief protocol={protocol} />}
            </>
          ) : (
            <div className="empty" style={{ padding: "16px 0" }}>
              <h4 style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--ink-2)", margin: "0 0 6px" }}>
                Protocole en attente de validation
              </h4>
              <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
                Cette consultation sera enrichie après revue clinique.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="var(--ink-faint)"
      strokeWidth="2"
      strokeLinecap="round"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 260ms cubic-bezier(.16,1,.3,1)",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <polyline points="2 5 7 10 12 5" />
    </svg>
  );
}
