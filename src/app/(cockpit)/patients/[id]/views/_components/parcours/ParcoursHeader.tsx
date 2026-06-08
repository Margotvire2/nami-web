import { expandPathwayLabel } from "@/lib/pathway-acronyms";
import { getFamilyLabel } from "@/lib/pathwayFamilyLabels";

interface ParcoursHeaderProps {
  pathwayLabel: string;
  pathwayFamily: string;
  startedAt: string | null;
  dayInPathway: number;
  summary: {
    total: number;
    completed: number;
    overdue: number;
    inWindow: number;
    skipped: number;
    pending: number;
  } | null;
  isBlueprint: boolean;
  totalSteps: number;
}

export function ParcoursHeader({
  pathwayLabel,
  pathwayFamily,
  startedAt,
  dayInPathway,
  summary,
  isBlueprint,
  totalSteps,
}: ParcoursHeaderProps) {
  const label = expandPathwayLabel(pathwayLabel);
  const familyLabel = getFamilyLabel(pathwayFamily);

  return (
    <div
      className="card"
      style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
    >
      {/* Title block */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px", fontFamily: "var(--font-ui)" }}>
          Parcours · {familyLabel}
        </p>
        <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 800, color: "var(--ink)", margin: 0, lineHeight: 1.25 }}>
          {label}
        </h2>
      </div>

      {/* Meta pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {isBlueprint ? (
          <MetaPill label={`${totalSteps} étapes`} muted />
        ) : (
          <>
            {summary && (
              <>
                <MetaPill label={`${summary.completed}/${summary.total} faites`} />
                {summary.overdue > 0 && <MetaPill label={`${summary.overdue} à rattraper`} warn />}
                {summary.inWindow > 0 && <MetaPill label={`${summary.inWindow} en cours`} accent />}
              </>
            )}
            {startedAt && dayInPathway > 0 && (
              <MetaPill label={`J+${dayInPathway}`} muted />
            )}
          </>
        )}

        {isBlueprint && (
          <span style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "var(--ink-faint)",
            padding: "3px 8px",
            borderRadius: "var(--r-sm)",
            border: "1px dashed var(--line-2)",
            fontFamily: "var(--font-ui)",
          }}>
            Non démarré
          </span>
        )}
      </div>
    </div>
  );
}

function MetaPill({ label, muted, warn, accent }: { label: string; muted?: boolean; warn?: boolean; accent?: boolean }) {
  const color = warn
    ? "var(--amber, #D97706)"
    : accent
    ? "var(--violet)"
    : muted
    ? "var(--ink-faint)"
    : "var(--ink-2)";
  const bg = warn
    ? "rgba(217,119,6,0.08)"
    : accent
    ? "rgba(91,78,196,0.08)"
    : "var(--paper-2, var(--surface-2))";

  return (
    <span style={{
      fontSize: 11.5,
      fontWeight: 700,
      fontFamily: "var(--font-ui)",
      color,
      background: bg,
      padding: "3px 10px",
      borderRadius: "var(--r-pill, 999px)",
    }}>
      {label}
    </span>
  );
}
