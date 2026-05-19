"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { startOfWeek, endOfWeek, addWeeks } from "date-fns"
import {
  appointmentsApi, locationsApi, absencesApi, careCasesApi,
  type ConsultationTypeDTO, type AvailabilitySlotDTO,
  type ConsultationLocation, type AgendaAbsence, type CareCase,
  type AppointmentCancelReason, type RescheduleSource,
} from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { useState, useEffect, useMemo } from "react"

// ── Types ───────────────────────────────────────────────────────────────────

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "PATIENT_ARRIVED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "ABSENCE"
export type GroupByMode = "day" | "location"

export interface AgendaAppointment {
  id: string
  careCaseId: string | null
  startAt: string
  endAt: string
  status: AppointmentStatus
  locationType: "IN_PERSON" | "VIDEO" | "PHONE"
  isFirstConsultation: boolean
  notes: string | null
  bookingSource?: string
  referralId?: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    birthDate?: string
    phone?: string
    email?: string
  }
  provider: { person: { firstName: string; lastName: string } }
  consultationType: { id?: string; name: string; durationMinutes: number; color?: string } | null
  location: { id: string; name: string; color: string | null; locationType: string; address: string | null; city: string | null } | null
}

export interface AgendaPatient {
  id: string
  firstName: string
  lastName: string
  birthDate?: string
  phone?: string
  email?: string
}

export interface CareHistoryEntry {
  date: string
  pro: string
  specialty: string
  type: string
  note: string
  source: "internal" | "external"
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useAgenda() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [weekOffset, setWeekOffset] = useState(0)

  const [groupByMode, setGroupByMode] = useState<GroupByMode>(() => {
    if (typeof window === "undefined") return "day"
    return (localStorage.getItem("nami-agenda-view") as GroupByMode) ?? "day"
  })

  useEffect(() => {
    localStorage.setItem("nami-agenda-view", groupByMode)
  }, [groupByMode])

  const baseDate = addWeeks(new Date(), weekOffset)
  const from = startOfWeek(baseDate, { weekStartsOn: 1 })
  const to = endOfWeek(baseDate, { weekStartsOn: 1 })
  const providerProfileId = user?.providerProfile?.id

  // ── Appointments ──────────────────────────────────────────────
  // Filter out RESCHEDULED : le service AppointmentService.reschedule (PR #29 backend)
  // crée 2 records (ancien=RESCHEDULED + nouveau=PENDING avec rescheduledFromId).
  // Sans ce filter, le DnD agenda afficherait un ghost RDV (ancien fantôme + nouveau).
  // TODO(F-AGENDA-STATUS-UNION-EXTEND P2): retirer le cast `as string` une fois
  // l'union AppointmentStatus étendue aux 6 nouveaux statuts F-G4 (RESCHEDULED,
  // IN_PROGRESS, CANCELLED_BY_PATIENT/PROVIDER/SECRETARY/SYSTEM).
  const appointmentsQ = useQuery<AgendaAppointment[]>({
    queryKey: ["agenda-appointments", user?.id, weekOffset],
    enabled: !!accessToken && !!user?.id,
    queryFn: () =>
      appointmentsApi.list(accessToken!, {
        providerId: user!.id,
        from: from.toISOString(),
        to: to.toISOString(),
      }) as Promise<AgendaAppointment[]>,
    select: (data) => data.filter((a) => (a.status as string) !== "RESCHEDULED"),
  })

  // ── Consultation types ────────────────────────────────────────
  const typesQ = useQuery<ConsultationTypeDTO[]>({
    queryKey: ["consultation-types", providerProfileId],
    enabled: !!accessToken && !!providerProfileId,
    queryFn: () => appointmentsApi.consultationTypes(accessToken!, providerProfileId!),
    staleTime: 5 * 60_000,
  })

  // ── Availability slots ────────────────────────────────────────
  const slotsQ = useQuery<AvailabilitySlotDTO[]>({
    queryKey: ["availability-slots", providerProfileId],
    enabled: !!accessToken && !!providerProfileId,
    queryFn: () => appointmentsApi.slots(accessToken!, providerProfileId!),
    staleTime: 10 * 60_000,
  })

  // ── Locations ─────────────────────────────────────────────────
  const locationsQ = useQuery<ConsultationLocation[]>({
    queryKey: ["locations"],
    enabled: !!accessToken,
    queryFn: () => locationsApi.list(accessToken!),
    staleTime: 10 * 60_000,
  })

  // ── Absences ──────────────────────────────────────────────────
  const absencesQ = useQuery<AgendaAbsence[]>({
    queryKey: ["agenda-absences"],
    enabled: !!accessToken,
    queryFn: () => absencesApi.list(accessToken!),
    staleTime: 5 * 60_000,
  })

  // ── Patients (from all care cases, not just this week's appointments) ──
  const careCasesQ = useQuery({
    queryKey: ["care-cases-for-agenda"],
    enabled: !!accessToken,
    queryFn: () => careCasesApi.list(accessToken!),
    staleTime: 5 * 60_000,
  })

  const patients = useMemo<AgendaPatient[]>(() => {
    const map = new Map<string, AgendaPatient>()
    // From care cases (all patients of this provider)
    for (const cc of (careCasesQ.data ?? []) as Array<{ patient?: { id: string; firstName: string; lastName: string; email?: string; phone?: string; birthDate?: string } }>) {
      const p = cc.patient
      if (p && !map.has(p.id)) {
        map.set(p.id, {
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          birthDate: p.birthDate,
          phone: p.phone,
          email: p.email,
        })
      }
    }
    // Also add from appointments (in case care case doesn't have full patient data)
    for (const a of appointmentsQ.data ?? []) {
      if (!map.has(a.patient.id)) {
        map.set(a.patient.id, {
          id: a.patient.id,
          firstName: a.patient.firstName,
          lastName: a.patient.lastName,
          birthDate: a.patient.birthDate,
          phone: a.patient.phone,
          email: a.patient.email,
        })
      }
    }
    return Array.from(map.values())
  }, [careCasesQ.data, appointmentsQ.data])

  // ── Build care history for a patient ──────────────────────────
  function buildCareHistory(patientId: string): CareHistoryEntry[] {
    const allAppts = appointmentsQ.data ?? []
    const patientAppts = allAppts
      .filter(a => a.patient.id === patientId && a.status !== "CANCELLED")
      .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
      .slice(0, 10)

    return patientAppts.map(a => ({
      date: new Date(a.startAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
      pro: `${a.provider.person.firstName} ${a.provider.person.lastName}`,
      specialty: "Vous",
      type: a.consultationType?.name ?? "Consultation",
      note: a.notes ?? `${a.consultationType?.name ?? "RDV"} · ${a.location?.name ?? a.locationType}`,
      source: "internal" as const,
    }))
  }

  // ── Color resolver ────────────────────────────────────────────
  function getColor(appt: AgendaAppointment): string {
    if (appt.consultationType?.id) {
      const ct = (typesQ.data ?? []).find(t => t.id === appt.consultationType!.id)
      if (ct && (ct as any).color) return (ct as any).color
    }
    const name = appt.consultationType?.name ?? ""
    const TYPE_COLORS: Record<string, string> = {
      "Première consultation": "#C4836A", "Consultation de suivi": "#7D9E85",
      "Bilan annuel": "#6B7B8D", "Bilan": "#6B7B8D", "Bilan nutritionnel": "#6B7B8D",
      "Téléconsultation suivi": "#9A8DC4", "Téléconsultation (suivi)": "#9A8DC4",
      "Téléconsultation (1ère)": "#9A8DC4", "Urgence": "#B8868E",
    }
    if (TYPE_COLORS[name]) return TYPE_COLORS[name]
    if (appt.location?.color) return appt.location.color
    return "#5B4EC4"
  }

  // ── Create ────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body: {
      patientId: string; providerId: string; locationType: "IN_PERSON" | "VIDEO" | "PHONE";
      startAt: string; endAt: string; consultationTypeId?: string;
      isFirstConsultation?: boolean; notes?: string; careCaseId?: string; locationId?: string;
    }) => appointmentsApi.create(accessToken!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-appointments"] }),
  })

  // ── Patch ─────────────────────────────────────────────────────
  const patchMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string; notes?: string; startAt?: string; endAt?: string }) =>
      appointmentsApi.patch(accessToken!, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-appointments"] }),
  })

  // ── Cycle de vie (F-G4-WIRING) ────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason, note, onBehalfOfPersonId }: {
      id: string; reason: AppointmentCancelReason; note?: string; onBehalfOfPersonId?: string;
    }) => appointmentsApi.cancel(accessToken!, id, { reason, note, onBehalfOfPersonId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-appointments"] }),
  })

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newStartAt, newEndAt, rescheduleSource, note, onBehalfOfPersonId }: {
      id: string; newStartAt: string; newEndAt: string;
      rescheduleSource: RescheduleSource; note?: string; onBehalfOfPersonId?: string;
    }) => appointmentsApi.reschedule(accessToken!, id, { newStartAt, newEndAt, rescheduleSource, note, onBehalfOfPersonId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-appointments"] }),
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.complete(accessToken!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-appointments"] }),
  })

  const noShowMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.noShow(accessToken!, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-appointments"] }),
  })

  // ── Create absence ────────────────────────────────────────────
  const absenceMutation = useMutation({
    mutationFn: (body: { label: string; startDate: string; endDate: string }) =>
      absencesApi.create(accessToken!, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agenda-absences"] })
      qc.invalidateQueries({ queryKey: ["agenda-appointments"] })
    },
  })

  return {
    weekOffset,
    prevWeek: () => setWeekOffset((w) => w - 1),
    nextWeek: () => setWeekOffset((w) => w + 1),
    goToday: () => setWeekOffset(0),
    from, to,

    groupByMode, setGroupByMode,

    appointments: appointmentsQ.data ?? [],
    isLoading: appointmentsQ.isLoading,
    isError: appointmentsQ.isError,
    consultationTypes: typesQ.data ?? [],
    slots: slotsQ.data ?? [],
    locations: locationsQ.data ?? [],
    absences: absencesQ.data ?? [],
    patients,

    getColor,
    buildCareHistory,

    createAppointment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    patchAppointment: patchMutation.mutateAsync,
    isPatching: patchMutation.isPending,
    cancelAppointment: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    rescheduleAppointment: rescheduleMutation.mutateAsync,
    isRescheduling: rescheduleMutation.isPending,
    completeAppointment: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    noShowAppointment: noShowMutation.mutateAsync,
    isMarkingNoShow: noShowMutation.isPending,
    createAbsence: absenceMutation.mutateAsync,
    isCreatingAbsence: absenceMutation.isPending,

    careCases: (careCasesQ.data ?? []) as CareCase[],
    providerId: user?.providerProfile?.id ?? "",
  }
}
