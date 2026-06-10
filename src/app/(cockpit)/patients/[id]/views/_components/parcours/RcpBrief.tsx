import type { ProtocolContent } from "@/lib/api";
import { CalendarDays, Users, ClipboardCheck } from "lucide-react";

interface RcpBriefProps {
  protocol: ProtocolContent;
}

export function RcpBrief({ protocol }: RcpBriefProps) {
  const hasContent =
    protocol.whenToTrigger ||
    (protocol.whoToGather?.length ?? 0) > 0 ||
    protocol.decisions;

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
      {protocol.whenToTrigger && (
        <SlotBlock label="Quand déclencher" icon={<CalendarDays size={14} strokeWidth={1.7} />} col={1}>
          <p style={bodyStyle}>{protocol.whenToTrigger}</p>
        </SlotBlock>
      )}

      {(protocol.whoToGather?.length ?? 0) > 0 && (
        <SlotBlock label="Participants à réunir" icon={<Users size={14} strokeWidth={1.7} />} col={2}>
          <ul style={listStyle}>
            {protocol.whoToGather!.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </SlotBlock>
      )}

      {protocol.decisions && (
        <SlotBlock label="Décisions à prendre" icon={<ClipboardCheck size={14} strokeWidth={1.7} />} col="full">
          <p style={bodyStyle}>{protocol.decisions}</p>
        </SlotBlock>
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
      border: "1px solid var(--line-2)",
      borderRadius: "var(--r-sm)",
      padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        {icon && (
          <span style={{ color: "var(--ink-2)", flexShrink: 0, display: "flex" }}>
            {icon}
          </span>
        )}
        <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, fontFamily: "var(--font-ui)" }}>
          {label}
        </p>
      </div>
      {children}
    </div>
  );
}

const bodyStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--ink)",
  lineHeight: 1.55,
  margin: 0,
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 14,
  fontSize: 13,
  color: "var(--ink)",
  lineHeight: 1.55,
  listStyleType: "disc",
};
