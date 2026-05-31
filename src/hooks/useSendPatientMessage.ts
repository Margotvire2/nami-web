"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiWithToken,
  type PatientMessageItem,
  type PatientMessageThreadType,
  type SendPatientMessageResult,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export interface SendPatientMessageVariables {
  threadType: PatientMessageThreadType;
  threadId: string;
  body: string;
  onBehalfOf?: string;
}

/**
 * Envoi d'un message patient (channel CARECASE ou DM) — CC #MES-MESSAGES-CHANNELS-DM.
 * Backend PR #94 : POST /patient/messages { threadType, threadId, body }.
 *
 * Pattern optimistic update : on injecte le message envoyé en tête de la
 * timeline locale (queryKey ["patient","messages","thread",threadType,threadId,...])
 * AVANT la confirmation backend, pour une perception UI instantanée. En cas
 * d'erreur, on rollback puis on invalide la query pour resync avec l'état
 * serveur réel.
 *
 * onSuccess :
 *   - on remplace l'optimistic tmp-id par l'id réel retourné par le backend
 *   - on invalide threads (pour mettre à jour lastMessage + tri) et la
 *     timeline du thread (pour récupérer le tri exact backend incluant les
 *     éventuels messages envoyés par d'autres simultanément).
 *
 * NB : pas d'accusé lu/vu côté UI (décision UX 31/05) — on ne touche pas à
 * isRead côté frontend, c'est le backend qui le maintient via MessageRead.
 */
export function useSendPatientMessage() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  return useMutation<
    SendPatientMessageResult,
    Error,
    SendPatientMessageVariables,
    { tempId: string; threadKey: readonly unknown[]; previous?: PatientMessageItem[] }
  >({
    mutationFn: ({ threadType, threadId, body, onBehalfOf }) =>
      apiWithToken(token!).patient.messages.send({
        threadType,
        threadId,
        body,
        onBehalfOf,
      }),
    onMutate: async (variables) => {
      const threadKey = [
        "patient",
        "messages",
        "thread",
        variables.threadType,
        variables.threadId,
      ] as const;
      await qc.cancelQueries({ queryKey: threadKey });

      const tempId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const senderId = user?.id ?? "self";
      const senderName = user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Vous"
        : "Vous";
      const optimistic: PatientMessageItem = {
        id: tempId,
        body: variables.body,
        createdAt: new Date().toISOString(),
        senderId,
        senderName,
        parentId: null,
        isRead: true, // self
      };

      // On essaie d'injecter dans TOUTES les variantes de la query (limit/before/onBehalfOf).
      const matches = qc.getQueriesData<PatientMessageItem[]>({ queryKey: threadKey });
      let snapshot: PatientMessageItem[] | undefined;
      for (const [key, data] of matches) {
        if (Array.isArray(data)) {
          if (!snapshot) snapshot = data;
          qc.setQueryData<PatientMessageItem[]>(key, [optimistic, ...data]);
        }
      }
      return { tempId, threadKey, previous: snapshot };
    },
    onError: (_err, _vars, ctx) => {
      // Rollback : on retire l'optimistic
      if (!ctx) return;
      const matches = qc.getQueriesData<PatientMessageItem[]>({ queryKey: ctx.threadKey });
      for (const [key, data] of matches) {
        if (Array.isArray(data)) {
          qc.setQueryData<PatientMessageItem[]>(
            key,
            data.filter((m) => m.id !== ctx.tempId),
          );
        }
      }
    },
    onSuccess: (result, _vars, ctx) => {
      // Remplace tmp-id par le vrai message renvoyé par le backend.
      if (!ctx) return;
      const matches = qc.getQueriesData<PatientMessageItem[]>({ queryKey: ctx.threadKey });
      for (const [key, data] of matches) {
        if (!Array.isArray(data)) continue;
        qc.setQueryData<PatientMessageItem[]>(
          key,
          data.map((m): PatientMessageItem =>
            m.id === ctx.tempId
              ? {
                  id: result.id,
                  body: result.body,
                  createdAt: result.createdAt,
                  senderId: result.senderId,
                  senderName: m.senderName,
                  parentId: null,
                  isRead: true,
                }
              : m,
          ),
        );
      }
    },
    onSettled: (_data, _err, vars) => {
      // Resync threads (lastMessage + tri) + timeline du thread.
      qc.invalidateQueries({ queryKey: ["patient", "messages", "threads"] });
      qc.invalidateQueries({
        queryKey: ["patient", "messages", "thread", vars.threadType, vars.threadId],
      });
    },
  });
}
