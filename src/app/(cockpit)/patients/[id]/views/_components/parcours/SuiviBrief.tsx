import type { ProtocolContent } from "@/lib/api";
import { Clock, Target, ListChecks, RefreshCw, ShieldAlert } from "lucide-react";

interface SuiviBriefProps {
  protocol: ProtocolContent;
}

export function SuiviBrief({ protocol }: SuiviBriefProps) {
  const hasContent =
    protocol.duration ||
    protocol.objectif ||
    (protocol.protocol?.length ?? 0) > 0 ||
    protocol.reevaluation ||
    (protocol.redFlags?.length ?? 0) > 0;

  if (!hasContent) {
    return (
      <div className="empty" style={{ padding: "20px 0" }}>
        <h4 style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--ink-2)", margin: "0 0 6px" }}>
          Protocole en attente de validation
        </h4>
        <p style={{ fontSize: 13, color: "var(--ink-faint)", margin: 0 }}>
          Cette consultation sera enrichie après revue clinique.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {protocol.duration && (
        <SlotBlock label="Durée / Fréquence" icon={<Clock size={14} strokeWidth={1.7} />} col={1}>
          <p style={bodyStyle}>{protocol.duration}</p>
        </SlotBlock>
      )}

      {protocol.objectif && (
        <SlotBlock label="Objectif" icon={<Target size={14} strokeWidth={1.7} />} col={2}>
          <p style={bodyStyle}>{protocol.objectif}</p>
        </SlotBlock>
      )}

      {(protocol.protocol?.length ?? 0) > 0 && (
        <SlotBlock label="Protocole de suivi" icon={<ListChecks size={14} strokeWidth={1.7} />} col="full">
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {protocol.protocol!.map((p, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  minWidth: 20, height: 20, borderRadius: "50%",
                  background: "var(--violet-tint)", color: "var(--violet)",
                  fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                  fontFamily: "var(--font-mono)",
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55 }}>{p}</span>
              </li>
            ))}
          </ol>
        </SlotBlock>
      )}

      {protocol.reevaluation && (
        <SlotBlock label="Critères de réévaluation" icon={<RefreshCw size={14} strokeWidth={1.7} />} col={1}>
          <p style={bodyStyle}>{protocol.reevaluation}</p>
        </SlotBlock>
      )}

      {(protocol.redFlags?.length ?? 0) > 0 && (
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{
            background: "var(--warning-tint)",
            border: "1px solid #EBD9B5",
            borderLeft: "3px solid var(--warning)",
            borderRadius: "var(--r-sm)",
            padding: "12px 14px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <ShieldAlert size={14} strokeWidth={1.7} style={{ color: "var(--warning)", flexShrink: 0 }} />
              <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, fontFamily: "var(--font-ui)" }}>
                Points de vigilance
              </p>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {protocol.redFlags!.map((r, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, color: "var(--warning)", fontSize: 14, lineHeight: "20px" }}>·</span>
                  <span style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.55 }}>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(protocol.sources?.length ?? 0) > 0 && (
        <div style={{ gridColumn: "1 / -1", marginTop: 4, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {protocol.sources.map((s, i) => (
            <span key={i} style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--ink-faint)",
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-xs)",
              padding: "2px 8px",
            }}>
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SlotBlock({
  label,
  col,
  icon,
  children,
}: {
  label: string;
  col: 1 | 2 | "full";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      gridColumn: col === "full" ? "1 / -1" : String(col),
      background: "var(--surface-2)",
      border: "1px solid var(--line)",
      borderRadius: "var(--r-sm)",
      padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        {icon && (
          <span style={{ color: "var(--ink-3)", flexShrink: 0, display: "flex" }}>
            {icon}
          </span>
        )}
        <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, fontFamily: "var(--font-ui)" }}>
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

const bodyStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--ink-2)",
  lineHeight: 1.55,
  margin: 0,
};
