import type { ProtocolContent } from "@/lib/api";

interface EvaluationBriefProps {
  protocol: ProtocolContent;
  actLabel: string;
}

export function EvaluationBrief({ protocol, actLabel }: EvaluationBriefProps) {
  const hasContent =
    protocol.whenToThink ||
    (protocol.questions?.length ?? 0) > 0 ||
    (protocol.examSigns?.length ?? 0) > 0 ||
    protocol.bilans ||
    (protocol.conduct?.length ?? 0) > 0 ||
    (protocol.orientation?.length ?? 0) > 0 ||
    (protocol.redFlags?.length ?? 0) > 0 ||
    (protocol.checklist?.length ?? 0) > 0;

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
      {/* Slot 1 — Quand y penser */}
      {protocol.whenToThink && (
        <SlotBlock label="Quand y penser" col={1}>
          <p style={bodyStyle}>{protocol.whenToThink}</p>
        </SlotBlock>
      )}

      {/* Slot 2 — Questions clés */}
      {(protocol.questions?.length ?? 0) > 0 && (
        <SlotBlock label="Questions clés" col={2}>
          {protocol.questionsHint && (
            <p style={{ ...bodyStyle, fontStyle: "italic", marginBottom: 6 }}>{protocol.questionsHint}</p>
          )}
          <ul style={listStyle}>
            {protocol.questions!.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </SlotBlock>
      )}

      {/* Slot 3 — Signes cliniques */}
      {(protocol.examSigns?.length ?? 0) > 0 && (
        <SlotBlock label="Examen clinique" col={1}>
          <ul style={listStyle}>
            {protocol.examSigns!.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </SlotBlock>
      )}

      {/* Slot 4 — Bilans */}
      {protocol.bilans && (
        <SlotBlock label="Bilans à demander" col={2}>
          <p style={bodyStyle}>{protocol.bilans}</p>
        </SlotBlock>
      )}

      {/* Slot 5 — Conduite à tenir */}
      {(protocol.conduct?.length ?? 0) > 0 && (
        <SlotBlock label="Conduite à tenir" col={1}>
          <ol style={{ ...listStyle, listStyleType: "decimal", paddingLeft: 18 }}>
            {protocol.conduct!.map((c, i) => <li key={i}>{c}</li>)}
          </ol>
        </SlotBlock>
      )}

      {/* Slot 6 — Orientation */}
      {(protocol.orientation?.length ?? 0) > 0 && (
        <SlotBlock label="Orientation" col={2}>
          <ul style={listStyle}>
            {protocol.orientation!.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </SlotBlock>
      )}

      {/* Slot 7 — Signaux de vigilance (redFlags legacy) */}
      {(protocol.redFlags?.length ?? 0) > 0 && (
        <SlotBlock label="Points de vigilance" col="full">
          <ul style={{ ...listStyle, color: "var(--ink)" }}>
            {protocol.redFlags!.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </SlotBlock>
      )}

      {/* Legacy checklist fallback */}
      {(protocol.checklist?.length ?? 0) > 0 && !(protocol.questions?.length) && (
        <SlotBlock label={`Protocole — ${actLabel}`} col="full">
          {protocol.checklist!.map((section, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              {section.category && (
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {section.category}
                </p>
              )}
              <ul style={listStyle}>
                {section.items.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            </div>
          ))}
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

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: 14,
  fontSize: 13,
  color: "var(--ink-2)",
  lineHeight: 1.55,
  listStyleType: "disc",
};
