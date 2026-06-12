"use client";

import { use, useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type NoteAnalysis } from "@/lib/api";
import { usePatientDashboard } from "@/hooks/usePatientDashboard";
import { useConsultation } from "@/contexts/ConsultationContext";
import { useAudioConsentGate } from "@/hooks/useAudioConsentGate";
import { PatientHeader } from "./views/PatientHeader";
import { ViewGlobale } from "./views/ViewGlobale";
import { ViewDossier } from "./views/ViewDossier";
import { ViewCoordination } from "./views/ViewCoordination";
import { ViewParcours } from "./views/ViewParcours";
import { SuiviTab } from "@/components/patient/SuiviTab";
import { PediatricDossier } from "@/components/patient/pediatric/PediatricDossier";
import { ReferralModal } from "@/components/adressages/ReferralModal";
import { QuickTaskModal } from "./QuickTaskModal";
import { ScheduleQuestionnaireModal } from "./ScheduleQuestionnaireModal";
import { EditPatientModal } from "./EditPatientModal";
import { ConsultationsList } from "./ConsultationsList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, X, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { AnimatedTabs } from "@/components/ui/AnimatedTabs"
import { useCareSocket } from "@/hooks/useCareSocket"

type Tab = "globale" | "suivi" | "parcours" | "dossier" | "coordination" | "consultations" | "pediatrique";

const TABS: { key: Tab; label: string }[] = [
  { key: "globale", label: "Vue globale" },
  { key: "suivi", label: "Suivi" },
  { key: "parcours", label: "Parcours" },
  { key: "dossier", label: "Dossier" },
  { key: "coordination", label: "Coordination" },
  { key: "consultations", label: "Consultations" },
];

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
        <span>L'analyse n'a pas pu aboutir.</span>
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
  const { startConsultation } = useConsultation();

  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab | null) ?? "globale";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [noteOpen, setNoteOpen] = useState(false);
  const [referralOpen, setReferralOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [questionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [pendingUploadType, setPendingUploadType] = useState<string | null>(null);

  const handleAddDocument = useCallback((type: string) => {
    setPendingUploadType(type);
    setActiveTab("dossier");
  }, []);
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

  // [BUG-06] Ref-tracked mount state — évite setState après unmount + permet
  // d'annuler proprement le polling si l'utilisateur quitte la page.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleAiSummarize = useCallback(async () => {
    if (!accessToken) return;

    // [BUG-06] Bascule immédiatement sur la Vue globale pour que le résultat
    // soit visible dès que `clinicalSummary` est mis à jour (queryKey partagée).
    setActiveTab("globale");
    setAiStreaming(true);

    // [BUG-06] Reset garanti dans tous les paths (succès, erreur, timeout,
    // 404 cache perdu, status inconnu) — fix du blocage en "Génération…".
    const finish = (opts: { invalidate?: boolean; message?: { kind: "success" | "error" | "info"; text: string } } = {}) => {
      if (!mountedRef.current) return;
      setAiStreaming(false);
      if (opts.invalidate) {
        qc.invalidateQueries({ queryKey: ["care-case", id] });
        qc.invalidateQueries({ queryKey: ["notes", id] });
        qc.invalidateQueries({ queryKey: ["timeline", id] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      }
      if (opts.message) {
        if (opts.message.kind === "success") toast.success(opts.message.text);
        else if (opts.message.kind === "error") toast.error(opts.message.text);
        else toast.info(opts.message.text);
      }
    };

    try {
      const res = await fetch(`${API_URL}/intelligence/summarize-job/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        finish({ message: { kind: "error", text: "Erreur lors de la génération" } });
        return;
      }
      const { jobId } = (await res.json()) as { jobId?: string };
      if (!jobId) {
        finish({ invalidate: true, message: { kind: "info", text: "Synthèse actualisée" } });
        return;
      }

      // [BUG-06] Deadline réduite à 90s (au-delà = backend coincé, on rafraîchit
      // quand même au cas où la DB contient déjà le résultat — cache _summarizeCache
      // in-memory côté Railway peut être perdu en cas de redémarrage).
      const deadline = Date.now() + 90 * 1000;

      const poll = async (): Promise<void> => {
        if (!mountedRef.current) return;
        if (Date.now() > deadline) {
          finish({
            invalidate: true,
            message: { kind: "info", text: "La génération prend plus de temps que prévu — résultat chargé si disponible." },
          });
          return;
        }
        let statusRes: Response;
        try {
          statusRes = await fetch(`${API_URL}/intelligence/summarize-job/${jobId}/status`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        } catch {
          // Réseau coupé / fetch reject → on tente quand même un rafraîchissement.
          finish({ invalidate: true, message: { kind: "info", text: "Connexion interrompue — résultat chargé si disponible." } });
          return;
        }
        // 404 = jobId perdu côté backend (redémarrage Railway). La synthèse est
        // peut-être déjà persistée en DB → invalidate pour rafraîchir l'UI.
        if (statusRes.status === 404) {
          finish({ invalidate: true, message: { kind: "info", text: "Synthèse actualisée" } });
          return;
        }
        if (!statusRes.ok) {
          finish({ invalidate: true, message: { kind: "error", text: "Erreur lors de la génération de la synthèse" } });
          return;
        }
        const data = (await statusRes.json()) as { status?: string };
        const status = String(data.status ?? "").toLowerCase();
        if (status === "completed" || status === "done") {
          finish({ invalidate: true, message: { kind: "success", text: "Synthèse clinique générée" } });
          return;
        }
        if (status === "failed" || status === "error") {
          finish({ message: { kind: "error", text: "Erreur lors de la génération de la synthèse" } });
          return;
        }
        if (status === "pending" || status === "active") {
          setTimeout(poll, 3000);
          return;
        }
        // Status inconnu → on sort proprement et on rafraîchit (pas de boucle infinie).
        finish({ invalidate: true, message: { kind: "info", text: "Synthèse actualisée" } });
      };
      setTimeout(poll, 3000);
    } catch {
      finish({ message: { kind: "error", text: "Erreur de connexion à la synthèse clinique" } });
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

      {/* Tab bar */}
      <AnimatedTabs
        tabs={[
          ...TABS,
          ...(careCase.caseType === "PEDIATRIC" ? [{ key: "pediatrique" as Tab, label: "Pédiatrie" }] : []),
        ].map((t) => ({ id: t.key, label: t.label }))}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as Tab)}
        className="bg-card px-6 shrink-0"
      />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === "globale" && (
            <ViewGlobale dashboard={dash} careCaseId={id} careCase={careCase} onAddDocument={handleAddDocument} />
          )}
          {activeTab === "suivi" && (
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
          {activeTab === "parcours" && <ViewParcours careCaseId={id} />}
          {activeTab === "dossier" && (
            <ViewDossier
              careCaseId={id}
              careCase={careCase}
              pendingUploadType={pendingUploadType}
              onPendingUploadConsumed={() => setPendingUploadType(null)}
            />
          )}
          {activeTab === "coordination" && (
            <ViewCoordination
              dashboard={dash}
              careCaseId={id}
              patientFirstName={careCase.patient?.firstName ?? ""}
              patientLastName={careCase.patient?.lastName ?? ""}
            />
          )}
          {activeTab === "consultations" && (
            <ConsultationsList careCaseId={id} />
          )}
          {activeTab === "pediatrique" && careCase.caseType === "PEDIATRIC" && (
            <PediatricDossier careCaseId={id} />
          )}
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
