"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
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
  const careCaseFilter = searchParams.get("careCaseId");

  const { data: allDocs = [], isLoading } = useQuery<PatientDocument[]>({
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

  const docs = useMemo(
    () =>
      careCaseFilter
        ? allDocs.filter(
            (d) =>
              d.careCaseId === careCaseFilter ||
              d.attachedCareCaseIds?.includes(careCaseFilter),
          )
        : allDocs,
    [allDocs, careCaseFilter],
  );

  const filteredCareCaseName = useMemo(() => {
    if (!careCaseFilter) return null;
    const cc = careCases.find((c) => c.id === careCaseFilter);
    return cc?.caseTitle ?? null;
  }, [careCaseFilter, careCases]);

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
        maxWidth: 900,
        margin: "0 auto",
        background: C.bg,
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 6,
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.4px",
          }}
        >
          Mes documents
        </h1>
        <Link
          href="/mes-bilans/upload"
          aria-label="Importer un document"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: C.primary,
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          <Upload size={15} aria-hidden="true" />
          Importer un document
        </Link>
      </div>
      <p style={{ fontSize: 13, color: C.textSoft, marginBottom: careCaseFilter ? 12 : 24 }}>
        {currentCategory
          ? "Documents partagés par vos soignants, classés par parcours."
          : "Choisissez une catégorie."}
      </p>

      {careCaseFilter && (
        <div
          role="status"
          style={{
            marginBottom: 24,
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(91,78,196,0.08)",
            border: "1px solid rgba(91,78,196,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 13,
            color: C.text,
          }}
        >
          <span>
            Filtré sur {filteredCareCaseName ? `« ${filteredCareCaseName} »` : "ce parcours"}.
          </span>
          <Link
            href={currentCategory ? `/mes-documents?cat=${currentCategory}` : "/mes-documents"}
            style={{
              color: C.primary,
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Voir tous mes documents
          </Link>
        </div>
      )}

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
