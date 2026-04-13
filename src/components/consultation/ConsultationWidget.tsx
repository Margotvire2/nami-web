"use client";

import { useConsultation } from "@/contexts/ConsultationContext";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Square,
  X,
  ChevronUp,
  ChevronDown,
  Minimize2,
  Maximize2,
  FileText,
  Loader2,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { MarkdownContent } from "@/components/MarkdownContent";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

// ─── Save status indicator ────────────────────────────────────────────────────

function SaveIndicator({ status }: { status: "saved" | "saving" | "unsaved" }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-[10px] text-gray-400">
        <Loader2 size={10} className="animate-spin" /> Sauvegarde…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1 text-[10px] text-green-600">
        <Check size={10} /> Sauvegardé
      </span>
    );
  }
  return (
    <span className="text-[10px] text-gray-400">Non sauvegardé</span>
  );
}

// ─── Audio controls ───────────────────────────────────────────────────────────

function AudioControls() {
  const {
    audioStatus,
    recordingSeconds,
    micDenied,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useConsultation();

  if (micDenied) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <MicOff size={14} className="text-red-500 shrink-0" />
        <span className="text-[11px] text-red-600">
          Microphone refusé — vérifiez les permissions du navigateur
        </span>
      </div>
    );
  }

  if (audioStatus === "idle") {
    return (
      <button
        onClick={startRecording}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors w-full text-left"
      >
        <Mic size={14} className="text-gray-500" />
        <span className="text-xs text-gray-600">Démarrer l&apos;enregistrement</span>
      </button>
    );
  }

  if (audioStatus === "done") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
        <Check size={14} className="text-green-600 shrink-0" />
        <span className="text-[11px] text-green-700">
          Audio enregistré — {formatTime(recordingSeconds)}
        </span>
      </div>
    );
  }

  // recording or paused
  return (
    <div className="flex items-center gap-2">
      {/* Timer + waveform */}
      <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            audioStatus === "recording" ? "bg-red-500 animate-pulse" : "bg-amber-400"
          }`}
        />
        <span className="text-xs font-mono font-semibold text-gray-700 tabular-nums">
          {formatTime(recordingSeconds)}
        </span>
        {audioStatus === "recording" && (
          <div className="flex items-center gap-[2px] h-3 ml-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-[2px] bg-red-400 rounded-full animate-pulse"
                style={{
                  height: `${40 + Math.random() * 60}%`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: `${400 + Math.random() * 300}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pause / Resume */}
      {audioStatus === "recording" ? (
        <button
          onClick={pauseRecording}
          title="Pause"
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
        >
          <Pause size={13} />
        </button>
      ) : (
        <button
          onClick={resumeRecording}
          title="Reprendre"
          className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition"
        >
          <Play size={13} />
        </button>
      )}

      {/* Stop */}
      <button
        onClick={stopRecording}
        title="Arrêter l'enregistrement"
        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
      >
        <Square size={13} />
      </button>
    </div>
  );
}

// ─── Minimized bar ────────────────────────────────────────────────────────────

function MinimizedBar() {
  const { patientName, audioStatus, recordingSeconds, maximize, cancelConsultation } =
    useConsultation();

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[300px] h-12 bg-[#5B4EC4] text-white rounded-xl shadow-xl flex items-center px-3 gap-2">
      {/* Indicator */}
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          audioStatus === "recording" ? "bg-red-300 animate-pulse" : "bg-white/40"
        }`}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{patientName}</p>
        {(audioStatus === "recording" || audioStatus === "paused") && (
          <p className="text-[10px] text-indigo-200 tabular-nums">
            {audioStatus === "paused" ? "En pause" : "Enregistrement"} · {formatTime(recordingSeconds)}
          </p>
        )}
      </div>

      {/* Maximize */}
      <button
        onClick={maximize}
        className="p-1.5 rounded-lg hover:bg-white/20 transition"
        title="Agrandir"
      >
        <ChevronUp size={14} />
      </button>

      {/* Cancel */}
      <button
        onClick={cancelConsultation}
        className="p-1.5 rounded-lg hover:bg-white/20 transition"
        title="Annuler"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Processing view ──────────────────────────────────────────────────────────

function ProcessingView({ wide }: { wide: boolean }) {
  const { status, patientName, minimize } = useConsultation();

  const isTranscribing = status === "transcribing";
  const label = isTranscribing ? "Transcription en cours…" : "Génération du compte-rendu…";
  const sub = isTranscribing
    ? "Conversion de l'audio en texte"
    : "Claude rédige un compte-rendu structuré";

  return (
    <div
      className={`fixed bottom-0 right-6 z-[100] ${
        wide ? "w-[600px]" : "w-[420px]"
      } bg-white rounded-t-2xl shadow-2xl border border-gray-200 overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#5B4EC4]">
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="text-white animate-spin" />
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        <button
          onClick={minimize}
          className="p-1 rounded hover:bg-white/20 text-white/80 transition"
        >
          <Minimize2 size={14} />
        </button>
      </div>

      <div className="px-4 py-6 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
          <Loader2 size={20} className="text-indigo-600 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{patientName} · {sub}</p>
        </div>
        {/* Animated dots */}
        <div className="flex gap-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Completed view ───────────────────────────────────────────────────────────

function CompletedView({ wide }: { wide: boolean }) {
  const { patientName, careCaseId, aiSummary, generatedNoteId, dismissCompleted } =
    useConsultation();

  return (
    <div
      className={`fixed bottom-0 right-6 z-[100] ${
        wide ? "w-[600px]" : "w-[420px]"
      } bg-white rounded-t-2xl shadow-2xl border border-green-200 overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-green-600">
        <div className="flex items-center gap-2">
          <Check size={14} className="text-white" />
          <span className="text-sm font-semibold text-white">Consultation terminée</span>
        </div>
        <button
          onClick={dismissCompleted}
          className="p-1 rounded hover:bg-white/20 text-white/80 transition"
        >
          <X size={14} />
        </button>
      </div>

      <div className="px-4 py-4">
        <p className="text-xs text-gray-500 mb-3">{patientName}</p>

        {/* Summary preview */}
        {aiSummary && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-indigo-700 mb-1.5">Aperçu du compte-rendu</p>
            <MarkdownContent
              content={aiSummary.slice(0, 600) + (aiSummary.length > 600 ? "\n\n…" : "")}
              compact
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {generatedNoteId && careCaseId && (
            <Link
              href={`/patients/${careCaseId}`}
              onClick={dismissCompleted}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#5B4EC4] text-white text-xs font-medium hover:bg-[#4A3DB3] transition"
            >
              <FileText size={13} /> Voir la note
            </Link>
          )}
          <button
            onClick={dismissCompleted}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Error view ───────────────────────────────────────────────────────────────

function ErrorView({ wide }: { wide: boolean }) {
  const { error, cancelConsultation } = useConsultation();

  return (
    <div
      className={`fixed bottom-0 right-6 z-[100] ${
        wide ? "w-[600px]" : "w-[420px]"
      } bg-white rounded-t-2xl shadow-2xl border border-red-200 overflow-hidden`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-red-600">
        <span className="text-sm font-semibold text-white">Erreur</span>
        <button
          onClick={cancelConsultation}
          className="p-1 rounded hover:bg-white/20 text-white/80 transition"
        >
          <X size={14} />
        </button>
      </div>
      <div className="px-4 py-4">
        <p className="text-sm text-red-700">{error || "Une erreur est survenue"}</p>
        <button
          onClick={cancelConsultation}
          className="mt-3 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

function MainWidget({ wide }: { wide: boolean }) {
  const {
    patientName,
    careCaseId,
    appointmentTitle,
    notes,
    saveStatus,
    status,
    isExpanded,
    updateNotes,
    completeConsultation,
    cancelConsultation,
    minimize,
    expand,
    collapse,
  } = useConsultation();

  const contentMaxH = wide ? "max-h-[60vh]" : "max-h-[420px]";

  return (
    <div
      className={`fixed bottom-0 right-6 z-[100] ${
        wide ? "w-[600px]" : "w-[420px]"
      } bg-white rounded-t-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#5B4EC4] shrink-0">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">
            {appointmentTitle || "Consultation"}
          </p>
          <p className="text-xs text-indigo-200 truncate">{patientName}</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {/* Expand / collapse */}
          {isExpanded ? (
            <button
              onClick={collapse}
              className="p-1.5 rounded hover:bg-white/20 text-white/80 transition"
              title="Réduire"
            >
              <ChevronDown size={14} />
            </button>
          ) : (
            <button
              onClick={expand}
              className="p-1.5 rounded hover:bg-white/20 text-white/80 transition"
              title="Agrandir"
            >
              <Maximize2 size={14} />
            </button>
          )}
          {/* Minimize */}
          <button
            onClick={minimize}
            className="p-1.5 rounded hover:bg-white/20 text-white/80 transition"
            title="Minimiser"
          >
            <Minimize2 size={14} />
          </button>
          {/* Cancel */}
          <button
            onClick={cancelConsultation}
            className="p-1.5 rounded hover:bg-white/20 text-white/80 transition"
            title="Annuler la consultation"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Lien dossier patient */}
      {careCaseId && (
        <div className="px-4 pt-2 pb-0 shrink-0">
          <a
            href={`/patients/${careCaseId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ExternalLink size={11} />
            Ouvrir le dossier patient
          </a>
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col gap-3 px-4 py-4 overflow-y-auto ${contentMaxH}`}>
        {/* Audio section */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Enregistrement
          </p>
          <AudioControls />
        </div>

        {/* Notes section */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              Notes
            </p>
            <SaveIndicator status={saveStatus} />
          </div>
          <textarea
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Notez ici les éléments clés : motif, anamnèse, examen clinique, décisions…"
            className={`w-full resize-none rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-800 placeholder-gray-400 px-3 py-2.5 transition ${
              wide ? "min-h-[300px]" : "min-h-[180px]"
            }`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <button
          onClick={completeConsultation}
          disabled={status !== "in_progress"}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#5B4EC4] text-white text-sm font-semibold hover:bg-[#4A3DB3] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={15} />
          Terminer et générer le compte-rendu
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">
          Claude fusionnera vos notes et l&apos;audio pour rédiger un compte-rendu structuré
        </p>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function ConsultationWidget() {
  const { isActive, isMinimized, isExpanded, status } = useConsultation();

  if (!isActive) return null;
  if (isMinimized) return <MinimizedBar />;

  const wide = isExpanded;

  if (status === "transcribing" || status === "generating_summary") {
    return <ProcessingView wide={wide} />;
  }
  if (status === "completed") {
    return <CompletedView wide={wide} />;
  }
  if (status === "error") {
    return <ErrorView wide={wide} />;
  }

  return <MainWidget wide={wide} />;
}
