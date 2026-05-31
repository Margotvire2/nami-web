"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { usePatientBilan } from "@/hooks/usePatientBilan";
import { BilanHeader } from "./BilanHeader";
import { BilanAnalysisSummary } from "./BilanAnalysisSummary";
import { BilanViewer } from "./BilanViewer";

const C = {
  bg: "#FAFAF8",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
};

const MAIN_STYLE = {
  padding: "28px 0 60px",
  maxWidth: 720,
  margin: "0 auto",
  background: C.bg,
  minHeight: "100vh",
} as const;

export function BilanViewerPageClient({ id }: { id: string }) {
  const { data: bilan, isLoading, isError } = usePatientBilan(id);

  if (isLoading) {
    return (
      <main aria-label="Chargement du bilan" style={MAIN_STYLE}>
        <div
          role="status"
          aria-live="polite"
          style={{ display: "flex", justifyContent: "center", padding: 60 }}
        >
          <Loader2
            size={22}
            className="animate-spin"
            style={{ color: C.primary }}
            aria-hidden="true"
          />
          <span className="sr-only">Chargement de votre bilan…</span>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main aria-label="Erreur de chargement" style={MAIN_STYLE}>
        <Link
          href="/mes-bilans"
          style={{ fontSize: 13, color: C.textSoft, textDecoration: "none" }}
        >
          ← Mes bilans
        </Link>
        <div style={{ marginTop: 24, textAlign: "center", padding: "40px 16px" }}>
          <p style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>
            Impossible de charger ce bilan.
          </p>
          <p style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            Vérifiez votre connexion et réessayez.
          </p>
        </div>
      </main>
    );
  }

  if (!bilan) {
    return (
      <main aria-label="Bilan introuvable" style={MAIN_STYLE}>
        <Link
          href="/mes-bilans"
          style={{ fontSize: 13, color: C.textSoft, textDecoration: "none" }}
        >
          ← Mes bilans
        </Link>
        <div style={{ marginTop: 24, textAlign: "center", padding: "40px 16px" }}>
          <p style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>
            Ce bilan est introuvable.
          </p>
          <p style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            Il a peut-être été supprimé ou n&apos;est plus partagé avec vous.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main aria-label={`Bilan : ${bilan.title}`} style={MAIN_STYLE}>
      <BilanHeader bilan={bilan} />
      <BilanAnalysisSummary bilan={bilan} />
      <BilanViewer bilan={bilan} />

      <p
        style={{
          marginTop: 24,
          fontSize: 12,
          color: C.textSoft,
          textAlign: "center",
          lineHeight: 1.5,
          padding: "0 16px",
        }}
      >
        Pour interpréter ces résultats, parlez-en à votre médecin.
      </p>
    </main>
  );
}
