// Types partagés pour les composants pédiatriques — Sprint 1

export interface PediatricMeasurement {
  value: number;
  effectiveAt: string;
  reconStatus: string | null;
}

export interface PediatricExamination {
  id: string;
  type: string;
  label: string;
  dueDate: string;
  performedDate: string | null;
  scheduledDate: string | null;
  status: "UPCOMING" | "DUE" | "OVERDUE" | "DONE" | "SKIPPED" | "CANCELLED";
  hasTndScreening: boolean;
  notes: string | null;
}

export interface PediatricVaccination {
  id: string;
  vaccineCode: string;
  vaccineName: string;
  dueDate: string;
  administeredDate: string | null;
  status: "DUE" | "OVERDUE" | "DONE" | "DEFERRED" | "REFUSED";
  site: string | null;
  batchNumber: string | null;
  notes: string | null;
}

export interface PendingObservation {
  id: string;
  valueNumeric: number | null;
  valueText: string | null;
  effectiveAt: string;
  reconStatus: string;
  reconNote: string | null;
  metric: { key: string; label: string; unit: string | null };
  provenance: Record<string, unknown> | null;
}

export interface PediatricProfile {
  id: string;
  patientId: string;
  careCaseId: string;
  birthDate: string;
  sex: "MALE" | "FEMALE";
  birthWeight: number | null;
  birthHeight: number | null;
  birthHeadCircumference: number | null;
  gestationalWeeks: number | null;
  apgarScore1: number | null;
  apgarScore5: number | null;
  motherHeight: number | null;
  fatherHeight: number | null;
  targetHeight: number | null;
  vitaminKGiven: boolean;
  vitaminDStarted: boolean;
  diversificationStartedAt: string | null;
  recentMeasurements: {
    weight?: PediatricMeasurement;
    height?: PediatricMeasurement;
    headCircumference?: PediatricMeasurement;
  };
  examinations: PediatricExamination[];
  vaccinations: PediatricVaccination[];
  guardians: PediatricGuardian[];
}

export interface PediatricGuardian {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  isMainGuardian: boolean;
}
