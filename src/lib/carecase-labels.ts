/**
 * Transformation frontend des noms de CareCase pour l'espace patient.
 *
 * PatientCareCaseSummary.caseTitle contient le libellé clinique interne
 * (ex. "Suivi TCA anorexie mentale restrictive") — jamais montré au patient.
 * PatientCareCaseHubInfo.patientFacingTitle est déjà clean côté backend
 * (computePatientFacingTitle, PR backend #93) — ne passe pas par ici.
 */
export function formatCareCaseLabel(_rawName: string | null | undefined): string {
  return "Mon parcours de soins";
}
