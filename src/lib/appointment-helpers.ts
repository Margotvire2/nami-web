import type { PatientAppointment } from "@/lib/api";

/**
 * Helpers de calcul d'affichage pour PatientAppointment.
 *
 * Évite d'avoir à demander au backend des champs computed comme `providerName`
 * et `locationLabel` (V1 — voir ticket F-PATIENT-APPOINTMENT-COMPUTED-FIELDS
 * P3 pour exposition côté backend plus tard).
 */

export function getProviderName(appt: PatientAppointment): string {
  const p = appt.provider?.person;
  if (!p) return "Soignant";
  const first = p.firstName?.trim() ?? "";
  const last = p.lastName?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  return full || "Soignant";
}

export function getLocationLabel(appt: PatientAppointment): string {
  if (appt.locationType === "TELECONSULTATION" || appt.locationType === "VIDEO") {
    return "Téléconsultation";
  }
  if (appt.locationType === "PHONE") {
    return "Téléphone";
  }
  return appt.location?.name?.trim() || "Cabinet";
}
