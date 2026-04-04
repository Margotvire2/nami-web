import type { Location, ConsultationType, Appointment, Block, TimeSlot } from "./types";

export const LOCATIONS: Location[] = [
  { id: "loc-1", name: "Cabinet Paris 11e", type: "CABINET", color: "#6B7FA3", isActive: true },
  { id: "loc-2", name: "Cabinet Paris 3e", type: "CABINET", color: "#7A9E7E", isActive: true },
  { id: "loc-3", name: "Téléconsultation", type: "TELECONSULT", color: "#C4956A", isActive: true },
];

export const CONSULTATION_TYPES: ConsultationType[] = [
  { id: "ct-1", name: "Première consultation", duration: 45, price: 60, color: "#6B7FA3", textColor: "#FFFFFF", bgColor: "#F0F2F8", borderColor: "#6B7FA3", isActive: true },
  { id: "ct-2", name: "Suivi", duration: 30, price: 50, color: "#7A9E7E", textColor: "#1C1C1E", bgColor: "#F0F5F1", borderColor: "#7A9E7E", isActive: true },
  { id: "ct-3", name: "Bilan", duration: 45, price: 70, color: "#C4956A", textColor: "#1C1C1E", bgColor: "#F5F0E8", borderColor: "#C4956A", isActive: true },
  { id: "ct-4", name: "Téléconsultation", duration: 30, price: 45, color: "#C4956A", textColor: "#FFFFFF", bgColor: "#F5F0E8", borderColor: "#C4956A", isActive: true },
  { id: "ct-5", name: "Urgence", duration: 15, price: 60, color: "#DC2626", textColor: "#FFFFFF", bgColor: "#FEF2F2", borderColor: "#DC2626", isActive: true },
];

function weekDay(dayOffset: number, hour: number, minute = 0): string {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(hour, minute, 0, 0);
  monday.setDate(monday.getDate() + dayOffset);
  return monday.toISOString();
}

export const APPOINTMENTS: Appointment[] = [
  // Lundi — Cabinet Paris 11e
  { id: "apt-01", patient: { firstName: "Sophie", lastName: "Moreau" }, consultationType: CONSULTATION_TYPES[0], location: LOCATIONS[0], startTime: weekDay(0, 9, 0), endTime: weekDay(0, 9, 45), status: "CONFIRMED" },
  { id: "apt-02", patient: { firstName: "Marc", lastName: "Dupont" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(0, 10, 0), endTime: weekDay(0, 10, 30), status: "CONFIRMED" },
  { id: "apt-03", patient: { firstName: "Léa", lastName: "Bernard" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(0, 11, 0), endTime: weekDay(0, 11, 30), status: "PENDING" },
  { id: "apt-04", patient: { firstName: "Antoine", lastName: "Roux" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(0, 14, 0), endTime: weekDay(0, 14, 30), status: "CONFIRMED" },
  { id: "apt-05", patient: { firstName: "Clara", lastName: "Petit" }, consultationType: CONSULTATION_TYPES[2], location: LOCATIONS[0], startTime: weekDay(0, 15, 0), endTime: weekDay(0, 15, 45), status: "CONFIRMED" },
  // Mardi — Cabinet Paris 11e
  { id: "apt-06", patient: { firstName: "Thomas", lastName: "Garcia" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(1, 9, 30), endTime: weekDay(1, 10, 0), status: "CONFIRMED" },
  { id: "apt-07", patient: { firstName: "Emma", lastName: "Laurent" }, consultationType: CONSULTATION_TYPES[0], location: LOCATIONS[0], startTime: weekDay(1, 10, 30), endTime: weekDay(1, 11, 15), status: "CONFIRMED" },
  { id: "apt-08", patient: { firstName: "Hugo", lastName: "Martin" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(1, 14, 0), endTime: weekDay(1, 14, 30), status: "PENDING" },
  { id: "apt-09", patient: { firstName: "Inès", lastName: "Faure" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(1, 15, 30), endTime: weekDay(1, 16, 0), status: "CONFIRMED" },
  { id: "apt-10", patient: { firstName: "Jules", lastName: "Mercier" }, consultationType: CONSULTATION_TYPES[2], location: LOCATIONS[0], startTime: weekDay(1, 16, 30), endTime: weekDay(1, 17, 15), status: "CONFIRMED" },
  // Mercredi — Cabinet Paris 3e
  { id: "apt-11", patient: { firstName: "Camille", lastName: "Lefèvre" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[1], startTime: weekDay(2, 9, 0), endTime: weekDay(2, 9, 30), status: "CONFIRMED" },
  { id: "apt-12", patient: { firstName: "Raphaël", lastName: "Girard" }, consultationType: CONSULTATION_TYPES[0], location: LOCATIONS[1], startTime: weekDay(2, 10, 0), endTime: weekDay(2, 10, 45), status: "CONFIRMED" },
  { id: "apt-13", patient: { firstName: "Chloé", lastName: "Fontaine" }, consultationType: CONSULTATION_TYPES[3], location: LOCATIONS[2], startTime: weekDay(2, 14, 0), endTime: weekDay(2, 14, 30), status: "CONFIRMED" },
  { id: "apt-14", patient: { firstName: "Lucas", lastName: "Perrin" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[1], startTime: weekDay(2, 15, 0), endTime: weekDay(2, 15, 30), status: "CONFIRMED" },
  // Jeudi — Cabinet Paris 11e
  { id: "apt-15", patient: { firstName: "Margot", lastName: "Vire" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(3, 9, 0), endTime: weekDay(3, 9, 30), status: "CONFIRMED" },
  { id: "apt-16", patient: { firstName: "Théo", lastName: "Dufresne" }, consultationType: CONSULTATION_TYPES[2], location: LOCATIONS[0], startTime: weekDay(3, 10, 0), endTime: weekDay(3, 10, 45), status: "CONFIRMED" },
  { id: "apt-17", patient: { firstName: "Nadia", lastName: "Benali" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(3, 14, 0), endTime: weekDay(3, 14, 30), status: "CONFIRMED" },
  { id: "apt-18", patient: { firstName: "Paul", lastName: "Durand" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[0], startTime: weekDay(3, 15, 0), endTime: weekDay(3, 15, 30), status: "PENDING" },
  { id: "apt-19", patient: { firstName: "Sarah", lastName: "Morin" }, consultationType: CONSULTATION_TYPES[3], location: LOCATIONS[2], startTime: weekDay(3, 16, 0), endTime: weekDay(3, 16, 30), status: "CONFIRMED" },
  // Vendredi — Cabinet Paris 3e
  { id: "apt-20", patient: { firstName: "Yasmina", lastName: "Chérif" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[1], startTime: weekDay(4, 9, 0), endTime: weekDay(4, 9, 30), status: "CONFIRMED" },
  { id: "apt-21", patient: { firstName: "Élodie", lastName: "Rey" }, consultationType: CONSULTATION_TYPES[0], location: LOCATIONS[1], startTime: weekDay(4, 10, 0), endTime: weekDay(4, 10, 45), status: "CONFIRMED" },
  { id: "apt-22", patient: { firstName: "Samir", lastName: "Hadj" }, consultationType: CONSULTATION_TYPES[1], location: LOCATIONS[1], startTime: weekDay(4, 14, 0), endTime: weekDay(4, 14, 30), status: "CONFIRMED" },
  { id: "apt-23", patient: { firstName: "Julie", lastName: "Lambert" }, consultationType: CONSULTATION_TYPES[3], location: LOCATIONS[2], startTime: weekDay(4, 15, 0), endTime: weekDay(4, 15, 30), status: "CONFIRMED" },
];

export const BLOCKS: Block[] = [];

export const OPEN_HOURS = {
  start: 8,
  end: 19,
  lunchStart: 13,
  lunchEnd: 14,
  days: [0, 1, 2, 3, 4],
};

export const TIME_SLOTS: TimeSlot[] = [
  { id: "ts-1", locationId: "loc-1", dayOfWeek: 0, startHour: 9, endHour: 18, acceptsReferral: true },
  { id: "ts-2", locationId: "loc-1", dayOfWeek: 1, startHour: 9, endHour: 18, acceptsReferral: true },
  { id: "ts-3", locationId: "loc-2", dayOfWeek: 2, startHour: 9, endHour: 17, acceptsReferral: false },
  { id: "ts-4", locationId: "loc-1", dayOfWeek: 3, startHour: 9, endHour: 18, acceptsReferral: true },
  { id: "ts-5", locationId: "loc-2", dayOfWeek: 4, startHour: 9, endHour: 17, acceptsReferral: false },
];

// Day → active cabinet mapping
export const DAY_CABINET: Record<number, string> = { 0: "loc-1", 1: "loc-1", 2: "loc-2", 3: "loc-1", 4: "loc-2" };
