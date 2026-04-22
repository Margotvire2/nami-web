/**
 * ConsultationContext — Widget de consultation flottant
 *
 * STRATÉGIE A : contexte indépendant de RecordingContext.
 * RecordingContext reste pour les enregistrements rapides (bouton "Enregistrer").
 * Les deux ne peuvent pas tourner en même temps (vérification croisée à l'implémentation).
 *
 * Audio : même logique MediaRecorder que RecordingContext (getUserMedia + chunks + Blob).
 * Notes : debounce 3s → PATCH /care-cases/:id/consultations/:id/notes.
 * Persistance : sessionStorage → survit aux refresh de page.
 * Restauration : au mount, GET /active → si IN_PROGRESS → rouvre le widget.
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useAuthStore } from "@/lib/store";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConsultationStatus =
  | "idle"
  | "in_progress"
  | "transcribing"
  | "generating_summary"
  | "completed"
  | "error";

export type AudioStatus = "idle" | "recording" | "paused" | "done";

interface ConsultationState {
  isActive: boolean;
  consultationId: string | null;
  careCaseId: string | null;
  patientName: string;
  appointmentId?: string;
  appointmentTitle?: string;

  notes: string;
  saveStatus: "saved" | "saving" | "unsaved";

  audioStatus: AudioStatus;
  recordingSeconds: number;
  hasAudio: boolean;

  isMinimized: boolean;
  isExpanded: boolean;

  status: ConsultationStatus;
  aiSummary: string | null;
  generatedNoteId: string | null;
  hasPrescriptionDraft: boolean;
  transcriptDocId: string | null;
  error: string | null;
  micDenied: boolean;
}

interface StartParams {
  careCaseId: string;
  patientName: string;
  appointmentId?: string;
  appointmentTitle?: string;
}

interface ConsultationContextValue extends ConsultationState {
  startConsultation: (params: StartParams) => Promise<void>;
  updateNotes: (notes: string) => void;
  startRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  stopRecording: () => void;
  minimize: () => void;
  maximize: () => void;
  expand: () => void;
  collapse: () => void;
  completeConsultation: () => Promise<void>;
  cancelConsultation: () => void;
  dismissCompleted: () => void;
}

const ConsultationContext = createContext<ConsultationContextValue | null>(null);

export function useConsultation() {
  const ctx = useContext(ConsultationContext);
  if (!ctx) throw new Error("useConsultation must be used within ConsultationProvider");
  return ctx;
}

// ─── Session Storage helpers ──────────────────────────────────────────────────

const SS_KEY = "nami_consultation";

function saveToSession(data: {
  consultationId: string;
  careCaseId: string;
  patientName: string;
  notes: string;
  appointmentId?: string;
  appointmentTitle?: string;
}) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(data));
  } catch {}
}

function loadFromSession() {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  try { sessionStorage.removeItem(SS_KEY); } catch {}
}

// ─── Debounce ─────────────────────────────────────────────────────────────────

function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number): (...args: T) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const INITIAL_STATE: ConsultationState = {
  isActive: false,
  consultationId: null,
  careCaseId: null,
  patientName: "",
  appointmentId: undefined,
  appointmentTitle: undefined,
  notes: "",
  saveStatus: "saved",
  audioStatus: "idle",
  recordingSeconds: 0,
  hasAudio: false,
  isMinimized: false,
  isExpanded: false,
  status: "idle",
  aiSummary: null,
  generatedNoteId: null,
  hasPrescriptionDraft: false,
  transcriptDocId: null,
  error: null,
  micDenied: false,
};

export function ConsultationProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuthStore();
  const [state, setState] = useState<ConsultationState>(INITIAL_STATE);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  // Notes debounce ref
  const saveNotesRef = useRef<((consultationId: string, careCaseId: string, notes: string) => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Restore active consultation on mount ──────────────────────────────────

  useEffect(() => {
    if (!accessToken) return;

    const saved = loadFromSession();
    if (!saved?.consultationId) return;

    // Verify it's still IN_PROGRESS on server
    fetch(`${API_URL}/care-cases/${saved.careCaseId}/consultations/active`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.json())
      .then(({ consultation }) => {
        if (consultation && consultation.id === saved.consultationId) {
          setState((s) => ({
            ...s,
            isActive: true,
            consultationId: consultation.id,
            careCaseId: saved.careCaseId,
            patientName: saved.patientName,
            notes: saved.notes || consultation.notes || "",
            appointmentId: saved.appointmentId,
            appointmentTitle: saved.appointmentTitle,
            status: "in_progress",
            saveStatus: "saved",
          }));
        } else {
          clearSession();
        }
      })
      .catch(() => {});
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save notes debounced ──────────────────────────────────────────────────

  const doSaveNotes = useCallback(
    async (consultationId: string, careCaseId: string, notes: string) => {
      if (!accessToken) return;
      setState((s) => ({ ...s, saveStatus: "saving" }));
      try {
        await fetch(
          `${API_URL}/care-cases/${careCaseId}/consultations/${consultationId}/notes`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ notes }),
          }
        );
        setState((s) => ({ ...s, saveStatus: "saved" }));
      } catch {
        setState((s) => ({ ...s, saveStatus: "unsaved" }));
      }
    },
    [accessToken]
  );

  // Memoize debounced save (recreated when deps change)
  saveNotesRef.current = useMemo(
    () => debounce(doSaveNotes, 3000),
    [doSaveNotes]
  );

  // ── Timer helpers ─────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setState((s) => ({ ...s, recordingSeconds: s.recordingSeconds + 1 }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ── startConsultation ─────────────────────────────────────────────────────

  const startConsultation = useCallback(async (params: StartParams) => {
    if (!accessToken) return;

    const res = await fetch(
      `${API_URL}/care-cases/${params.careCaseId}/consultations/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          appointmentId: params.appointmentId,
          appointmentTitle: params.appointmentTitle,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 409 && err.existingConsultation) {
        // Guard: ne jamais rouvrir une consultation d'un autre patient
        if (err.existingConsultation.careCaseId !== params.careCaseId) {
          throw new Error(err.error || "Erreur démarrage consultation");
        }
        // Même patient — rouvrir
        setState((s) => ({
          ...s,
          isActive: true,
          consultationId: err.existingConsultation.id,
          careCaseId: err.existingConsultation.careCaseId,
          patientName: err.existingConsultation.patientName,
          status: "in_progress",
          isMinimized: false,
        }));
        return;
      }
      throw new Error(err.error || "Erreur démarrage consultation");
    }

    const consultation = await res.json();

    setState({
      ...INITIAL_STATE,
      isActive: true,
      consultationId: consultation.id,
      careCaseId: params.careCaseId,
      patientName: params.patientName,
      appointmentId: params.appointmentId,
      appointmentTitle: params.appointmentTitle,
      status: "in_progress",
    });

    saveToSession({
      consultationId: consultation.id,
      careCaseId: params.careCaseId,
      patientName: params.patientName,
      notes: "",
      appointmentId: params.appointmentId,
      appointmentTitle: params.appointmentTitle,
    });
  }, [accessToken]);

  // ── updateNotes ───────────────────────────────────────────────────────────

  const updateNotes = useCallback((notes: string) => {
    setState((s) => {
      if (!s.consultationId || !s.careCaseId) return s;
      // Update sessionStorage
      saveToSession({
        consultationId: s.consultationId,
        careCaseId: s.careCaseId,
        patientName: s.patientName,
        notes,
        appointmentId: s.appointmentId,
        appointmentTitle: s.appointmentTitle,
      });
      // Debounced server save
      saveNotesRef.current?.(s.consultationId, s.careCaseId, notes);
      return { ...s, notes, saveStatus: "unsaved" };
    });
  }, []);

  // ── Audio recording ───────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;
      setState((s) => ({ ...s, micDenied: false }));

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      setState((s) => ({ ...s, audioStatus: "recording", recordingSeconds: 0 }));
      startTimer();
    } catch {
      setState((s) => ({ ...s, micDenied: true }));
    }
  }, [startTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setState((s) => ({ ...s, audioStatus: "paused" }));
      stopTimer();
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setState((s) => ({ ...s, audioStatus: "recording" }));
      startTimer();
    }
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      audioBlobRef.current = blob;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setState((s) => ({ ...s, audioStatus: "done", hasAudio: blob.size > 0 }));
    };
    mediaRecorderRef.current.stop();
    stopTimer();
  }, [stopTimer]);

  // ── completeConsultation ──────────────────────────────────────────────────

  const completeConsultation = useCallback(async () => {
    const { consultationId, careCaseId, notes } = state;
    if (!consultationId || !careCaseId || !accessToken) return;

    // Stop recording if still going
    if (state.audioStatus === "recording" || state.audioStatus === "paused") {
      stopRecording();
      // Wait briefly for onstop to fire
      await new Promise((r) => setTimeout(r, 300));
    }

    setState((s) => ({ ...s, status: "transcribing" }));

    try {
      // Upload audio if captured
      if (audioBlobRef.current && audioBlobRef.current.size > 1000) {
        const formData = new FormData();
        formData.append("audio", audioBlobRef.current, "consultation.webm");
        formData.append("duration", String(state.recordingSeconds));

        const audioRes = await fetch(
          `${API_URL}/care-cases/${careCaseId}/consultations/${consultationId}/audio`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: formData,
          }
        );
        if (!audioRes.ok) {
          console.warn("[Consultation] Audio upload failed — continuing with notes only");
        }
      }

      // Flush notes before completing
      if (notes.trim()) {
        await fetch(
          `${API_URL}/care-cases/${careCaseId}/consultations/${consultationId}/notes`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ notes }),
          }
        );
      }

      setState((s) => ({ ...s, status: "generating_summary" }));

      const res = await fetch(
        `${API_URL}/care-cases/${careCaseId}/consultations/${consultationId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur génération résumé");
      }

      const { consultation, note, hasPrescriptionDraft, transcriptDocId } = await res.json();

      clearSession();
      setState((s) => ({
        ...s,
        status: "completed",
        aiSummary: consultation.aiSummary,
        generatedNoteId: note.id,
        hasPrescriptionDraft: hasPrescriptionDraft ?? false,
        transcriptDocId: transcriptDocId ?? null,
        error: null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      setState((s) => ({ ...s, status: "error", error: message }));
    }
  }, [state, accessToken, stopRecording]);

  // ── cancelConsultation ────────────────────────────────────────────────────

  const cancelConsultation = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    }
    stopTimer();
    clearSession();
    setState(INITIAL_STATE);
  }, [stopTimer]);

  const dismissCompleted = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  // ── UI helpers ────────────────────────────────────────────────────────────

  const minimize = useCallback(() => setState((s) => ({ ...s, isMinimized: true, isExpanded: false })), []);
  const maximize = useCallback(() => setState((s) => ({ ...s, isMinimized: false })), []);
  const expand = useCallback(() => setState((s) => ({ ...s, isExpanded: true, isMinimized: false })), []);
  const collapse = useCallback(() => setState((s) => ({ ...s, isExpanded: false })), []);

  return (
    <ConsultationContext.Provider
      value={{
        ...state,
        startConsultation,
        updateNotes,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
        minimize,
        maximize,
        expand,
        collapse,
        completeConsultation,
        cancelConsultation,
        dismissCompleted,
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
}
