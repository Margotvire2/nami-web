"use client";

import { useRecording } from "@/contexts/RecordingContext";
import { Pause, Play, Square, X, FileText, Loader2 } from "lucide-react";
import Link from "next/link";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function RecordingWidget() {
  const rec = useRecording();

  if (rec.status === "idle") return null;

  // ── RECORDING / PAUSED ──
  if (rec.status === "recording" || rec.status === "paused") {
    return (
      <div className="fixed bottom-6 right-6 z-[100] w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${rec.status === "recording" ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                {rec.status === "recording" ? "REC" : "Pause"}
              </span>
              <span className="text-sm font-mono font-semibold text-gray-700 tabular-nums">
                {formatTime(rec.seconds)}
              </span>
            </div>
            {/* Mini waveform */}
            {rec.status === "recording" && (
              <div className="flex items-center gap-[2px] h-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-red-400 rounded-full animate-pulse"
                    style={{
                      height: `${30 + Math.random() * 70}%`,
                      animationDelay: `${i * 80}ms`,
                      animationDuration: `${300 + Math.random() * 400}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Patient name */}
          <p className="text-xs text-gray-500 mb-3">{rec.patientName}</p>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {rec.status === "recording" ? (
              <button
                onClick={rec.pauseRecording}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition"
              >
                <Pause size={13} /> Pause
              </button>
            ) : (
              <button
                onClick={rec.resumeRecording}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium hover:bg-indigo-100 transition"
              >
                <Play size={13} /> Reprendre
              </button>
            )}
            <button
              onClick={rec.stopAndAnalyze}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
            >
              <Square size={13} /> Terminer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── UPLOADING / TRANSCRIBING / ANALYZING ──
  if (rec.status === "uploading" || rec.status === "transcribing" || rec.status === "analyzing") {
    const steps = ["uploading", "transcribing", "analyzing"] as const;
    const currentIdx = steps.indexOf(rec.status as typeof steps[number]);
    const percent = Math.round(((currentIdx + 1) / steps.length) * 100);
    const labels = { uploading: "Envoi audio…", transcribing: "Transcription…", analyzing: "Extraction structurée…" };

    return (
      <div className="fixed bottom-6 right-6 z-[100] w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 size={14} className="text-indigo-600 animate-spin" />
            <span className="text-xs font-semibold text-gray-900">
              {labels[rec.status as keyof typeof labels]}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">
            {rec.patientName} &middot; {formatTime(rec.seconds)}
          </p>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── DONE ──
  if (rec.status === "done") {
    return (
      <div className="fixed bottom-6 right-6 z-[100] w-[300px] bg-white rounded-2xl shadow-2xl border border-green-200 overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs font-bold text-green-800">Note générée</span>
            </div>
            <button onClick={rec.dismiss} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mb-3">
            {rec.patientName} &middot; {formatTime(rec.seconds)}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/patients/${rec.careCaseId}`}
              onClick={rec.dismiss}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition"
            >
              <FileText size={13} /> Voir la note
            </Link>
            <button
              onClick={rec.dismiss}
              className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR ──
  if (rec.status === "error") {
    return (
      <div className="fixed bottom-6 right-6 z-[100] w-[300px] bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-700">Erreur d&apos;enregistrement</span>
            <button onClick={rec.dismiss} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          <p className="text-[11px] text-red-600 mt-1">{rec.error}</p>
        </div>
      </div>
    );
  }

  return null;
}
