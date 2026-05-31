"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { BilanUploadCard } from "../_components/BilanUploadCard";
import {
  UploadTargetingModal,
  type UploadTargetingPayload,
} from "../_components/UploadTargetingModal";
import { useUploadBilan } from "@/hooks/useUploadBilan";

const C = {
  bg: "#FAFAF8",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  primary: "#5B4EC4",
};

type Phase = "idle" | "success" | "error";

interface PhaseMessage {
  label: string;
  sub?: string;
}

export default function MesBilansUploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<PhaseMessage | null>(null);

  const upload = useUploadBilan();

  async function handleConfirm(payload: UploadTargetingPayload) {
    if (!selectedFile) return;

    try {
      await upload.mutateAsync({
        file: selectedFile,
        careCaseIds: payload.careCaseIds,
        directRecipientPersonId: payload.directRecipientPersonId,
      });
      setSelectedFile(null);
      setPhase("success");
      setMessage({
        label: "Bilan envoyé",
        sub: "Les soignants choisis y ont accès. L'analyse est en cours.",
      });
      setTimeout(() => router.push("/mes-bilans"), 1600);
    } catch (e: unknown) {
      setSelectedFile(null);
      setPhase("error");
      const errMsg =
        e instanceof Error
          ? e.message
          : "Une erreur est survenue lors de l'envoi.";
      setMessage({ label: errMsg });
    }
  }

  return (
    <main
      aria-label="Ajouter un bilan"
      style={{
        padding: "20px 0 80px",
        maxWidth: 560,
        margin: "0 auto",
        background: C.bg,
        minHeight: "100vh",
      }}
    >
      <Link
        href="/mes-bilans"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 13,
          color: C.primary,
          textDecoration: "none",
          marginBottom: 16,
          fontWeight: 500,
        }}
      >
        <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        Mes bilans
      </Link>

      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: C.text,
          letterSpacing: "-0.4px",
          marginBottom: 6,
        }}
      >
        Ajouter un bilan
      </h1>
      <p
        style={{
          fontSize: 13,
          color: C.textSoft,
          lineHeight: 1.5,
          marginBottom: 24,
        }}
      >
        Vos soignants y auront accès et pourront le retrouver dans votre dossier
        de coordination.
      </p>

      {/* Feedback global (post-upload via modal) */}
      {phase === "success" && message ? (
        <div
          role="status"
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(31,122,112,0.08)",
            color: "#1F7A70",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          <div>
            <strong>{message.label}</strong>
            {message.sub ? (
              <div style={{ fontSize: 12, marginTop: 2 }}>{message.sub}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {phase === "error" && message ? (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(217,119,6,0.08)",
            color: "#92400E",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} aria-hidden="true" />
          {message.label}
        </div>
      ) : null}

      <BilanUploadCard onFileSelected={setSelectedFile} />

      <UploadTargetingModal
        isOpen={!!selectedFile}
        fileName={selectedFile?.name}
        onClose={() => setSelectedFile(null)}
        onConfirm={handleConfirm}
        isSubmitting={upload.isPending}
      />
    </main>
  );
}
