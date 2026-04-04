import type { Location, ConsultationType, Appointment, Block, TimeSlot } from "./types";

export const LOCATIONS: Location[] = [
  { id: "loc-1", name: "Cabinet Necker", type: "CABINET", color: "#4F46E5", isActive: true },
  { id: "loc-2", name: "Téléconsultation", type: "TELECONSULT", color: "#8B5CF6", isActive: true },
  { id: "loc-3", name: "CHU Necker — Endocrino", type: "HOPITAL", color: "#10B981", isActive: true },
];

export const CONSULTATION_TYPES: ConsultationType[] = [
  { id: "ct-1", name: "Première consultation", duration: 60, price: 80, color: "#10B981", textColor: "#065F46", bgColor: "#F0FDF4", borderColor: "#10B981", isActive: true },
  { id: "ct-2", name: "Consultation de suivi", duration: 30, price: 55, color: "#6366F1", textColor: "#3730A3", bgColor: "#EEF2FF", borderColor: "#6366F1", isActive: true },
  { id: "ct-3", name: "Bilan annuel complet", duration: 90, price: 120, color: "#F59E0B", textColor: "#92400E", bgColor: "#FFF7ED", borderColor: "#F59E0B", isActive: true },
  { id: "ct-4", name: "Téléconsultation suivi", duration: 20, price: 45, color: "#0EA5E9", textColor: "#0C4A6E", bgColor: "#F0F9FF", borderColor: "#0EA5E9", isActive: true },
  { id: "ct-5", name: "Urgence", duration: 15, price: 60, color: "#EF4444", textColor: "#991B1B", bgColor: "#FEF2F2", borderColor: "#EF4444", isActive: true },
];

// Helpers pour construire les dates de la semaine courante
function weekDay(dayOffset: number, hour: number, minute = 0): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(hour, minute, 0, 0);
  monday.setDate(monday.getDate() + dayOffset);
  return monday.toISOString();
}

function addMinutes(iso: string, min: number): string {
  return new Date(new Date(iso).getTime() + min * 60000).toISOString();
}

export const APPOINTMENTS: Appointment[] = [
  // ── LUNDI (5 RDV) ──
  { id: "apt-01", patient: { firstName: "Marie", lastName: "Dupont" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(0, 9, 0), endTime: weekDay(0, 9, 30), status: "DONE" },
  { id: "apt-02", patient: { firstName: "Jean", lastName: "Martin" }, consultationType: CONSULTATION_TYPES[0], location: LOCATIONS[0], startTime: weekDay(0, 10, 0), endTime: weekDay(0, 11, 0), status: "DONE" },
  { id: "apt-03", patient: { firstName: "Sophie", lastName: "Bernard" }, consultationType: CONSULTATION_TYPES[3], location: LOCATIONS[1], startTime: weekDay(0, 11, 30), endTime: weekDay(0, 11, 50), status: "DONE" },
  { id: "apt-04", patient: { firstName: "Chloé", lastName: "Fontaine" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(0, 14, 0), endTime: weekDay(0, 14, 30), status: "CONFIRMED" },
  { id: "apt-05", patient: { firstName: "Antoine", lastName: "Leroy" }, consultationType: CONSULTATION_TYPES[4], location: LOCATIONS[0], startTime: weekDay(0, 15, 0), endTime: weekDay(0, 15, 15), status: "CONFIRMED" },

  // ── MARDI (5 RDV) ──
  { id: "apt-06", patient: { firstName: "Thomas", lastName: "Petit" }, consultationType: CONSULTATION_TYPES[2], location: LOCATIONS[0], startTime: weekDay(1, 9, 0), endTime: weekDay(1, 10, 30), status: "CONFIRMED" },
  { id: "apt-07", patient: { firstName: "Claire", lastName: "Rousseau" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[2], startTime: weekDay(1, 11, 0), endTime: weekDay(1, 11, 30), status: "CONFIRMED" },
  { id: "apt-08", patient: { firstName: "Nadia", lastName: "Benali" }, consultationType: CONSULTATION_TYPES[3], location: LOCATIONS[1], startTime: weekDay(1, 14, 0), endTime: weekDay(1, 14, 20), status: "PENDING" },
  { id: "apt-09", patient: { firstName: "Hugo", lastName: "Deschamps" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(1, 15, 0), endTime: weekDay(1, 15, 30), status: "CONFIRMED" },
  { id: "apt-10", patient: { firstName: "Léa", lastName: "Marchand" }, consultationType: CONSULTATION_TYPES[0], location: LOCATIONS[0], startTime: weekDay(1, 16, 0), endTime: weekDay(1, 17, 0), status: "PENDING" },

  // ── MERCREDI (2 RDV après-midi — matin bloqué formation) ──
  { id: "apt-11", patient: { firstName: "Inès", lastName: "Faure" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[2], startTime: weekDay(2, 14, 0), endTime: weekDay(2, 14, 30), status: "CONFIRMED" },
  { id: "apt-12", patient: { firstName: "Raphaël", lastName: "Girard" }, consultationType: CONSULTATION_TYPES[3], location: LOCATIONS[1], startTime: weekDay(2, 15, 0), endTime: weekDay(2, 15, 20), status: "CONFIRMED" },

  // ── JEUDI (5 RDV) ──
  { id: "apt-13", patient: { firstName: "Marc", lastName: "Leblanc" }, consultationType: CONSULTATION_TYPES[0], location: LOCATIONS[0], startTime: weekDay(3, 9, 0), endTime: weekDay(3, 10, 0), status: "CONFIRMED" },
  { id: "apt-14", patient: { firstName: "Camille", lastName: "Noël" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(3, 10, 30), endTime: weekDay(3, 11, 0), status: "CONFIRMED" },
  { id: "apt-15", patient: { firstName: "Yasmina", lastName: "Chérif" }, consultationType: CONSULTATION_TYPES[2], location: LOCATIONS[2], startTime: weekDay(3, 11, 0), endTime: weekDay(3, 12, 30), status: "PENDING" },
  { id: "apt-16", patient: { firstName: "Paul", lastName: "Durand" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(3, 14, 30), endTime: weekDay(3, 15, 0), status: "CONFIRMED" },
  { id: "apt-17", patient: { firstName: "Élodie", lastName: "Perrin" }, consultationType: CONSULTATION_TYPES[3], location: LOCATIONS[1], startTime: weekDay(3, 16, 0), endTime: weekDay(3, 16, 20), status: "CONFIRMED" },

  // ── VENDREDI (5 RDV) ──
  { id: "apt-18", patient: { firstName: "Emma", lastName: "Garcia" }, consultationType: CONSULTATION_TYPES[3], location: LOCATIONS[1], startTime: weekDay(4, 9, 0), endTime: weekDay(4, 9, 20), status: "CONFIRMED" },
  { id: "apt-19", patient: { firstName: "Lucas", lastName: "Moreau" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(4, 10, 0), endTime: weekDay(4, 10, 30), status: "CONFIRMED" },
  { id: "apt-20", patient: { firstName: "Mathilde", lastName: "Rey" }, consultationType: CONSULTATION_TYPES[0], location: LOCATIONS[0], startTime: weekDay(4, 11, 0), endTime: weekDay(4, 12, 0), status: "CONFIRMED" },
  { id: "apt-21", patient: { firstName: "Samir", lastName: "Hadj" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[2], startTime: weekDay(4, 14, 0), endTime: weekDay(4, 14, 30), status: "PENDING" },
  { id: "apt-22", patient: { firstName: "Julie", lastName: "Lambert" }, consultationType: CONSULTATION_TYPES[4], location: LOCATIONS[0], startTime: weekDay(4, 15, 30), endTime: weekDay(4, 15, 45), status: "CONFIRMED" },
];

export const BLOCKS: Block[] = [
  {
    id: "blk-1",
    startTime: weekDay(2, 8, 0),
    endTime: weekDay(2, 12, 0),
    reason: "Formation DPC",
  },
];

// Créneaux d'ouverture (lun-ven 8h-13h + 14h-18h)
export const OPEN_HOURS = {
  start: 8,
  end: 18,
  lunchStart: 13,
  lunchEnd: 14,
  days: [0, 1, 2, 3, 4], // lun-ven
};

// Créneaux récurrents avec indication adressage
export const TIME_SLOTS: TimeSlot[] = [
  // Lundi
  { id: "ts-1", locationId: "loc-1", dayOfWeek: 0, startHour: 9, endHour: 13, acceptsReferral: true },
  { id: "ts-2", locationId: "loc-1", dayOfWeek: 0, startHour: 14, endHour: 17, acceptsReferral: false },
  // Mardi
  { id: "ts-3", locationId: "loc-1", dayOfWeek: 1, startHour: 9, endHour: 13, acceptsReferral: true },
  { id: "ts-4", locationId: "loc-3", dayOfWeek: 1, startHour: 14, endHour: 18, acceptsReferral: true },
  // Mercredi — matin libre (formation), après-midi CHU
  { id: "ts-5", locationId: "loc-3", dayOfWeek: 2, startHour: 14, endHour: 18, acceptsReferral: false },
  // Jeudi
  { id: "ts-6", locationId: "loc-1", dayOfWeek: 3, startHour: 9, endHour: 13, acceptsReferral: true },
  { id: "ts-7", locationId: "loc-1", dayOfWeek: 3, startHour: 14, endHour: 17, acceptsReferral: false },
  // Vendredi
  { id: "ts-8", locationId: "loc-2", dayOfWeek: 4, startHour: 9, endHour: 12, acceptsReferral: true },
  { id: "ts-9", locationId: "loc-1", dayOfWeek: 4, startHour: 14, endHour: 17, acceptsReferral: false },
];
