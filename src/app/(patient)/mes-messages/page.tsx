"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { usePatientMessageThreads } from "@/hooks/usePatientMessageThreads";
import { usePatientMessagesInThread } from "@/hooks/usePatientMessagesInThread";
import { useSendPatientMessage } from "@/hooks/useSendPatientMessage";
import type { PatientMessageThread, PatientMessageThreadType } from "@/lib/api";
import { ThreadsSidebar } from "./_components/ThreadsSidebar";
import { ConversationPanel } from "./_components/ConversationPanel";
import { EmergencyBanner } from "./_components/EmergencyBanner";
import { EmptyState } from "./_components/EmptyState";

/**
 * /mes-messages — refonte channels + DM (CC #MES-MESSAGES-CHANNELS-DM).
 *
 * Pattern Slack/WhatsApp adapté MDR :
 *   - Sidebar 320px à gauche → 2 sections (équipes CARECASE + DM 1:1)
 *   - ConversationPanel flex-1 à droite → header + timeline + composer
 *   - Bannière urgence permanente top non-dismissible (CLAUDE.md requirement)
 *
 * Pré-sélection via query params :
 *   - ?careCase=<careCaseId> → ouvre le channel CARECASE correspondant
 *   - ?dm=<providerPersonId> → ouvre le DM 1:1 correspondant
 *   - Sinon : EmptyState (variant "no-selection" si threads existent,
 *     "no-threads" sinon).
 *
 * Sélection robuste : on ne *force* la sélection que si le thread désigné
 * par l'URL est PRÉSENT dans la liste backend (sinon on retombe sur
 * EmptyState — évite d'afficher une conversation 403/404).
 *
 * Le composant est wrappé dans <Suspense> pour permettre useSearchParams()
 * pendant le SSR/CSR Next 15+ (React 19).
 */
function MesMessagesInner() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();

  const careCaseParam = searchParams.get("careCase");
  const dmParam = searchParams.get("dm");

  const threadsQuery = usePatientMessageThreads();
  const threads = threadsQuery.data ?? [];

  // Résolution déterministe : URL d'abord, fallback null. On NE choisit PAS
  // automatiquement le premier thread — c'est explicite côté patient.
  const selectedThread: PatientMessageThread | null = useMemo(() => {
    if (careCaseParam) {
      return (
        threads.find(
          (t) => t.threadType === "CARECASE" && t.threadId === careCaseParam,
        ) ?? null
      );
    }
    if (dmParam) {
      return threads.find((t) => t.threadType === "DM" && t.threadId === dmParam) ?? null;
    }
    return null;
  }, [careCaseParam, dmParam, threads]);

  const selectedThreadType: PatientMessageThreadType | null = selectedThread?.threadType ?? null;
  const selectedThreadId: string | null = selectedThread?.threadId ?? null;

  const messagesQuery = usePatientMessagesInThread({
    threadType: selectedThreadType,
    threadId: selectedThreadId,
    limit: 100,
  });
  const messages = messagesQuery.data ?? [];

  const sendMutation = useSendPatientMessage();

  function handleSelectThread(thread: PatientMessageThread) {
    const params = new URLSearchParams();
    if (thread.threadType === "CARECASE") params.set("careCase", thread.threadId);
    else params.set("dm", thread.threadId);
    // window.history pour éviter un rerender Next coûteux ; le hook
    // useSearchParams réagit naturellement aux changements d'URL côté client.
    if (typeof window !== "undefined") {
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, "", url);
      // Déclenche la mise à jour de useSearchParams (Next 15+).
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  function handleSend(body: string) {
    if (!selectedThread) return;
    sendMutation.mutate({
      threadType: selectedThread.threadType,
      threadId: selectedThread.threadId,
      body,
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--nami-bg, #FAFAF8)",
      }}
    >
      <EmergencyBanner />
      <div
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
        }}
      >
        <ThreadsSidebar
          threads={threads}
          selectedThreadType={selectedThreadType}
          selectedThreadId={selectedThreadId}
          isLoading={threadsQuery.isLoading}
          onSelect={handleSelectThread}
        />
        {selectedThread ? (
          <ConversationPanel
            thread={selectedThread}
            messages={messages}
            isLoading={messagesQuery.isLoading}
            isSending={sendMutation.isPending}
            currentUserPersonId={user?.id ?? null}
            onSend={handleSend}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "var(--nami-bg, #FAFAF8)",
              minWidth: 0,
            }}
          >
            <EmptyState variant={threads.length === 0 ? "no-threads" : "no-selection"} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MesMessagesPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            background: "var(--nami-bg, #FAFAF8)",
          }}
        >
          <EmergencyBanner />
          <div style={{ flex: 1 }} />
        </div>
      }
    >
      <MesMessagesInner />
    </Suspense>
  );
}
