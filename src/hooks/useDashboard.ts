"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store"
import { appointmentsApi } from "@/lib/api"
import { startOfDay, endOfDay, format, differenceInMinutes } from "date-fns"
import { fr } from "date-fns/locale"

// ── Types exposés au composant ─────────────────────────────────────────────

export type ConsultationStatus = "past" | "next" | "upcoming"
export type ConsultationType = "suivi" | "premiere" | "teleconsult"

export interface DashboardConsultation {
  id: string
  time: string
  patient: string
  patientId: string
  careCaseId: string | null
  initials: string
  type: ConsultationType
  typeLabel: string
  duration: string
  mode: string
  status: ConsultationStatus
  detail: {
    age: number
    dob: string
    phone: string
    email: string
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function deriveType(apt: { locationType?: string; isFirstConsultation?: boolean }): ConsultationType {
  if (apt.isFirstConsultation) return "premiere"
  if (apt.locationType === "VIDEO" || apt.locationType === "PHONE") return "teleconsult"
  return "suivi"
}

function deriveTypeLabel(type: ConsultationType): string {
  return {
    suivi: "Suivi",
    premiere: "1ère consultation",
    teleconsult: "Téléconsultation",
  }[type]
}

function toInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase()
}

function computeAge(dob: string | null): number {
  if (!dob) return 0
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

function formatDuration(startAt: string, endAt: string): string {
  const mins = differenceInMinutes(new Date(endAt), new Date(startAt))
  if (mins >= 60) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`
  }
  return `${mins}min`
}

function formatTime(startAt: string): string {
  return format(new Date(startAt), "HH:mm", { locale: fr })
}

function modeLabel(locationType: string): string {
  if (locationType === "VIDEO") return "Téléconsultation"
  if (locationType === "PHONE") return "Téléphone"
  return "Présentiel"
}

// ── Mapping API → DashboardConsultation ───────────────────────────────────

interface ApiAppointment {
  id: string
  careCaseId: string | null
  startAt: string
  endAt: string
  status: string
  locationType: string
  isFirstConsultation: boolean
  notes: string | null
  patient: { id: string; firstName: string; lastName: string; birthDate?: string; phone?: string; email?: string }
  provider: { person: { firstName: string; lastName: string } }
  consultationType: { name: string; durationMinutes: number } | null
}

function mapAppointments(dtos: ApiAppointment[]): DashboardConsultation[] {
  const sorted = [...dtos].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  )

  const now = new Date()
  let nextAssigned = false

  return sorted.map((dto) => {
    const start = new Date(dto.startAt)
    const end = new Date(dto.endAt)
    const isPast = end < now
    const isCurrent = start <= now && end >= now

    let status: ConsultationStatus
    if (isPast) {
      status = "past"
    } else if (isCurrent || !nextAssigned) {
      status = "next"
      nextAssigned = true
    } else {
      status = "upcoming"
    }

    const type = deriveType(dto)

    return {
      id: dto.id,
      time: formatTime(dto.startAt),
      patient: `${dto.patient.firstName} ${dto.patient.lastName}`,
      patientId: dto.patient.id,
      careCaseId: dto.careCaseId ?? null,
      initials: toInitials(dto.patient.firstName, dto.patient.lastName),
      type,
      typeLabel: dto.consultationType?.name ?? deriveTypeLabel(type),
      duration: formatDuration(dto.startAt, dto.endAt),
      mode: modeLabel(dto.locationType),
      status,
      detail: {
        age: dto.patient.birthDate ? computeAge(dto.patient.birthDate) : 0,
        dob: dto.patient.birthDate ? format(new Date(dto.patient.birthDate), "dd/MM/yyyy") : "—",
        phone: dto.patient.phone ?? "—",
        email: dto.patient.email ?? "—",
      },
    }
  })
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useDashboard(date = new Date()) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const personId = useAuthStore((s) => s.user?.id)

  const from = startOfDay(date).toISOString()
  const to = endOfDay(date).toISOString()

  const {
    data: consultations = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-appointments", personId, from],
    queryFn: async () => {
      if (!accessToken || !personId) return []
      const dtos = await appointmentsApi.list(accessToken, {
        providerId: personId,
        from,
        to,
      })
      return mapAppointments(dtos as ApiAppointment[])
    },
    enabled: !!accessToken && !!personId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })

  const nextConsultation = consultations.find((c) => c.status === "next")
  const pastCount = consultations.filter((c) => c.status === "past").length
  const remainingCount = consultations.filter((c) => c.status !== "past").length

  return {
    consultations,
    nextConsultation,
    pastCount,
    remainingCount,
    totalToday: consultations.length,
    isLoading,
    isError,
    refetch,
  }
}
