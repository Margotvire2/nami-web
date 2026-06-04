"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type NoteAnalysis } from "@/lib/api";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import { useRecording } from "@/contexts/RecordingContext";
import { useConsultation } from "@/contexts/ConsultationContext";
import { useAudioConsentGate } from "@/hooks/useAudioConsentGate";
import { PatientHeader } from "./views/PatientHeader";
import { ViewDossier } from "./views/ViewDossier";
import { ViewCoordination } from "./views/ViewCoordination";
import { ViewParcours } from "./views/ViewParcours";
import { ViewOverview } from "./views/ViewOverview";
import { SuiviTab } from "@/components/patient/SuiviTab";
import { PediatricDossier } from "@/components/patient/pediatric/PediatricDossier";
import { ReferralModal } from "./referral-modal";
import { QuickTaskModal } from "./QuickTaskModal";
import { ScheduleQuestionnaireModal } from "./ScheduleQuestionnaireModal";
import { EditPatientModal } from "./EditPatientModal";
import { ConsultationsList } from "./ConsultationsList";
import { PatientSidebar, type PatientSidebarTab } from "./_components/PatientSidebar";
import { QuickActionsBar } from "./_components/QuickActionsBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LayoutDashboard,
  GitBranch,
  ClipboardCheck,
  FlaskConical,
  MessageSquare,
  Mic,
  Baby,
  ChevronRight,
} from "lucide-react";
import { useCareSocket } from "@/hooks/useCareSocket"

type Tab =
  | "overview"
  | "parcours"
  | "bilans"
  | "observations"
  | "messages"
  | "consultations"
  | "pediatrique"
  // Anciens deep-links conservés pour rétro-compat
  | "globale"
  | "suivi"
  | "dossier"
  | "coordination";

const VALID_TABS: Tab[] = [
  "overview",
  "parcours",
  "bilans",
  "observations",
  "messages",
  "consultations",
  "pediatrique",
  "globale",
  "suivi",
  "dossier",
  "coordination",
];

// Mapping rétro-compat — les anciennes clés sont conservées comme alias des
// nouvelles, pour préserver les bookmarks existants.
const TAB_ALIAS: Partial<Record<Tab, Tab>> = {
  globale: "overview",
  suivi: "bilans",
  dossier: "observations",
  coordination: "messages",
};

// ─── NoteInline ───────────────────────────────────────────────────────────────

function NoteInline({
  careCaseId,
  api,
  onClose,
  onCreated,
}: {
  careCaseId: string;
  api: ReturnType<typeof apiWithToken>;
  onClose: () => void;
  onCreated?: (noteId: string) => void;
}) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const create = useMutation({
    mutationFn: () => api.notes.create(careCaseId, { noteType: "EVOLUTION", body }),
    onSuccess: (note) => {
      ["timeline", "notes", "care-case"].forEach((k) =>
        qc.invalidateQueries({ queryKey: [k, careCaseId] })
      );
      toast.success("Note ajoutée");
      onClose();
      onCreated?.(note.id);
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });

  return (
    <div className="border-b bg-white px-6 py-3 shrink-0">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Nouvelle note clinique</p>
        <Textarea
          placeholder="Rédiger une note…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          autoFocus
          className="text-sm resize-none"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="text-xs h-7"
            disabled={!body.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            {create.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── NoteAnalysisBanner ───────────────────────────────────────────────────────

function NoteAnalysisBanner({
  careCaseId,
  noteId,
  api,
  onDismiss,
}: {
  careCaseId: string;
  noteId: string;
  api: ReturnType<typeof apiWithToken>;
  onDismiss: () => void;
}) {
  const { data } = useQuery<NoteAnalysis>({
    queryKey: ["note-analysis", noteId],
    queryFn: () => api.notes.analysis(careCaseId, noteId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "DONE" || status === "ERROR") return false;
      return 2000;
    },
  });

  if (!data || data.status === "NONE") return null;

  const totalItems = (data.suggestedTasks?.length ?? 0) + (data.flaggedItems?.length ?? 0);

  if (data.status === "PENDING") {
    return (
      <div className="border-b bg-indigo-50/60 px-6 py-2 shrink-0 flex items-center gap-2 text-xs text-indigo-700">
        <Loader2 size={12} className="animate-spin shrink-0" />
        <span>Analyse de la note en cours…</span>
        <button onClick={onDismiss} className="ml-auto text-indigo-400 hover:text-indigo-700">
          <X size={13} />
        </button>
      </div>
    );
  }

  if (data.status === "ERROR") {
    return (
      <div className="border-b bg-slate-50 px-6 py-2 shrink-0 flex items-center gap-2 text-xs text-slate-500">
        <AlertTriangle size={12} className="shrink-0" />
        <span>L&apos;analyse n&apos;a pas pu aboutir.</span>
        <button onClick={onDismiss} className="ml-auto text-slate-400 hover:text-slate-600">
          <X size={13} />
        </button>
      </div>
    );
  }

  if (data.status === "DONE" && totalItems === 0) {
    return (
      <div className="border-b bg-slate-50 px-6 py-2 shrink-0 flex items-center gap-2 text-xs text-slate-500">
        <CheckCircle2 size={12} className="shrink-0" />
        <span>Analyse terminée — aucun élément à valider.</span>
        <button onClick={onDismiss} className="ml-auto text-slate-400 hover:text-slate-600">
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div className="border-b bg-indigo-50 px-6 py-2 shrink-0 flex items-center gap-2 text-xs">
      <Sparkles size={12} className="shrink-0 text-indigo-600" />
      <span className="text-indigo-800 font-medium">
        Nami a identifié <strong>{totalItems}</strong> élément{totalItems > 1 ? "s" : ""} à valider
      </span>
      <span className="text-indigo-400 mx-1">—</span>
      <span className="text-indigo-500">brouillon, validation humaine requise</span>
      <button
        onClick={onDismiss}
        className="ml-auto text-indigo-400 hover:text-indigo-700"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PatientV2Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  const api = apiWithToken(accessToken!);
  const { startRecording } = useRecording();
  const { startConsultation } = useConsultation();

  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") as Tab | null;
  const normalizedTab: Tab = (() => {
    if (!rawTab || !VALID_TABS.includes(rawTab)) return "overview";
    return TAB_ALIAS[rawTab] ?? rawTab;
  })();
  const [activeTab, setActiveTabInternal] = useState<Tab>(normalizedTab);

  const setActiveTab = useCallback(
    (tab: Tab) => {
      setActiveTabInternal(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );
  const [noteOpen, setNoteOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [questionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [pendingUploadType, setPendingUploadType] = useState<string | null>(null);

  const handleAddDocument = useCallback(
    (type: string) => {
      setPendingUploadType(type);
      setActiveTab("observations");
    },
    [setActiveTab],
  );
  const [analysisNote, setAnalysisNote] = useState<{ noteId: string; careCaseId: string } | null>(null);
  const [aiStreaming, setAiStreaming] = useState(false);

  // Temps réel — notes, journal, observations, messages du dossier
  useCareSocket(id);

  const { data: careCase, isLoading: careCaseLoading } = useQuery({
    queryKey: ["care-case", id],
    queryFn: () => api.careCases.get(id),
    enabled: !!accessToken,
    retry: 1,
  });

  const { data: dashboard } = usePatientDashboard(id);

  const patientPersonId = careCase?.patient?.id ?? null;
  const patientFullName = careCase
    ? `${careCase.patient.firstName} ${careCase.patient.lastName}`
    : "";
  const { check: gateAudioConsent, banner: audioConsentBanner } = useAudioConsentGate(
    patientPersonId,
    patientFullName,
  );

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleAiSummarize = useCallback(async () => {
    if (!accessToken) return;
    setAiStreaming(true);
    try {
      const res = await fetch(`${API_URL}/intelligence/summarize-job/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Erreur lors de la génération");
      const { jobId } = await res.json() as { jobId: string };

      const deadline = Date.now() + 5 * 60 * 1000;
      const poll = async (): Promise<void> => {
        if (Date.now() > deadline) {
          setAiStreaming(false);
          toast.error("La génération a pris trop de temps");
          return;
        }
        const statusRes = await fetch(`${API_URL}/intelligence/summarize-job/${jobId}/status`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!statusRes.ok) { setAiStreaming(false); return; }
        const { status } = await statusRes.json() as { status: string };
        if (status === "completed") {
          setAiStreaming(false);
          qc.invalidateQueries({ queryKey: ["care-case", id] });
          qc.invalidateQueries({ queryKey: ["notes", id] });
          qc.invalidateQueries({ queryKey: ["timeline", id] });
          toast.success("Synthèse clinique générée");
        } else if (status === "failed") {
          setAiStreaming(false);
          toast.error("Erreur lors de la génération de la synthèse");
        } else {
          setTimeout(poll, 3000);
        }
      };
      setTimeout(poll, 3000);
    } catch {
      setAiStreaming(false);
      toast.error("Erreur de connexion à la synthèse clinique");
    }
  }, [accessToken, id, qc, API_URL]);

  if (!accessToken || careCaseLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-[#5B4EC4]" />
      </div>
    );
  }

  if (!careCase) {
    return (
      <div className="p-8 text-sm text-muted-foreground">Dossier introuvable.</div>
    );
  }

  const dash = dashboard ?? {
    patient: { id: "", firstName: careCase.patient.firstName, lastName: careCase.patient.lastName, age: null, sex: null },
    pathway: null,
    alerts: [],
    screenings: [],
    indicators: [],
    questionnaires: [],
    actions: { urgentTasks: [], upcomingAppointments: [], pendingReferrals: [], suggestedReferrals: [] },
    recentActivity: [],
  };

  // Tabs disponibles — ne sont rendus que ceux dont la View existe.
  // ViewParcours / ViewOverview existent toujours.
  // bilans → SuiviTab, observations → ViewDossier, messages → ViewCoordination
  // pediatrique → PediatricDossier uniquement si caseType === PEDIATRIC.
  const sidebarTabs: PatientSidebarTab[] = [
    { key: "overview", label: "Vue d'ensemble", icon: <LayoutDashboard size={14} /> },
    { key: "parcours", label: "Parcours", icon: <GitBranch size={14} /> },
    { key: "bilans", label: "Bilans & suivi", icon: <FlaskConical size={14} /> },
    { key: "observations", label: "Observations", icon: <ClipboardCheck size={14} /> },
    { key: "messages", label: "Coordination", icon: <MessageSquare size={14} /> },
    { key: "consultations", label: "Consultations", icon: <Mic size={14} /> },
    ...(careCase.caseType === "PEDIATRIC"
      ? [{ key: "pediatrique", label: "Pédiatrie", icon: <Baby size={14} /> }]
      : []),
  ];

  // Counts agrégés pour les badges sidebar
  const sidebarCounts: Record<string, number> = {
    bilans: dash.indicators.filter(
      (i) => i.required && (i.timeStatus === "OVERDUE" || i.timeStatus === "DUE_SOON"),
    ).length,
    observations:
      dash.actions.urgentTasks.length + (careCase._count?.notes ?? 0 > 0 ? 0 : 0),
    messages:
      dash.actions.pendingReferrals.length + dash.actions.suggestedReferrals.length,
  };

  // Tab effectif rendu — fallback ?tab=xyz → overview
  const renderTab: Tab = sidebarTabs.some((t) => t.key === activeTab)
    ? activeTab
    : "overview";

  const patientFullNameRender = `${careCase.patient.firstName} ${careCase.patient.lastName}`;
  const ageRender = careCase.patient.birthDate
    ? Math.floor(
        (Date.now() - new Date(careCase.patient.birthDate).getTime()) /
          (365.25 * 24 * 3600 * 1000),
      )
    : null;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <PatientHeader
        dashboard={dash}
        careCase={careCase}
        careCaseId={id}
        onAddNote={() => setNoteOpen(true)}
        onReferral={() => setReferralOpen(true)}
        onTask={() => setTaskModalOpen(true)}
        onQuestionnaire={() => setQuestionnaireModalOpen(true)}
        onRecord={() =>
          gateAudioConsent(() =>
            startRecording(id, `${careCase.patient.firstName} ${careCase.patient.lastName}`),
          )
        }
        onStartConsultation={async () => {
          try {
            await startConsultation({
              careCaseId: id,
              patientName: `${careCase.patient.firstName} ${careCase.patient.lastName}`,
            });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Impossible de démarrer la consultation");
          }
        }}
        onAiSummarize={handleAiSummarize}
        onEdit={() => setEditPatientOpen(true)}
        aiStreaming={aiStreaming}
      />

      {/* Note inline */}
      {noteOpen && (
        <NoteInline
          careCaseId={id}
          api={api}
          onClose={() => setNoteOpen(false)}
          onCreated={(noteId) => setAnalysisNote({ noteId, careCaseId: id })}
        />
      )}

      {/* Note analysis banner */}
      {analysisNote && (
        <NoteAnalysisBanner
          careCaseId={analysisNote.careCaseId}
          noteId={analysisNote.noteId}
          api={api}
          onDismiss={() => setAnalysisNote(null)}
        />
      )}

      {/* Breadcrumb + QuickActions */}
      <div
        data-testid="patient-360-breadcrumb"
        className="flex items-center justify-between gap-4 px-6 py-2 border-b border-[#E8ECF4] bg-white shrink-0"
      >
        <nav aria-label="fil d'Ariane" className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0">
          <Link href="/patients" className="hover:text-[#4F46E5]">
            Patients
          </Link>
          <ChevronRight size={12} aria-hidden="true" className="text-gray-300" />
          <span className="text-gray-700 font-medium truncate">
            {patientFullNameRender}
            {ageRender !== null ? ` (${ageRender} ans)` : null}
          </span>
        </nav>
        <QuickActionsBar
          onScheduleAppointment={() => setActiveTab("parcours")}
          onSendMessage={() => setActiveTab("messages")}
          onAddDocument={() => handleAddDocument("OTHER")}
        />
      </div>

      {/* Body: sidebar + main */}
      <div className="flex-1 overflow-hidden flex">
        <PatientSidebar
          activeTab={renderTab}
          tabs={sidebarTabs}
          counts={sidebarCounts}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderTab === "overview" && (
              <ViewOverview
                patient={careCase}
                dashboard={dash}
                onNavigateToTab={(tabKey) => setActiveTab(tabKey as Tab)}
              />
            )}
            {renderTab === "parcours" && <ViewParcours careCaseId={id} />}
            {renderTab === "bilans" && (
              <SuiviTab
                careCaseId={id}
                pathwayKey={careCase.pathwayTemplateId ?? "default"}
                personId={careCase.patient?.id}
                patient={{
                  firstName: careCase.patient?.firstName ?? "",
                  lastName: careCase.patient?.lastName ?? "",
                  birthDate: careCase.patient?.birthDate ?? null,
                  sex: careCase.patient?.sex ?? undefined,
                }}
                height={careCase.height ?? null}
                napValue={careCase.napValue ?? null}
                napDescription={careCase.napDescription ?? null}
              />
            )}
            {renderTab === "observations" && (
              <ViewDossier
                careCaseId={id}
                careCase={careCase}
                pendingUploadType={pendingUploadType}
                onPendingUploadConsumed={() => setPendingUploadType(null)}
              />
            )}
            {renderTab === "messages" && (
              <ViewCoordination
                dashboard={dash}
                careCaseId={id}
                patientFirstName={careCase.patient?.firstName ?? ""}
                patientLastName={careCase.patient?.lastName ?? ""}
              />
            )}
            {renderTab === "consultations" && <ConsultationsList careCaseId={id} />}
            {renderTab === "pediatrique" && careCase.caseType === "PEDIATRIC" && (
              <PediatricDossier careCaseId={id} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReferralModal
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        careCaseId={id}
        patientFirstName={careCase.patient?.firstName ?? "le patient"}
        senderRoleType="PROVIDER"
      />
      {taskModalOpen && (
        <QuickTaskModal
          careCaseId={id}
          patientName={`${careCase.patient.firstName} ${careCase.patient.lastName}`}
          onClose={() => setTaskModalOpen(false)}
        />
      )}
      {questionnaireModalOpen && (
        <ScheduleQuestionnaireModal
          careCaseId={id}
          patientFirstName={careCase.patient.firstName}
          patientBirthDate={careCase.patient.birthDate ?? null}
          onClose={() => setQuestionnaireModalOpen(false)}
        />
      )}
      {editPatientOpen && (
        <EditPatientModal
          careCaseId={id}
          personId={careCase.patient.id}
          initialData={{
            firstName: careCase.patient.firstName,
            lastName: careCase.patient.lastName,
            email: careCase.patient.email,
            phone: careCase.patient.phone,
            birthDate: careCase.patient.birthDate,
            sex: careCase.patient.sex,
          }}
          initialPatientFacingTitle={careCase.patientFacingTitle}
          onClose={() => setEditPatientOpen(false)}
        />
      )}

      {audioConsentBanner}
    </div>
  );
}
