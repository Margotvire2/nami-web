/**
 * Helpers de calcul d'âge depuis une date de naissance ISO.
 */

/**
 * Retourne l'âge en années entières depuis une date ISO (ou null si non fourni).
 * Exemple : "2016-03-15" → 10 (en mai 2026).
 */
export function computeAge(birthDateIso: string | null | undefined, now: Date = new Date()): number | null {
  if (!birthDateIso) return null;
  const birth = new Date(birthDateIso);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
