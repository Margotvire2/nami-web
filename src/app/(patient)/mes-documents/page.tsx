"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientDocument } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Download, Loader2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const C = {
  primary: "#5B4EC4", primaryLight: "rgba(91,78,196,0.08)",
  text: "#1A1A2E", textSoft: "#6B7280", border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF", bg: "#FAFAF8",
};

const DOC_TYPES: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  BILAN_BIO:     { icon: "🩸", label: "Bilan biologique", color: "#2563EB", bg: "#EFF6FF" },
  COURRIER:      { icon: "✉️", label: "Courrier",          color: "#6B7280", bg: "#F9FAFB" },
  ORDONNANCE:    { icon: "💊", label: "Ordonnance",        color: "#059669", bg: "#ECFDF5" },
  COMPTE_RENDU:  { icon: "📋", label: "Compte-rendu",      color: "#D97706", bg: "#FFFBEB" },
  AUTRE:         { icon: "📄", label: "Autre",             color: "#7C3AED", bg: "#F5F3FF" },
};

const ALL_TYPES = ["Tous", "Bilan biologique", "Courrier", "Ordonnance", "Compte-rendu", "Autre"];
const TYPE_KEY: Record<string, string> = {
  "Bilan biologique": "BILAN_BIO", Courrier: "COURRIER",
  Ordonnance: "ORDONNANCE", "Compte-rendu": "COMPTE_RENDU", Autre: "AUTRE",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function DocumentsPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const api = apiWithToken(accessToken!);
  const [filter, setFilter] = useState("Tous");

  const { data: docs = [], isLoading } = useQuery<PatientDocument[]>({
    queryKey: ["patient-documents"],
    queryFn: () => api.patient.documents(),
    enabled: !!accessToken,
    staleTime: 5 * 60_000,
  });

  const filtered = useMemo(() => {
    if (filter === "Tous") return docs;
    const key = TYPE_KEY[filter];
    return docs.filter((d) => d.documentType === key);
  }, [docs, filter]);

  return (
    <div style={{ padding: "28px 24px 80px", maxWidth: 720, margin: "0 auto", background: C.bg, minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 20, letterSpacing: "-0.4px" }}>
        Mes documents
      </h1>

      {/* Filtres */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {ALL_TYPES.map((t) => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: "6px 12px", borderRadius: 20, border: `1px solid ${filter === t ? C.primary : C.border}`,
            background: filter === t ? C.primaryLight : C.card,
            color: filter === t ? C.primary : C.textSoft,
            fontSize: 12, fontWeight: filter === t ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
          }}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <Loader2 size={22} className="animate-spin" style={{ color: C.primary }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", background: C.card, borderRadius: 16, border: `1px solid ${C.border}` }}>
          <FileText size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
          <p style={{ fontSize: 14, color: C.textSoft }}>Aucun document{filter !== "Tous" ? ` de type "${filter}"` : ""}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((doc, idx) => {
            const typeInfo = DOC_TYPES[doc.documentType] ?? DOC_TYPES.AUTRE;
            return (
              <ScrollReveal key={doc.id} variant="fade-up" delay={idx * 0.06} duration={0.5}>
              <div className="nami-patient-card" style={{
                background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
                padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
              }}>
                {/* Icône type */}
                <div style={{
                  width: 42, height: 42, borderRadius: 10, background: typeInfo.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                }}>
                  {typeInfo.icon}
                </div>

                {/* Infos */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>
                    <span style={{ color: typeInfo.color, fontWeight: 500 }}>{typeInfo.label}</span>
                    {" · "}{format(parseISO(doc.createdAt), "d MMM yyyy", { locale: fr })}
                    {" · "}{doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                    {" · "}{formatSize(doc.sizeBytes)}
                  </div>
                </div>

                {/* Télécharger */}
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 34, height: 34, borderRadius: 8, background: C.primaryLight,
                  flexShrink: 0, color: C.primary,
                }}>
                  <Download size={16} strokeWidth={2} />
                </a>
              </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
