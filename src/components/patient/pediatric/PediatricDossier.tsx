"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { PediatricHeader } from "./PediatricHeader";
import { PediatricExaminationTimeline } from "./PediatricExaminationTimeline";
import { PediatricVaccinationTimeline } from "./PediatricVaccinationTimeline";
import { PendingObservationsPanel } from "./PendingObservationsPanel";
import { PediatricModulePanel } from "./PediatricModulePanel";
import { PediatricParentEntries } from "./PediatricParentEntries";
import type { PediatricProfile } from "./types";
import { Loader2, Baby, Users, Layers, Smartphone } from "lucide-react";

interface Props {
  careCaseId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function PediatricDossier({ careCaseId }: Props) {
  const { accessToken } = useAuthStore();

  const { data: profile, isLoading, isError } = useQuery<PediatricProfile>({
    queryKey: ["pediatric-profile", careCaseId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/pediatric/profiles/by-care-case/${careCaseId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 404) throw new Error("not_found");
      if (!res.ok) throw new Error("error");
      return res.json() as Promise<PediatricProfile>;
    },
    enabled: !!accessToken && !!careCaseId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-[#5B4EC4]" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-8 text-center space-y-2">
        <Baby size={32} className="text-[#5B4EC4]/40 mx-auto" />
        <p className="text-sm font-medium text-[#1A1A2E]">Profil pédiatrique non configuré</p>
        <p className="text-xs text-[#8A8A96]">Le profil pédiatrique n'a pas encore été créé pour ce dossier.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header — âge + mesures */}
      <PediatricHeader profile={profile} />

      {/* Tuteurs légaux */}
      {profile.guardians.length > 0 && (
        <Section title="Tuteurs légaux" icon={<Users size={15} />}>
          <div className="space-y-2">
            {profile.guardians.map((g) => (
              <div key={g.id} className="flex items-center gap-3 py-1">
                <div className="w-7 h-7 rounded-full bg-[#5B4EC4]/10 flex items-center justify-center text-[10px] font-bold text-[#5B4EC4]">
                  {g.firstName[0]}{g.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A1A2E]">
                    {g.firstName} {g.lastName}
                    {g.isMainGuardian && <span className="ml-1 text-[10px] text-[#5B4EC4]">· Principal</span>}
                  </p>
                  <p className="text-[10px] text-[#8A8A96]">
                    {GUARDIAN_LABELS[g.relationship] ?? g.relationship}
                    {g.phone && ` · ${g.phone}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Mesures en attente de vérification */}
      <Section title="Mesures à vérifier" badge={profile.id ? undefined : undefined}>
        <PendingObservationsPanel profileId={profile.id} />
      </Section>

      {/* Examens des 0-18 ans */}
      <Section title="Examens obligatoires">
        <PediatricExaminationTimeline examinations={profile.examinations} profileId={profile.id} />
      </Section>

      {/* Calendrier vaccinal */}
      <Section title="Calendrier vaccinal 2025">
        <PediatricVaccinationTimeline vaccinations={profile.vaccinations} />
      </Section>

      {/* Saisies parent (app mobile) */}
      <Section title="Saisies parent" icon={<Smartphone size={15} />}>
        <PediatricParentEntries profileId={profile.id} />
      </Section>

      {/* Modules de spécialité */}
      <Section title="Modules de spécialité" icon={<Layers size={15} />}>
        <PediatricModulePanel profileId={profile.id} />
      </Section>
    </div>
  );
}

function Section({
  title,
  icon,
  badge,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-5 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-[#1A1A2E]">{title}</h3>
        {badge != null && badge > 0 && (
          <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const GUARDIAN_LABELS: Record<string, string> = {
  MOTHER: "Mère",
  FATHER: "Père",
  GRANDPARENT: "Grand-parent",
  FOSTER_PARENT: "Parent adoptif",
  LEGAL_GUARDIAN: "Tuteur légal",
  OTHER: "Autre",
};
