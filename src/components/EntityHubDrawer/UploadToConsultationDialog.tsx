"use client";

/**
 * UploadToConsultationDialog — F-UX-PATIENT-V1-LAUNCH-5-DRAWER-CONSULTATION.
 *
 * Modal contextuel ouvert depuis le drawer consultation. Pré-rempli avec :
 *   - careCaseId             : contexte parcours du drawer
 *   - consultationId         : référence d'usage (UX uniquement, BE ne stocke pas)
 *   - directRecipientPersonId : providerId de la consultation (DM par défaut)
 *
 * Réutilise POST /patient/documents/upload (route backend existante).
 * XOR strict avec le backend : on n'envoie QUE directRecipientPersonId (DM 1:1
 * au soignant de la consultation). Pas de fan-out équipe depuis ce point d'entrée
 * pour rester cohérent avec le mental model "je transmets à CE soignant".
 *
 * Wording strict patient (cf. CLAUDE.md §Mots interdits) : aucun terme clinique
 * MDR ("alerte", "surveillance", "détection", "diagnostic", "risque").
 */

import { useEffect, useState } from "react";
import { X, Loader2, FileUp, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWithToken, ApiError, type PatientDocument } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const C = {
  bg: "#FFFFFF",
  backdrop: "rgba(26,26,46,0.4)",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  border: "rgba(26,26,46,0.08)",
  borderActive: "#5B4EC4",
  primary: "#5B4EC4",
  primaryHover: "#4A3FA8",
  primaryLight: "#EEEDFB",
  disabled: "#E5E7EB",
  success: "#059669",
  successLight: "#ECFDF5",
};

type DocumentTypeOption =
  | "PRESCRIPTION"
  | "BIOLOGICAL_REPORT"
  | "HOSPITAL_REPORT"
  | "LETTER"
  | "IMAGING"
  | "OTHER";

const DOCUMENT_TYPE_OPTIONS: { value: DocumentTypeOption; label: string; emoji: string }[] = [
  { value: "BIOLOGICAL_REPORT", label: "Bilan biologique", emoji: "🧪" },
  { value: "PRESCRIPTION", label: "Ordonnance", emoji: "💊" },
  { value: "HOSPITAL_REPORT", label: "Compte-rendu hospitalier", emoji: "📝" },
  { value: "LETTER", label: "Lettre d'adressage", emoji: "📨" },
  { value: "IMAGING", label: "Imagerie", emoji: "🩻" },
  { value: "OTHER", label: "Autre document", emoji: "📄" },
];

const MAX_TITLE_LEN = 200;

export interface UploadToConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Contexte parcours (clé d'invalidation React Query). */
  careCaseId: string;
  /** Référence consultation (affichée pour rappel UX, pas envoyée au BE). */
  consultationId: string;
  /** PersonId du soignant rencontré (destinataire DM). */
  providerId: string;
  /** Nom complet du soignant pour le message UX. */
  providerName: string;
}

function defaultTitle(label: string): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${label} du ${dd}/${mm}/${yyyy}`.slice(0, MAX_TITLE_LEN);
}

export function UploadToConsultationDialog({
  isOpen,
  onClose,
  careCaseId,
  consultationId,
  providerId,
  providerName,
}: UploadToConsultationDialogProps) {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentTypeOption>("BIOLOGICAL_REPORT");
  const [title, setTitle] = useState<string>(defaultTitle("Bilan biologique"));
  const [titleTouched, setTitleTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [justSucceeded, setJustSucceeded] = useState(false);

  // Reset state à chaque réouverture (évite résidus inter-sessions).
  useEffect(() => {
    if (!isOpen) return;
    setFile(null);
    setDocumentType("BIOLOGICAL_REPORT");
    setTitle(defaultTitle("Bilan biologique"));
    setTitleTouched(false);
    setSubmitError(null);
    setJustSucceeded(false);
  }, [isOpen]);

  // Auto-suggest titre quand le type change (sauf si l'utilisateur l'a édité).
  useEffect(() => {
    if (titleTouched) return;
    const label =
      DOCUMENT_TYPE_OPTIONS.find((o) => o.value === documentType)?.label ?? "Document";
    setTitle(defaultTitle(label));
  }, [documentType, titleTouched]);

  const mutation = useMutation<
    PatientDocument,
    ApiError,
    { file: File; documentType: DocumentTypeOption; title: string }
  >({
    mutationFn: async ({ file: f, documentType: dt, title: t }) => {
      if (!token) throw new ApiError(401, "Non authentifié");
      const api = apiWithToken(token);
      return api.patient.uploadDocument({
        file: f,
        documentType: dt,
        title: t,
        routing: { directRecipientPersonId: providerId },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient", "bilans"] });
      qc.invalidateQueries({ queryKey: ["entityHub", "consultation", careCaseId, consultationId] });
      qc.invalidateQueries({ queryKey: ["entityHub"] });
      setJustSucceeded(true);
      // Auto-fermeture 1.4s après succès pour laisser voir le check.
      setTimeout(() => {
        onClose();
      }, 1400);
    },
    onError: (err) => {
      setSubmitError(err.message || "Impossible d'envoyer ce document. Réessayez.");
    },
  });

  const trimmedTitle = title.trim();
  const isValid =
    file !== null && trimmedTitle.length > 0 && trimmedTitle.length <= MAX_TITLE_LEN;

  function handleSubmit() {
    if (!isValid || !file) return;
    setSubmitError(null);
    mutation.mutate({ file, documentType, title: trimmedTitle });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setSubmitError(null);
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-consult-title"
      onClick={mutation.isPending ? undefined : onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: C.backdrop,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          borderRadius: 20,
          padding: 24,
          maxWidth: 480,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(26,26,46,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 4,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              id="upload-consult-title"
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.3px",
                margin: 0,
              }}
            >
              Transmettre un document
            </h2>
            <p
              style={{
                fontSize: 13,
                color: C.textSoft,
                marginTop: 6,
                lineHeight: 1.4,
              }}
            >
              Ce document sera envoyé en privé à{" "}
              <strong style={{ color: C.text }}>{providerName}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            disabled={mutation.isPending}
            style={{
              background: "transparent",
              border: "none",
              cursor: mutation.isPending ? "not-allowed" : "pointer",
              color: C.textSoft,
              padding: 4,
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {justSucceeded ? (
          <div
            role="status"
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 12,
              background: C.successLight,
              color: C.success,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <CheckCircle2 size={20} aria-hidden="true" />
            <span>
              <strong>Document transmis.</strong> {providerName} en sera notifié.
            </span>
          </div>
        ) : (
          <>
            {/* Document type */}
            <div style={{ marginTop: 20 }}>
              <label
                htmlFor="upload-consult-type"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 6,
                }}
              >
                Type de document
              </label>
              <select
                id="upload-consult-type"
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value as DocumentTypeOption);
                }}
                disabled={mutation.isPending}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: "#FFFFFF",
                  color: C.text,
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                {DOCUMENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.emoji} {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div style={{ marginTop: 16 }}>
              <label
                htmlFor="upload-consult-title-input"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 6,
                }}
              >
                Titre
              </label>
              <input
                id="upload-consult-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleTouched(true);
                }}
                maxLength={MAX_TITLE_LEN}
                disabled={mutation.isPending}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  background: "#FFFFFF",
                  color: C.text,
                }}
              />
            </div>

            {/* File picker */}
            <div style={{ marginTop: 16 }}>
              <label
                htmlFor="upload-consult-file"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: 14,
                  borderRadius: 12,
                  border: `1px dashed ${file ? C.borderActive : C.border}`,
                  background: file ? C.primaryLight : "#FAFAF8",
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                  transition: "all 120ms ease",
                }}
              >
                <FileUp
                  size={18}
                  aria-hidden="true"
                  style={{ color: C.primary, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {file ? (
                    <>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: C.text,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={file.name}
                      >
                        {file.name}
                      </div>
                      <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>
                        {(file.size / 1024).toFixed(0)} Ko · cliquez pour changer
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                        Choisir un fichier
                      </div>
                      <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>
                        PDF, image ou photo (max 10 Mo)
                      </div>
                    </>
                  )}
                </div>
                <input
                  id="upload-consult-file"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  disabled={mutation.isPending}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {/* Error */}
            {submitError ? (
              <div
                role="alert"
                style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(220,38,38,0.08)",
                  color: "#991B1B",
                  fontSize: 13,
                }}
              >
                {submitError}
              </div>
            ) : null}

            {/* Footer */}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 24,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={mutation.isPending}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  color: C.textSoft,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: mutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || mutation.isPending}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: !isValid ? C.disabled : C.primary,
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor:
                    !isValid || mutation.isPending ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Envoi en cours…
                  </>
                ) : (
                  "Transmettre"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
