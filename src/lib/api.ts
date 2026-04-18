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

export type LoginResponse =
  | { accessToken: string; refreshToken: string; mfaRequired?: false }
  | { mfaRequired: true; mfaPendingToken: string };

export const authApi = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
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
    professionType?: string;
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

  verifyEmail: (token: string) =>
    request<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`),
};

export const mfaApi = {
  setup: (token: string) =>
    request<{ qrCodeDataUrl: string; secret: string }>("/auth/mfa/setup", { method: "POST" }, token),

  enable: (token: string, totp: string) =>
    request<{ message: string }>("/auth/mfa/enable", {
      method: "POST",
      body: JSON.stringify({ totp }),
    }, token),

  validate: (mfaPendingToken: string, totp: string) =>
    request<{ accessToken: string; refreshToken: string }>("/auth/mfa/validate", {
      method: "POST",
      body: JSON.stringify({ mfaPendingToken, totp }),
    }),

  disable: (token: string, totp: string) =>
    request<{ message: string }>("/auth/mfa/disable", {
      method: "POST",
      body: JSON.stringify({ totp }),
    }, token),
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

export interface NoteAnalysis {
  id: string;
  noteId: string;
  status: "PENDING" | "DONE" | "ERROR" | "NONE";
  suggestedTasks: { title: string; priority: "HIGH" | "MEDIUM" | "LOW"; reason: string }[];
  extractedMetrics: { key: string; value: string; unit?: string; date?: string }[];
  flaggedItems: { label: string; type: "DATE" | "MEDICATION" | "CONCERN" | "INSTRUCTION"; detail: string }[];
  errorMessage?: string;
}

export const notesApi = {
  list: (token: string, careCaseId: string) =>
    request<ClinicalNote[]>(`/care-cases/${careCaseId}/notes`, {}, token),

  create: (token: string, careCaseId: string, data: CreateNoteInput) =>
    request<ClinicalNote>(`/care-cases/${careCaseId}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  analysis: (token: string, careCaseId: string, noteId: string) =>
    request<NoteAnalysis>(`/care-cases/${careCaseId}/notes/${noteId}/analysis`, {}, token),
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

  listAll: (token: string, params?: { status?: string; severity?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.severity) qs.set("severity", params.severity);
    const q = qs.toString();
    return request<Alert[]>(`/me/alerts${q ? `?${q}` : ""}`, {}, token);
  },

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
    return request<KnowledgeSource[]>(`/knowledge/knowledge-sources${q ? `?${q}` : ""}`, {}, token);
  },

  knowledgeSource: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}`, {}, token),

  // Catalogues
  questionnaires: (token: string, domain?: string) => {
    const qs = domain ? `?domain=${encodeURIComponent(domain)}` : "";
    return request<any[]>(`/knowledge/questionnaires${qs}`, {}, token);
  },
  metrics: (token: string, domain?: string) => {
    const qs = domain ? `?domain=${encodeURIComponent(domain)}` : "";
    return request<any[]>(`/knowledge/metrics${qs}`, {}, token);
  },
  pathways: (token: string, family?: string) => {
    const qs = family ? `?family=${encodeURIComponent(family)}` : "";
    return request<any[]>(`/knowledge/pathways${qs}`, {}, token);
  },
  conditionLinks: (token: string, fromCode?: string) => {
    const qs = fromCode ? `?fromCode=${encodeURIComponent(fromCode)}` : "";
    return request<any[]>(`/knowledge/condition-links${qs}`, {}, token);
  },

  // HAS sync
  syncHAS: (token: string) =>
    request<{ triggered: boolean; message: string }>("/knowledge/ingest/has", {
      method: "POST",
    }, token),

  refreshHASSource: (token: string, sourceId: string) =>
    request<{ success: boolean; message: string }>(`/knowledge/ingest/has/${sourceId}/refresh`, {
      method: "POST",
    }, token),

  // Workflow
  reviewSource: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}/review`, { method: "POST" }, token),

  validateSource: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}/validate`, { method: "POST" }, token),

  publishSource: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}/publish`, { method: "POST" }, token),

  semanticSearch: (token: string, q: string, limit = 5) =>
    request<{ query: string; results: SemanticSearchResult[] }>(
      `/knowledge/semantic-search?q=${encodeURIComponent(q)}&limit=${limit}`,
      {},
      token
    ),

  knowledgeSearch: (
    token: string,
    q: string,
    opts: { limit?: number; source?: string; category?: string } = {}
  ) => {
    const params = new URLSearchParams({ q });
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.source) params.set("source", opts.source);
    if (opts.category) params.set("category", opts.category);
    return request<{ query: string; count: number; results: KnowledgeSearchResult[] }>(
      `/intelligence/search?${params.toString()}`,
      {},
      token
    );
  },

  knowledgeEntry: (token: string, id: string) =>
    request<KnowledgeEntryDetail>(`/intelligence/knowledge/${id}`, {}, token),

  evaluationStats: (token: string) =>
    request<{
      totalEvaluations: number;
      avgOverallScore: number | null;
      avgSourceCoverage: number | null;
      avgHallucinationRate: number | null;
      avgCompleteness: number | null;
      avgActionability: number | null;
      avgConsistency: number | null;
      scoreDistribution: { bucket: string; count: number }[];
      trend: { date: string; avgScore: number; count: number }[];
      pipelineContext: {
        rerankerEnabled: boolean;
        avgRagChunks: number | null;
        avgGraphRelations: number | null;
      };
    }>(`/intelligence/evaluation-stats`, {}, token),
};

export interface SemanticSearchResult {
  id: string;
  slug: string;
  sectionTitle: string;
  content: string;
  score: number;
}

export interface KnowledgeSearchResult {
  id: string;
  source: "FFAB" | "HAS" | "FICHE" | "FICHE_EXPERT" | "ORPHANET" | "PEDIADOC" | "ALGORITHME";
  category: string;
  subcategory: string | null;
  title: string;
  excerpt: string; // HTML with <mark> highlights
  score: number;
  sourceUrl: string | null;
  publicationDate: string | null;
  gradeEvidence: string | null;
  tags: string[];
  pathwayTypes: string[];
}

export interface KnowledgeEntryDetail {
  id: string;
  source: string;
  category: string;
  subcategory: string | null;
  title: string;
  content: string;
  sourceUrl: string | null;
  sourceRef: string | null;
  publicationDate: string | null;
  gradeEvidence: string | null;
  tags: string[];
  pathwayTypes: string[];
  cim11Codes: string[];
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  personId?: string;
  email: string;
  firstName: string;
  lastName: string;
  roleType: "PATIENT" | "PROVIDER" | "ADMIN" | "ORG_ADMIN" | "SECRETARY";
  emailVerifiedAt?: string | null;
  providerProfile?: {
    id: string;
    specialties: string[];
    totpEnabled?: boolean;
    subscriptionTier?: string;
  };
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
  payload?: Record<string, unknown>;
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
  careCaseId: string;
  alertType: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  title: string;
  description: string | null;
  triggerSource: string;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  resolvedAt: string | null;
  careCase?: {
    id: string;
    status: string;
    patient: { id: string; firstName: string; lastName: string };
  };
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
  sex?: "M" | "F" | "OTHER";
  email?: string;
  phone?: string;
  birthDate?: string;
  caseType: "TCA" | "OBESITY" | "METABOLIC" | "MENTAL_HEALTH" | "PEDIATRIC" | "CHRONIC_PAIN" | "OTHER";
  caseTitle: string;
  mainConcern?: string;
  riskLevel?: "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  inviteMessage?: string;
  pathwayTemplateKey?: string;
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
  allowedConsultTypes: string[];
  activeDays: string[];
  schedule: Record<string, Array<{ start: string; end: string }>>;
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

export type JournalEntryType = "MEAL" | "EMOTION" | "SYMPTOM" | "NOTE" | "PHYSICAL_ACTIVITY" | "CRISIS_EVENT" | "POSITIVE_THOUGHT" | "SLEEP";

export interface JournalEntry {
  id: string;
  careCaseId: string;
  entryType: JournalEntryType;
  payload: Record<string, unknown>;
  occurredAt: string;
  sharedWithTeam: boolean;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string };
  // Photo repas + analyse IA (alimentés après validate-meal-analysis)
  photoUrl: string | null;
  photoAnalyzed: boolean;
  photoValidated: boolean;
  photoMacros: {
    macros: { kcal: number; proteines_g: number; glucides_g: number; lipides_g: number; fibres_g: number };
    aliments: Array<{ nom: string; quantite_g: number }>;
  } | null;
}

export interface NutritionAnalysisResult {
  items: Array<{
    name: string;
    quantity: string;
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>;
  total: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  confidence: "high" | "medium" | "low";
  notes?: string;
  analyzedAt?: string;
}

export const journalApi = {
  list: (token: string, careCaseId: string, params?: { type?: string }) => {
    const qs = params?.type ? `?type=${params.type}` : "";
    return request<JournalEntry[]>(`/care-cases/${careCaseId}/journal${qs}`, {}, token);
  },
  analyzeNutrition: (token: string, entryId: string) =>
    request<NutritionAnalysisResult>(`/journal/${entryId}/nutrition-analysis`, { method: "POST" }, token),
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
  validatedStatus: boolean
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

// ─── Summary diff ────────────────────────────────────────────────────────────

export interface SummaryDiffObs {
  valueNumeric: number | null;
  valueText: string | null;
  unit: string | null;
  effectiveAt: string;
  metric: { key: string; label: string };
}

export interface SummaryDiffNote {
  noteType: string;
  title: string | null;
  createdAt: string;
  author: { firstName: string; lastName: string };
}

export interface SummaryDiffAlert {
  alertType: string;
  title: string;
  severity: string;
  createdAt: string;
}

export interface SummaryDiff {
  lastSummaryAt: string | null;
  hasChanges: boolean;
  newNotes: SummaryDiffNote[];
  newObservations: SummaryDiffObs[];
  newAlerts: SummaryDiffAlert[];
  counts: { notes: number; observations: number; alerts: number };
}

export const summaryDiffApi = {
  get: (token: string, careCaseId: string) =>
    request<SummaryDiff>(`/intelligence/summary-diff/${careCaseId}`, {}, token),
};

// ─── Notifications in-app ────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  activityType: string;
  title: string;
  summary: string | null;
  payload: Record<string, unknown>;
  occurredAt: string;
  careCase: {
    id: string;
    patient: { id: string; firstName: string; lastName: string };
  };
  person: { id: string; firstName: string; lastName: string };
}

export const notificationsApi = {
  list: (token: string, since?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (since) params.set("since", since);
    if (limit) params.set("limit", String(limit));
    const qs = params.size > 0 ? `?${params.toString()}` : "";
    return request<{ items: NotificationItem[]; total: number }>(`/notifications${qs}`, {}, token);
  },
};

// ─── Network Overview ────────────────────────────────────────────────────────

export interface NetworkOverviewStats {
  totalActive: number;
  tasksOverdue: number;
  appointmentsToday: number;
  openAlerts: number;
}

export interface NetworkPatient {
  careCaseId: string;
  caseTitle: string;
  caseType: string;
  status: string;
  riskLevel: string;
  careStage: string | null;
  patient: { id: string; firstName: string; lastName: string; birthDate: string | null };
  pendingTasksCount: number;
  overdueTasksCount: number;
  openAlertsCount: number;
  teamSize: number;
  nextAppointment: { id: string; startAt: string; locationType: string } | null;
  updatedAt: string;
}

export interface NetworkOverview {
  stats: NetworkOverviewStats;
  patients: NetworkPatient[];
}

export const networkApi = {
  overview: (token: string) =>
    request<NetworkOverview>("/provider/network-overview", {}, token),
};

// ─── Documents ───────────────────────────────────────────────────────────────

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

export interface MatchedProvider {
  id: string;
  person: { id: string; firstName: string; lastName: string; photoUrl: string | null };
  specialties: string[];
  subSpecialties: string[];
  publicSpecialties: string[];
  publicBio: string | null;
  languages: string[];
  geographicZones: string[];
  consultationCity: string | null;
  consultationPostalCode: string | null;
  consultationModes: string[];
  acceptsNewPatients: boolean;
  acceptsALD: boolean;
  acceptsCMU: boolean;
  acceptedPatientTypes: string[];
  averageDelay: string | null;
  teleconsultAvailable: boolean;
  onlineBookingUrl: string | null;
  qualificationLevel: string;
  structures: { name: string; city: string; address: string }[];
  consultationTypes: { name: string; durationMinutes: number; price: number | null; consultationMode: string }[];
  criteriaMatch: number; // 0–100 — pertinence selon critères soignant
}

export interface ProviderMatchParams {
  specialties?: string[];
  pathologyKeywords?: string[];
  zones?: string[];
  languages?: string[];
  consultationModes?: string[];
  acceptsNewPatients?: boolean;
  acceptsALD?: boolean;
  acceptsCMU?: boolean;
  patientTypes?: string[];
  limit?: number;
}

export interface ProviderMatchResult {
  total: number;
  criteria: Pick<ProviderMatchParams, "specialties" | "pathologyKeywords" | "zones" | "languages" | "consultationModes">;
  results: MatchedProvider[];
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

// ─── Annuaire Santé (Ameli + RPPS) ─────────────────────────────────────────

export interface DirectoryEntry {
  id: string;
  type: "PS" | "CDS";
  name: string;
  lastName: string;
  firstName: string | null;
  specialty: string;
  specialtyCode: string;
  profession: string | null;
  convention: string | null;
  conventionCode: string | null;
  option: string | null;
  exerciseType: string | null;
  carteVitale: boolean;
  phone: string | null;
  address: string;
  postalCode: string;
  city: string;
  finess: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface DirectorySearchResult {
  total: number;
  count: number;
  offset: number;
  limit: number;
  source: string;
  results: DirectoryEntry[];
}

export interface DirectoryStats {
  total: number;
  byType: Record<string, number>;
  topSpecialties: { label: string; count: number }[];
  topCities: { city: string; count: number }[];
}

export const annuaireApi = {
  search: (token: string, params: {
    q?: string; specialty?: string; city?: string; postalCode?: string;
    convention?: string; type?: string; limit?: number; offset?: number;
  }) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v != null && v !== "") qs.set(k, String(v)); });
    return request<DirectorySearchResult>(`/annuaire/directory?${qs}`, {}, token);
  },
  get: (token: string, id: string) =>
    request<DirectoryEntry>(`/annuaire/directory/${id}`, {}, token),
  stats: (token: string) =>
    request<DirectoryStats>(`/annuaire/directory/stats`, {}, token),
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
    return request<KnowledgeSource[]>(`/knowledge/knowledge-sources${q ? `?${q}` : ""}`, {}, token);
  },
  get: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}`, {}, token),
  review: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}/review`, { method: "POST" }, token),
  validate: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}/validate`, { method: "POST" }, token),
  publish: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}/publish`, { method: "POST" }, token),
  deprecate: (token: string, id: string) =>
    request<KnowledgeSource>(`/knowledge/knowledge-sources/${id}/deprecate`, { method: "POST" }, token),
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
  existingAccount?: boolean;
  inviteeRoleType?: string | null;
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

export const authActivateApi = (email: string, password: string) =>
  request<{ accessToken: string; refreshToken: string }>("/auth/activate", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

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

export interface DeltaObservation {
  metricKey: string;
  label: string;
  unit: string | null;
  domain: string;
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number;
  direction: "up" | "down" | "stable";
  currentDate: string;
  previousDate: string;
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
    request<{ deltas: DeltaObservation[]; referenceDate: string | null; total: number }>(
      `/care-cases/${careCaseId}/observations/delta`, {}, token
    ),

  sessions: (token: string, careCaseId: string, prefix = "bia_", maxSessions = 5) =>
    request<{
      sessions: Array<{ date: string; values: Record<string, number> }>;
      metricKeys: Record<string, { label: string; unit: string | null }>;
    }>(
      `/care-cases/${careCaseId}/observations/sessions?prefix=${encodeURIComponent(prefix)}&sessions=${maxSessions}`,
      {}, token
    ),

  trajectory: (token: string, careCaseId: string, opts?: { window?: number; threshold?: number }) => {
    const qs = new URLSearchParams();
    if (opts?.window) qs.set("window", String(opts.window));
    if (opts?.threshold) qs.set("threshold", String(opts.threshold));
    const q = qs.toString();
    return request<{
      computedAt: string;
      window: number;
      threshold: number;
      deviations: TrajectoryMetric[];
      stable: TrajectoryMetric[];
    }>(`/care-cases/${careCaseId}/observations/trajectory${q ? `?${q}` : ""}`, {}, token);
  },
};

export interface TrajectoryMetric {
  metricKey: string;
  metricLabel: string;
  unit: string | null;
  domain: string | null;
  zScore: number;
  direction: "up" | "down";
  currentValue: number;
  predictedValue: number;
  trendSlope: number;
  trendSlopeLabel: string;
  residual: number;
  stdResidual: number;
  deviationLabel: string;
  spark: { value: number; predicted: number; date: string }[];
  n: number;
  usedOLS: boolean;
  // legacy fallback (may be absent on OLS results)
  mean?: number;
  stddev?: number;
}

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

export interface PathwaySuggestion {
  id: string;
  key: string;
  label: string;
  score: number;
  matchReasons: string[];
  metricsCount: number;
  questionnairesCount: number;
  rulesCount: number;
  phasesCount: number;
  baselinePlan: Record<string, unknown> | null;
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
  transcriptDocId: string | null;
  summary: string;
  motif: string;
  examenClinique: string;
  planDeSoins: string;
  ordonnances: string[];
  decisions: string[];
  suggestedTasks: { title: string; priority: string; dueInDays: number }[];
  keyPoints: string[];
  followUpDate: string | null;
  hasPrescriptionDraft: boolean;
}

export interface PrescriptionDraft {
  id: string;
  careCaseId: string;
  patientId: string;
  prescriberId: string;
  clinicalNoteId: string | null;
  sourceTranscriptDocId: string | null;
  status: "DRAFT" | "REVIEWED" | "SIGNED" | "CANCELLED";
  content: {
    medications: {
      name: string; genericName: string | null; brandName: string | null;
      dosage: string; form: string; route: string; frequency: string;
      duration: string; startDate: string | null; instructions: string | null;
      confidence: number; sourceSpan: string;
    }[];
    complementaryActs: {
      type: string; description: string; urgency: string | null;
      confidence: number; sourceSpan: string;
    }[];
    warnings: string[];
  };
  extractionConfidence: number | null;
  prescriberNotes: string | null;
  signedAt: string | null;
  signatureMethod: string | null;
  signatureHash: string | null;
  pdfDocumentId: string | null;
  createdAt: string;
  updatedAt: string;
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

// ─── Prescription Drafts ─────────────────────────────────────────────────────

export const prescriptionDraftsApi = {
  list: (token: string, careCaseId?: string) =>
    request<{ drafts: PrescriptionDraft[]; count: number }>(
      `/prescription-drafts${careCaseId ? `?careCaseId=${careCaseId}&status=DRAFT` : ""}`,
      {}, token
    ),
  get: (token: string, id: string) =>
    request<PrescriptionDraft>(`/prescription-drafts/${id}`, {}, token),
  patch: (token: string, id: string, data: { content?: PrescriptionDraft["content"]; prescriberNotes?: string }) =>
    request<PrescriptionDraft>(`/prescription-drafts/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),
  sign: (token: string, id: string) =>
    request<{ ok: boolean; draft: PrescriptionDraft; pdfUrl: string; pdfDocumentId: string; signedAt: string }>(
      `/prescription-drafts/${id}/sign`, { method: "POST", body: JSON.stringify({ signatureMethod: "INTERNAL" }) }, token
    ),
  cancel: (token: string, id: string) =>
    request<{ ok: boolean }>(`/prescription-drafts/${id}`, { method: "DELETE" }, token),
};

// Helper pour les requêtes avec token depuis le store
// ─── RCP ────────────────────────────────────────────────────────────────────

export interface Rcp {
  id: string;
  careCaseId: string;
  title: string;
  rcpType: "ASYNC" | "SYNC";
  urgency: "ROUTINE" | "URGENT" | "EMERGENCY";
  status: "OPEN" | "IN_PROGRESS" | "PENDING_DECISION" | "CLOSED" | "CANCELLED";
  context: string | null;
  questions: string[];
  participantIds: string[];
  respondedIds: string[];
  decision: string | null;
  decisionType: "CONSENSUS" | "MAJORITY" | "INITIATOR_DECISION" | null;
  aiSummary: string | null;
  draftCr: string | null;
  conclusionNoteId: string | null;
  conversationId: string | null;
  taskIds: string[];
  openedAt: string;
  deadline: string | null;
  scheduledAt: string | null;
  closedAt: string | null;
  initiatorId: string;
  initiator?: { firstName: string; lastName: string; roleType: string };
  createdAt: string;
  updatedAt: string;
}

export interface RcpSummary extends Rcp {
  opinionsCount: number;
  myOpinionGiven: boolean;
  waitingForMyOpinion: boolean;
}

export interface RcpOpinion {
  id: string;
  body: string;
  createdAt: string;
  authorPersonId: string;
  author: { firstName: string; lastName: string; roleType: string; providerProfile: { specialties: string[] } | null };
}

export interface RcpParticipant {
  id: string;
  firstName: string;
  lastName: string;
  roleType: string;
  providerProfile: { specialties: string[] } | null;
}

export interface RcpObservation {
  key: string;
  label: string;
  value: number | string | null;
  unit: string | null;
  date: string;
}

export interface RcpDetail extends RcpSummary {
  opinions: RcpOpinion[];
  alerts: { severity: string; title: string; description: string | null }[];
  observations: RcpObservation[];
  participants: RcpParticipant[];
  canClose: boolean;
}

export interface CreateRcpInput {
  title: string;
  rcpType?: "ASYNC" | "SYNC";
  urgency?: "ROUTINE" | "URGENT" | "EMERGENCY";
  context?: string;
  questions?: string[];
  participantIds: string[];
  deadline?: string;
  scheduledAt?: string;
  generateContext?: boolean;
}

export interface CloseRcpInput {
  decision: string;
  decisionType: "CONSENSUS" | "MAJORITY" | "INITIATOR_DECISION";
  actions?: {
    title: string;
    description?: string;
    assignedToPersonId?: string;
    dueDate?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  }[];
}

// ─── Patient Portal types ─────────────────────────────────────────────────────

export interface PatientMe {
  person: {
    id: string; firstName: string; lastName: string; email: string;
    phone: string | null; birthDate: string | null; sex: string | null; photoUrl: string | null;
  };
  careCases: Array<{
    id: string; caseTitle: string; caseType: string; status: string; startDate: string;
    members: Array<{
      id: string; personId: string; roleInCase: string;
      person: { id: string; firstName: string; lastName: string; photoUrl: string | null };
      provider: { id: string; specialties: string[] } | null;
    }>;
  }>;
}

export interface PatientAppointment {
  id: string; startAt: string; endAt: string; status: string;
  locationType: string; notes: string | null;
  provider: { person: { firstName: string; lastName: string } };
  consultationType: { name: string; durationMinutes: number } | null;
  location: { name: string; address: string | null; city: string | null; color: string | null } | null;
}

export interface PatientDocument {
  id: string; title: string; documentType: string; fileUrl: string;
  mimeType: string; sizeBytes: number; createdAt: string; careCaseId: string;
  uploadedBy: { firstName: string; lastName: string; roleType: string };
}

export interface PatientMessage {
  id: string; body: string; createdAt: string; careCaseId: string;
  sender: { id: string; firstName: string; lastName: string; roleType: string; photoUrl: string | null };
  reads: Array<{ personId: string; readAt: string }>;
}

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
      analysis: (careCaseId: string, noteId: string) => notesApi.analysis(token, careCaseId, noteId),
    },
    tasks: {
      list: (id: string) => tasksApi.list(token, id),
      create: (id: string, data: CreateTaskInput) => tasksApi.create(token, id, data),
      update: (id: string, taskId: string, data: Partial<Task>) => tasksApi.update(token, id, taskId, data),
      scheduleQuestionnaire: (
        careCaseId: string,
        data: { questionnaireCode: string; scheduledAt: string; patientMessage?: string; priority?: string }
      ) =>
        request<Task>(
          `/care-cases/${careCaseId}/tasks/schedule-questionnaire`,
          { method: "POST", body: JSON.stringify(data) },
          token
        ),
    },
    alerts: {
      list: (id: string) => alertsApi.list(token, id),
      listAll: (params?: { status?: string; severity?: string }) => alertsApi.listAll(token, params),
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
      analyzeNutrition: (entryId: string) => journalApi.analyzeNutrition(token, entryId),
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
      suggestions: (careCaseId: string) =>
        request<{ suggestions: PathwaySuggestion[]; alreadyAssigned: boolean; patientAgeYears: number | null }>(
          `/care-cases/${careCaseId}/pathway-suggestions`, {}, token
        ),
    },
    trajectory: {
      get: (careCaseId: string, metrics?: string[], period?: string) =>
        trajectoryApi.get(token, careCaseId, metrics, period),
    },
    observations: {
      create: (careCaseId: string, observations: ObservationInput[]) => observationsApi.create(token, careCaseId, observations),
      list: (careCaseId: string, params?: { metricKey?: string; domain?: string; from?: string; to?: string; limit?: number; offset?: number }) => observationsApi.list(token, careCaseId, params),
      latest: (careCaseId: string) => observationsApi.latest(token, careCaseId),
      sessions: (careCaseId: string, prefix?: string, maxSessions?: number) => observationsApi.sessions(token, careCaseId, prefix, maxSessions),
      trajectory: (careCaseId: string, opts?: { window?: number; threshold?: number }) => observationsApi.trajectory(token, careCaseId, opts),
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
      semanticSearch: (q: string, limit?: number) => intelligenceApi.semanticSearch(token, q, limit),
      knowledgeEntry: (id: string) => intelligenceApi.knowledgeEntry(token, id),
      knowledgeSearch: (q: string, opts?: { limit?: number; source?: string; category?: string }) =>
        intelligenceApi.knowledgeSearch(token, q, opts),
      evaluationStats: () => intelligenceApi.evaluationStats(token),
    },
    prescriptionDrafts: {
      list: (careCaseId?: string) => prescriptionDraftsApi.list(token, careCaseId),
      get: (id: string) => prescriptionDraftsApi.get(token, id),
      patch: (id: string, data: { content?: PrescriptionDraft["content"]; prescriberNotes?: string }) =>
        prescriptionDraftsApi.patch(token, id, data),
      sign: (id: string) => prescriptionDraftsApi.sign(token, id),
      cancel: (id: string) => prescriptionDraftsApi.cancel(token, id),
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
    providers: {
      match: (params: ProviderMatchParams) =>
        request<ProviderMatchResult>("/providers/match", { method: "POST", body: JSON.stringify(params) }, token),
    },
    annuaire: {
      search: (params: Parameters<typeof annuaireApi.search>[1]) => annuaireApi.search(token, params),
      get: (id: string) => annuaireApi.get(token, id),
      stats: () => annuaireApi.stats(token),
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
    rcps: {
      list:      (careCaseId: string) => request<RcpSummary[]>(`/care-cases/${careCaseId}/rcps`, {}, token),
      create:    (careCaseId: string, data: CreateRcpInput) =>
        request<Rcp>(`/care-cases/${careCaseId}/rcps`, { method: "POST", body: JSON.stringify(data) }, token),
      get:       (rcpId: string) => request<RcpDetail>(`/rcps/${rcpId}`, {}, token),
      opinion:   (rcpId: string, data: { content: string; position?: string }) =>
        request<{ id: string }>(`/rcps/${rcpId}/opinions`, { method: "POST", body: JSON.stringify(data) }, token),
      close:     (rcpId: string, data: CloseRcpInput) =>
        request<{ rcp: Rcp; conclusionNote: { id: string }; tasksCreated: number }>(`/rcps/${rcpId}/close`, { method: "POST", body: JSON.stringify(data) }, token),
      cancel:    (rcpId: string) => request<Rcp>(`/rcps/${rcpId}/cancel`, { method: "POST" }, token),
      patch:     (rcpId: string, data: Partial<CreateRcpInput>) =>
        request<Rcp>(`/rcps/${rcpId}`, { method: "PATCH", body: JSON.stringify(data) }, token),
      summarize: (rcpId: string) => request<{ aiSummary: string }>(`/rcps/${rcpId}/summarize`, { method: "POST" }, token),
      draftCr:   (rcpId: string) => request<{ draft: string }>(`/rcps/${rcpId}/draft-cr`, { method: "POST" }, token),
      exportPdfUrl: (rcpId: string) => `${API_URL}/rcps/${rcpId}/export-pdf`,
    },
    billing: {
      tariffs: (params?: { q?: string; category?: string; nomenclature?: string }) => {
        const qs = new URLSearchParams(params as Record<string, string>).toString();
        return request<BillingTariff[]>(`/billing/tariffs${qs ? `?${qs}` : ""}`, {}, token);
      },
      invoices: (params?: { patientId?: string; status?: string }) => {
        const qs = new URLSearchParams(params as Record<string, string>).toString();
        return request<Invoice[]>(`/billing/invoices${qs ? `?${qs}` : ""}`, {}, token);
      },
      invoice: (id: string) => request<Invoice>(`/billing/invoices/${id}`, {}, token),
      create: (data: CreateInvoiceInput) =>
        request<Invoice>("/billing/invoices", { method: "POST", body: JSON.stringify(data) }, token),
      updateLines: (id: string, lines: InvoiceLineInput[]) =>
        request<Invoice>(`/billing/invoices/${id}/lines`, { method: "PUT", body: JSON.stringify({ lines }) }, token),
      finalize: (id: string) =>
        request<Invoice>(`/billing/invoices/${id}/finalize`, { method: "POST" }, token),
      cancel: (id: string) =>
        request<{ message: string }>(`/billing/invoices/${id}`, { method: "DELETE" }, token),
      getConfig: () => request<BillingConfig>("/billing/config", {}, token),
      updateConfig: (data: Partial<Omit<BillingConfig, "id" | "personId" | "lastInvoiceNumber">>) =>
        request<BillingConfig>("/billing/config", { method: "PATCH", body: JSON.stringify(data) }, token),
    },
    patient: {
      me: () => request<PatientMe>("/patient/me", {}, token),
      patchMe: (data: { phone?: string; birthDate?: string; sex?: string }) =>
        request<PatientMe["person"]>("/patient/me", { method: "PATCH", body: JSON.stringify(data) }, token),
      appointments: (status?: "upcoming" | "past") =>
        request<PatientAppointment[]>(`/patient/appointments${status ? `?status=${status}` : ""}`, {}, token),
      documents: () => request<PatientDocument[]>("/patient/documents", {}, token),
      messages: (careCaseId: string) =>
        request<PatientMessage[]>(`/patient/messages/${careCaseId}`, {}, token),
      sendMessage: (careCaseId: string, body: string) =>
        request<PatientMessage>(`/patient/messages/${careCaseId}`, { method: "POST", body: JSON.stringify({ body }) }, token),
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

// ─── Billing ─────────────────────────────────────────────────────────────────

export interface BillingConfig {
  id: string;
  personId: string;
  rppsNumber: string | null;
  amNumber: string | null;
  finessNumber: string | null;
  siretNumber: string | null;
  sector: string;
  isOPTAM: boolean;
  caisseCode: string | null;
  caisseLabel: string | null;
  centreGestion: string | null;
  defaultPaymentMode: string;
  autoTransmit: boolean;
  lastInvoiceNumber: number;
}

export interface LibreInvoiceLine {
  description: string;
  unitPrice: number;
  quantity: number;
}

export interface BillingTariff {
  id: string;
  code: string;
  label: string;
  nomenclature: "NGAP" | "CCAM";
  category: "CONSULTATION" | "VISIT" | "TECHNICAL" | "MAJORATION" | "FORFAIT";
  priceMetropole: number;
  priceDom: number | null;
  sector1Only: boolean;
  specialties: string[];
  cumulRules: string | null;
  conditions: string | null;
  sourceRef: string | null;
  validFrom: string;
  validTo: string | null;
}

export interface InvoiceLine {
  id: string;
  actCode: string;
  actLabel: string;
  nomenclature: "NGAP" | "CCAM";
  category: string;
  quantity: number;
  coefficient: number;
  unitPrice: number;
  totalPrice: number;
  baseRemb: number;
  tauxRemb: number;
  montantAMO: number;
  depassement: number;
  isExonerated: boolean;
  lineOrder: number;
  tariff: { code: string; label: string; cumulRules: string | null } | null;
}

export interface Invoice {
  id: string;
  invoiceNumber: string | null;
  status: "DRAFT" | "READY" | "SIGNED" | "TRANSMITTED" | "ACKNOWLEDGED" | "PAID" | "REJECTED" | "CANCELLED";
  careDate: string;
  paymentMode: "TIERS_PAYANT_TOTAL" | "TIERS_PAYANT_PARTIEL" | "PAIEMENT_DIRECT";
  isALD: boolean;
  isMaternity: boolean;
  sector: string | null;
  totalHonoraires: number;
  totalBase: number;
  totalDepassement: number;
  totalAMO: number;
  totalPatient: number;
  participationForfaitaire: number;
  notes: string | null;
  createdAt: string;
  patient: { id: string; firstName: string; lastName: string };
  careCase: { id: string; caseTitle: string } | null;
  lines: InvoiceLine[];
}

export interface CreateInvoiceInput {
  patientId: string;
  careCaseId?: string;
  careDate: string;
  paymentMode?: "TIERS_PAYANT_TOTAL" | "TIERS_PAYANT_PARTIEL" | "PAIEMENT_DIRECT";
  sector?: string;
  isALD?: boolean;
  aldNumber?: string;
  isAccident?: boolean;
  isMaternity?: boolean;
  notes?: string;
}

// ─── Generic API client (lit le token depuis le store Zustand persisté) ──────

function getPersistedToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("nami-auth");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function apiRequest<T = any>(method: string, url: string, body?: unknown): Promise<{ data: T }> {
  const token = getPersistedToken();
  const res = await fetch(`${API_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erreur ${res.status}`);
  }
  return { data: await res.json() };
}

export const api = {
  defaults: { baseURL: API_URL },
  get:    <T = any>(url: string)                    => apiRequest<T>("GET",    url),
  post:   <T = any>(url: string, body?: unknown)    => apiRequest<T>("POST",   url, body),
  patch:  <T = any>(url: string, body?: unknown)    => apiRequest<T>("PATCH",  url, body),
  delete: <T = any>(url: string)                    => apiRequest<T>("DELETE", url),
};

// ─── Secretary types ──────────────────────────────────────────────────────────

export interface SecretaryAppointment {
  id: string;
  startAt: string;
  endAt: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "PATIENT_ARRIVED";
  patient: { id: string; firstName: string; lastName: string; phone: string | null; birthDate: string | null } | null;
  consultationType: { name: string; durationMinutes: number; color: string | null } | null;
  notes: string | null;
}

export interface SecretaryAgenda {
  providerId: string;
  providerName: string;
  specialties: string[];
  appointments: SecretaryAppointment[];
}

export interface SecretaryAgendasResponse {
  date: string;
  agendas: SecretaryAgenda[];
}

export interface SecretaryWaitingEntry {
  appointmentId: string;
  patientName: string;
  providerName: string;
  scheduledAt: string;
  waitingMinutes: number;
}

export interface SecretaryPatientResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  sex: string | null;
}

async function secretaryApiRequest<T>(path: string, options: RequestInit = {}, token: string): Promise<T> {
  return request<T>(path, options, token);
}

export function secretaryApi(token: string) {
  return {
    getAgendas: (date?: string): Promise<SecretaryAgendasResponse> =>
      secretaryApiRequest(`/secretary/agendas${date ? `?date=${date}` : ""}`, {}, token),

    createAppointment: (data: {
      providerId: string;
      patientId?: string;
      patientFirstName?: string;
      patientLastName?: string;
      patientPhone?: string;
      patientEmail?: string;
      startAt: string;
      endAt?: string;
      consultationTypeId?: string;
      notes?: string;
    }): Promise<SecretaryAppointment> =>
      secretaryApiRequest("/secretary/appointments", { method: "POST", body: JSON.stringify(data) }, token),

    updateAppointment: (id: string, data: { startAt?: string; endAt?: string; status?: string; notes?: string }): Promise<SecretaryAppointment> =>
      secretaryApiRequest(`/secretary/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }, token),

    cancelAppointment: (id: string): Promise<{ success: boolean }> =>
      secretaryApiRequest(`/secretary/appointments/${id}`, { method: "DELETE" }, token),

    markArrived: (id: string): Promise<{ success: boolean }> =>
      secretaryApiRequest(`/secretary/appointments/${id}/arrived`, { method: "POST" }, token),

    getWaitingRoom: (): Promise<SecretaryWaitingEntry[]> =>
      secretaryApiRequest("/secretary/waiting-room", {}, token),

    searchPatients: (q: string): Promise<SecretaryPatientResult[]> =>
      secretaryApiRequest(`/secretary/patients/search?q=${encodeURIComponent(q)}`, {}, token),

    getPatient: (id: string): Promise<{ patient: SecretaryPatientResult; appointments: SecretaryAppointment[] }> =>
      secretaryApiRequest(`/secretary/patients/${id}`, {}, token),
  };
}

export interface InvoiceLineInput {
  actCode: string;
  tariffId?: string;
  quantity?: number;
  coefficient?: number;
  unitPrice: number;
  depassement?: number;
  isExonerated?: boolean;
}
