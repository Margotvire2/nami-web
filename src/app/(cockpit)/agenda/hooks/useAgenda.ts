"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { startOfWeek, endOfWeek, addWeeks } from "date-fns"
import { appointmentsApi, locationsApi, type ConsultationTypeDTO, type AvailabilitySlotDTO, type ConsultationLocation } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { useState, useEffect } from "react"

// ── Types ───────────────────────────────────────────────────────────────────

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"

export type ViewMode = "day" | "location"

export interface AgendaAppointment {
  id: string
  careCaseId: string | null
  startAt: string
  endAt: string
  status: AppointmentStatus
  locationType: "IN_PERSON" | "VIDEO" | "PHONE"
  isFirstConsultation: boolean
  notes: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    birthDate?: string
    phone?: string
    email?: string
  }
  provider: { person: { firstName: string; lastName: string } }
  consultationType: { name: string; durationMinutes: number } | null
  location: { id: string; name: string; color: string | null; locationType: string; address: string | null; city: string | null } | null
}

// ── Hook ────────────────────────────────────────────────────────────────────

export function useAgenda() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [weekOffset, setWeekOffset] = useState(0)

  // View mode persisted in localStorage
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "day"
    return (localStorage.getItem("nami-agenda-view") as ViewMode) ?? "day"
  })

  useEffect(() => {
    localStorage.setItem("nami-agenda-view", viewMode)
  }, [viewMode])

  const baseDate = addWeeks(new Date(), weekOffset)
  const from = startOfWeek(baseDate, { weekStartsOn: 1 })
  const to = endOfWeek(baseDate, { weekStartsOn: 1 })

  // ── Appointments de la semaine ────────────────────────────────
  const appointmentsQ = useQuery<AgendaAppointment[]>({
    queryKey: ["agenda-appointments", user?.id, weekOffset],
    enabled: !!accessToken && !!user?.id,
    queryFn: () =>
      appointmentsApi.list(accessToken!, {
        providerId: user!.id,
        from: from.toISOString(),
        to: to.toISOString(),
      }) as Promise<AgendaAppointment[]>,
  })

  // ── Consultation types ────────────────────────────────────────
  const providerProfileId = user?.providerProfile?.id
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

  // ── Locations (lieux de consultation) ─────────────────────────
  const locationsQ = useQuery<ConsultationLocation[]>({
    queryKey: ["locations"],
    enabled: !!accessToken,
    queryFn: () => locationsApi.list(accessToken!),
    staleTime: 10 * 60_000,
  })

  // ── Create ────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (body: {
      patientId: string
      providerId: string
      locationType: "IN_PERSON" | "VIDEO" | "PHONE"
      startAt: string
      endAt: string
      consultationTypeId?: string
      isFirstConsultation?: boolean
      notes?: string
      careCaseId?: string
    }) => appointmentsApi.create(accessToken!, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-appointments"] }),
  })

  // ── Patch ─────────────────────────────────────────────────────
  const patchMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string; notes?: string; startAt?: string; endAt?: string }) =>
      appointmentsApi.patch(accessToken!, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agenda-appointments"] }),
  })

  return {
    weekOffset,
    prevWeek: () => setWeekOffset((w) => w - 1),
    nextWeek: () => setWeekOffset((w) => w + 1),
    goToday: () => setWeekOffset(0),
    from,
    to,

    viewMode,
    setViewMode,

    appointments: appointmentsQ.data ?? [],
    isLoading: appointmentsQ.isLoading,
    isError: appointmentsQ.isError,
    consultationTypes: typesQ.data ?? [],
    slots: slotsQ.data ?? [],
    locations: locationsQ.data ?? [],

    createAppointment: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    patchAppointment: patchMutation.mutateAsync,
    isPatching: patchMutation.isPending,
  }
}
