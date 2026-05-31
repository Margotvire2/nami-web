"use client";

import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Download } from "lucide-react";
import type { PatientDocument } from "@/lib/api";
import { DOC_TYPES, type DocumentTypeKey } from "../DocumentsFilters";

const C = {
  primary: "#5B4EC4",
  primaryLight: "rgba(91,78,196,0.08)",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface DocumentCardProps {
  doc: PatientDocument;
}

/**
 * Carte unitaire d'un document patient — reutilisee par toutes les sections
 * de groupement (CareCase / DM / Orphans).
 *
 * Extrait de l'ancienne implementation flat de /mes-documents (V1) pour
 * partager le rendu sans dupliquer le markup.
 *
 * Wording MDR-safe : aucun terme clinique, aucune mention de pathologie.
 */
export function DocumentCard({ doc }: DocumentCardProps) {
  const typeInfo =
    DOC_TYPES[doc.documentType as DocumentTypeKey] ?? DOC_TYPES.OTHER;

  return (
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
      {/* Icone type */}
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

      {/* Telecharger */}
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
  );
}
