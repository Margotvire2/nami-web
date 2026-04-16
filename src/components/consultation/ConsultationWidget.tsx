"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useConsultation } from "@/contexts/ConsultationContext";
import {
  Mic, MicOff, Pause, Play, Square, X,
  ChevronUp, Minimize2, FileText, Loader2, Check,
  ExternalLink, Edit3, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { MarkdownContent } from "@/components/MarkdownContent";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

/** Parse a markdown summary into named sections */
function parseSections(md: string | null): Record<string, string> {
  if (!md) return {};
  const SECTION_KEYS = [
    "Antécédents",
    "Histoire de la maladie",
    "Examen clinique",
    "Bilan paraclinique",
    "Plan de soins",
    "Conclusion",
    "Décision",
  ];
  const result: Record<string, string> = {};
  let current: string | null = null;
  const lines = md.split("\n");

  for (const line of lines) {
    const header = SECTION_KEYS.find((k) =>
      line.replace(/^#+\s*/, "").trim().toLowerCase().startsWith(k.toLowerCase())
    );
    if (header) {
      current = header;
      result[header] = "";
    } else if (current) {
      result[current] = (result[current] + "\n" + line).trimStart();
    }
  }
  // If nothing was parsed, put everything in Conclusion
  if (Object.keys(result).length === 0 && md.trim()) {
    result["Compte-rendu"] = md;
  }
  return result;
}

// ─── Save status ──────────────────────────────────────────────────────────────

function SaveIndicator({ status }: { status: "saved" | "saving" | "unsaved" }) {
  if (status === "saving") return (
    <span className="flex items-center gap-1 text-[10px] text-gray-400">
      <Loader2 size={10} className="animate-spin" /> Sauvegarde…
    </span>
  );
  if (status === "saved") return (
    <span className="flex items-center gap-1 text-[10px] text-green-600">
      <Check size={10} /> Sauvegardé
    </span>
  );
  return <span className="text-[10px] text-gray-400">Non sauvegardé</span>;
}

// ─── BIG GREEN RECORD BUTTON (idle state) ─────────────────────────────────────

function BigRecordButton({ onStart, micDenied }: { onStart: () => void; micDenied: boolean }) {
  if (micDenied) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
        <MicOff size={14} className="text-red-500 shrink-0" />
        <span className="text-[11px] text-red-600">Microphone refusé — vérifiez les permissions</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <button
        onClick={onStart}
        className="nami-rec-pulse flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
        style={{
          width: 80,
          height: 80,
          background: "linear-gradient(135deg, #2BA84A 0%, #22963F 100%)",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
        title="Démarrer l'enregistrement"
      >
        <Mic size={28} strokeWidth={1.75} />
      </button>
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        Appuyez pour enregistrer<br />la consultation
      </p>
    </div>
  );
}

// ─── STRUCTURED REPORT (completed state) ──────────────────────────────────────

function StructuredReport({ summary, patientName, careCaseId, generatedNoteId, onClose }: {
  summary: string | null;
  patientName: string;
  careCaseId: string | null;
  generatedNoteId: string | null;
  onClose: () => void;
}) {
  const sections = parseSections(summary);
  const [edits, setEdits] = useState<Record<string, string>>(() => ({ ...sections }));
  const [expanded, setExpanded] = useState<string | null>(Object.keys(sections)[0] ?? null);

  // Keep edits in sync if sections change
  useEffect(() => {
    setEdits(parseSections(summary));
    setExpanded(Object.keys(parseSections(summary))[0] ?? null);
  }, [summary]);

  return (
    <div className="fixed bottom-0 right-6 z-[100] w-[480px] bg-white rounded-t-2xl shadow-2xl border border-green-200 flex flex-col overflow-hidden"
      style={{ maxHeight: "75vh" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "linear-gradient(135deg, #2BA84A 0%, #22963F 100%)" }}>
        <div className="flex items-center gap-2">
          <Check size={15} className="text-white" />
          <div>
            <p className="text-sm font-semibold text-white">Compte-rendu généré</p>
            <p className="text-[10px] text-green-100">{patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {generatedNoteId && careCaseId && (
            <Link
              href={`/patients/${careCaseId}`}
              onClick={onClose}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition"
            >
              <ExternalLink size={11} /> Dossier
            </Link>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 transition">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* AI disclaimer */}
      <div className="px-4 py-2 shrink-0 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <Edit3 size={11} className="text-amber-600 shrink-0" />
        <p className="text-[10px] text-amber-700 font-semibold">
          Brouillon IA — à vérifier et valider par le professionnel de santé
        </p>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {Object.keys(edits).length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">Aucun contenu structuré généré.</p>
        )}
        {Object.entries(edits).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === key ? null : key)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
              <span className="text-xs font-semibold text-gray-700">{key}</span>
              <ChevronDown
                size={13}
                className="text-gray-400 transition-transform"
                style={{ transform: expanded === key ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {expanded === key && (
              <textarea
                value={value}
                onChange={(e) => setEdits((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm text-gray-800 resize-none border-0 outline-none min-h-[80px] focus:ring-0"
                style={{ fontFamily: "var(--font-inter), monospace" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0 flex gap-2">
        {generatedNoteId && careCaseId ? (
          <Link
            href={`/patients/${careCaseId}`}
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-semibold transition"
            style={{ background: "linear-gradient(135deg, #5B4EC4 0%, #4A3DB3 100%)" }}
          >
            <FileText size={13} /> Voir dans le dossier
          </Link>
        ) : (
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Processing view ──────────────────────────────────────────────────────────

function ProcessingView() {
  const { status, patientName, minimize } = useConsultation();
  const isTranscribing = status === "transcribing";
  const label = isTranscribing ? "Transcription…" : "Génération du compte-rendu…";

  return (
    <div className="fixed bottom-0 right-6 z-[100] w-[420px] bg-white rounded-t-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#5B4EC4]">
        <div className="flex items-center gap-2">
          <Loader2 size={14} className="text-white animate-spin" />
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        <button onClick={minimize} className="p-1 rounded hover:bg-white/20 text-white/80 transition">
          <Minimize2 size={14} />
        </button>
      </div>
      <div className="px-4 py-6 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
          <Loader2 size={20} className="text-indigo-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{patientName}</p>
        <div className="flex gap-1.5 mt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Minimized bar ────────────────────────────────────────────────────────────

function MinimizedBar() {
  const { patientName, audioStatus, recordingSeconds, maximize, cancelConsultation } = useConsultation();
  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[300px] h-12 bg-[#5B4EC4] text-white rounded-xl shadow-xl flex items-center px-3 gap-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${audioStatus === "recording" ? "bg-red-300 animate-pulse" : "bg-white/40"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{patientName}</p>
        {(audioStatus === "recording" || audioStatus === "paused") && (
          <p className="text-[10px] text-indigo-200 tabular-nums">
            {audioStatus === "paused" ? "En pause" : "Enregistrement"} · {formatTime(recordingSeconds)}
          </p>
        )}
      </div>
      <button onClick={maximize} className="p-1.5 rounded-lg hover:bg-white/20 transition" title="Agrandir">
        <ChevronUp size={14} />
      </button>
      <button onClick={cancelConsultation} className="p-1.5 rounded-lg hover:bg-white/20 transition" title="Annuler">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Error view ───────────────────────────────────────────────────────────────

function ErrorView() {
  const { error, cancelConsultation } = useConsultation();
  return (
    <div className="fixed bottom-0 right-6 z-[100] w-[420px] bg-white rounded-t-2xl shadow-2xl border border-red-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-red-600">
        <span className="text-sm font-semibold text-white">Erreur</span>
        <button onClick={cancelConsultation} className="p-1 rounded hover:bg-white/20 text-white/80 transition"><X size={14} /></button>
      </div>
      <div className="px-4 py-4">
        <p className="text-sm text-red-700">{error || "Une erreur est survenue"}</p>
        <button onClick={cancelConsultation} className="mt-3 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition">
          Fermer
        </button>
      </div>
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

function MainWidget() {
  const {
    patientName, careCaseId, appointmentTitle, notes, saveStatus, status,
    audioStatus, recordingSeconds, micDenied,
    updateNotes, completeConsultation, cancelConsultation, minimize,
    startRecording, pauseRecording, resumeRecording, stopRecording,
  } = useConsultation();

  const isRecording = audioStatus === "recording";
  const isPaused = audioStatus === "paused";
  const isDone = audioStatus === "done";

  // ── Drag state ──
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function handleHeaderMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: rect.left,
      originY: rect.top,
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const s = dragState.current;
      if (!s?.dragging) return;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      const newX = s.originX + dx;
      const newY = s.originY + dy;
      const maxX = window.innerWidth - 200;
      const maxY = window.innerHeight - 40;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
    function onUp() {
      if (dragState.current?.dragging) {
        dragState.current.dragging = false;
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Key-press ESC to pause
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isRecording) {
      pauseRecording();
    }
  }, [isRecording, pauseRecording]);

  useEffect(() => {
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleEsc]);

  return (
    <div
      ref={panelRef}
      className="fixed z-[100] w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
      style={
        position
          ? { left: position.x, top: position.y, right: "auto", bottom: "auto", maxHeight: "80vh" }
          : { right: 24, bottom: 24, maxHeight: "80vh" }
      }
    >

      {/* Header draggable */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className="flex items-center justify-between px-4 py-3 bg-[#5B4EC4] shrink-0 cursor-move select-none"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">{appointmentTitle || "Consultation"}</p>
          <p className="text-xs text-indigo-200 truncate">{patientName}</p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={minimize} className="p-1.5 rounded hover:bg-white/20 text-white/80 transition" title="Minimiser">
            <Minimize2 size={14} />
          </button>
          <button onClick={cancelConsultation} className="p-1.5 rounded hover:bg-white/20 text-white/80 transition" title="Annuler">
            <X size={14} />
          </button>
        </div>
      </div>

      {careCaseId && (
        <div className="px-4 pt-2 pb-0 shrink-0">
          <a href={`/patients/${careCaseId}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 hover:text-teal-700 transition-colors">
            <ExternalLink size={11} /> Ouvrir le dossier patient
          </a>
        </div>
      )}

      <div className="flex flex-col gap-4 px-4 py-4 overflow-y-auto flex-1">

        {/* Recording section */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Enregistrement
          </p>
          {isDone ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200">
              <Check size={14} className="text-green-600 shrink-0" />
              <span className="text-[11px] text-green-700 font-medium">Audio enregistré — {formatTime(recordingSeconds)}</span>
            </div>
          ) : (isRecording || isPaused) ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 space-y-2.5">
              {/* Status + chrono + waveform */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRecording ? "bg-red-500 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span className="text-[11px] font-bold text-gray-800 uppercase tracking-wide">
                  {isRecording ? "REC" : "Pause"}
                </span>
                <span className="text-sm font-mono font-semibold text-gray-800 tabular-nums">
                  {formatTime(recordingSeconds)}
                </span>
                {isRecording && (
                  <div className="ml-auto flex items-center gap-[2px] h-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-[2px] bg-red-400 rounded-full animate-pulse"
                        style={{
                          height: `${40 + ((i * 17) % 60)}%`,
                          animationDelay: `${i * 90}ms`,
                          animationDuration: `${350 + ((i * 50) % 300)}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Contrôles */}
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <button
                    onClick={pauseRecording}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-white border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50 transition"
                  >
                    <Pause size={12} /> Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition"
                  >
                    <Play size={12} /> Reprendre
                  </button>
                )}
                <button
                  onClick={stopRecording}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
                >
                  <Square size={12} /> Terminer
                </button>
              </div>
            </div>
          ) : audioStatus === "idle" ? (
            <BigRecordButton onStart={startRecording} micDenied={micDenied} />
          ) : null}
        </div>

        {/* Notes section */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Notes</p>
            <SaveIndicator status={saveStatus} />
          </div>
          <textarea
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Notez les éléments clés : motif, anamnèse, examen clinique, décisions…"
            className="w-full resize-none rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-gray-800 placeholder-gray-400 px-3 py-2.5 transition min-h-[140px]"
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
          <Check size={15} /> Terminer et générer le compte-rendu
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
  const { isActive, isMinimized, status, aiSummary, patientName, careCaseId, generatedNoteId, dismissCompleted } = useConsultation();

  if (!isActive) return null;
  if (isMinimized) return <MinimizedBar />;

  if (status === "transcribing" || status === "generating_summary") return <ProcessingView />;

  if (status === "completed") {
    return (
      <StructuredReport
        summary={aiSummary}
        patientName={patientName}
        careCaseId={careCaseId}
        generatedNoteId={generatedNoteId}
        onClose={dismissCompleted}
      />
    );
  }

  if (status === "error") return <ErrorView />;

  return <MainWidget />;
}
