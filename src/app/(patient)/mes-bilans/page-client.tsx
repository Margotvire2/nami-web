"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Loader2, Plus } from "lucide-react";
import { usePatientBilans } from "@/hooks/usePatientBilans";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { BilanEmptyState } from "./_components/BilanEmptyState";
import { BilansCareCaseSection } from "./_components/BilansCareCaseSection";
import { BilansOrphanSection } from "./_components/BilansOrphanSection";
import { MdrDisclaimer } from "./_components/MdrDisclaimer";

const C = {
  bg: "#FAFAF8",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
};

export function MesBilansClient() {
  const { data: bilans = [], isLoading: bilansLoading } = usePatientBilans();
  const { data: careCases = [], isLoading: careCasesLoading } =
    usePatientCareCases();

  const isLoading = bilansLoading || careCasesLoading;

  // Index : careCaseId → bilans[] + collecte des orphans (sans careCaseId valide
  // côté CareCase ACTIVE du patient).
  const { byCareCase, orphans } = useMemo(() => {
    const activeIds = new Set(careCases.map((cc) => cc.id));
    const byCareCase = new Map<string, typeof bilans>();
    const orphans: typeof bilans = [];

    for (const bilan of bilans) {
      if (bilan.careCaseId && activeIds.has(bilan.careCaseId)) {
        const arr = byCareCase.get(bilan.careCaseId) ?? [];
        arr.push(bilan);
        byCareCase.set(bilan.careCaseId, arr);
      } else {
        orphans.push(bilan);
      }
    }

    return { byCareCase, orphans };
  }, [bilans, careCases]);

  const hasAnyBilan = bilans.length > 0;
  const hasAnyCareCase = careCases.length > 0;
  const showGroups = !isLoading && hasAnyBilan;
  const showGlobalEmpty = !isLoading && !hasAnyBilan && !hasAnyCareCase;
  const showOnlyCareCasesNoBilans =
    !isLoading && !hasAnyBilan && hasAnyCareCase;

  return (
    <main
      aria-label="Mes bilans"
      style={{
        padding: "28px 0 80px",
        maxWidth: 720,
        margin: "0 auto",
        background: C.bg,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.4px",
            }}
          >
            Mes bilans
          </h1>
          <p style={{ fontSize: 13, color: C.textSoft, marginTop: 4 }}>
            Vos bilans biologiques, conservés et partagés avec vos soignants.
          </p>
        </div>

        {hasAnyBilan ? (
          <Link
            href="/mes-bilans/upload"
            aria-label="Ajouter un bilan"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderRadius: 10,
              background: C.primary,
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
            Ajouter
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Chargement de vos bilans"
          style={{ display: "flex", justifyContent: "center", padding: 40 }}
        >
          <Loader2
            size={22}
            className="animate-spin"
            style={{ color: C.primary }}
            aria-hidden="true"
          />
        </div>
      ) : showGlobalEmpty ? (
        <BilanEmptyState />
      ) : showOnlyCareCasesNoBilans ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {careCases.map((careCase) => (
            <BilansCareCaseSection
              key={careCase.id}
              careCase={careCase}
              bilans={[]}
            />
          ))}
          <MdrDisclaimer />
        </div>
      ) : showGroups ? (
        <>
          <p aria-live="polite" aria-atomic="true" className="sr-only">
            {bilans.length} bilan{bilans.length !== 1 ? "s" : ""} affiché
            {bilans.length !== 1 ? "s" : ""}.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {careCases
              .filter((cc) => (byCareCase.get(cc.id) ?? []).length > 0)
              .map((careCase) => (
                <BilansCareCaseSection
                  key={careCase.id}
                  careCase={careCase}
                  bilans={byCareCase.get(careCase.id) ?? []}
                />
              ))}
            {orphans.length > 0 ? (
              <BilansOrphanSection bilans={orphans} />
            ) : null}
          </div>
          <MdrDisclaimer />
        </>
      ) : null}
    </main>
  );
}
