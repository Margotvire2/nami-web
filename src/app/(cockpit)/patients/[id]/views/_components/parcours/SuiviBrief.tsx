import type { ProtocolContent } from "@/lib/api";

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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
      {/* Slot 1 — Durée / Fréquence */}
      {protocol.duration && (
        <SlotBlock label="Durée / Fréquence" col={1}>
          <p style={bodyStyle}>{protocol.duration}</p>
        </SlotBlock>
      )}

      {/* Slot 2 — Objectif */}
      {protocol.objectif && (
        <SlotBlock label="Objectif" col={2}>
          <p style={bodyStyle}>{protocol.objectif}</p>
        </SlotBlock>
      )}

      {/* Slot 3 — Protocole de suivi */}
      {(protocol.protocol?.length ?? 0) > 0 && (
        <SlotBlock label="Protocole de suivi" col="full">
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, listStyleType: "decimal" }}>
            {protocol.protocol!.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </SlotBlock>
      )}

      {/* Slot 4 — Réévaluation */}
      {protocol.reevaluation && (
        <SlotBlock label="Critères de réévaluation" col={1}>
          <p style={bodyStyle}>{protocol.reevaluation}</p>
        </SlotBlock>
      )}

      {/* redFlags optionnel */}
      {(protocol.redFlags?.length ?? 0) > 0 && (
        <SlotBlock label="Points de vigilance" col="full">
          <ul style={{ margin: 0, paddingLeft: 14, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, listStyleType: "disc" }}>
            {protocol.redFlags!.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
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
