"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientDocument } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Download, Loader2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  DocumentsFilters,
  DOC_TYPES,
  FILTER_LABELS,
  bucketize,
  type FilterKey,
  type DocumentTypeKey,
} from "./DocumentsFilters";

const C = {
  primary: "#5B4EC4",
  primaryLight: "rgba(91,78,196,0.08)",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF",
  bg: "#FAFAF8",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const api = apiWithToken(accessToken!);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");

  const { data: docs = [], isLoading } = useQuery<PatientDocument[]>({
    queryKey: ["patient-documents"],
    queryFn: () => api.patient.documents(),
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });

  // Counts par bucket de filtre (pour les badges sur les pills)
  const counts = useMemo(() => {
    const acc: Record<FilterKey, number> = {
      ALL: docs.length,
      BIOLOGICAL_REPORT: 0,
      PRESCRIPTION: 0,
      CONSULTATION_REPORT: 0,
      HOSPITAL_REPORT: 0,
      LETTER: 0,
      IMAGING: 0,
      OTHER: 0,
      IMPEDANCE_REPORT: 0,
      DXA_REPORT: 0,
      ECG_REPORT: 0,
      TRANSCRIPTION: 0,
    };
    for (const d of docs) {
      const bucket = bucketize(d.documentType);
      acc[bucket] = (acc[bucket] ?? 0) + 1;
    }
    return acc;
  }, [docs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      if (filter !== "ALL" && bucketize(d.documentType) !== filter) return false;
      if (q && !d.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [docs, filter, search]);

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
          marginBottom: 20,
          letterSpacing: "-0.4px",
        }}
      >
        Mes documents
      </h1>

      <DocumentsFilters
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
        totalAll={docs.length}
      />

      {/* Compteur résultats accessible aux lecteurs d'écran */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {filtered.length} document{filtered.length !== 1 ? "s" : ""} affiché
        {filtered.length !== 1 ? "s" : ""}.
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
      ) : filtered.length === 0 ? (
        <div
          role="status"
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: C.card,
            borderRadius: 16,
            border: `1px dashed ${C.border}`,
          }}
        >
          <FileText
            size={32}
            aria-hidden="true"
            style={{ margin: "0 auto 12px", opacity: 0.3 }}
          />
          <p style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>
            Aucun document à afficher
          </p>
          <p style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            {search.trim().length > 0
              ? `Aucun document ne contient « ${search.trim()} ».`
              : filter !== "ALL"
              ? `Aucun document dans la catégorie « ${FILTER_LABELS[filter]} ».`
              : "Vos documents partagés par vos soignants apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((doc, idx) => {
            const typeInfo =
              DOC_TYPES[doc.documentType as DocumentTypeKey] ?? DOC_TYPES.OTHER;
            return (
              <ScrollReveal
                key={doc.id}
                variant="fade-up"
                delay={idx * 0.06}
                duration={0.5}
              >
                <article
                  className="nami-patient-card"
                  style={{
                    background: C.card,
                    borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  {/* Icône type */}
                  <div
                    aria-hidden="true"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: typeInfo.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {typeInfo.icon}
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doc.title}
                    </div>
                    <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>
                      <span style={{ color: typeInfo.color, fontWeight: 500 }}>
                        {typeInfo.label}
                      </span>
                      {" · "}
                      {format(parseISO(doc.createdAt), "d MMM yyyy", { locale: fr })}
                      {" · "}
                      {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                      {" · "}
                      {formatSize(doc.sizeBytes)}
                    </div>
                  </div>

                  {/* Télécharger */}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Télécharger ${doc.title}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: C.primaryLight,
                      flexShrink: 0,
                      color: C.primary,
                    }}
                  >
                    <Download size={16} strokeWidth={2} aria-hidden="true" />
                  </a>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
