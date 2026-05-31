"use client";

import { Users, Inbox, Info } from "lucide-react";

interface ParticipantsListProps {
  participantsCount: number;
  patientSubmissionsCount: number;
  acceptsPatientSubmissions: boolean;
  isDpcEligible: boolean;
}

/**
 * Vue de synthèse des inscriptions et soumissions.
 *
 * Note V1 : backend PR #106 expose `_count.participants` et
 * `_count.patientSubmissions` sur GET /events/:id, mais PAS de liste
 * paginée des inscrits ni des soumissions. Le détail nominatif et les
 * actions admin par ligne (confirmer DPC, retirer, review submission)
 * arriveront avec un endpoint GET dédié (suivi : V2.1 backend).
 *
 * En attendant, on présente clairement les compteurs et on explique
 * la limitation — pas de mock data.
 */
export function ParticipantsList({
  participantsCount,
  patientSubmissionsCount,
  acceptsPatientSubmissions,
  isDpcEligible,
}: ParticipantsListProps) {
  return (
    <div className="space-y-4" data-testid="participants-list">
      <div className="grid gap-3 sm:grid-cols-2">
        <CountCard
          icon={<Users size={16} className="text-[#5B4EC4]" />}
          label="Inscriptions"
          value={participantsCount}
          hint={
            isDpcEligible
              ? "Confirmations DPC le jour de l'événement"
              : "Inscriptions et liste d'attente"
          }
        />
        <CountCard
          icon={<Inbox size={16} className="text-[#2BA89C]" />}
          label="Dossiers soumis"
          value={patientSubmissionsCount}
          hint={
            acceptsPatientSubmissions
              ? "Pattern A.2 — RCP élargie"
              : "Non activé pour cet événement"
          }
          muted={!acceptsPatientSubmissions}
        />
      </div>

      <div className="rounded-md border border-[#E8ECF4] bg-[#FAFAF8] px-4 py-3 flex items-start gap-2">
        <Info size={14} className="text-[#6B7280] mt-0.5 shrink-0" />
        <p className="text-xs text-[#6B7280] leading-relaxed">
          La liste nominative des inscrits et des dossiers soumis sera disponible
          dans une prochaine itération. En attendant, les compteurs ci-dessus
          reflètent l&apos;état temps réel des inscriptions (RSVP) et des soumissions
          de dossiers (Pattern A.2 — RCP élargie).
        </p>
      </div>
    </div>
  );
}

function CountCard({
  icon,
  label,
  value,
  hint,
  muted = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-[#E8ECF4] p-4 ${
        muted ? "bg-[#FAFAF8] opacity-70" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span
          className="text-xs font-medium text-[#374151]"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-2xl font-bold text-[#0F172A]"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {value}
      </div>
      {hint && <p className="mt-1 text-[11px] text-[#6B7280]">{hint}</p>}
    </div>
  );
}
