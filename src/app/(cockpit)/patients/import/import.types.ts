// ═══════════════════════════════════════════════════════════════════════════════
// Import Doctolib → Nami — Types & mapping
// ═══════════════════════════════════════════════════════════════════════════════

/** Colonnes exactes du CSV Doctolib */
export interface DoctolibeRow {
  id: string;
  import_identifier: string;
  gender: string;                    // "M" | "F" | ""
  last_name: string;
  maiden_name: string;
  first_name: string;
  birthdate: string;                 // "DD/MM/YYYY"
  email: string;
  phone_number: string;
  secondary_phone_number: string;
  address: string;
  zipcode: string;
  city: string;
  insurance_type: string;            // "CPAM" | "AME" | "CMU" | etc.
  crucial_info: string;
  referrer: string;
  occupation: string;
  regular_doctor_name: string;
  regular_doctor_city: string;
  notes: string;
  no_notifications_for_doctor_appointment: string;  // "true" | "false"
}

/**
 * Payload envoyé à POST /patients/bulk.
 * Adapté au modèle Prisma existant :
 *   Person (firstName, lastName, email, phone, birthDate)
 *   + PatientProfile (defaults)
 *   + CareCase (caseTitle auto-généré, mainConcern, clinicalSummary)
 * Les champs supplémentaires (address, insurance…) sont stockés dans metadata.
 */
export interface PatientImportPayload {
  firstName: string;
  lastName: string;
  maidenName?: string;
  gender?: "male" | "female" | "other";
  birthDate?: string;                // ISO "YYYY-MM-DD"
  email?: string;
  phoneNumber?: string;
  secondaryPhoneNumber?: string;
  address?: string;
  zipcode?: string;
  city?: string;
  insuranceType?: string;
  crucialInfo?: string;
  referrer?: string;
  occupation?: string;
  regularDoctorName?: string;
  regularDoctorCity?: string;
  notes?: string;
  noNotifications?: boolean;
  importIdentifier?: string;
  externalId?: string;
}

export interface ImportResult {
  total: number;
  success: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

// ─── Mapping Doctolib → Nami ─────────────────────────────────────────────────

function trim(val: string | undefined | null): string {
  return (val ?? "").trim();
}

function parseDoctolibeDate(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  // DD/MM/YYYY → YYYY-MM-DD
  const parts = trimmed.split("/");
  if (parts.length !== 3) return undefined;
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return undefined;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

function mapGender(raw: string): "male" | "female" | "other" | undefined {
  const g = raw.trim().toUpperCase();
  if (g === "M") return "male";
  if (g === "F") return "female";
  if (g === "") return undefined;
  return "other";
}

export function mapDoctolibeToNami(row: DoctolibeRow): PatientImportPayload {
  const firstName = trim(row.first_name);
  const lastName = trim(row.last_name);

  if (!lastName && !firstName) {
    throw new Error("Nom et prénom requis");
  }

  return {
    firstName,
    lastName,
    maidenName: trim(row.maiden_name) || undefined,
    gender: mapGender(row.gender),
    birthDate: parseDoctolibeDate(row.birthdate),
    email: trim(row.email) || undefined,
    phoneNumber: trim(row.phone_number) || undefined,
    secondaryPhoneNumber: trim(row.secondary_phone_number) || undefined,
    address: trim(row.address) || undefined,
    zipcode: trim(row.zipcode) || undefined,
    city: trim(row.city) || undefined,
    insuranceType: trim(row.insurance_type) || undefined,
    crucialInfo: trim(row.crucial_info) || undefined,
    referrer: trim(row.referrer) || undefined,
    occupation: trim(row.occupation) || undefined,
    regularDoctorName: trim(row.regular_doctor_name) || undefined,
    regularDoctorCity: trim(row.regular_doctor_city) || undefined,
    notes: trim(row.notes) || undefined,
    noNotifications: row.no_notifications_for_doctor_appointment?.trim().toLowerCase() === "true",
    importIdentifier: trim(row.import_identifier) || undefined,
    externalId: trim(row.id) || undefined,
  };
}

// ─── Mapping fields table (pour le stepper mapping UI) ───────────────────────

export interface MappingField {
  csvKey: keyof DoctolibeRow;
  namiLabel: string;
  enabled: boolean;
}

export const DEFAULT_DOCTOLIB_MAPPING: MappingField[] = [
  { csvKey: "last_name",          namiLabel: "Nom de famille",          enabled: true },
  { csvKey: "first_name",         namiLabel: "Prénom",                  enabled: true },
  { csvKey: "birthdate",          namiLabel: "Date de naissance",       enabled: true },
  { csvKey: "email",              namiLabel: "Email",                   enabled: true },
  { csvKey: "phone_number",       namiLabel: "Téléphone principal",     enabled: true },
  { csvKey: "gender",             namiLabel: "Genre",                   enabled: true },
  { csvKey: "address",            namiLabel: "Adresse",                 enabled: true },
  { csvKey: "zipcode",            namiLabel: "Code postal",             enabled: true },
  { csvKey: "city",               namiLabel: "Ville",                   enabled: true },
  { csvKey: "insurance_type",     namiLabel: "Type d'assurance",        enabled: true },
  { csvKey: "notes",              namiLabel: "Notes cliniques",         enabled: true },
  { csvKey: "crucial_info",       namiLabel: "Informations importantes", enabled: true },
  { csvKey: "regular_doctor_name", namiLabel: "Médecin traitant",       enabled: true },
  { csvKey: "maiden_name",        namiLabel: "Nom de naissance",        enabled: true },
  { csvKey: "occupation",         namiLabel: "Profession",              enabled: true },
  { csvKey: "referrer",           namiLabel: "Adresseur",               enabled: true },
];
