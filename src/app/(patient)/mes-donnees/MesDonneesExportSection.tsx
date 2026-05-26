"use client";

import { useState } from "react";
import { Download, Check, Loader2 } from "lucide-react";
import type { User } from "@/lib/api";
import {
  generateExportBlob,
  downloadBlob,
  buildExportFilename,
} from "./export-utils";

/**
 * Art. 20 RGPD — Droit à la portabilité.
 *
 * Génère un export JSON 100% client-side à partir des données du store auth.
 * Aucun appel backend, aucun risque de saturer Railway / l'enrichissement ICD11.
 *
 * UX :
 *   - Bouton désactivé pendant la génération (~50ms en pratique, mais
 *     défensif si Blob/JSON.stringify ralentit sur navigateurs anciens)
 *   - Message succès visible 4s après téléchargement déclenché
 *   - Ancrage id="export" pour le lien depuis MesDonneesDeleteSection
 */
export function MesDonneesExportSection({ user }: { user: User }) {
  const [isExporting, setIsExporting] = useState(false);
  const [justExported, setJustExported] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    try {
      const blob = generateExportBlob(user);
      const filename = buildExportFilename();
      downloadBlob(blob, filename);
      setJustExported(true);
      window.setTimeout(() => setJustExported(false), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section
      id="export"
      aria-labelledby="export-heading"
      className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6 md:p-8 space-y-5 scroll-mt-24"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(43,168,156,0.08)] flex items-center justify-center shrink-0">
          <Download
            className="w-5 h-5 text-[#2BA89C]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
        <h2
          id="export-heading"
          className="text-xl font-semibold text-[#1A1A2E]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Exporter mes données
        </h2>
      </div>

      <p className="text-sm text-[#6B7280] leading-relaxed">
        Art. 20 RGPD — droit à la portabilité. Téléchargez vos données
        d&apos;identification et de compte dans un format structuré (JSON) que
        vous pouvez réutiliser librement.
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          aria-disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#5B4EC4] hover:bg-[#4A3EA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="w-4 h-4" aria-hidden="true" />
          )}
          Télécharger mes données (JSON)
        </button>

        {justExported && (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 text-sm text-[#059669] font-medium"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            Téléchargement lancé
          </span>
        )}
      </div>

      <p className="text-xs text-[#6B7280] leading-relaxed">
        Format : JSON UTF-8. Cet export contient les données dont Nami est
        responsable de traitement. Les données saisies par un soignant relèvent
        de sa propre responsabilité et doivent être demandées directement
        auprès de lui.
      </p>
    </section>
  );
}
