import type { PatientBilan } from "@/lib/api";

interface Props {
  bilan: Pick<PatientBilan, "analysisStatus" | "observationsCount">;
}

/**
 * Badge de statut d'analyse d'un bilan.
 *
 * Wording MDR strict (cf. CLAUDE.md liste interdits) :
 * - "X mesures extraites" — verbe neutre, factuel.
 * - "Analyse en cours" / "Document conservé" / "Analyse à réessayer".
 * - Aucune interprétation clinique, aucune qualification normative.
 *
 * Fallback (CC #79 backend non déployé → analysisStatus undefined) : "Bilan reçu".
 */
export function BilanStatusBadge({ bilan }: Props) {
  const count = bilan.observationsCount ?? 0;
  const status = bilan.analysisStatus;

  let label: string;
  let bg: string;
  let fg: string;

  if (status === "pending") {
    label = "Analyse en cours";
    bg = "rgba(91,78,196,0.10)"; // violet doux
    fg = "#5B4EC4";
  } else if (status === "completed" && count > 0) {
    label = `${count} mesure${count > 1 ? "s" : ""} extraite${count > 1 ? "s" : ""}`;
    bg = "rgba(43,168,156,0.12)"; // teal
    fg = "#1F7A70";
  } else if (status === "completed") {
    label = "Document conservé";
    bg = "rgba(107,114,128,0.10)";
    fg = "#374151";
  } else if (status === "failed") {
    label = "Analyse à réessayer";
    bg = "rgba(217,119,6,0.12)";
    fg = "#92400E";
  } else {
    label = "Bilan reçu";
    bg = "rgba(107,114,128,0.10)";
    fg = "#374151";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: bg,
        color: fg,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
