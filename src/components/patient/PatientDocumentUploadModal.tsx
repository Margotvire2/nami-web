"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Upload,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { apiWithToken } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

// Sous-ensemble safe DocumentType côté patient (aligné backend PR #62).
const PATIENT_DOCUMENT_TYPES = [
  { value: "PRESCRIPTION", label: "Ordonnance" },
  { value: "BIOLOGICAL_REPORT", label: "Bilan biologique" },
  { value: "HOSPITAL_REPORT", label: "Compte-rendu hospitalier" },
  { value: "LETTER", label: "Courrier médical" },
  { value: "IMAGING", label: "Imagerie / Radiologie" },
  { value: "OTHER", label: "Autre" },
] as const;

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
const MAX_TITLE_LENGTH = 200;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PatientDocumentUploadModal({ open, onClose }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; documentType: string; title: string }) => {
      if (!token) throw new Error("Non authentifié");
      return apiWithToken(token).patient.uploadDocument(
        data.file,
        data.documentType,
        data.title,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents"] });
      // Brève fenêtre de feedback succès puis close
      setTimeout(() => {
        setFile(null);
        setDocType("");
        setTitle("");
        setError(null);
        onClose();
      }, 800);
    },
    onError: (err: unknown) => {
      let msg = "Erreur lors de l'envoi";
      if (err && typeof err === "object" && "status" in err) {
        const status = (err as { status: number }).status;
        if (status === 404) {
          msg = "Service d'upload en cours de mise en place. Réessayez bientôt.";
        } else if ("body" in err) {
          const body = (err as { body: { error?: string } }).body;
          msg = body?.error ?? msg;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    },
  });

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ALLOWED_MIMES.includes(f.type)) {
      setError("Type de fichier non autorisé. Acceptés : JPEG, PNG, WebP, PDF.");
      setFile(null);
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setError(`Fichier trop volumineux (max ${MAX_SIZE_BYTES / 1024 / 1024} MB)`);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
    if (!title) {
      setTitle(f.name.replace(/\.[^.]+$/, "").slice(0, MAX_TITLE_LENGTH));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }
    if (!docType) {
      setError("Veuillez choisir un type de document");
      return;
    }
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Veuillez donner un titre au document");
      return;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError(`Titre trop long (max ${MAX_TITLE_LENGTH} caractères)`);
      return;
    }
    uploadMutation.mutate({ file, documentType: docType, title: trimmed });
  }

  function handleClose() {
    if (uploadMutation.isPending) return;
    setFile(null);
    setDocType("");
    setTitle("");
    setError(null);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(26,26,46,0.5)] backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(26,26,46,0.06)]">
          <h2
            id="upload-modal-title"
            className="text-lg font-bold text-[#1A1A2E]"
          >
            Ajouter un document
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
            aria-label="Fermer"
            className="p-1 rounded-full text-[#6B7280] hover:bg-[rgba(91,78,196,0.08)] hover:text-[#5B4EC4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[rgba(220,38,38,0.06)] border border-[rgba(220,38,38,0.2)] text-xs text-[#DC2626]"
            >
              <AlertCircle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* File input */}
          <div>
            <label
              htmlFor="doc-file"
              className="block text-sm font-medium text-[#1A1A2E] mb-2"
            >
              Fichier <span className="text-[#DC2626]" aria-hidden="true">*</span>
            </label>
            <input
              ref={fileInputRef}
              id="doc-file"
              type="file"
              accept={ALLOWED_MIMES.join(",")}
              onChange={handleFileSelect}
              disabled={uploadMutation.isPending}
              required
              aria-describedby="file-hint"
              className="block w-full text-sm text-[#1A1A2E] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#5B4EC4] file:text-white file:cursor-pointer file:hover:opacity-90 file:transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p id="file-hint" className="mt-1 text-xs text-[#6B7280]">
              JPEG, PNG, WebP ou PDF — max 10 MB
            </p>
            {file && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(91,78,196,0.08)] text-xs">
                <FileText size={14} className="text-[#5B4EC4]" aria-hidden="true" />
                <span className="font-medium text-[#1A1A2E] truncate flex-1">
                  {file.name}
                </span>
                <span className="text-[#6B7280]">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            )}
          </div>

          {/* Document type */}
          <div>
            <label
              htmlFor="doc-type"
              className="block text-sm font-medium text-[#1A1A2E] mb-2"
            >
              Type de document <span className="text-[#DC2626]" aria-hidden="true">*</span>
            </label>
            <select
              id="doc-type"
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value);
                if (error) setError(null);
              }}
              disabled={uploadMutation.isPending}
              required
              className="w-full px-3 py-2 rounded-lg border border-[rgba(26,26,46,0.08)] bg-white text-sm text-[#1A1A2E] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[rgba(91,78,196,0.15)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">— Choisir un type —</option>
              {PATIENT_DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="doc-title"
              className="block text-sm font-medium text-[#1A1A2E] mb-2"
            >
              Titre <span className="text-[#DC2626]" aria-hidden="true">*</span>
            </label>
            <input
              id="doc-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              disabled={uploadMutation.isPending}
              maxLength={MAX_TITLE_LENGTH}
              required
              placeholder="Ex : Ordonnance Dr Dupont — janvier 2026"
              aria-describedby="title-counter"
              className="w-full px-3 py-2 rounded-lg border border-[rgba(26,26,46,0.08)] bg-white text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[rgba(91,78,196,0.15)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p
              id="title-counter"
              className={`mt-1 text-xs text-right ${
                title.length > MAX_TITLE_LENGTH * 0.9
                  ? "text-[#DC2626] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              {title.length} / {MAX_TITLE_LENGTH}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(26,26,46,0.08)] bg-white text-sm font-medium text-[#1A1A2E] hover:bg-[rgba(91,78,196,0.04)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={
                uploadMutation.isPending ||
                uploadMutation.isSuccess ||
                !file ||
                !docType ||
                !title.trim()
              }
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B4EC4] text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Envoi...
                </>
              ) : uploadMutation.isSuccess ? (
                <>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Envoyé !
                </>
              ) : (
                <>
                  <Upload size={16} aria-hidden="true" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
