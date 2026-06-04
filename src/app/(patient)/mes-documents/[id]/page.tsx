"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Printer,
} from "lucide-react";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { PrintHeader } from "@/components/print/PrintHeader";
import { PrintFooter } from "@/components/print/PrintFooter";

// Sous-ensemble safe DocumentType (aligné backend PR #62 + frontend PR #51).
// Note legacy : BILAN_BIO est un alias historique de BIOLOGICAL_REPORT
// (cf. bug F-PATIENT-DOCUMENTS-FILTER-FIX) conservé pour rétro-compat.
const TYPE_LABELS: Record<string, string> = {
  PRESCRIPTION: "Ordonnance",
  BIOLOGICAL_REPORT: "Bilan biologique",
  HOSPITAL_REPORT: "Compte-rendu hospitalier",
  LETTER: "Courrier médical",
  IMAGING: "Imagerie / Radiologie",
  OTHER: "Autre",
  BILAN_BIO: "Bilan biologique",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} octets`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDocColor(type: string): string {
  switch (type) {
    case "PRESCRIPTION":
      return "#5B4EC4";
    case "BIOLOGICAL_REPORT":
    case "BILAN_BIO":
      return "#0F766E";
    case "HOSPITAL_REPORT":
      return "#7C2D12";
    case "IMAGING":
      return "#9333EA";
    case "LETTER":
      return "#6B7280";
    default:
      return "#6B7280";
  }
}

export default function DocumentDetailPage() {
  const params = useParams();
  const token = useAuthStore((s) => s.accessToken);
  const id = typeof params?.id === "string" ? params.id : "";

  // Pattern PR #48 : pas de get(id) backend dédié, on filtre depuis list().
  const { data: documents, isLoading } = useQuery({
    queryKey: ["patient-documents-detail"],
    queryFn: () => {
      if (!token) return [] as never[];
      return apiWithToken(token).patient.documents();
    },
    enabled: !!token,
    staleTime: 60_000,
  });

  const document = (documents ?? []).find((d) => d.id === id);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 0",
        }}
        role="status"
        aria-label="Chargement du document"
      >
        <Loader2 size={24} className="animate-spin" style={{ color: "#5B4EC4" }} aria-hidden="true" />
      </div>
    );
  }

  if (!document) {
    return (
      <main
        style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}
        aria-label="Document introuvable"
      >
        <Link
          href="/mes-documents"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#6B7280",
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à mes documents
        </Link>
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "rgba(91,78,196,0.04)",
            border: "1px solid rgba(91,78,196,0.12)",
            borderRadius: 16,
          }}
          role="status"
        >
          <AlertCircle
            size={32}
            style={{ color: "#6B7280", opacity: 0.4, margin: "0 auto 12px" }}
            aria-hidden="true"
          />
          <p style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E", marginBottom: 6 }}>
            Document introuvable
          </p>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
            Ce document a peut-être été supprimé ou vous n&apos;avez pas accès.
          </p>
          <Link
            href="/mes-documents"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              background: "#5B4EC4",
              color: "#fff",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Voir mes documents
          </Link>
        </div>
      </main>
    );
  }

  const docColor = getDocColor(document.documentType);
  const typeLabel = TYPE_LABELS[document.documentType] ?? document.documentType;
  const isImage = document.mimeType?.startsWith("image/") ?? false;
  const isPdf = document.mimeType === "application/pdf";

  // Le label letterhead reste générique côté impression (pas de PHI rendue
  // par la feuille de style). On indique simplement la nature du document.
  const printDocumentLabel =
    document.documentType === "PRESCRIPTION"
      ? "Ordonnance"
      : typeLabel;

  return (
    <main
      className="print-content"
      style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px 96px" }}
      aria-label="Détail du document"
    >
      <PrintHeader documentLabel={printDocumentLabel} reference={document.id} />

      {/* Breadcrumb */}
      <Link
        href="/mes-documents"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          color: "#6B7280",
          textDecoration: "none",
          marginBottom: 24,
        }}
        className="hover:text-[#1A1A2E]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Retour à mes documents
      </Link>

      {/* Header */}
      <header style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `${docColor}15`,
              color: docColor,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {isImage ? <ImageIcon size={24} strokeWidth={1.8} /> : <FileText size={24} strokeWidth={1.8} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
                letterSpacing: "-0.02em",
                marginBottom: 6,
                wordBreak: "break-word",
              }}
            >
              {document.title}
            </h1>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
                fontSize: 13,
                color: "#6B7280",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px 10px",
                  borderRadius: 100,
                  background: `${docColor}15`,
                  color: docColor,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {typeLabel}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Calendar size={12} aria-hidden="true" />
                {formatDate(document.createdAt)}
              </span>
              <span>{formatBytes(document.sizeBytes ?? 0)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Preview */}
      <section
        style={{
          background: "#fff",
          border: "1px solid rgba(26,26,46,0.06)",
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 20,
        }}
        aria-label="Aperçu du document"
      >
        {isImage && document.fileUrl ? (
          // next/image requiert `images.domains` ou `images.remotePatterns` whitelist
          // pour des URLs dynamiques (signed URLs Supabase storage). Garder <img>
          // natif est intentionnel ici : pas de perte LCP critique (page preview
          // après navigate, pas above-the-fold), et évite un changement de config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={document.fileUrl}
            alt={`Aperçu de ${document.title}`}
            style={{
              display: "block",
              maxWidth: "100%",
              height: "auto",
              margin: "0 auto",
              maxHeight: "70vh",
            }}
          />
        ) : isPdf && document.fileUrl ? (
          <embed
            src={document.fileUrl}
            type="application/pdf"
            title={`Aperçu PDF de ${document.title}`}
            style={{
              display: "block",
              width: "100%",
              height: "70vh",
              border: "none",
            }}
          />
        ) : (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              color: "#6B7280",
            }}
            role="status"
          >
            <FileText
              size={48}
              style={{ color: "#9CA3AF", opacity: 0.5, margin: "0 auto 12px" }}
              aria-hidden="true"
            />
            <p style={{ fontSize: 14 }}>Aperçu non disponible pour ce type de fichier.</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
              Téléchargez le document pour le visualiser.
            </p>
          </div>
        )}
      </section>

      {/* Actions */}
      <section
        style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
        aria-label="Actions sur le document"
        className="no-print"
        data-print="hide"
      >
        {document.fileUrl && (
          <a
            href={document.fileUrl}
            download={document.title}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Télécharger ${document.title}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 12,
              background: "#5B4EC4",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(91,78,196,0.25)",
            }}
            className="hover:opacity-90"
          >
            <Download size={16} aria-hidden="true" />
            Télécharger
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.print();
            }
          }}
          aria-label={`Imprimer ${document.title}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 12,
            background: "#fff",
            color: "#1A1A2E",
            border: "1px solid rgba(26,26,46,0.12)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
          className="hover:bg-[rgba(91,78,196,0.04)]"
        >
          <Printer size={16} aria-hidden="true" />
          Imprimer
        </button>
        <Link
          href="/mes-documents"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 12,
            background: "#fff",
            color: "#1A1A2E",
            border: "1px solid rgba(26,26,46,0.12)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
          className="hover:bg-[rgba(91,78,196,0.04)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Retour à la liste
        </Link>
      </section>

      {/* Hint compliance */}
      <p
        className="no-print"
        data-print="hide"
        style={{
          marginTop: 20,
          padding: "12px 16px",
          fontSize: 12,
          color: "#6B7280",
          background: "rgba(91,78,196,0.04)",
          borderRadius: 10,
          border: "1px solid rgba(91,78,196,0.08)",
          lineHeight: 1.5,
        }}
      >
        Ce document est partagé avec votre équipe soignante. Pour toute question médicale,
        contactez votre soignant via la messagerie.
      </p>

      <PrintFooter signatureLabel="Signature du soignant prescripteur" />
    </main>
  );
}
