"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointment, type SwitchableProfile } from "@/lib/api";
import { computeTab, type AppointmentTab } from "@/lib/appointment-status";
import { getProviderName } from "@/lib/appointment-helpers";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProfileSwitcher } from "@/components/patient/ProfileSwitcher";
import { CancelAppointmentModal } from "@/components/patient/CancelAppointmentModal";
import { AppointmentCard } from "@/components/patient/AppointmentCard";
import { RdvHeroCard } from "./_components/RdvHeroCard";
import { RdvStatusTabs } from "./_components/RdvStatusTabs";
import { RdvEmptyState } from "./_components/RdvEmptyState";

const VALID_TABS: AppointmentTab[] = ["upcoming", "pending", "past", "cancelled"];

function parseTab(raw: string | null): AppointmentTab {
  if (raw && (VALID_TABS as string[]).includes(raw)) return raw as AppointmentTab;
  return "upcoming";
}

export default function RendezVousPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProfileId = searchParams.get("profile");
  const activeTab = parseTab(searchParams.get("tab"));

  const setCurrentProfileId = (id: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set("profile", id);
    else params.delete("profile");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname);
  };

  const setActiveTab = (tab: AppointmentTab) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "upcoming") params.delete("tab");
    else params.set("tab", tab);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname);
  };

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

  // ── Tri par tab (upcoming / past / cancelled) — pending = AppointmentRequest, pas géré ici
  const { upcomingList, pastList, cancelledList } = useMemo(() => {
    const list = appointments ?? [];
    const upcomingArr: PatientAppointment[] = [];
    const pastArr: PatientAppointment[] = [];
    const cancelledArr: PatientAppointment[] = [];
    for (const appt of list) {
      const tab = computeTab(appt);
      if (tab === "upcoming") upcomingArr.push(appt);
      else if (tab === "past") pastArr.push(appt);
      else cancelledArr.push(appt);
    }
    upcomingArr.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    pastArr.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
    cancelledArr.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
    return { upcomingList: upcomingArr, pastList: pastArr, cancelledList: cancelledArr };
  }, [appointments]);

  // Compteurs pour les badges des tabs — pending toujours 0 en V2.1
  const tabCounts: Record<AppointmentTab, number> = useMemo(
    () => ({
      upcoming: upcomingList.length,
      pending: 0,
      past: pastList.length,
      cancelled: cancelledList.length,
    }),
    [upcomingList.length, pastList.length, cancelledList.length],
  );

  function refreshAppointments() {
    queryClient.invalidateQueries({ queryKey: ["patient-appointments", effectiveProfileId] });
  }

  const heroAppointment = activeTab === "upcoming" ? upcomingList[0] ?? null : null;
  const upcomingRest = heroAppointment ? upcomingList.slice(1) : upcomingList;
  const profileFirstName =
    currentProfile && !currentProfile.isSelf ? currentProfile.firstName : undefined;

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6 min-h-screen bg-[var(--nami-bg)]">
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

      <RdvStatusTabs counts={tabCounts} active={activeTab} onChange={setActiveTab} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[var(--nami-primary)]" size={22} />
        </div>
      ) : (
        <div
          role="tabpanel"
          id={`rdv-panel-${activeTab}`}
          aria-labelledby={`rdv-tab-${activeTab}`}
          className="space-y-6"
        >
          {activeTab === "upcoming" && (
            <>
              {heroAppointment && (
                <ScrollReveal variant="fade-up" duration={0.5}>
                  <RdvHeroCard
                    appointment={heroAppointment}
                    onCancel={() => setCancelTarget(heroAppointment)}
                  />
                </ScrollReveal>
              )}
              {upcomingRest.length > 0 && (
                <ScrollReveal variant="fade-up" delay={0.1} duration={0.5}>
                  <div className="space-y-3">
                    {upcomingRest.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        onCancel={() => setCancelTarget(appt)}
                      />
                    ))}
                  </div>
                </ScrollReveal>
              )}
              {upcomingList.length === 0 && (
                <RdvEmptyState variant="upcoming" profileFirstName={profileFirstName} />
              )}
            </>
          )}

          {activeTab === "pending" && (
            <RdvEmptyState variant="pending" profileFirstName={profileFirstName} />
          )}

          {activeTab === "past" && (
            <>
              {pastList.length === 0 ? (
                <RdvEmptyState variant="past" profileFirstName={profileFirstName} />
              ) : (
                <ScrollReveal variant="fade-up" duration={0.5}>
                  <div className="space-y-3">
                    {pastList.map((appt) => (
                      <AppointmentCard key={appt.id} appointment={appt} />
                    ))}
                  </div>
                </ScrollReveal>
              )}
            </>
          )}

          {activeTab === "cancelled" && (
            <>
              {cancelledList.length === 0 ? (
                <RdvEmptyState variant="cancelled" profileFirstName={profileFirstName} />
              ) : (
                <ScrollReveal variant="fade-up" duration={0.5}>
                  <div className="space-y-3">
                    {cancelledList.map((appt) => (
                      <AppointmentCard key={appt.id} appointment={appt} />
                    ))}
                  </div>
                </ScrollReveal>
              )}
            </>
          )}
        </div>
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
