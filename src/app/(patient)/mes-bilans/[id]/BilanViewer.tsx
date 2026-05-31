"use client";

import { Download } from "lucide-react";
import type { PatientBilan } from "@/lib/api";

const C = {
  border: "rgba(26,26,46,0.08)",
  primary: "#5B4EC4",
  primarySoft: "rgba(91,78,196,0.10)",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textSoft: "#6B7280",
};

/**
 * Affichage du document du bilan.
 *
 * V1 : `fileUrl` est l'URL Supabase publique signée à l'upload.
 * V2 (ticket dérivé F-PATIENT-MES-BILANS-SIGNED-URL-MIGRATE) : utiliser une
 * route backend GET /patient/documents/:id/url qui ré-émet un signed URL
 * 15min TTL à la volée (post CC #88).
 *
 * Trois rendus selon mimeType :
 * - image/* → balise <img>
 * - application/pdf → <iframe>
 * - autres → bouton de téléchargement
 */
export function BilanViewer({ bilan }: { bilan: PatientBilan }) {
  const url = bilan.fileUrl;
  const mime = bilan.mimeType ?? "";

  if (mime.startsWith("image/")) {
    return (
      <figure
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: 10,
          margin: 0,
        }}
      >
        {/* next/image requiert images.remotePatterns whitelist pour les signed
            URLs Supabase storage. Garder <img> natif est intentionnel ici :
            page de preview (pas above-the-fold critique LCP) et évite un
            changement de config. Cohérent avec /mes-documents/[id]. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`Document : ${bilan.title}`}
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            borderRadius: 8,
          }}
        />
      </figure>
    );
  }

  if (mime === "application/pdf") {
    return (
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <iframe
          src={url}
          title={`Document : ${bilan.title}`}
          style={{
            display: "block",
            width: "100%",
            height: 600,
            border: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "8px 12px",
            borderTop: `1px solid ${C.border}`,
            background: "#FAFAF8",
          }}
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: C.primary,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <Download size={14} strokeWidth={2.2} aria-hidden="true" />
            Ouvrir dans un nouvel onglet
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 24,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 14, color: C.textSoft, marginBottom: 14 }}>
        Aperçu indisponible pour ce format ({mime || "inconnu"}).
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: 10,
          background: C.primary,
          color: "#FFFFFF",
          textDecoration: "none",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <Download size={16} strokeWidth={2.2} aria-hidden="true" />
        Télécharger le document
      </a>
    </div>
  );
}
