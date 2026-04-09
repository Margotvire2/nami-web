const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ─── Token refresh state (singleton, pas de refresh en parallèle) ────────────

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  // Import dynamique pour éviter la dépendance circulaire
  const { useAuthStore } = await import("./store");
  const { refreshToken, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      logout();
      if (typeof window !== "undefined") window.location.href = "/login";
      return null;
    }

    const data = await res.json();
    // Met à jour le store avec les nouveaux tokens
    useAuthStore.getState().setAuth(
      useAuthStore.getState().user!,
      data.accessToken,
      data.refreshToken,
    );
    return data.accessToken;
  } catch {
    logout();
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }
}

// ─── Request avec auto-refresh sur 401 ───────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Si 401 et qu'on avait un token : tenter un refresh
  if (res.status === 401 && token && !path.startsWith("/auth/")) {
    // Éviter N refresh en parallèle : une seule promesse partagée
    if (!refreshPromise) {
      refreshPromise = tryRefreshToken().finally(() => { refreshPromise = null; });
    }
    const newToken = await refreshPromise;

    if (newToken) {
      // Retry la requête originale avec le nouveau token
      headers["Authorization"] = `Bearer ${newToken}`;
      const retryRes = await fetch(`${API_URL}${path}`, { ...options, headers });

      if (!retryRes.ok) {
        const body = await retryRes.json().catch(() => ({}));
        throw new ApiError(retryRes.status, body.error || `Erreur ${retryRes.status}`);
      }
      return retryRes.json();
    }

    // Refresh échoué : on throw sans retry
    throw new ApiError(401, "Session expirée");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Erreur ${res.status}`);
  }

  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    request<User>("/auth/me", {}, token),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  signup: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleType: "PATIENT" | "PROVIDER";
    phone?: string;
    rppsNumber?: string;
    specialties?: string[];
  }) =>
    request<{ accessToken: string; refreshToken: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (refreshToken: string) =>
    request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};

// ─── Care Cases ───────────────────────────────────────────────────────────────

export const careCasesApi = {
  list: (token: string, params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : "";
    return request<CareCase[]>(`/care-cases${qs}`, {}, token);
  },

  get: (token: string, id: string) =>
    request<CareCaseDetail>(`/care-cases/${id}`, {}, token),

  timeline: (token: string, id: string, page = 1, limit = 20) =>
    request<TimelinePage>(`/care-cases/${id}/timeline?page=${page}&limit=${limit}`, {}, token),

  update: (token: string, id: string, data: Partial<CareCaseDetail>) =>
    request<CareCaseDetail>(`/care-cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),
};

// ─── Care Team ────────────────────────────────────────────────────────────────

export const teamApi = {
  list: (token: string, careCaseId: string) =>
    request<CareCaseMember[]>(`/care-cases/${careCaseId}/team`, {}, token),
};

// ─── Notes ────────────────────────────────────────────────────────────────────

export const notesApi = {
  list: (token: string, careCaseId: string) =>
    request<ClinicalNote[]>(`/care-cases/${careCaseId}/notes`, {}, token),

  create: (token: string, careCaseId: string, data: CreateNoteInput) =>
    request<ClinicalNote>(`/care-cases/${careCaseId}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const tasksApi = {
  list: (token: string, careCaseId: string) =>
    request<Task[]>(`/care-cases/${careCaseId}/tasks`, {}, token),

  create: (token: string, careCaseId: string, data: CreateTaskInput) =>
    request<Task>(`/care-cases/${careCaseId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (token: string, careCaseId: string, taskId: string, data: Partial<Task>) =>
    request<Task>(`/care-cases/${careCaseId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const alertsApi = {
  list: (token: string, careCaseId: string) =>
    request<Alert[]>(`/care-cases/${careCaseId}/alerts`, {}, token),

  update: (token: string, careCaseId: string, alertId: string, data: { status: string }) =>
    request<Alert>(`/care-cases/${careCaseId}/alerts/${alertId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),
};

// ─── Messages ────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  careCaseId: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  sender: { id: string; firstName: string; lastName: string; roleType: string };
  reads: { personId: string; readAt: string }[];
  _count: { replies: number };
  replies?: Message[];
}

export const messagesApi = {
  list: (token: string, careCaseId: string, parentId?: string) => {
    const qs = parentId ? `?parentId=${parentId}` : "";
    return request<Message[]>(`/care-cases/${careCaseId}/messages${qs}`, {}, token);
  },
  get: (token: string, careCaseId: string, messageId: string) =>
    request<Message>(`/care-cases/${careCaseId}/messages/${messageId}`, {}, token),
  send: (token: string, careCaseId: string, body: string, parentId?: string) =>
    request<Message>(`/care-cases/${careCaseId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body, parentId }),
    }, token),
  markRead: (token: string, careCaseId: string, messageId: string) =>
    request<{ ok: boolean }>(`/care-cases/${careCaseId}/messages/${messageId}/read`, {
      method: "POST",
    }, token),
};

// ─── Referrals ───────────────────────────────────────────────────────────────

export type ReferralStatus =
  | "DRAFT" | "SENT" | "RECEIVED" | "UNDER_REVIEW" | "ACCEPTED" | "DECLINED"
  | "PATIENT_CONTACTED" | "APPOINTMENT_INVITED" | "APPOINTMENT_BOOKED"
  | "FIRST_VISIT_COMPLETED" | "EXPIRED" | "CANCELLED";

export type ReferralPriority = "ROUTINE" | "URGENT" | "EMERGENCY";
export type ReferralMode = "DIRECT" | "POOL";

export interface Referral {
  id: string;
  careCaseId: string;
  mode: ReferralMode;
  status: ReferralStatus;
  priority: ReferralPriority;
  clinicalReason: string;
  urgencyNote: string | null;
  preferredSpecialty: string | null;
  preferredZone: string | null;
  desiredAppointmentDate: string | null;
  autoAddToTeam: boolean;
  respondedAt: string | null;
  declineReason: string | null;
  responseNote: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  sender: { id: string; firstName: string; lastName: string };
  targetProvider?: {
    id: string;
    person: { firstName: string; lastName: string };
    specialties?: string[];
  } | null;
  careCase: { id: string; caseTitle: string; caseType: string };
  candidates?: ReferralCandidate[];
  _count?: { documents: number };
}

export interface ReferralCandidate {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  responseNote: string | null;
  provider: { id: string; person: { firstName: string; lastName: string } };
}

export interface CreateReferralInput {
  careCaseId: string;
  targetProviderId?: string;
  mode?: ReferralMode;
  priority?: ReferralPriority;
  clinicalReason: string;
  urgencyNote?: string;
  preferredSpecialty?: string;
  preferredZone?: string;
  desiredAppointmentDate?: string;
  autoAddToTeam?: boolean;
  patientConsent: boolean;
  referralType?: "REFERRAL" | "COORDINATION_REQUEST";
  personalMessage?: string;
  expiresAt?: string;
}

export const referralsApi = {
  outgoing: (token: string, params?: { status?: string; careCaseId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.careCaseId) qs.set("careCaseId", params.careCaseId);
    const q = qs.toString();
    return request<Referral[]>(`/referrals/outgoing${q ? `?${q}` : ""}`, {}, token);
  },
  incoming: (token: string, params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : "";
    return request<Referral[]>(`/referrals/incoming${qs}`, {}, token);
  },
  get: (token: string, id: string) =>
    request<Referral>(`/referrals/${id}`, {}, token),
  create: (token: string, data: CreateReferralInput) =>
    request<Referral>("/referrals", { method: "POST", body: JSON.stringify(data) }, token),
  respond: (token: string, id: string, decision: "ACCEPTED" | "DECLINED", responseNote?: string) =>
    request<Referral>(`/referrals/${id}/respond`, {
      method: "PATCH",
      body: JSON.stringify({ decision, responseNote }),
    }, token),
  updateStatus: (token: string, id: string, status: string) =>
    request<Referral>(`/referrals/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, token),
};

// ─── Intelligence ─────────────────────────────────────────────────────────────

export interface KnowledgeSource {
  id: string;
  sourceType: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string | null;
  sourceDate: string | null;
  status: "DRAFT" | "REVIEW" | "VALIDATED" | "PUBLISHED" | "DEPRECATED";
  structuredData: Record<string, unknown> | null;
  lastCheckedAt: string | null;
  createdAt: string;
}

export const intelligenceApi = {
  careGaps: (token: string, careCaseId: string) =>
    request<GapAnalysis>(`/intelligence/care-gaps/${careCaseId}`, {}, token),

  summarize: (token: string, careCaseId: string, persist = false) =>
    request<SummaryResult>(`/intelligence/summarize/${careCaseId}?persist=${persist}`, {
      method: "POST",
    }, token),

  // Knowledge sources
  knowledgeSources: (token: string, params?: { status?: string; sourceType?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.sourceType) qs.set("sourceType", params.sourceType);
    const q = qs.toString();
    return request<KnowledgeSource[]>(`/intelligence/knowledge-sources${q ? `?${q}` : ""}`, {}, token);
  },

  knowledgeSource: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}`, {}, token),

  // Catalogues
  questionnaires: (token: string, domain?: string) => {
    const qs = domain ? `?domain=${encodeURIComponent(domain)}` : "";
    return request<any[]>(`/intelligence/questionnaires${qs}`, {}, token);
  },
  metrics: (token: string, domain?: string) => {
    const qs = domain ? `?domain=${encodeURIComponent(domain)}` : "";
    return request<any[]>(`/intelligence/metrics${qs}`, {}, token);
  },
  pathways: (token: string, family?: string) => {
    const qs = family ? `?family=${encodeURIComponent(family)}` : "";
    return request<any[]>(`/intelligence/pathways${qs}`, {}, token);
  },
  conditionLinks: (token: string, fromCode?: string) => {
    const qs = fromCode ? `?fromCode=${encodeURIComponent(fromCode)}` : "";
    return request<any[]>(`/intelligence/condition-links${qs}`, {}, token);
  },

  // HAS sync
  syncHAS: (token: string) =>
    request<{ triggered: boolean; message: string }>("/intelligence/ingest/has", {
      method: "POST",
    }, token),

  refreshHASSource: (token: string, sourceId: string) =>
    request<{ success: boolean; message: string }>(`/intelligence/ingest/has/${sourceId}/refresh`, {
      method: "POST",
    }, token),

  // Workflow
  reviewSource: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}/review`, { method: "POST" }, token),

  validateSource: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}/validate`, { method: "POST" }, token),

  publishSource: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}/publish`, { method: "POST" }, token),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleType: "PATIENT" | "PROVIDER" | "ADMIN" | "ORG_ADMIN";
  providerProfile?: { id: string; specialties: string[] };
}

export interface CareCase {
  id: string;
  caseTitle: string;
  caseType: string;
  status: "ACTIVE" | "PAUSED" | "CLOSED" | "ARCHIVED";
  riskLevel: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lastActivityAt: string | null;
  startDate: string;
  patient: { id: string; firstName: string; lastName: string; email: string; phone?: string; birthDate?: string | null; sex?: string | null };
  leadProvider: { person: { firstName: string; lastName: string } } | null;
  _count: { members: number; activities: number };
}

export interface CareCaseDetail extends Omit<CareCase, "_count"> {
  mainConcern: string | null;
  clinicalSummary: string | null;
  careStage: string | null;
  nextStepSummary: string | null;
  height: number | null;
  napValue: number | null;
  napDescription: string | null;
  pathwayTemplateId: string | null;
  members: CareCaseMember[];
  _count: { members: number; activities: number; notes: number; documents: number; tasks: number; alerts: number };
}

export interface CareCaseMember {
  id: string;
  roleInCase: string;
  isPrimary: boolean;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  person: { id: string; firstName: string; lastName: string };
  provider: { specialties: string[] };
}

export interface Activity {
  id: string;
  activityType: string;
  source: "PATIENT" | "PROVIDER" | "SYSTEM";
  title: string;
  summary: string | null;
  occurredAt: string;
  person: { id: string; firstName: string; lastName: string; roleType: string };
}

export interface TimelinePage {
  data: Activity[];
  total: number;
  page: number;
  pages: number;
}

export interface ClinicalNote {
  id: string;
  noteType: string;
  title: string | null;
  body: string;
  visibility: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
}

export interface CreateNoteInput {
  noteType: string;
  title?: string;
  body: string;
  visibility?: string;
}

export interface Task {
  id: string;
  title: string;
  taskType: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  createdAt: string;
  assignedTo: { id: string; firstName: string; lastName: string } | null;
  createdBy: { id: string; firstName: string; lastName: string };
}

export interface CreateTaskInput {
  title: string;
  taskType: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  assignedToPersonId?: string;
}

export interface Alert {
  id: string;
  alertType: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  title: string;
  description: string | null;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

export interface Gap {
  type: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  recommendedAction: string;
}

export interface GapAnalysis {
  careCaseId: string;
  caseTitle: string;
  analyzedAt: string;
  summary: { total: number; critical: number; high: number; warning: number; info: number };
  gaps: Gap[];
}

// ─── Appointments ────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  careCaseId: string | null;
  startAt: string;
  endAt: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  locationType: "IN_PERSON" | "VIDEO" | "PHONE";
  locationDetails: string | null;
  isFirstConsultation: boolean;
  notes: string | null;
  createdAt: string;
  patient: { id: string; firstName: string; lastName: string };
  provider: { person: { firstName: string; lastName: string } };
  consultationType: { name: string; durationMinutes: number } | null;
  location: { id: string; name: string; color: string | null; locationType: string; address: string | null; city: string | null } | null;
}

export interface ConsultationTypeDTO {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  currency: string;
  consultationMode: "IN_PERSON" | "VIDEO" | "PHONE";
  isFirstTimeOnly: boolean;
  isFollowUpOnly: boolean;
  availablePublicly: boolean;
}

export interface AvailabilitySlotDTO {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  consultationTypeId: string | null;
  isActive: boolean;
}

export const appointmentsApi = {
  list: (token: string, params?: { careCaseId?: string; status?: string; from?: string; to?: string; providerId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.careCaseId) qs.set("careCaseId", params.careCaseId);
    if (params?.status) qs.set("status", params.status);
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.providerId) qs.set("providerId", params.providerId);
    const q = qs.toString();
    return request<Appointment[]>(`/appointments${q ? `?${q}` : ""}`, {}, token);
  },

  create: (token: string, data: {
    patientId: string; providerId: string; locationType: "IN_PERSON" | "VIDEO" | "PHONE";
    startAt: string; endAt: string; consultationTypeId?: string;
    isFirstConsultation?: boolean; notes?: string; careCaseId?: string; locationId?: string;
  }) => request<Appointment>("/appointments", { method: "POST", body: JSON.stringify(data) }, token),

  patch: (token: string, id: string, data: { status?: string; notes?: string; startAt?: string; endAt?: string }) =>
    request<Appointment>(`/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

  consultationTypes: (token: string, providerId?: string) => {
    const qs = providerId ? `?providerId=${providerId}` : "";
    return request<ConsultationTypeDTO[]>(`/appointments/consultation-types${qs}`, {}, token);
  },

  slots: (token: string, providerId?: string) => {
    const qs = providerId ? `?providerId=${providerId}` : "";
    return request<AvailabilitySlotDTO[]>(`/appointments/slots${qs}`, {}, token);
  },

  createConsultationType: (token: string, data: {
    name: string; durationMinutes: number; price?: number; consultationMode?: string;
    isFirstTimeOnly?: boolean; isFollowUpOnly?: boolean; availablePublicly?: boolean;
  }) => request<ConsultationTypeDTO>("/appointments/consultation-types", {
    method: "POST", body: JSON.stringify(data),
  }, token),

  createSlot: (token: string, data: {
    weekday: number; startTime: string; endTime: string;
    consultationTypeId?: string; isActive?: boolean;
  }) => request<AvailabilitySlotDTO>("/appointments/slots", {
    method: "POST", body: JSON.stringify(data),
  }, token),

  deleteSlot: (token: string, id: string) =>
    request<{ success: boolean }>(`/appointments/slots/${id}`, { method: "DELETE" }, token),

  deleteConsultationType: (token: string, id: string) =>
    request<{ success: boolean }>(`/appointments/consultation-types/${id}`, { method: "DELETE" }, token),

  patchConsultationType: (token: string, id: string, data: Partial<ConsultationTypeDTO>) =>
    request<ConsultationTypeDTO>(`/appointments/consultation-types/${id}`, {
      method: "PATCH", body: JSON.stringify(data),
    }, token),
};

// ─── Patients (création) ────────────────────────────────────────────────────

export interface CreatePatientWithCaseInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  caseType: "TCA" | "OBESITY" | "METABOLIC" | "MENTAL_HEALTH" | "PEDIATRIC" | "CHRONIC_PAIN" | "OTHER";
  caseTitle: string;
  mainConcern?: string;
  riskLevel?: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  inviteMessage?: string;
}

export interface CreatePatientWithCaseResult {
  patient: { id: string; firstName: string; lastName: string; email: string };
  careCase: { id: string; caseTitle: string; caseType: string };
  invitation: { id: string; token: string; inviteUrl: string; expiresAt: string } | null;
}

export const patientsApi = {
  createWithCase: (token: string, data: CreatePatientWithCaseInput) =>
    request<CreatePatientWithCaseResult>("/patients/create-with-case", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// ─── Locations (lieux de consultation) ───────────────────────────────────────

export interface ConsultationLocation {
  id: string;
  providerId: string;
  name: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  accessCode: string | null;
  instructions: string | null;
  locationType: "PHYSICAL" | "VIDEO" | "PHONE" | "HOME_VISIT";
  color: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateLocationInput {
  name: string;
  address?: string;
  postalCode?: string;
  city?: string;
  accessCode?: string;
  instructions?: string;
  locationType: "PHYSICAL" | "VIDEO" | "PHONE" | "HOME_VISIT";
  color?: string;
  activeDays?: string[];
  openTime?: string;
  closeTime?: string;
  lunchStart?: string | null;
  lunchEnd?: string | null;
  allowedConsultTypes?: string[];
  allowsVideo?: boolean;
}

export interface AgendaAbsence {
  id: string;
  providerId: string;
  label: string;
  startDate: string;
  endDate: string;
  allLocations: boolean;
  locationIds: string[];
  createdAt: string;
}

export interface AgendaSettings {
  buffer: number | null;
  minNotice: number | null;
  maxHorizon: number | null;
  autoConfirm: boolean;
  smartCompact: boolean;
  cancelDelay: number | null;
  isConfigured: boolean;
  configuredAt: string | null;
  locations: ConsultationLocation[];
  consultationTypes: ConsultationTypeDTO[];
  absences: AgendaAbsence[];
}

export const agendaSettingsApi = {
  get: (token: string) =>
    request<AgendaSettings>("/providers/me/agenda-settings", {}, token),
  update: (token: string, data: {
    agendaBuffer?: number | null; agendaMinNotice?: number | null;
    agendaMaxHorizon?: number | null; agendaAutoConfirm?: boolean;
    agendaSmartCompact?: boolean; agendaCancelDelay?: number | null;
  }) =>
    request<unknown>("/providers/me/agenda-settings", { method: "PATCH", body: JSON.stringify(data) }, token),
};

export const absencesApi = {
  list: (token: string) =>
    request<AgendaAbsence[]>("/providers/me/absences", {}, token),
  create: (token: string, data: { label: string; startDate: string; endDate: string; allLocations?: boolean; locationIds?: string[] }) =>
    request<AgendaAbsence>("/providers/me/absences", { method: "POST", body: JSON.stringify(data) }, token),
  remove: (token: string, id: string) =>
    request<{ success: boolean }>(`/providers/me/absences/${id}`, { method: "DELETE" }, token),
};

export const locationsApi = {
  list: (token: string) =>
    request<ConsultationLocation[]>("/locations", {}, token),
  create: (token: string, data: CreateLocationInput) =>
    request<ConsultationLocation>("/locations", {
      method: "POST", body: JSON.stringify(data),
    }, token),
  update: (token: string, id: string, data: Partial<CreateLocationInput>) =>
    request<ConsultationLocation>(`/locations/${id}`, {
      method: "PATCH", body: JSON.stringify(data),
    }, token),
  remove: (token: string, id: string) =>
    request<{ success: boolean }>(`/locations/${id}`, { method: "DELETE" }, token),
};

// ─── Journal Patient ─────────────────────────────────────────────────────────

export type JournalEntryType = "MEAL" | "EMOTION" | "SYMPTOM" | "NOTE" | "PHYSICAL_ACTIVITY" | "CRISIS_EVENT" | "POSITIVE_THOUGHT";

export interface JournalEntry {
  id: string;
  careCaseId: string;
  entryType: JournalEntryType;
  payload: Record<string, unknown>;
  occurredAt: string;
  sharedWithTeam: boolean;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
}

export const journalApi = {
  list: (token: string, careCaseId: string, params?: { type?: string }) => {
    const qs = params?.type ? `?type=${params.type}` : "";
    return request<JournalEntry[]>(`/care-cases/${careCaseId}/journal${qs}`, {}, token);
  },
};

// ─── Onboarding ──────────────────────────────────────────────────────────────

export interface OnboardingProfile {
  id: string
  personId: string
  specialties: string[]
  subSpecialties: string[]
  qualificationLevel: string
  bio: string | null
  rppsNumber: string | null
  adeliNumber: string | null
  onboardingStep: string
  structures: unknown[]
  certifications: unknown[]
}

export interface OnboardingIdentityInput {
  specialties: string[]
  subSpecialties?: string[]
  qualificationLevel?: string
  bio?: string
  rppsNumber?: string
  adeliNumber?: string
}

export interface OnboardingExerciseInput {
  exerciseMode: string
  conventionSector?: string
  acceptsCMU?: boolean
  acceptsALD?: boolean
  acceptsTele?: boolean
}

export interface OnboardingNetworkInput {
  spokenLanguages:   string[]
  geographicZones:   string[]
  profileVisibility: string
  addressingScope:   string
}

export interface OnboardingConfirmInput {
  acceptedCGU:    boolean
  acceptedDeonto: boolean
  acceptedRGPD:   boolean
}

export interface OnboardingCertificationInput {
  name:         string
  organization: string
  year?:        number
}

export interface OnboardingConsultationInput {
  consultationModes:    string[]
  acceptedPatientTypes: string[]
  acceptingNewPatients: boolean
  newPatientDelay?:     string
}

export interface OnboardingStructureInput {
  name:       string
  type:       string
  address:    string
  city:       string
  postalCode: string
  phone?:     string
  fax?:       string
}

export const onboardingApi = {
  me: (token: string) =>
    request<{ profile: OnboardingProfile }>("/onboarding/me", {}, token),

  saveIdentity: (token: string, data: OnboardingIdentityInput) =>
    request<{ profile: OnboardingProfile }>("/onboarding/identity", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  saveExercise: (token: string, data: OnboardingExerciseInput) =>
    request<{ profile: OnboardingProfile }>("/onboarding/exercise", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  saveNetwork: (token: string, data: OnboardingNetworkInput) =>
    request<{ ok: boolean }>("/onboarding/network", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  confirm: (token: string, data: OnboardingConfirmInput) =>
    request<{ ok: boolean }>("/onboarding/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  saveCertifications: (token: string, certifications: OnboardingCertificationInput[]) =>
    request<{ ok: boolean }>("/onboarding/certifications", {
      method: "POST",
      body: JSON.stringify({ certifications }),
    }, token),

  saveConsultation: (token: string, data: OnboardingConsultationInput) =>
    request<{ profile: OnboardingProfile }>("/onboarding/consultation", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  saveStructures: (token: string, structures: OnboardingStructureInput[]) =>
    request<{ ok: boolean }>("/onboarding/structures", {
      method: "POST",
      body: JSON.stringify({ structures }),
    }, token),
};

// ─── Documents ───────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  careCaseId: string;
  documentType: string;
  title: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  summaryAi: string | null;
  isSharedWithTeam: boolean;
  bioExtracted: boolean;
  bioExtractedAt: string | null;
  createdAt: string;
  uploadedBy: { id: string; firstName: string; lastName: string };
}

export interface CreateDocumentInput {
  documentType: "BIOLOGICAL_REPORT" | "PRESCRIPTION" | "CONSULTATION_REPORT" | "HOSPITAL_REPORT" | "LETTER" | "IMAGING" | "OTHER";
  title: string;
  fileUrl: string;
  fileKey: string;
  mimeType: string;
  sizeBytes: number;
  isSharedWithTeam?: boolean;
}

export const documentsApi = {
  list: (token: string, careCaseId: string) =>
    request<Document[]>(`/care-cases/${careCaseId}/documents`, {}, token),
  create: (token: string, careCaseId: string, data: CreateDocumentInput) =>
    request<Document>(`/care-cases/${careCaseId}/documents`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
  upload: async (token: string, careCaseId: string, file: File, title: string, documentType: string): Promise<Document> => {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("documentType", documentType);
    const res = await fetch(`${API}/care-cases/${careCaseId}/documents/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(res.status, (err as Record<string, string>).error || `Erreur ${res.status}`);
    }
    return res.json();
  },
  download: (token: string, careCaseId: string, docId: string) =>
    request<{ url: string }>(`/care-cases/${careCaseId}/documents/${docId}/download`, {}, token),
};

// ─── Bio Extraction ─────────────────────────────────────────────────────────

export interface BioCandidate {
  metricKey: string;
  labelOriginal: string;
  value: number;
  unit: string;
  confidence: number;
}

export interface BioExtractionResult {
  documentId: string;
  careCaseId: string;
  datePrelevement: string | null;
  laboratoire: string | null;
  candidates: BioCandidate[];
}

export interface BioValidateInput {
  datePrelevement: string;
  observations: Array<{
    metricKey: string;
    label: string;
    value: number;
    unit: string;
  }>;
}

export const bioExtractionApi = {
  extract: (token: string, documentId: string) =>
    request<BioExtractionResult>(`/documents/${documentId}/extract-bio`, { method: "POST" }, token),
  validate: (token: string, documentId: string, data: BioValidateInput) =>
    request<{ message: string; observations: unknown[] }>(`/documents/${documentId}/validate-bio`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// ─── Intelligence ────────────────────────────────────────────────────────────

export interface SummaryResult {
  careCaseId: string;
  generatedAt: string;
  persisted: boolean;
  summary: {
    overview: string;
    recentEvolution: string;
    careTeamAssessment: string;
    keyFindings: string[];
    recommendations: string[];
    riskAssessment: string;
  };
  gapsSummary: { total: number; critical: number; high: number; warning: number; info: number };
}

// ─── Messagerie Pro ─────────────────────────────────────────────────────────

export interface ProConversation {
  id: string;
  type: "DIRECT" | "GROUP" | "CHANNEL" | "CLINICAL_NETWORK" | "CPTS" | "HOSPITAL" | "PRACTICE" | "ALUMNI" | "COMMUNITY";
  name: string | null;
  description: string | null;
  isPrivate: boolean;
  members: { id: string; firstName: string; lastName: string; role: string }[];
  lastMessage: { content: string; senderId: string; createdAt: string } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ProMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  contentType: "TEXT" | "FILE" | "SYSTEM";
  isDeleted: boolean;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string };
  reactions: { emoji: string; userId: string }[];
}

export const proMessagesApi = {
  getConversations: (token: string) =>
    request<ProConversation[]>("/pro-messages/conversations", {}, token),

  getMessages: (token: string, conversationId: string) =>
    request<ProMessage[]>(`/pro-messages/conversations/${conversationId}/messages`, {}, token),

  sendMessage: (token: string, conversationId: string, content: string) =>
    request<ProMessage>(`/pro-messages/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }, token),

  createDirect: (token: string, targetUserId: string) =>
    request<ProConversation>("/pro-messages/conversations/new-direct", {
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    }, token),

  createGroup: (token: string, name: string, memberIds: string[], description?: string, type?: string) =>
    request<ProConversation>("/pro-messages/conversations/new-group", {
      method: "POST",
      body: JSON.stringify({ name, memberIds, description, type }),
    }, token),

  markAsRead: (token: string, conversationId: string) =>
    request<{ success: boolean }>(`/pro-messages/conversations/${conversationId}/read`, {
      method: "PATCH",
    }, token),

  deleteMessage: (token: string, messageId: string) =>
    request<{ success: boolean }>(`/pro-messages/messages/${messageId}`, {
      method: "DELETE",
    }, token),

  toggleReaction: (token: string, messageId: string, emoji: string) =>
    request<{ action: string }>(`/pro-messages/messages/${messageId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    }, token),
};

// ─── Connection Requests (patient → soignant) ──────────────────────────────

export interface ConnectionRequest {
  id: string;
  patientPersonId: string;
  providerPersonId: string;
  providerId: string;
  reason: string | null;
  preferredType: string | null;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  declineReason: string | null;
  careCaseId: string | null;
  respondedAt: string | null;
  createdAt: string;
  patient?: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null; birthDate: string | null };
  providerProfile?: { person: { id: string; firstName: string; lastName: string }; specialties: string[] };
}

export const connectionRequestsApi = {
  create: (token: string, data: { providerId: string; reason?: string; preferredType?: string; message?: string }) =>
    request<ConnectionRequest>("/connection-requests", { method: "POST", body: JSON.stringify(data) }, token),
  incoming: (token: string, status?: string) =>
    request<ConnectionRequest[]>(`/connection-requests/incoming${status ? `?status=${status}` : ""}`, {}, token),
  mine: (token: string) =>
    request<ConnectionRequest[]>("/connection-requests/mine", {}, token),
  respond: (token: string, id: string, data: { decision: "ACCEPTED" | "DECLINED"; declineReason?: string; caseType?: string; caseTitle?: string }) =>
    request<ConnectionRequest>(`/connection-requests/${id}/respond`, { method: "POST", body: JSON.stringify(data) }, token),
};

// ─── Appointment Requests ───────────────────────────────────────────────────

export interface AppointmentRequest {
  id: string;
  providerId: string;
  patientPersonId: string | null;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone: string | null;
  patientBirthDate: string | null;
  motif: string | null;
  requestedDate: string | null;
  locationType: string;
  status: string;
  careCaseId: string | null;
  appointmentId: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  createdAt: string;
}

export const appointmentRequestsApi = {
  list: (token: string, status?: string) =>
    request<AppointmentRequest[]>(`/appointment-requests${status ? `?status=${status}` : ""}`, {}, token),
  accept: (token: string, id: string) =>
    request<{ careCaseId: string; appointmentId: string; inviteUrl: string | null; message: string }>(
      `/appointment-requests/${id}/accept`, { method: "POST" }, token,
    ),
  decline: (token: string, id: string, reason?: string) =>
    request<AppointmentRequest>(`/appointment-requests/${id}/decline`, {
      method: "POST", body: JSON.stringify({ reason }),
    }, token),
};

// ─── Provider Directory (public) ────────────────────────────────────────────

export interface PublicProvider {
  id: string;
  specialties: string[];
  bio: string | null;
  acceptsNewPatients: boolean;
  acceptsTele: boolean;
  person: { id: string; firstName: string; lastName: string; photoUrl: string | null };
  structures: { name: string; city: string; address: string }[];
}

export const providerDirectoryApi = {
  search: (params?: { specialty?: string; accepting?: string }) => {
    const qs = new URLSearchParams();
    if (params?.specialty) qs.set("specialty", params.specialty);
    if (params?.accepting) qs.set("accepting", params.accepting);
    const q = qs.toString();
    return request<PublicProvider[]>(`/providers/search${q ? `?${q}` : ""}`);
  },
  list: () => request<PublicProvider[]>("/providers"),
};

// ─── Knowledge Sources ──────────────────────────────────────────────────────

export interface KnowledgeSource {
  id: string;
  sourceType: string;
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string | null;
  sourceDate: string | null;
  rawContent: string | null;
  structuredData: Record<string, unknown> | null;
  status: "DRAFT" | "REVIEW" | "VALIDATED" | "PUBLISHED" | "DEPRECATED";
  validatedBy: string | null;
  validatedAt: string | null;
  publishedAt: string | null;
  deprecatedAt: string | null;
  ingestedAt: string;
  createdAt: string;
}

export const knowledgeApi = {
  list: (token: string, params?: { status?: string; sourceType?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.sourceType) qs.set("sourceType", params.sourceType);
    const q = qs.toString();
    return request<KnowledgeSource[]>(`/intelligence/knowledge-sources${q ? `?${q}` : ""}`, {}, token);
  },
  get: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}`, {}, token),
  review: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}/review`, { method: "POST" }, token),
  validate: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}/validate`, { method: "POST" }, token),
  publish: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}/publish`, { method: "POST" }, token),
  deprecate: (token: string, id: string) =>
    request<KnowledgeSource>(`/intelligence/knowledge-sources/${id}/deprecate`, { method: "POST" }, token),
};

// ─── Colleagues ─────────────────────────────────────────────────────────────

export interface Colleague {
  person: { id: string; firstName: string; lastName: string; photoUrl: string | null; email: string };
  provider: { id: string; specialties: string[]; rppsNumber: string | null };
  sharedCaseCount: number;
  caseIds: string[];
}

export const colleaguesApi = {
  list: (token: string) =>
    request<Colleague[]>("/providers/my-colleagues", {}, token),
};

// ─── Structures ─────────────────────────────────────────────────────────────

export interface ProviderStructure {
  id: string;
  providerId: string;
  name: string;
  type: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string | null;
  fax: string | null;
  createdAt: string;
}

export const structuresApi = {
  list: (token: string) =>
    request<ProviderStructure[]>("/providers/me/structures", {}, token),
  create: (token: string, data: Omit<ProviderStructure, "id" | "providerId" | "createdAt" | "fax">) =>
    request<ProviderStructure>("/providers/me/structures", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// ─── Invitations ────────────────────────────────────────────────────────────

export interface Invitation {
  id: string;
  token: string;
  fromPersonId: string;
  fromPerson: { id: string; firstName: string; lastName: string };
  toEmail: string | null;
  careCaseId: string | null;
  careCase: { id: string; caseTitle: string } | null;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  expiresAt: string;
  acceptedAt: string | null;
  acceptedBy: { id: string; firstName: string; lastName: string } | null;
  createdAt: string;
  inviteUrl?: string;
  isExpired?: boolean;
}

export interface CreateInvitationInput {
  email?: string;
  careCaseId?: string;
  message?: string;
}

export const invitationsApi = {
  create: (token: string, data: CreateInvitationInput) =>
    request<Invitation>("/invitations", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
  mine: (token: string) =>
    request<Invitation[]>("/invitations/mine", {}, token),
  get: (tokenVal: string) =>
    request<Invitation>(`/invitations/${tokenVal}`, {}),
  resend: (token: string, id: string) =>
    request<Invitation>(`/invitations/${id}/resend`, {
      method: "POST",
    }, token),
};

// ─── Conditions (PatientCondition) ───────────────────────────────────────

export interface PatientCondition {
  id: string;
  careCaseId: string;
  conditionCode: string;
  conditionLabel: string;
  conditionType: "PRIMARY" | "COMORBIDITY" | "SUSPECTED";
  severity: "mild" | "moderate" | "severe" | null;
  status: string;
  onsetDate: string | null;
  resolvedDate: string | null;
  diagnosedBy: string | null;
  linkedPathwayKey: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConditionCatalogEntry {
  code: string;
  label: string;
  type: "PRIMARY" | "COMORBIDITY" | "SUSPECTED";
  domain: string;
  linkedPathwayKey: string | null;
}

export interface CreateConditionInput {
  conditionCode: string;
  conditionLabel: string;
  conditionType: "PRIMARY" | "COMORBIDITY" | "SUSPECTED";
  severity?: "mild" | "moderate" | "severe";
  status?: string;
  onsetDate?: string;
  linkedPathwayKey?: string;
  notes?: string;
}

export const conditionsApi = {
  list: (token: string, careCaseId: string) =>
    request<PatientCondition[]>(`/care-cases/${careCaseId}/conditions`, {}, token),

  catalog: (token: string, careCaseId: string) =>
    request<ConditionCatalogEntry[]>(`/care-cases/${careCaseId}/conditions/catalog`, {}, token),

  create: (token: string, careCaseId: string, data: CreateConditionInput) =>
    request<PatientCondition>(`/care-cases/${careCaseId}/conditions`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (token: string, careCaseId: string, conditionId: string, data: Partial<PatientCondition>) =>
    request<PatientCondition>(`/care-cases/${careCaseId}/conditions/${conditionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, token),

  resolve: (token: string, careCaseId: string, conditionId: string) =>
    request<PatientCondition>(`/care-cases/${careCaseId}/conditions/${conditionId}`, {
      method: "DELETE",
    }, token),
};

// ─── Observations (télésurveillance) ──────────────────────────────────────

export interface ObservationInput {
  metricKey: string;
  valueNumeric?: number;
  valueText?: string;
  valueBoolean?: boolean;
  unit?: string;
  effectiveAt?: string;
  source?: "PATIENT_APP" | "PROVIDER_ENTRY" | "IMPORT" | "CONNECTED_DEVICE" | "TRANSCRIPTION";
}

export interface ObservationRecord {
  id: string;
  careCaseId: string;
  patientId: string;
  metricId: string;
  source: string;
  effectiveAt: string;
  valueNumeric: number | null;
  valueText: string | null;
  valueBoolean: boolean | null;
  unit: string | null;
  metric?: { key: string; label: string; unit: string | null; domain: string };
}

export interface LatestObservation {
  metricKey: string;
  label: string;
  value: number | string | boolean;
  unit?: string;
  effectiveAt: string;
  source: string;
}

export const observationsApi = {
  create: (token: string, careCaseId: string, observations: ObservationInput[]) =>
    request<{
      observations: ObservationRecord[];
      alerts: Alert[];
      summary: { observationsCreated: number; alertsTriggered: number };
    }>(`/care-cases/${careCaseId}/observations`, {
      method: "POST",
      body: JSON.stringify({ observations }),
    }, token),

  list: (token: string, careCaseId: string, params?: {
    metricKey?: string;
    domain?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.metricKey) qs.set("metricKey", params.metricKey);
    if (params?.domain) qs.set("domain", params.domain);
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.offset) qs.set("offset", String(params.offset));
    const query = qs.toString() ? `?${qs}` : "";
    return request<{ observations: ObservationRecord[]; total: number }>(`/care-cases/${careCaseId}/observations${query}`, {}, token);
  },

  latest: (token: string, careCaseId: string) =>
    request<{ latest: Record<string, LatestObservation[]>; total: number }>(
      `/care-cases/${careCaseId}/observations/latest`, {}, token
    ),

  delta: (token: string, careCaseId: string) =>
    request<{ deltas: { metricKey: string; label: string; current: number | null; previous: number | null; delta: number | null; unit: string | null }[]; referenceDate: string | null; total: number }>(
      `/care-cases/${careCaseId}/observations/delta`, {}, token
    ),
};

// ─── Pathway ────────────────────────────────────────────────────────────────

export type MetricStatus = "up_to_date" | "due_soon" | "overdue" | "never";

export interface PathwayMetric {
  metricKey: string;
  label: string;
  unit: string | null;
  domain: string;
  valueType: string;
  cadence: string;
  required: boolean;
  normalMin: number | null;
  normalMax: number | null;
  lastValue: number | string | boolean | null;
  lastDate: string | null;
  status: MetricStatus;
}

export interface PathwayQuestionnaire {
  key: string;
  label: string;
  domain: string;
  cadence: string;
  required: boolean;
}

export interface PathwayRule {
  key: string;
  label: string;
  severity: string;
  enabled: boolean;
  triggered: boolean;
  lastTriggered: string | null;
}

export interface PathwayData {
  pathway: {
    id: string;
    key: string;
    label: string;
    family: string;
    baselinePlan: Record<string, unknown>;
  } | null;
  summary: {
    metricsTotal: number;
    metricsUpToDate: number;
    metricsOverdue: number;
    metricsNever: number;
    rulesActive: number;
    rulesTriggered: number;
  };
  metrics: PathwayMetric[];
  questionnaires: PathwayQuestionnaire[];
  rules: PathwayRule[];
}

export const pathwayApi = {
  get: (token: string, careCaseId: string) =>
    request<PathwayData>(`/care-cases/${careCaseId}/pathway`, {}, token),
};

// ─── Trajectory ─────────────────────────────────────────────────────────────

export type TrendDirection = "improving" | "stable" | "worsening" | "insufficient_data";

export interface TrajectoryDataPoint {
  date: string;
  value: number;
  note?: string;
}

export interface TrajectorySeries {
  metricKey: string;
  label: string;
  unit: string | null;
  normalRange: { min: number | null; max: number | null };
  alertRange: { low: number | null; high: number | null };
  dataPoints: TrajectoryDataPoint[];
  trend: TrendDirection;
  lastValue: number | null;
  delta: number | null;
}

export interface TrajectoryEvent {
  type: string;
  title: string;
  date: string;
}

export interface TrajectoryData {
  careCaseId: string;
  period: string;
  series: TrajectorySeries[];
  events: TrajectoryEvent[];
}

export const trajectoryApi = {
  get: (token: string, careCaseId: string, metrics?: string[], period?: string) => {
    const qs = new URLSearchParams();
    if (metrics?.length) qs.set("metrics", metrics.join(","));
    if (period) qs.set("period", period);
    const q = qs.toString();
    return request<TrajectoryData>(`/care-cases/${careCaseId}/trajectory${q ? `?${q}` : ""}`, {}, token);
  },
};

// ─── Recordings ─────────────────────────────────────────────────────────────

export interface RecordingUploadResult {
  transcription: string;
  duration: number | null;
}

export interface RecordingAnalysisResult {
  noteId: string;
  taskIds: string[];
  summary: string;
  decisions: string[];
  tasks: { title: string; priority: string; dueInDays: number }[];
  keyPoints: string[];
  followUpDate: string | null;
}

export const recordingsApi = {
  upload: async (token: string, audioBlob: Blob, duration?: number): Promise<RecordingUploadResult> => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    if (duration) formData.append("duration", String(duration));

    const res = await fetch(`${API_URL}/recordings/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.error || `Erreur ${res.status}`);
    }
    return res.json();
  },

  analyze: (token: string, data: { transcription: string; careCaseId: string; appointmentId?: string; consentConfirmed?: boolean }) =>
    request<RecordingAnalysisResult>("/recordings/analyze", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),
};

// Helper pour les requêtes avec token depuis le store
export function apiWithToken(token: string) {
  return {
    careCases: {
      list: (p?: { status?: string }) => careCasesApi.list(token, p),
      get: (id: string) => careCasesApi.get(token, id),
      timeline: (id: string, page?: number, limit?: number) => careCasesApi.timeline(token, id, page, limit),
      update: (id: string, data: Partial<CareCaseDetail>) => careCasesApi.update(token, id, data),
    },
    team: { list: (id: string) => teamApi.list(token, id) },
    notes: {
      list: (id: string) => notesApi.list(token, id),
      create: (id: string, data: CreateNoteInput) => notesApi.create(token, id, data),
    },
    tasks: {
      list: (id: string) => tasksApi.list(token, id),
      create: (id: string, data: CreateTaskInput) => tasksApi.create(token, id, data),
      update: (id: string, taskId: string, data: Partial<Task>) => tasksApi.update(token, id, taskId, data),
    },
    alerts: {
      list: (id: string) => alertsApi.list(token, id),
      update: (id: string, alertId: string, data: { status: string }) => alertsApi.update(token, id, alertId, data),
    },
    messages: {
      list: (careCaseId: string, parentId?: string) => messagesApi.list(token, careCaseId, parentId),
      get: (careCaseId: string, messageId: string) => messagesApi.get(token, careCaseId, messageId),
      send: (careCaseId: string, body: string, parentId?: string) => messagesApi.send(token, careCaseId, body, parentId),
      markRead: (careCaseId: string, messageId: string) => messagesApi.markRead(token, careCaseId, messageId),
    },
    referrals: {
      outgoing: (params?: { status?: string; careCaseId?: string }) => referralsApi.outgoing(token, params),
      incoming: (params?: { status?: string }) => referralsApi.incoming(token, params),
      get: (id: string) => referralsApi.get(token, id),
      create: (data: CreateReferralInput) => referralsApi.create(token, data),
      respond: (id: string, decision: "ACCEPTED" | "DECLINED", note?: string) => referralsApi.respond(token, id, decision, note),
      updateStatus: (id: string, status: string) => referralsApi.updateStatus(token, id, status),
    },
    appointments: {
      list: (params?: { careCaseId?: string; status?: string; from?: string; to?: string; providerId?: string }) => appointmentsApi.list(token, params),
      create: (data: Parameters<typeof appointmentsApi.create>[1]) => appointmentsApi.create(token, data),
      patch: (id: string, data: Parameters<typeof appointmentsApi.patch>[2]) => appointmentsApi.patch(token, id, data),
      consultationTypes: (providerId?: string) => appointmentsApi.consultationTypes(token, providerId),
      slots: (providerId?: string) => appointmentsApi.slots(token, providerId),
      createConsultationType: (data: Parameters<typeof appointmentsApi.createConsultationType>[1]) => appointmentsApi.createConsultationType(token, data),
      createSlot: (data: Parameters<typeof appointmentsApi.createSlot>[1]) => appointmentsApi.createSlot(token, data),
      deleteSlot: (id: string) => appointmentsApi.deleteSlot(token, id),
      deleteConsultationType: (id: string) => appointmentsApi.deleteConsultationType(token, id),
      patchConsultationType: (id: string, data: Partial<ConsultationTypeDTO>) => appointmentsApi.patchConsultationType(token, id, data),
    },
    journal: {
      list: (careCaseId: string, params?: { type?: string }) => journalApi.list(token, careCaseId, params),
    },
    conditions: {
      list: (careCaseId: string) => conditionsApi.list(token, careCaseId),
      catalog: (careCaseId: string) => conditionsApi.catalog(token, careCaseId),
      create: (careCaseId: string, data: CreateConditionInput) => conditionsApi.create(token, careCaseId, data),
      update: (careCaseId: string, conditionId: string, data: Partial<PatientCondition>) => conditionsApi.update(token, careCaseId, conditionId, data),
      resolve: (careCaseId: string, conditionId: string) => conditionsApi.resolve(token, careCaseId, conditionId),
    },
    documents: {
      list: (careCaseId: string) => documentsApi.list(token, careCaseId),
      create: (careCaseId: string, data: CreateDocumentInput) => documentsApi.create(token, careCaseId, data),
      upload: (careCaseId: string, file: File, title: string, documentType: string) => documentsApi.upload(token, careCaseId, file, title, documentType),
      download: (careCaseId: string, docId: string) => documentsApi.download(token, careCaseId, docId),
      extractBio: (documentId: string) => bioExtractionApi.extract(token, documentId),
      validateBio: (documentId: string, data: BioValidateInput) => bioExtractionApi.validate(token, documentId, data),
    },
    pathway: {
      get: (careCaseId: string) => pathwayApi.get(token, careCaseId),
    },
    trajectory: {
      get: (careCaseId: string, metrics?: string[], period?: string) =>
        trajectoryApi.get(token, careCaseId, metrics, period),
    },
    observations: {
      create: (careCaseId: string, observations: ObservationInput[]) => observationsApi.create(token, careCaseId, observations),
      list: (careCaseId: string, params?: { domain?: string; limit?: number }) => observationsApi.list(token, careCaseId, params),
      latest: (careCaseId: string) => observationsApi.latest(token, careCaseId),
    },
    recordings: {
      upload: (audioBlob: Blob, duration?: number) => recordingsApi.upload(token, audioBlob, duration),
      analyze: (data: { transcription: string; careCaseId: string; appointmentId?: string; consentConfirmed?: boolean }) =>
        recordingsApi.analyze(token, data),
    },
    intelligence: {
      careGaps: (id: string) => intelligenceApi.careGaps(token, id),
      summarize: (id: string, persist?: boolean) => intelligenceApi.summarize(token, id, persist),
      knowledgeSources: (params?: { status?: string; sourceType?: string }) => intelligenceApi.knowledgeSources(token, params),
      knowledgeSource: (id: string) => intelligenceApi.knowledgeSource(token, id),
      questionnaires: (domain?: string) => intelligenceApi.questionnaires(token, domain),
      metrics: (domain?: string) => intelligenceApi.metrics(token, domain),
      pathways: (family?: string) => intelligenceApi.pathways(token, family),
      conditionLinks: (fromCode?: string) => intelligenceApi.conditionLinks(token, fromCode),
      syncHAS: () => intelligenceApi.syncHAS(token),
      refreshHASSource: (sourceId: string) => intelligenceApi.refreshHASSource(token, sourceId),
      reviewSource: (id: string) => intelligenceApi.reviewSource(token, id),
      validateSource: (id: string) => intelligenceApi.validateSource(token, id),
      publishSource: (id: string) => intelligenceApi.publishSource(token, id),
    },
    onboarding: {
      me: () => onboardingApi.me(token),
      saveIdentity: (data: OnboardingIdentityInput) => onboardingApi.saveIdentity(token, data),
      saveExercise: (data: OnboardingExerciseInput) => onboardingApi.saveExercise(token, data),
      saveNetwork: (data: OnboardingNetworkInput) => onboardingApi.saveNetwork(token, data),
      confirm: (data: OnboardingConfirmInput) => onboardingApi.confirm(token, data),
      saveCertifications: (certifications: OnboardingCertificationInput[]) => onboardingApi.saveCertifications(token, certifications),
      saveConsultation: (data: OnboardingConsultationInput) => onboardingApi.saveConsultation(token, data),
      saveStructures: (structures: OnboardingStructureInput[]) => onboardingApi.saveStructures(token, structures),
    },
    colleagues: {
      list: () => colleaguesApi.list(token),
    },
    patients: {
      createWithCase: (data: CreatePatientWithCaseInput) => patientsApi.createWithCase(token, data),
    },
    connectionRequests: {
      create: (data: { providerId: string; reason?: string; preferredType?: string; message?: string }) => connectionRequestsApi.create(token, data),
      incoming: (status?: string) => connectionRequestsApi.incoming(token, status),
      mine: () => connectionRequestsApi.mine(token),
      respond: (id: string, data: { decision: "ACCEPTED" | "DECLINED"; declineReason?: string; caseType?: string; caseTitle?: string }) => connectionRequestsApi.respond(token, id, data),
    },
    appointmentRequests: {
      list: (status?: string) => appointmentRequestsApi.list(token, status),
      accept: (id: string) => appointmentRequestsApi.accept(token, id),
      decline: (id: string, reason?: string) => appointmentRequestsApi.decline(token, id, reason),
    },
    knowledge: {
      list: (params?: { status?: string; sourceType?: string }) => knowledgeApi.list(token, params),
      get: (id: string) => knowledgeApi.get(token, id),
      review: (id: string) => knowledgeApi.review(token, id),
      validate: (id: string) => knowledgeApi.validate(token, id),
      publish: (id: string) => knowledgeApi.publish(token, id),
      deprecate: (id: string) => knowledgeApi.deprecate(token, id),
    },
    locations: {
      list: () => locationsApi.list(token),
      create: (data: CreateLocationInput) => locationsApi.create(token, data),
      update: (id: string, data: Partial<CreateLocationInput>) => locationsApi.update(token, id, data),
      remove: (id: string) => locationsApi.remove(token, id),
    },
    agendaSettings: {
      get: () => agendaSettingsApi.get(token),
      update: (data: Parameters<typeof agendaSettingsApi.update>[1]) => agendaSettingsApi.update(token, data),
    },
    absences: {
      list: () => absencesApi.list(token),
      create: (data: Parameters<typeof absencesApi.create>[1]) => absencesApi.create(token, data),
      remove: (id: string) => absencesApi.remove(token, id),
    },
    structures: {
      list: () => structuresApi.list(token),
      create: (data: Omit<ProviderStructure, "id" | "providerId" | "createdAt" | "fax">) => structuresApi.create(token, data),
    },
    invitations: {
      create: (data: CreateInvitationInput) => invitationsApi.create(token, data),
      mine: () => invitationsApi.mine(token),
      resend: (id: string) => invitationsApi.resend(token, id),
    },
    patientsBulk: (patients: import("@/app/(cockpit)/patients/import/import.types").PatientImportPayload[]) =>
      request<{ success: boolean; result: import("@/app/(cockpit)/patients/import/import.types").ImportResult }>(
        "/patients/bulk",
        { method: "POST", body: JSON.stringify({ patients }) },
        token,
      ),
    proMessages: {
      getConversations: () => proMessagesApi.getConversations(token),
      getMessages: (conversationId: string) => proMessagesApi.getMessages(token, conversationId),
      sendMessage: (conversationId: string, content: string) => proMessagesApi.sendMessage(token, conversationId, content),
      createDirect: (targetUserId: string) => proMessagesApi.createDirect(token, targetUserId),
      createGroup: (name: string, memberIds: string[], description?: string, type?: string) => proMessagesApi.createGroup(token, name, memberIds, description, type),
      markAsRead: (conversationId: string) => proMessagesApi.markAsRead(token, conversationId),
      deleteMessage: (messageId: string) => proMessagesApi.deleteMessage(token, messageId),
      toggleReaction: (messageId: string, emoji: string) => proMessagesApi.toggleReaction(token, messageId, emoji),
    },
    subscriptions: {
      me: () => request<{ tier: string; subscriptionStart: string | null; subscriptionEnd: string | null; trialUsed: boolean }>("/subscriptions/me", {}, token),
      activate: (tier: string, trigger?: string) => request<{ success: boolean; message: string }>("/subscriptions/activate", { method: "POST", body: JSON.stringify({ tier, trigger }) }, token),
    },
    tasksMine: {
      list: (status?: string) => request<TaskWithContext[]>(status ? `/tasks/mine?status=${status}` : "/tasks/mine", {}, token),
    },
  };
}

export interface TaskWithContext {
  id: string;
  title: string;
  taskType: string;
  status: string;
  priority: string;
  description: string | null;
  dueDate: string | null;
  createdAt: string;
  assignedTo: { id: string; firstName: string; lastName: string } | null;
  createdBy: { id: string; firstName: string; lastName: string };
  careCase: {
    id: string;
    caseTitle: string;
    patient: { id: string; firstName: string; lastName: string };
  };
}
