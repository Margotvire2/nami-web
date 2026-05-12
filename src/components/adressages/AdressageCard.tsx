"use client";

/**
 * AdressageCard — glass-soft rounded-xl.
 * Card de liste pour un adressage, pattern inspiré de ResultCard (cockpit RAG).
 *
 * Variante EMERGENCY : border-l 3px rouge + léger dégradé wash pour signaler
 * visuellement l'urgence clinique. Le PriorityPill SOLID est toujours présent
 * (la couleur de la card n'est qu'un renforcement, jamais un substitut).
 */

import type { Referral } from "@/lib/api";
import { Calendar, ChevronRight } from "lucide-react";
import { PriorityPill } from "./PriorityPill";
import { StatusBadge } from "./StatusBadge";
import { ConsentChip } from "./ConsentChip";
import {
  daysAgo,
  patientName,
  targetProviderName,
  targetSpecialty,
  truncateMotif,
} from "./_utils";
import { cn } from "@/lib/utils";

interface AdressageCardProps {
  referral: Referral;
  onClick: (referral: Referral) => void;
  className?: string;
}

export function AdressageCard({ referral, onClick, className }: AdressageCardProps) {
  const isEmergency = referral.priority === "EMERGENCY";
  const specialty = targetSpecialty(referral);
  const motif = truncateMotif(referral.clinicalReason ?? "");

  return (
    <button
      type="button"
      onClick={() => onClick(referral)}
      className={cn(
        "group w-full text-left",
        "glass-soft rounded-xl px-5 py-4",
        "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:bg-white/60 hover:-translate-y-px hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40",
        isEmergency && [
          "border-l-[3px] border-l-[#D14545]",
          "bg-gradient-to-r from-[#FCE9E9]/40 to-transparent",
        ],
        className,
      )}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
        {/* Colonne 1 : priorité */}
        <div className="pt-0.5">
          <PriorityPill priority={referral.priority} />
        </div>

        {/* Colonne 2 : patient + destinataire + motif */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#1A1A2E] truncate">
              {patientName(referral)}
            </span>
            <StatusBadge status={referral.status} />
          </div>
          <div className="text-sm text-[#4A4A5A] truncate mt-1">
            <span aria-hidden="true">→ </span>
            {targetProviderName(referral)}
            {specialty && (
              <span className="text-[#8A8A96]"> · {specialty}</span>
            )}
          </div>
          {motif && (
            <p className="text-sm text-[#4A4A5A] mt-1.5 line-clamp-2">{motif}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <ConsentChip hasConsent={null} />
            {referral.desiredAppointmentDate && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#8A8A96] font-mono">
                <Calendar className="size-3" />
                {new Date(referral.desiredAppointmentDate).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>

        {/* Colonne 3 : date + chevron */}
        <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
          <span className="text-[11px] text-[#8A8A96] font-mono">
            {daysAgo(referral.createdAt)}
          </span>
          <ChevronRight
            className="size-4 text-[#8A8A96] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  );
}
