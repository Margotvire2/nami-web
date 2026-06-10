"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Mail,
  Send,
  Users,
  AlertCircle,
} from "lucide-react";
import { ConsoleSidebar } from "@/components/structure/ConsoleSidebar";
import { RecipientsTable } from "@/components/broadcast/RecipientsTable";
import { useBroadcast } from "@/hooks/useBroadcast";
import { useOrgBroadcasts } from "@/hooks/useOrgBroadcasts";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BroadcastDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; broadcastId: string }>;
}) {
  const { orgId, broadcastId } = use(params);
  const { broadcast, isLoading } = useBroadcast(orgId, broadcastId);
  const { send } = useOrgBroadcasts(orgId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSend() {
    setErrorMessage(null);
    if (
      !window.confirm(
        "Confirmer l'envoi du broadcast à tous les membres actifs ? Cette action est irréversible.",
      )
    ) {
      return;
    }
    try {
      await send.mutateAsync(broadcastId);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Échec de l'envoi.",
      );
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-jakarta)" }}>
      <ConsoleSidebar orgId={orgId} active="communications" />

      <Link
        href={`/structure/${orgId}/admin/communications`}
        className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#5B4EC4]"
      >
        <ArrowLeft size={12} /> Communications
      </Link>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Loader2 size={13} className="animate-spin" /> Chargement…
        </div>
      ) : !broadcast ? (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 text-sm text-[#991B1B]">
          Broadcast introuvable ou supprimé.
        </div>
      ) : (
        <>
          <header className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-bold text-[#0F172A]">
                {broadcast.subject}
              </h1>
              {broadcast.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={send.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B4EC4] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4A3FB0] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  <Send size={13} />
                  {send.isPending ? "Envoi…" : "Envoyer maintenant"}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} />
                {broadcast.status === "SENT"
                  ? `Envoyé le ${formatDate(broadcast.sentAt)}`
                  : `Créé le ${formatDate(broadcast.createdAt)}`}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail size={11} />
                {broadcast.status === "DRAFT"
                  ? "Brouillon — non envoyé"
                  : `Statut : ${broadcast.status}`}
              </span>
              {broadcast.status === "SENT" && (
                <span className="inline-flex items-center gap-1">
                  <Users size={11} />
                  {broadcast.recipientCount} destinataires
                </span>
              )}
              {broadcast.sender && (
                <span>
                  par {broadcast.sender.firstName} {broadcast.sender.lastName}
                </span>
              )}
            </div>
          </header>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-xs text-[#991B1B]"
            >
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              {errorMessage}
            </div>
          )}

          <section
            aria-label="Contenu du message"
            className="rounded-xl border border-[#E8ECF4] bg-white p-5"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-3">
              Message
            </h2>
            <div className="text-sm text-[#0F172A] whitespace-pre-wrap leading-relaxed">
              {broadcast.body}
            </div>
          </section>

          {broadcast.status !== "DRAFT" && (
            <section aria-label="Destinataires" className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Destinataires ({broadcast.recipients.length})
              </h2>
              <RecipientsTable recipients={broadcast.recipients} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
