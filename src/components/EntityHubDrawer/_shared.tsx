"use client";

import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5B4EC4] mb-2 mt-0">
      {children}
    </h3>
  );
}

export function HubCard({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const base =
    "w-full text-left rounded-xl bg-white border border-[#1A1A2E]/06 p-4 transition";
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={`${base} hover:border-[#5B4EC4]/30 hover:shadow-[0_4px_16px_rgba(91,78,196,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 cursor-pointer`}
      >
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

export function EmptyLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-[#9CA3AF] italic m-0">{children}</p>
  );
}

const DOC_TYPE_LABEL: Record<string, string> = {
  PRESCRIPTION: "Ordonnance",
  REPORT: "Compte-rendu",
  CONSULTATION_REPORT: "Compte-rendu",
  HOSPITAL_REPORT: "Compte-rendu hospitalier",
  BIOLOGICAL_REPORT: "Bilan biologique",
  LETTER: "Lettre d'adressage",
  IMAGING: "Imagerie",
  CERTIFICATE: "Certificat",
  CONSENT: "Consentement",
  OTHER: "Document",
};

export function documentTypeLabel(documentType: string): string {
  return DOC_TYPE_LABEL[documentType] ?? "Document";
}

const DOC_TYPE_EMOJI: Record<string, string> = {
  PRESCRIPTION: "💊",
  REPORT: "📝",
  CONSULTATION_REPORT: "📝",
  HOSPITAL_REPORT: "📝",
  BIOLOGICAL_REPORT: "🧪",
  LETTER: "📨",
  IMAGING: "🩻",
  CERTIFICATE: "📄",
  CONSENT: "📄",
  OTHER: "📄",
};

export function documentTypeEmoji(documentType: string): string {
  return DOC_TYPE_EMOJI[documentType] ?? "📄";
}

const DOC_TYPE_PLURAL_LABEL: Record<string, string> = {
  PRESCRIPTION: "Ordonnances",
  REPORT: "Comptes-rendus",
  CONSULTATION_REPORT: "Comptes-rendus",
  HOSPITAL_REPORT: "Comptes-rendus hospitaliers",
  BIOLOGICAL_REPORT: "Bilans biologiques",
  LETTER: "Lettres d'adressage",
  IMAGING: "Imageries",
  CERTIFICATE: "Certificats",
  CONSENT: "Consentements",
  OTHER: "Autres documents",
};

export function documentTypePluralLabel(documentType: string): string {
  return DOC_TYPE_PLURAL_LABEL[documentType] ?? "Documents";
}

/**
 * Ordre d'affichage des groupes documentType dans la fiche consultation
 * (les plus pertinents au patient en premier, OTHER en dernier).
 */
export const DOCUMENT_TYPE_DISPLAY_ORDER: readonly string[] = [
  "PRESCRIPTION",
  "BIOLOGICAL_REPORT",
  "CONSULTATION_REPORT",
  "HOSPITAL_REPORT",
  "REPORT",
  "LETTER",
  "IMAGING",
  "CERTIFICATE",
  "CONSENT",
  "OTHER",
];

const LOCATION_LABEL: Record<string, string> = {
  IN_PERSON: "En cabinet",
  VIDEO: "Téléconsultation",
  PHONE: "Au téléphone",
};

export function locationLabel(locationType: string): string {
  return LOCATION_LABEL[locationType] ?? locationType;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
