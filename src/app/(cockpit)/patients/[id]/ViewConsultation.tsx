"use client";

import { useState } from "react";
import type { ConsultationDetail } from "@/lib/api";
import {
  Clock,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Receipt,
  X,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(startedAt: string, completedAt: string | null, audioDurationSec: number | null): string {
  if (audioDurationSec) {
    const m = Math.floor(audioDurationSec / 60);
    const s = audioDurationSec % 60;
    return m > 0 ? `${m} min ${s > 0 ? `${s}s` : ""}` : `${s}s`;
  }
  if (completedAt) {
    const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
    const totalMin = Math.round(ms / 60000);
    return totalMin > 0 ? `${totalMin} min` : "< 1 min";
  }
  return "—";
}

// ─── En-tête ─────────────────────────────────────────────────────────────────

function ConsultationHeader({ consultation }: { consultation: ConsultationDetail }) {
  const statusLabel = consultation.status === "COMPLETED" ? "Terminée" : "En cours";
  const StatusIcon = consultation.status === "COMPLETED" ? CheckCircle2 : Circle;
  const statusColor = consultation.status === "COMPLETED"
    ? "text-green-600 bg-green-50 border-green-200"
    : "text-amber-600 bg-amber-50 border-amber-200";

  return (
    <div className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6 mb-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-[#1A1A2E] mb-1">
            Consultation du {formatDate(consultation.startedAt)}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              Durée : {formatDuration(consultation.startedAt, consultation.completedAt, consultation.audioDurationSec)}
            </span>
            {consultation.completedAt && (
              <span>
                Terminée à {new Date(consultation.completedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${statusColor}`}>
          <StatusIcon size={12} />
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

// ─── Bloc Notes soignant ──────────────────────────────────────────────────────

function NotesBlock({ notes }: { notes: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6 mb-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E] mb-3">
        <FileText size={15} className="text-[#5B4EC4]" />
        Notes du soignant
      </h2>
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
    </div>
  );
}

// ─── Bloc Note générée (compte-rendu IA) ─────────────────────────────────────

function GeneratedNoteBlock({ note }: { note: { id: string; body: string; createdAt: string } }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
          <Sparkles size={15} className="text-[#5B4EC4]" />
          Compte-rendu structuré
        </h2>
        <span className="text-xs px-2 py-0.5 bg-[#EEEDFB] text-[#5B4EC4] rounded-full border border-[#5B4EC4]/20 font-medium">
          Brouillon IA — à vérifier
        </span>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed prose-sm max-w-none">
        {note.body}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Généré le {new Date(note.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
      </p>
    </div>
  );
}

// ─── Bloc Résumé IA (aiSummary) ──────────────────────────────────────────────

function AiSummaryBlock({ summary }: { summary: string }) {
  return (
    <div className="bg-[#EEEDFB]/50 rounded-2xl border border-[#5B4EC4]/15 p-6 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
          <Sparkles size={15} className="text-[#5B4EC4]" />
          Synthèse IA
        </h2>
        <span className="text-xs px-2 py-0.5 bg-white text-[#5B4EC4] rounded-full border border-[#5B4EC4]/20 font-medium">
          Brouillon IA — à vérifier
        </span>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
    </div>
  );
}

// ─── Bloc Transcript (accordéon) ─────────────────────────────────────────────

function TranscriptBlock({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] mb-4 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#1A1A2E]">
          <FileText size={15} className="text-gray-400" />
          Transcript audio
        </span>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-3 mt-3">Transcription brute — non modifiée</p>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed font-mono bg-gray-50 rounded-xl p-4 overflow-auto max-h-80">
            {transcript}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Bouton Générer facture (placeholder) ────────────────────────────────────

function BillingPlaceholderModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 cockpit-glass-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[#1A1A2E]">Facturation depuis une consultation</h3>
            <p className="text-sm text-gray-500 mt-1">Bientôt disponible</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          La génération de factures directement depuis une consultation sera disponible dans une prochaine mise à jour.
        </p>
        <p className="text-xs text-gray-400 mt-3">
          En attendant, créez la facture depuis l&apos;onglet <strong>Facturation</strong> du menu principal.
        </p>
      </div>
    </div>
  );
}

// ─── ViewConsultation ─────────────────────────────────────────────────────────

type Props = { consultation: ConsultationDetail };

export function ViewConsultation({ consultation }: Props) {
  const [billingOpen, setBillingOpen] = useState(false);

  const hasGeneratedNote = !!consultation.generatedNote?.body;
  const hasAiSummary = consultation.aiSummaryStatus === "DONE" && !!consultation.aiSummary && !hasGeneratedNote;
  const hasNotes = !!consultation.notes?.trim();
  const hasTranscript = !!consultation.transcript?.trim();

  return (
    <article>
      <ConsultationHeader consultation={consultation} />

      {hasNotes && <NotesBlock notes={consultation.notes!} />}

      {hasGeneratedNote && <GeneratedNoteBlock note={consultation.generatedNote!} />}

      {hasAiSummary && <AiSummaryBlock summary={consultation.aiSummary!} />}

      {hasTranscript && <TranscriptBlock transcript={consultation.transcript!} />}

      {!hasNotes && !hasGeneratedNote && !hasAiSummary && !hasTranscript && (
        <div className="bg-white rounded-2xl border border-[rgba(26,26,46,0.06)] p-8 text-center text-sm text-gray-400">
          Aucun contenu enregistré pour cette consultation.
        </div>
      )}

      {/* Actions */}
      {consultation.status === "COMPLETED" && (
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => setBillingOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Receipt size={15} />
            Générer une facture
          </button>
        </div>
      )}

      {billingOpen && <BillingPlaceholderModal onClose={() => setBillingOpen(false)} />}
    </article>
  );
}
