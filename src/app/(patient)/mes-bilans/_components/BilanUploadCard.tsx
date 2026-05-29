"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useUploadBilan } from "@/hooks/useUploadBilan";

const C = {
  card: "#FFFFFF",
  border: "rgba(26,26,46,0.08)",
  borderActive: "#5B4EC4",
  borderError: "#DC2626",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
  primaryLight: "rgba(91,78,196,0.08)",
};

const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB (aligné backend PATIENT_DOC_MAX_BYTES côté nami)

type Phase = "idle" | "uploading" | "success" | "error";

interface PhaseMessage {
  kind: "uploading" | "success" | "error";
  label: string;
  sub?: string;
}

export function BilanUploadCard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<PhaseMessage | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = useUploadBilan();

  function validateFile(file: File): string | null {
    if (!ACCEPTED_MIME.includes(file.type)) {
      return "Format non pris en charge. Acceptés : PDF, JPG, PNG.";
    }
    if (file.size > MAX_BYTES) {
      return `Fichier trop volumineux (max ${MAX_BYTES / 1024 / 1024} Mo).`;
    }
    return null;
  }

  async function handleFile(file: File) {
    const err = validateFile(file);
    if (err) {
      setPhase("error");
      setMessage({ kind: "error", label: err });
      return;
    }

    setPhase("uploading");
    setMessage({
      kind: "uploading",
      label: "Téléchargement en cours…",
      sub: "Puis analyse automatique. Cela peut prendre une minute.",
    });

    try {
      await upload.mutateAsync({ file });
      setPhase("success");
      setMessage({
        kind: "success",
        label: "Bilan reçu",
        sub: "Vos soignants y ont accès. L'analyse est en cours.",
      });
      // Retour vers la liste après 1.6s pour laisser le feedback s'afficher
      setTimeout(() => router.push("/mes-bilans"), 1600);
    } catch (e: unknown) {
      setPhase("error");
      const errMsg =
        e instanceof Error ? e.message : "Une erreur est survenue lors de l'envoi.";
      setMessage({ kind: "error", label: errMsg });
    }
  }

  function onDrop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    setDragOver(false);
    const file = ev.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onChangeInput(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (file) handleFile(file);
    // Reset pour permettre de re-sélectionner le même fichier
    ev.target.value = "";
  }

  const isBusy = phase === "uploading";

  return (
    <div>
      {/* Drag-drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isBusy) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="region"
        aria-label="Zone de dépôt de fichier"
        style={{
          border: `2px dashed ${
            phase === "error"
              ? C.borderError
              : dragOver
                ? C.borderActive
                : C.border
          }`,
          borderRadius: 16,
          background: dragOver ? C.primaryLight : C.card,
          padding: "40px 20px",
          textAlign: "center",
          transition: "all 160ms ease",
        }}
      >
        {phase === "idle" || phase === "error" ? (
          <>
            <FileText
              size={32}
              aria-hidden="true"
              style={{ margin: "0 auto 12px", opacity: 0.4, color: C.primary }}
            />
            <p style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>
              Déposez votre bilan ici
            </p>
            <p style={{ fontSize: 13, color: C.textSoft, marginTop: 4 }}>
              PDF, JPG ou PNG — 15 Mo maximum
            </p>
          </>
        ) : null}

        {phase === "uploading" ? (
          <>
            <Loader2
              size={32}
              aria-hidden="true"
              className="animate-spin"
              style={{ margin: "0 auto 12px", color: C.primary }}
            />
            <p style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>
              {message?.label}
            </p>
            {message?.sub ? (
              <p style={{ fontSize: 13, color: C.textSoft, marginTop: 4 }}>
                {message.sub}
              </p>
            ) : null}
          </>
        ) : null}

        {phase === "success" ? (
          <>
            <CheckCircle2
              size={32}
              aria-hidden="true"
              style={{ margin: "0 auto 12px", color: "#1F7A70" }}
            />
            <p style={{ fontSize: 15, color: C.text, fontWeight: 600 }}>
              {message?.label}
            </p>
            {message?.sub ? (
              <p style={{ fontSize: 13, color: C.textSoft, marginTop: 4 }}>
                {message.sub}
              </p>
            ) : null}
          </>
        ) : null}

        {phase === "error" && message ? (
          <p
            role="alert"
            style={{
              marginTop: 14,
              fontSize: 13,
              color: "#92400E",
              background: "rgba(217,119,6,0.08)",
              padding: "8px 12px",
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <AlertCircle size={14} aria-hidden="true" />
            {message.label}
          </p>
        ) : null}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          style={{
            flex: "1 1 200px",
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            background: C.primary,
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: isBusy ? "not-allowed" : "pointer",
            opacity: isBusy ? 0.6 : 1,
          }}
        >
          <Upload size={16} strokeWidth={2.2} aria-hidden="true" />
          Choisir un fichier
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isBusy}
          style={{
            flex: "1 1 200px",
            padding: "12px 16px",
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.card,
            color: C.text,
            fontSize: 14,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: isBusy ? "not-allowed" : "pointer",
            opacity: isBusy ? 0.6 : 1,
          }}
        >
          <Camera size={16} strokeWidth={2.2} aria-hidden="true" />
          Prendre une photo
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png"
        onChange={onChangeInput}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onChangeInput}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}
