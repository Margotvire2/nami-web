"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type RecordingAnalysisResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Mic, MicOff, Square, Pause, Play, Loader2, CheckCircle2,
  FileText, CheckSquare, X, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

type RecorderState = "idle" | "consent" | "recording" | "paused" | "uploading" | "transcribing" | "analyzing" | "done";

interface Props {
  careCaseId: string;
  patientName: string;
  appointmentId?: string;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ConsultationRecorder({ careCaseId, patientName, appointmentId, onClose }: Props) {
  const { accessToken } = useAuthStore();
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();

  const [state, setState] = useState<RecorderState>("consent");
  const [consent, setConsent] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [result, setResult] = useState<RecordingAnalysisResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Timer ──

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Recording ──

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(1000); // chunk every 1s
      mediaRecorderRef.current = mediaRecorder;
      setState("recording");
      startTimer();
    } catch {
      toast.error("Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  }, [startTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setState("paused");
      stopTimer();
    }
  }, [stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setState("recording");
      startTimer();
    }
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    return new Promise<Blob>((resolve) => {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
      stopTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    });
  }, [stopTimer]);

  // ── Upload + Analyze pipeline ──

  const processMutation = useMutation({
    mutationFn: async () => {
      // 1. Stop recording
      setState("uploading");
      const blob = await stopRecording();

      // 2. Upload + transcribe
      setState("transcribing");
      const uploadResult = await api.recordings.upload(blob, seconds);
      setTranscription(uploadResult.transcription);

      // 3. Analyze
      setState("analyzing");
      const analysisResult = await api.recordings.analyze({
        transcription: uploadResult.transcription,
        careCaseId,
        appointmentId,
      });

      return analysisResult;
    },
    onSuccess: (data) => {
      setResult(data);
      setState("done");
      qc.invalidateQueries({ queryKey: ["timeline", careCaseId] });
      qc.invalidateQueries({ queryKey: ["notes", careCaseId] });
      qc.invalidateQueries({ queryKey: ["tasks", careCaseId] });
      qc.invalidateQueries({ queryKey: ["care-case", careCaseId] });
      toast.success("Consultation analysée — note et tâches créées");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erreur lors du traitement");
      setState("recording");
    },
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Enregistrer la consultation</h2>
            <p className="text-xs text-gray-500 mt-0.5">{patientName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* CONSENT */}
          {state === "consent" && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <Shield size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Consentement requis</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    L&apos;enregistrement audio d&apos;une consultation médicale nécessite le consentement explicite du patient,
                    conformément au RGPD et au Code de la santé publique.
                  </p>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  Le patient a été informé et a <span className="font-medium">consenti à l&apos;enregistrement</span> de cette consultation.
                  La transcription sera stockée dans son dossier médical.
                </span>
              </label>

              <Button
                onClick={startRecording}
                disabled={!consent}
                className="w-full gap-2"
              >
                <Mic size={16} /> Démarrer l&apos;enregistrement
              </Button>
            </div>
          )}

          {/* RECORDING / PAUSED */}
          {(state === "recording" || state === "paused") && (
            <div className="space-y-6 text-center">
              {/* Timer */}
              <div>
                <p className="text-4xl font-bold tabular-nums text-gray-900">{formatTime(seconds)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {state === "recording" ? "Enregistrement en cours…" : "En pause"}
                </p>
              </div>

              {/* Audio indicator */}
              <div className="flex items-center justify-center gap-1 h-8">
                {state === "recording" ? (
                  Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-indigo-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 50}ms`,
                        animationDuration: `${300 + Math.random() * 400}ms`,
                      }}
                    />
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Pause size={16} />
                    <span className="text-sm font-medium">Pause</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                {state === "recording" ? (
                  <button
                    onClick={pauseRecording}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <Pause size={20} className="text-gray-600" />
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center hover:bg-indigo-200 transition"
                  >
                    <Play size={20} className="text-indigo-600" />
                  </button>
                )}
                <button
                  onClick={() => processMutation.mutate()}
                  className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                >
                  <Square size={22} className="text-white" />
                </button>
              </div>

              <p className="text-xs text-gray-400">Cliquez sur le carré rouge pour arrêter et analyser</p>
            </div>
          )}

          {/* PROCESSING STEPS */}
          {(state === "uploading" || state === "transcribing" || state === "analyzing") && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <Loader2 size={32} className="text-indigo-600 animate-spin" />
              </div>
              <div className="space-y-2">
                {[
                  { key: "uploading", label: "Envoi de l'audio…" },
                  { key: "transcribing", label: "Transcription (Whisper)…" },
                  { key: "analyzing", label: "Analyse IA (Claude)…" },
                ].map((step) => {
                  const steps: RecorderState[] = ["uploading", "transcribing", "analyzing"];
                  const currentIdx = steps.indexOf(state);
                  const stepIdx = steps.indexOf(step.key as RecorderState);
                  const isDone = stepIdx < currentIdx;
                  const isCurrent = stepIdx === currentIdx;
                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : isCurrent ? (
                        <Loader2 size={16} className="text-indigo-500 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                      )}
                      <span className={cn(
                        "text-sm",
                        isDone ? "text-green-600" : isCurrent ? "text-indigo-600 font-medium" : "text-gray-400"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DONE */}
          {state === "done" && result && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={20} />
                <p className="text-sm font-semibold">Consultation analysée avec succès</p>
              </div>

              {/* Summary */}
              <div className="rounded-xl border bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Résumé IA</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
              </div>

              {/* Key points */}
              {result.keyPoints.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Points clés</p>
                  <ul className="space-y-1">
                    {result.keyPoints.map((p, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-indigo-500 mt-0.5">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tasks created */}
              {result.tasks.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                    <CheckSquare size={11} className="inline mr-1" />
                    {result.taskIds.length} tâche{result.taskIds.length > 1 ? "s" : ""} créée{result.taskIds.length > 1 ? "s" : ""}
                  </p>
                  <div className="space-y-1">
                    {result.tasks.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border">
                        <span className="text-gray-700">{t.title}</span>
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium",
                          t.priority === "HIGH" ? "bg-red-50 text-red-600" :
                          t.priority === "MEDIUM" ? "bg-amber-50 text-amber-600" :
                          "bg-gray-50 text-gray-500"
                        )}>{t.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Link href={`/patients/${careCaseId}`} className="flex-1">
                  <Button variant="outline" className="w-full gap-1.5 text-xs">
                    <FileText size={13} /> Voir la note
                  </Button>
                </Link>
                <Button onClick={onClose} className="flex-1 text-xs">
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
