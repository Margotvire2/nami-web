"use client";

import { useQuery } from "@tanstack/react-query";
import {
  apiWithToken,
  type PatientMessageItem,
  type PatientMessageThreadType,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export interface UsePatientMessagesInThreadParams {
  threadType: PatientMessageThreadType | null | undefined;
  threadId: string | null | undefined;
  limit?: number;
  before?: string;
  onBehalfOf?: string;
}

/**
 * Charge les messages racines d'un thread (channel CARECASE OU DM) —
 * CC #MES-MESSAGES-CHANNELS-DM. Backend PR #94 :
 *   GET /patient/messages/:threadType/:threadId
 *
 * Désactivé tant que (threadType, threadId) ne sont pas tous deux fournis,
 * pour permettre un usage conditionnel depuis le panel (utilisateur n'a pas
 * encore sélectionné de conversation).
 *
 * staleTime 10 s — on veut voir rapidement les nouveaux messages quand on
 * revient sur une conversation, sans toutefois refetcher à chaque rerender.
 */
export function usePatientMessagesInThread(params: UsePatientMessagesInThreadParams) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const { threadType, threadId, limit, before, onBehalfOf } = params;
  const enabled = !!token && !!user?.id && !!threadType && !!threadId;

  return useQuery<PatientMessageItem[]>({
    queryKey: [
      "patient",
      "messages",
      "thread",
      threadType,
      threadId,
      limit ?? null,
      before ?? null,
      onBehalfOf ?? null,
    ],
    queryFn: () =>
      apiWithToken(token!).patient.messages.list({
        threadType: threadType!,
        threadId: threadId!,
        limit,
        before,
        onBehalfOf,
      }),
    enabled,
    staleTime: 10_000,
  });
}
