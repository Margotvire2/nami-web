"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientDocument } from "@/lib/api";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { usePatientMessageThreads } from "@/hooks/usePatientMessageThreads";
import { CategorieCard } from "@/components/mes-documents/CategorieCard";
import { CategorieFilter } from "@/components/mes-documents/CategorieFilter";
import { DocumentListView } from "@/components/mes-documents/DocumentListView";
import {
  GRID_CATEGORIES,
  ALL_CATEGORY_META,
  computeGridCounts,
  filterDocsByGridCategory,
  parseGridCategoryParam,
} from "@/components/mes-documents/grid-categories";

const C = {
  primary: "#5B4EC4",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  bg: "#FAFAF8",
};

export default function DocumentsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const api = apiWithToken(accessToken!);

  const searchParams = useSearchParams();
  const currentCategory = parseGridCategoryParam(searchParams.get("cat"));

  const { data: docs = [], isLoading } = useQuery<PatientDocument[]>({
    queryKey: ["patient-documents"],
    queryFn: () => api.patient.documents(),
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });

  const careCasesQuery = usePatientCareCases();
  const careCases = useMemo(
    () => careCasesQuery.data ?? [],
    [careCasesQuery.data],
  );

  const threadsQuery = usePatientMessageThreads();

  const counts = useMemo(() => computeGridCounts(docs), [docs]);
  const filteredDocs = useMemo(
    () =>
      currentCategory
        ? filterDocsByGridCategory(docs, currentCategory)
        : [],
    [docs, currentCategory],
  );

  return (
    <main
      aria-label="Mes documents"
      style={{
        padding: "28px 24px 80px",
        maxWidth: 720,
        margin: "0 auto",
        background: C.bg,
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: C.text,
          marginBottom: 6,
          letterSpacing: "-0.4px",
        }}
      >
        Mes documents
      </h1>
      <p style={{ fontSize: 13, color: C.textSoft, marginBottom: 24 }}>
        {currentCategory
          ? "Documents partagés par vos soignants, classés par parcours."
          : "Choisissez une catégorie."}
      </p>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          aria-label="Chargement de vos documents"
          style={{ display: "flex", justifyContent: "center", padding: 40 }}
        >
          <Loader2
            size={22}
            className="animate-spin"
            style={{ color: C.primary }}
            aria-hidden="true"
          />
        </div>
      ) : currentCategory ? (
        <>
          <CategorieFilter current={currentCategory} counts={counts} />
          <DocumentListView
            documents={filteredDocs}
            careCases={careCases}
            threads={threadsQuery.data}
            selfPersonId={user?.id ?? null}
            emptyLabel={
              currentCategory === "ALL"
                ? "Vos documents partagés par vos soignants apparaîtront ici."
                : "Aucun document dans cette catégorie pour le moment."
            }
          />
          {currentCategory === "BILANS" && (
            <p
              style={{
                marginTop: 32,
                fontSize: 12,
                color: C.textSoft,
                textAlign: "center",
                lineHeight: 1.5,
                padding: "0 16px",
              }}
            >
              Pour interpréter ces résultats, parlez-en à votre médecin.
            </p>
          )}
        </>
      ) : (
        <>
          <div
            role="group"
            aria-label="Catégories de documents"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {GRID_CATEGORIES.map((cat) => (
              <CategorieCard
                key={cat.key}
                meta={cat}
                count={counts[cat.key]}
              />
            ))}
          </div>

          <div style={{ marginTop: 18, textAlign: "center" }}>
            <CategorieCard meta={ALL_CATEGORY_META} count={counts.ALL} />
          </div>
        </>
      )}
    </main>
  );
}
