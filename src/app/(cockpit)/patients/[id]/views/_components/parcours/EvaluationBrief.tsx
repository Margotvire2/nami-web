import type { ProtocolContent } from "@/lib/api";
import {
  Brain, HelpCircle, Stethoscope, FlaskConical,
  ListChecks, Share2, ShieldAlert,
} from "lucide-react";

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
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {protocol.whenToThink && (
        <SlotBlock label="Quand y penser" icon={<Brain size={14} strokeWidth={1.7} />} col={1}>
          <p style={bodyStyle}>{protocol.whenToThink}</p>
        </SlotBlock>
      )}

      {(protocol.questions?.length ?? 0) > 0 && (
        <SlotBlock label="Questions clés" icon={<HelpCircle size={14} strokeWidth={1.7} />} col={2}>
          {protocol.questionsHint && (
            <div style={{
              background: "var(--teal-tint)",
              borderRadius: "var(--r-xs)",
              padding: "4px 10px",
              marginBottom: 8,
              fontSize: 11.5,
              color: "var(--teal-deep)",
              lineHeight: 1.45,
            }}>
              {protocol.questionsHint}
            </div>
          )}
          <ul style={listStyle}>
            {protocol.questions!.map((q, i) => <li key={i}>{q}</li>)}
          </ul>
        </SlotBlock>
      )}

      {(protocol.examSigns?.length ?? 0) > 0 && (
        <SlotBlock label="Examen clinique" icon={<Stethoscope size={14} strokeWidth={1.7} />} col={1}>
          <ul style={listStyle}>
            {protocol.examSigns!.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </SlotBlock>
      )}

      {protocol.bilans && (
        <SlotBlock label="Bilans à demander" icon={<FlaskConical size={14} strokeWidth={1.7} />} col={2}>
          <p style={bodyStyle}>{protocol.bilans}</p>
        </SlotBlock>
      )}

      {(protocol.conduct?.length ?? 0) > 0 && (
        <SlotBlock label="Conduite à tenir" icon={<ListChecks size={14} strokeWidth={1.7} />} col={1}>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            {protocol.conduct!.map((c, i) => (
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
                <span style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.55 }}>{c}</span>
              </li>
            ))}
          </ol>
        </SlotBlock>
      )}

      {(protocol.orientation?.length ?? 0) > 0 && (
        <SlotBlock label="Orientation" icon={<Share2 size={14} strokeWidth={1.7} />} col={2}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
            {protocol.orientation!.map((o, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Share2 size={12} strokeWidth={1.8} style={{ color: "var(--teal-deep)", flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.55 }}>{o}</span>
              </li>
            ))}
          </ul>
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

      {(protocol.checklist?.length ?? 0) > 0 && !(protocol.questions?.length) && (
        <SlotBlock label="Protocole" icon={<ListChecks size={14} strokeWidth={1.7} />} col="full">
          {protocol.checklist!.map((section, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              {section.category && (
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, margin: "0 0 4px" }}>
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
