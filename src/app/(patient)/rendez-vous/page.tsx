"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointment, type SwitchableProfile } from "@/lib/api";
import { STATUS_CFG, type AppointmentStatus } from "@/lib/appointment-status";
import { getProviderName } from "@/lib/appointment-helpers";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProfileSwitcher } from "@/components/patient/ProfileSwitcher";
import { CancelAppointmentModal } from "@/components/patient/CancelAppointmentModal";
import { AppointmentCard } from "@/components/patient/AppointmentCard";

export default function RendezVousPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PatientAppointment | null>(null);

  // ── Profils consultables (self + délégations actives) ─────────────────────
  const { data: profiles } = useQuery<SwitchableProfile[]>({
    queryKey: ["patient-switchable-profiles"],
    queryFn: () => apiWithToken(accessToken!).patient.switchableProfiles(),
    enabled: !!accessToken,
  });

  // Auto-sélection du profil "self" au 1er chargement
  const effectiveProfileId = useMemo(() => {
    if (currentProfileId) return currentProfileId;
    const self = profiles?.find((p) => p.isSelf);
    return self?.personId ?? null;
  }, [currentProfileId, profiles]);

  const currentProfile = profiles?.find((p) => p.personId === effectiveProfileId);

  // ── RDV du profil actif ────────────────────────────────────────────────────
  const { data: appointments, isLoading } = useQuery<PatientAppointment[]>({
    queryKey: ["patient-appointments", effectiveProfileId],
    queryFn: () => {
      const isSelf = currentProfile?.isSelf ?? true;
      return apiWithToken(accessToken!).patient.appointments.list({
        status: "all",
        onBehalfOf: isSelf ? undefined : effectiveProfileId!,
      });
    },
    enabled: !!accessToken && !!effectiveProfileId,
  });

  // ── Tri Active / Passés (utilise STATUS_CFG.isPast) ───────────────────────
  const { upcoming, past } = useMemo(() => {
    const list = appointments ?? [];
    const upcomingArr: PatientAppointment[] = [];
    const pastArr: PatientAppointment[] = [];
    for (const appt of list) {
      const cfg = STATUS_CFG[appt.status as AppointmentStatus];
      if (cfg?.isPast) pastArr.push(appt);
      else upcomingArr.push(appt);
    }
    upcomingArr.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    pastArr.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
    return { upcoming: upcomingArr, past: pastArr };
  }, [appointments]);

  function refreshAppointments() {
    queryClient.invalidateQueries({ queryKey: ["patient-appointments", effectiveProfileId] });
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8 min-h-screen bg-[var(--nami-bg)]">
      <h1 className="text-3xl font-bold text-[var(--nami-dark)] tracking-tight">
        Mes rendez-vous
      </h1>

      {profiles && profiles.length > 1 && effectiveProfileId && (
        <ProfileSwitcher
          profiles={profiles}
          currentPersonId={effectiveProfileId}
          onSwitch={setCurrentProfileId}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[var(--nami-primary)]" size={22} />
        </div>
      ) : (
        <>
          <ScrollReveal variant="fade-up" duration={0.5}>
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[var(--nami-dark)]">
                À venir ({upcoming.length})
              </h2>
              {upcoming.length === 0 ? (
                <EmptyMessage
                  message="Aucun rendez-vous à venir"
                  hint="Contactez votre soignant pour planifier un nouveau RDV."
                />
              ) : (
                <div className="space-y-3">
                  {upcoming.map((appt) => (
                    <AppointmentCard
                      key={appt.id}
                      appointment={appt}
                      onCancel={() => setCancelTarget(appt)}
                    />
                  ))}
                </div>
              )}
            </section>
          </ScrollReveal>

          {past.length > 0 && (
            <ScrollReveal variant="fade-up" delay={0.1} duration={0.5}>
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[var(--nami-dark)]">
                  Passés ({past.length})
                </h2>
                <div className="space-y-3">
                  {past.map((appt) => (
                    <AppointmentCard key={appt.id} appointment={appt} />
                  ))}
                </div>
              </section>
            </ScrollReveal>
          )}
        </>
      )}

      {cancelTarget && currentProfile && (
        <CancelAppointmentModal
          appointment={{
            ...cancelTarget,
            providerName: getProviderName(cancelTarget),
            onBehalfOfName: currentProfile.isSelf ? undefined : currentProfile.firstName,
            onBehalfOf: currentProfile.isSelf ? undefined : currentProfile.personId,
          }}
          open={!!cancelTarget}
          onOpenChange={(open) => !open && setCancelTarget(null)}
          onSuccess={() => {
            refreshAppointments();
            setCancelTarget(null);
          }}
        />
      )}
    </main>
  );
}

function EmptyMessage({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="text-center py-12 px-6 bg-white/50 rounded-2xl border border-[var(--nami-border)]">
      <Calendar size={32} className="mx-auto mb-3 text-[var(--nami-text-muted)] opacity-50" />
      <p className="text-sm text-[var(--nami-text-muted)]">{message}</p>
      {hint && <p className="text-xs text-[var(--nami-text-muted)]/70 mt-2">{hint}</p>}
    </div>
  );
}
