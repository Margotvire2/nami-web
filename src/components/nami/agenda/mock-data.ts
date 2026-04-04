import type { Location, ConsultationType, Appointment, Block } from "./types";

export const LOCATIONS: Location[] = [
  { id: "loc-1", name: "Cabinet Necker", type: "CABINET", color: "#4F6AF5", isActive: true },
  { id: "loc-2", name: "Téléconsultation", type: "TELECONSULT", color: "#8B5CF6", isActive: true },
  { id: "loc-3", name: "CHU Necker — Endocrino", type: "HOPITAL", color: "#10B981", isActive: true },
];

export const CONSULTATION_TYPES: ConsultationType[] = [
  { id: "ct-1", name: "Première consultation", duration: 60, price: 80, color: "#EF4444", textColor: "#FFFFFF", isActive: true },
  { id: "ct-2", name: "Consultation de suivi", duration: 30, price: 55, color: "#F59E0B", textColor: "#1E293B", isActive: true },
  { id: "ct-3", name: "Bilan annuel complet", duration: 90, price: 120, color: "#3B82F6", textColor: "#FFFFFF", isActive: true },
  { id: "ct-4", name: "Téléconsultation suivi", duration: 20, price: 45, color: "#8B5CF6", textColor: "#FFFFFF", isActive: true },
  { id: "ct-5", name: "Urgence", duration: 15, price: 60, color: "#DC2626", textColor: "#FFFFFF", isActive: true },
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
  {
    id: "apt-1",
    patient: { firstName: "Marie", lastName: "Dupont" },
    consultationType: CONSULTATION_TYPES[1],
    location: LOCATIONS[0],
    startTime: weekDay(0, 9, 0),
    endTime: weekDay(0, 9, 30),
    status: "CONFIRMED",
  },
  {
    id: "apt-2",
    patient: { firstName: "Jean", lastName: "Martin" },
    consultationType: CONSULTATION_TYPES[0],
    location: LOCATIONS[0],
    startTime: weekDay(0, 10, 0),
    endTime: weekDay(0, 11, 0),
    status: "CONFIRMED",
  },
  {
    id: "apt-3",
    patient: { firstName: "Sophie", lastName: "Bernard" },
    consultationType: CONSULTATION_TYPES[3],
    location: LOCATIONS[1],
    startTime: weekDay(0, 14, 30),
    endTime: weekDay(0, 14, 50),
    status: "PENDING",
  },
  {
    id: "apt-4",
    patient: { firstName: "Thomas", lastName: "Petit" },
    consultationType: CONSULTATION_TYPES[2],
    location: LOCATIONS[0],
    startTime: weekDay(1, 9, 30),
    endTime: weekDay(1, 11, 0),
    status: "CONFIRMED",
  },
  {
    id: "apt-5",
    patient: { firstName: "Claire", lastName: "Rousseau" },
    consultationType: CONSULTATION_TYPES[1],
    location: LOCATIONS[2],
    startTime: weekDay(1, 11, 0),
    endTime: weekDay(1, 11, 30),
    status: "CONFIRMED",
  },
  {
    id: "apt-6",
    patient: { firstName: "Marc", lastName: "Leblanc" },
    consultationType: CONSULTATION_TYPES[0],
    location: LOCATIONS[0],
    startTime: weekDay(3, 14, 0),
    endTime: weekDay(3, 15, 0),
    status: "CONFIRMED",
  },
  {
    id: "apt-7",
    patient: { firstName: "Emma", lastName: "Garcia" },
    consultationType: CONSULTATION_TYPES[3],
    location: LOCATIONS[1],
    startTime: weekDay(4, 9, 0),
    endTime: weekDay(4, 9, 20),
    status: "CONFIRMED",
  },
  {
    id: "apt-8",
    patient: { firstName: "Lucas", lastName: "Moreau" },
    consultationType: CONSULTATION_TYPES[1],
    location: LOCATIONS[0],
    startTime: weekDay(4, 11, 0),
    endTime: weekDay(4, 11, 30),
    status: "PENDING",
  },
];

export const BLOCKS: Block[] = [
  {
    id: "blk-1",
    startTime: weekDay(2, 8, 0),
    endTime: weekDay(2, 12, 0),
    reason: "Formation DPC",
  },
];

// Créneaux d'ouverture (simplifié : lun-ven 8h-13h + 14h-18h)
export const OPEN_HOURS = {
  start: 8,
  end: 18,
  lunchStart: 13,
  lunchEnd: 14,
  days: [0, 1, 2, 3, 4], // lun-ven (offset depuis lundi)
};
