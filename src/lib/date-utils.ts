import { format, formatDistanceToNow, parseISO, isValid } from "date-fns"
import { fr } from "date-fns/locale"

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "—"
  return format(d, "d MMMM yyyy", { locale: fr })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "—"
  return format(d, "d MMM yyyy 'à' HH:mm", { locale: fr })
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "—"
  return format(d, "d MMM", { locale: fr })
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? parseISO(date) : date
  if (!isValid(d)) return "—"
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

export function formatAge(birthDate: string | Date | null | undefined): string {
  if (!birthDate) return ""
  const d = typeof birthDate === "string" ? parseISO(birthDate) : birthDate
  if (!isValid(d)) return ""
  const now = new Date()
  const years = now.getFullYear() - d.getFullYear()
  const months = now.getMonth() - d.getMonth()
  if (years < 2) {
    const totalMonths = years * 12 + months
    return totalMonths <= 0 ? "< 1 mois" : `${totalMonths} mois`
  }
  return `${years} ans`
}
