"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type PatientAppointment, type PatientCareCaseSummary, type SwitchableProfile } from "@/lib/api";
import { computeTab, type AppointmentTab } from "@/lib/appointment-status";
import { getProviderName } from "@/lib/appointment-helpers";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProfileSwitcher } from "@/components/patient/ProfileSwitcher";
import { CancelAppointmentModal } from "@/components/patient/CancelAppointmentModal";
import { usePatientAppointmentRequests } from "@/hooks/usePatientAppointmentRequests";
import { useWithdrawAppointmentRequest } from "@/hooks/useWithdrawAppointmentRequest";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { RdvHeroCard } from "./_components/RdvHeroCard";
import { RdvStatusTabs } from "./_components/RdvStatusTabs";
import { RdvEmptyState } from "./_components/RdvEmptyState";
import { DemandeCard } from "./_components/DemandeCard";
import { AppointmentsCareCaseSection } from "./_components/AppointmentsCareCaseSection";
import { AppointmentsOrphanSection } from "./_components/AppointmentsOrphanSection";

const VALID_TABS: AppointmentTab[] = ["upcoming", "pending", "past", "cancelled"];

function parseTab(raw: string | null): AppointmentTab {
  if (raw && (VALID_TABS as string[]).includes(raw)) return raw as AppointmentTab;
  return "upcoming";
}

/**
 * Filtre les RDV pour ne garder que ceux du tab actif, en respectant le mapping
 * `computeTab` de la lib (upcoming / past / cancelled). Utilisé pour ne pas
 * dupliquer les sous-blocs dans une vue déjà filtrée par tab.
 */
function filterByTab(items: PatientAppointment[], tab: AppointmentTab): PatientAppointment[] {
  return items.filter((a) => computeTab(a) === tab);
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

  // ── Parcours actifs du patient — pour le groupement V1-RENDEZ-VOUS-CARECASE-GROUPING
  // Pour le self uniquement (les délégués accèdent à leurs propres parcours,
  // pas ceux du patient cible). Si délégué, on retombe sur la liste plate
  // façon "hors parcours" via AppointmentsOrphanSection.
  const isSelfProfile = currentProfile?.isSelf ?? true;
  const { data: careCases } = usePatientCareCases();

  // ── Demandes de RDV PENDING (tab « En attente » — CC #89 PR #74) ──────────
  const requestsQueryParams = useMemo(
    () => ({
      status: "pending" as const,
      onBehalfOf: isSelfProfile ? undefined : effectiveProfileId ?? undefined,
    }),
    [isSelfProfile, effectiveProfileId],
  );
  const { data: pendingRequests, isLoading: isLoadingRequests } =
    usePatientAppointmentRequests(requestsQueryParams);
  const withdrawMutation = useWithdrawAppointmentRequest();

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

  // Compteurs pour les badges des tabs.
  const tabCounts: Record<AppointmentTab, number> = useMemo(
    () => ({
      upcoming: upcomingList.length,
      pending: pendingRequests?.length ?? 0,
      past: pastList.length,
      cancelled: cancelledList.length,
    }),
    [
      upcomingList.length,
      pendingRequests?.length,
      pastList.length,
      cancelledList.length,
    ],
  );

  function refreshAppointments() {
    queryClient.invalidateQueries({ queryKey: ["patient-appointments", effectiveProfileId] });
  }

  const heroAppointment = activeTab === "upcoming" ? upcomingList[0] ?? null : null;
  const upcomingRest = heroAppointment ? upcomingList.slice(1) : upcomingList;
  const profileFirstName =
    currentProfile && !currentProfile.isSelf ? currentProfile.firstName : undefined;

  // ── V1-RENDEZ-VOUS-CARECASE-GROUPING ─────────────────────────────────────
  // Groupement par CareCase pour le tab actif (upcoming / past / cancelled).
  // Le hero "upcoming" (1er RDV) reste hors groupement pour préserver la
  // mise en avant existante (PR #87).
  const groupedSections = useMemo(() => {
    if (activeTab === "pending") {
      return { perCase: [], orphans: [] as PatientAppointment[] };
    }

    // RDV à afficher dans le tab actif : on retire le hero quand on est
    // sur "upcoming" pour éviter les doublons (le hero reste rendu à part).
    const baseList =
      activeTab === "upcoming"
        ? upcomingRest
        : activeTab === "past"
          ? pastList
          : cancelledList;

    // Index pour les sous-blocs : le tab est déjà filtré, mais on reconstruit
    // les 3 sous-listes pour respecter la signature de la section (filtrer
    // ré-applique computeTab par sécurité — idempotent).
    const upcomingForGroup = filterByTab(baseList, "upcoming");
    const pastForGroup = filterByTab(baseList, "past");
    const cancelledForGroup = filterByTab(baseList, "cancelled");

    const byCase = new Map<string, PatientAppointment[]>();
    const orphans: PatientAppointment[] = [];
    for (const appt of baseList) {
      const cid = appt.careCaseId;
      if (cid) {
        const arr = byCase.get(cid) ?? [];
        arr.push(appt);
        byCase.set(cid, arr);
      } else {
        orphans.push(appt);
      }
    }

    // Order = ordre des CareCases ACTIVE (startDate desc côté hook), filtrés
    // sur ceux qui ont au moins 1 RDV. Les CareCases inconnus restent en
    // orphans (sécurité : un RDV avec careCaseId d'un CareCase non ACTIVE).
    const perCase: Array<{
      careCase: PatientCareCaseSummary;
      appointments: PatientAppointment[];
      upcoming: PatientAppointment[];
      past: PatientAppointment[];
      cancelled: PatientAppointment[];
    }> = [];
    const knownCaseIds = new Set<string>();
    for (const cc of careCases ?? []) {
      const items = byCase.get(cc.id);
      if (items && items.length > 0) {
        knownCaseIds.add(cc.id);
        perCase.push({
          careCase: cc,
          appointments: items,
          upcoming: items.filter((a) => upcomingForGroup.includes(a)),
          past: items.filter((a) => pastForGroup.includes(a)),
          cancelled: items.filter((a) => cancelledForGroup.includes(a)),
        });
      }
    }
    // Sécurité : tout RDV pointant vers un CareCase non listé bascule orphan.
    for (const [cid, items] of byCase.entries()) {
      if (!knownCaseIds.has(cid)) {
        for (const it of items) orphans.push(it);
      }
    }

    return {
      perCase,
      orphans,
      orphansUpcoming: filterByTab(orphans, "upcoming"),
      orphansPast: filterByTab(orphans, "past"),
      orphansCancelled: filterByTab(orphans, "cancelled"),
    };
  }, [activeTab, upcomingRest, pastList, cancelledList, careCases]);

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
              {(groupedSections.perCase.length > 0 ||
                (groupedSections.orphans?.length ?? 0) > 0) && (
                <ScrollReveal variant="fade-up" delay={0.1} duration={0.5}>
                  <div className="space-y-10">
                    {groupedSections.perCase.map((g) => (
                      <AppointmentsCareCaseSection
                        key={g.careCase.id}
                        careCase={g.careCase}
                        appointments={g.appointments}
                        upcoming={g.upcoming}
                        past={g.past}
                        cancelled={g.cancelled}
                        onCancel={(appt) => setCancelTarget(appt)}
                      />
                    ))}
                    {(groupedSections.orphans?.length ?? 0) > 0 && (
                      <AppointmentsOrphanSection
                        appointments={groupedSections.orphans ?? []}
                        upcoming={groupedSections.orphansUpcoming ?? []}
                        past={groupedSections.orphansPast ?? []}
                        cancelled={groupedSections.orphansCancelled ?? []}
                        onCancel={(appt) => setCancelTarget(appt)}
                      />
                    )}
                  </div>
                </ScrollReveal>
              )}
              {upcomingList.length === 0 && (
                <RdvEmptyState variant="upcoming" profileFirstName={profileFirstName} />
              )}
            </>
          )}

          {activeTab === "pending" && (
            <>
              {isLoadingRequests ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    className="animate-spin text-[var(--nami-primary)]"
                    size={22}
                  />
                </div>
              ) : (pendingRequests?.length ?? 0) === 0 ? (
                <RdvEmptyState variant="pending" profileFirstName={profileFirstName} />
              ) : (
                <ScrollReveal variant="fade-up" duration={0.5}>
                  <div className="space-y-3">
                    {pendingRequests!.map((req) => (
                      <DemandeCard
                        key={req.id}
                        request={req}
                        onWithdraw={(id) => withdrawMutation.mutate({ id })}
                        isWithdrawing={
                          withdrawMutation.isPending &&
                          withdrawMutation.variables?.id === req.id
                        }
                      />
                    ))}
                  </div>
                </ScrollReveal>
              )}
            </>
          )}

          {activeTab === "past" && (
            <>
              {pastList.length === 0 ? (
                <RdvEmptyState variant="past" profileFirstName={profileFirstName} />
              ) : (
                <ScrollReveal variant="fade-up" duration={0.5}>
                  <div className="space-y-10">
                    {groupedSections.perCase.map((g) => (
                      <AppointmentsCareCaseSection
                        key={g.careCase.id}
                        careCase={g.careCase}
                        appointments={g.appointments}
                        upcoming={g.upcoming}
                        past={g.past}
                        cancelled={g.cancelled}
                      />
                    ))}
                    {(groupedSections.orphans?.length ?? 0) > 0 && (
                      <AppointmentsOrphanSection
                        appointments={groupedSections.orphans ?? []}
                        upcoming={groupedSections.orphansUpcoming ?? []}
                        past={groupedSections.orphansPast ?? []}
                        cancelled={groupedSections.orphansCancelled ?? []}
                      />
                    )}
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
                  <div className="space-y-10">
                    {groupedSections.perCase.map((g) => (
                      <AppointmentsCareCaseSection
                        key={g.careCase.id}
                        careCase={g.careCase}
                        appointments={g.appointments}
                        upcoming={g.upcoming}
                        past={g.past}
                        cancelled={g.cancelled}
                      />
                    ))}
                    {(groupedSections.orphans?.length ?? 0) > 0 && (
                      <AppointmentsOrphanSection
                        appointments={groupedSections.orphans ?? []}
                        upcoming={groupedSections.orphansUpcoming ?? []}
                        past={groupedSections.orphansPast ?? []}
                        cancelled={groupedSections.orphansCancelled ?? []}
                      />
                    )}
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
