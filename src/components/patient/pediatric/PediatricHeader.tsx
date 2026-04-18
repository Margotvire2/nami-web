"use client";

import { differenceInMonths, differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PediatricProfile } from "./types";
import { Baby, Ruler, Weight, Circle } from "lucide-react";

interface Props {
  profile: PediatricProfile;
}

function ageLabel(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = differenceInMonths(now, birth);
  if (months < 1) {
    const days = differenceInDays(now, birth);
    return `${days} jour${days > 1 ? "s" : ""}`;
  }
  if (months < 24) return `${months} mois`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} ans ${rem} mois` : `${years} ans`;
}

const STATUS_COLOR: Record<string, string> = {
  PENDING_VALIDATION: "text-amber-500",
  VALIDATED: "text-emerald-600",
  REJECTED: "text-red-500",
};

export function PediatricHeader({ profile }: Props) {
  const age = ageLabel(profile.birthDate);
  const { weight, height, headCircumference } = profile.recentMeasurements;

  return (
    <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5 space-y-4">
      {/* Ligne 1 — identité */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#5B4EC4]/10 flex items-center justify-center">
          <Baby size={20} className="text-[#5B4EC4]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1A1A2E]">{age}</p>
          <p className="text-xs text-[#8A8A96]">
            Né(e) le {format(new Date(profile.birthDate), "d MMMM yyyy", { locale: fr })}
            {profile.gestationalWeeks ? ` · ${profile.gestationalWeeks} SA` : ""}
            {profile.sex === "MALE" ? " · Garçon" : " · Fille"}
          </p>
        </div>
      </div>

      {/* Ligne 2 — mesures récentes */}
      <div className="grid grid-cols-3 gap-3">
        <MeasureCard
          label="Poids"
          value={weight ? `${weight.value.toFixed(2)} kg` : "—"}
          date={weight?.effectiveAt}
          status={weight?.reconStatus}
          icon={<Weight size={14} />}
        />
        <MeasureCard
          label="Taille"
          value={height ? `${height.value.toFixed(1)} cm` : "—"}
          date={height?.effectiveAt}
          status={height?.reconStatus}
          icon={<Ruler size={14} />}
        />
        <MeasureCard
          label="PC"
          value={headCircumference ? `${headCircumference.value.toFixed(1)} cm` : "—"}
          date={headCircumference?.effectiveAt}
          status={headCircumference?.reconStatus}
          icon={<Circle size={14} />}
        />
      </div>

      {/* Ligne 3 — infos naissance */}
      {(profile.birthWeight || profile.apgarScore1 != null || profile.targetHeight) && (
        <div className="flex flex-wrap gap-4 pt-1 border-t border-[rgba(26,26,46,0.04)] text-xs text-[#4A4A5A]">
          {profile.birthWeight && <span>Poids naiss. <strong>{profile.birthWeight} g</strong></span>}
          {profile.apgarScore1 != null && (
            <span>Apgar <strong>{profile.apgarScore1}/{profile.apgarScore5 ?? "—"}</strong></span>
          )}
          {profile.targetHeight && (
            <span>Taille cible <strong>{profile.targetHeight} cm</strong></span>
          )}
          {profile.vitaminKGiven && <span className="text-emerald-600">Vit. K ✓</span>}
          {profile.vitaminDStarted && <span className="text-emerald-600">Vit. D ✓</span>}
        </div>
      )}
    </div>
  );
}

function MeasureCard({
  label,
  value,
  date,
  status,
  icon,
}: {
  label: string;
  value: string;
  date?: string;
  status?: string | null;
  icon: React.ReactNode;
}) {
  const statusClass = status ? (STATUS_COLOR[status] ?? "text-[#4A4A5A]") : "text-[#4A4A5A]";
  return (
    <div className="bg-[#FAFAF8] rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-1 text-xs text-[#8A8A96]">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-sm font-semibold ${statusClass}`}>{value}</p>
      {date && (
        <p className="text-[10px] text-[#8A8A96]">
          {format(new Date(date), "d MMM yy", { locale: fr })}
          {status === "PENDING_VALIDATION" && (
            <span className="ml-1 text-amber-500">· à vérifier</span>
          )}
        </p>
      )}
    </div>
  );
}
