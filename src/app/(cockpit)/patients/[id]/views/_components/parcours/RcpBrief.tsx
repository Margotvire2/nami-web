import type { ProtocolContent } from "@/lib/api";

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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
      {/* Slot 1 — Quand déclencher */}
      {protocol.whenToTrigger && (
        <SlotBlock label="Quand déclencher" col={1}>
          <p style={bodyStyle}>{protocol.whenToTrigger}</p>
        </SlotBlock>
      )}

      {/* Slot 2 — Participants */}
      {(protocol.whoToGather?.length ?? 0) > 0 && (
        <SlotBlock label="Participants à réunir" col={2}>
          <ul style={{ margin: 0, paddingLeft: 14, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, listStyleType: "disc" }}>
            {protocol.whoToGather!.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </SlotBlock>
      )}

      {/* Slot 3 — Décisions à prendre */}
      {protocol.decisions && (
        <SlotBlock label="Décisions à prendre" col="full">
          <p style={bodyStyle}>{protocol.decisions}</p>
        </SlotBlock>
      )}

      {/* Sources */}
      {(protocol.sources?.length ?? 0) > 0 && (
        <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
          <p className="legal">
            Sources : {protocol.sources.join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}

function SlotBlock({
  label,
  col,
  children,
}: {
  label: string;
  col: 1 | 2 | "full";
  children: React.ReactNode;
}) {
  return (
    <div style={{ gridColumn: col === "full" ? "1 / -1" : String(col) }}>
      <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
        {label}
      </p>
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
