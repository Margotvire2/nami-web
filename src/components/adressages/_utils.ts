/**
 * Helpers réutilisables pour la refonte /adressages.
 * Pattern extrait de l'ancienne page monolithique (625 lignes → composants).
 */

import type { Referral } from "@/lib/api";

/**
 * Retourne "il y a 3 j" / "il y a 2 h" / "à l'instant" depuis un ISO.
 */
export function daysAgo(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const ms = now.getTime() - date.getTime();
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours} h`;
  if (days < 7) return `il y a ${days} j`;
  if (days < 30) return `il y a ${Math.floor(days / 7)} sem.`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

/**
 * Nom du soignant destinataire (ou de la spécialité préférée si POOL).
 */
export function targetProviderName(ref: Referral): string {
  if (ref.targetProvider?.person) {
    const { firstName, lastName } = ref.targetProvider.person;
    return `Dr ${firstName} ${lastName}`.trim();
  }
  if (ref.preferredSpecialty) return ref.preferredSpecialty;
  return "Destinataire à définir";
}

/**
 * Spécialité du destinataire (ou specialty préférée si POOL).
 */
export function targetSpecialty(ref: Referral): string | null {
  const specs = ref.targetProvider?.specialties;
  if (specs && specs.length > 0) return specs[0];
  return ref.preferredSpecialty;
}

/**
 * Nom de l'envoyeur (sender).
 */
export function senderName(ref: Referral): string {
  if (!ref.sender) return "—";
  return `${ref.sender.firstName} ${ref.sender.lastName}`.trim();
}

/**
 * Nom du patient depuis careCase (pas exposé directement sur Referral).
 */
export function patientName(ref: Referral): string {
  const p = ref.careCase?.patient;
  if (!p) return "Patient inconnu";
  return `${p.lastName.toUpperCase()} ${p.firstName}`.trim();
}

/**
 * Initiales (2 lettres max) à partir d'un nom complet.
 */
export function initials(name: string): string {
  const parts = name
    .replace(/^Dr\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Tronque le motif clinique à N caractères (default 180) avec ellipsis.
 */
export function truncateMotif(text: string, maxLen = 180): string {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + "…";
}

/**
 * Date de naissance formatée FR (ou null si absente).
 */
export function formatBirthDate(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("fr-FR");
  } catch {
    return null;
  }
}

/**
 * Search match : retourne true si une des chaînes de l'objet matche q (case-insensitive).
 */
export function matchesSearch(ref: Referral, q: string): boolean {
  if (!q) return true;
  const haystack = [
    patientName(ref),
    targetProviderName(ref),
    senderName(ref),
    targetSpecialty(ref),
    ref.clinicalReason,
    ref.personalMessage,
    ref.urgencyNote,
    ref.preferredZone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(q.toLowerCase());
}
