import Link from "next/link";
import { Loader2, CheckCircle2, FileCheck, AlertCircle } from "lucide-react";
import type { PatientBilan } from "@/lib/api";

/**
 * Résumé de l'analyse IA d'un bilan, affiché en haut de la page detail.
 *
 * Wording MDR strict (cf. CLAUDE.md mots interdits) :
 * - "mesures extraites" — verbe neutre et factuel.
 * - "Document conservé" — neutre, aucune évaluation clinique.
 * - "Analyse en cours" / "Analyse à réessayer" — descriptif technique.
 * - Aucune interprétation, aucune qualification normative.
 *
 * Fallback (analysisStatus indéfini) : "Bilan conservé dans votre espace".
 */
const C = {
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
  primarySoft: "rgba(91,78,196,0.08)",
  teal: "#1F7A70",
  tealSoft: "rgba(43,168,156,0.10)",
  amber: "#92400E",
  amberSoft: "rgba(217,119,6,0.10)",
  neutralSoft: "rgba(107,114,128,0.08)",
};

export function BilanAnalysisSummary({ bilan }: { bilan: PatientBilan }) {
  const status = bilan.analysisStatus;
  const count = bilan.observationsCount ?? 0;

  if (status === "pending") {
    return (
      <Section bg={C.primarySoft} fg={C.primary}>
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        <p style={{ margin: 0 }}>
          Analyse en cours… cela peut prendre une minute.
        </p>
      </Section>
    );
  }

  if (status === "completed" && count > 0) {
    return (
      <Section bg={C.tealSoft} fg={C.teal}>
        <CheckCircle2 size={18} aria-hidden="true" />
        <p style={{ margin: 0 }}>
          {count} mesure{count > 1 ? "s" : ""} extraite{count > 1 ? "s" : ""} —{" "}
          <Link
            href="/suivi"
            style={{ color: C.primary, fontWeight: 600, textDecoration: "none" }}
          >
            voir dans Mon suivi
          </Link>
          .
        </p>
      </Section>
    );
  }

  if (status === "completed") {
    return (
      <Section bg={C.neutralSoft} fg="#374151">
        <FileCheck size={18} aria-hidden="true" />
        <p style={{ margin: 0 }}>
          Document conservé dans votre espace santé.
        </p>
      </Section>
    );
  }

  if (status === "failed") {
    return (
      <Section bg={C.amberSoft} fg={C.amber}>
        <AlertCircle size={18} aria-hidden="true" />
        <p style={{ margin: 0 }}>
          L&apos;analyse n&apos;a pas pu aboutir. Vous pouvez réessayer plus tard.
        </p>
      </Section>
    );
  }

  return (
    <Section bg={C.neutralSoft} fg="#374151">
      <FileCheck size={18} aria-hidden="true" />
      <p style={{ margin: 0 }}>Bilan conservé dans votre espace.</p>
    </Section>
  );
}

function Section({
  bg,
  fg,
  children,
}: {
  bg: string;
  fg: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 12,
        background: bg,
        color: fg,
        fontSize: 13.5,
        fontWeight: 500,
        marginBottom: 16,
      }}
    >
      {children}
    </section>
  );
}
