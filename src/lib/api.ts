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

export const intelligenceApi = {
  careGaps: (token: string, careCaseId: string) =>
    request<GapAnalysis>(`/intelligence/care-gaps/${careCaseId}`, {}, token),

  summarize: (token: string, careCaseId: string, persist = false) =>
    request<SummaryResult>(`/intelligence/summarize/${careCaseId}?persist=${persist}`, {
      method: "POST",
    }, token),
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
  patient: { id: string; firstName: string; lastName: string; email: string };
  leadProvider: { person: { firstName: string; lastName: string } } | null;
  _count: { members: number; activities: number };
}

export interface CareCaseDetail extends Omit<CareCase, "_count"> {
  mainConcern: string | null;
  clinicalSummary: string | null;
  careStage: string | null;
  nextStepSummary: string | null;
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
}

export const appointmentsApi = {
  list: (token: string, params?: { careCaseId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.careCaseId) qs.set("careCaseId", params.careCaseId);
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString();
    return request<Appointment[]>(`/appointments${q ? `?${q}` : ""}`, {}, token);
  },
};

// ─── Journal Patient ─────────────────────────────────────────────────────────

export type JournalEntryType = "MEAL" | "EMOTION" | "SYMPTOM" | "NOTE" | "PHYSICAL_ACTIVITY";

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
  createdAt: string;
  uploadedBy: { id: string; firstName: string; lastName: string };
}

export const documentsApi = {
  list: (token: string, careCaseId: string) =>
    request<Document[]>(`/care-cases/${careCaseId}/documents`, {}, token),
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
  type: "DIRECT" | "GROUP" | "CHANNEL";
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
      list: (params?: { careCaseId?: string; status?: string }) => appointmentsApi.list(token, params),
    },
    journal: {
      list: (careCaseId: string, params?: { type?: string }) => journalApi.list(token, careCaseId, params),
    },
    documents: {
      list: (careCaseId: string) => documentsApi.list(token, careCaseId),
    },
    intelligence: {
      careGaps: (id: string) => intelligenceApi.careGaps(token, id),
      summarize: (id: string, persist?: boolean) => intelligenceApi.summarize(token, id, persist),
    },
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
  };
}
