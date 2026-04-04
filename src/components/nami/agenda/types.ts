export interface Location {
  id: string;
  name: string;
  type: "CABINET" | "HOPITAL" | "TELECONSULT" | "DOMICILE";
  color: string;
  isActive: boolean;
}

export interface ConsultationType {
  id: string;
  name: string;
  duration: number;
  price: number;
  color: string;
  textColor: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  patient: { firstName: string; lastName: string };
  consultationType: ConsultationType;
  location: Location;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "NO_SHOW" | "DONE";
  notes?: string;
}

export interface Block {
  id: string;
  startTime: string;
  endTime: string;
  reason: string;
}
