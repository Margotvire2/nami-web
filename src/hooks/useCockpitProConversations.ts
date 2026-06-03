import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, type ProConversation, type ProMessage } from "@/lib/api";
import { getProMessagesSocket, disconnectProMessagesSocket } from "@/lib/socket";

const CONVERSATIONS_KEY = ["pro-conversations"] as const;
const messagesKey = (conversationId: string | null) =>
  ["pro-messages", conversationId] as const;

export function useCockpitProConversations() {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: () => apiWithToken(accessToken!).proMessages.getConversations(),
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

export function useCockpitProMessages(conversationId: string | null) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: messagesKey(conversationId),
    queryFn: () =>
      apiWithToken(accessToken!).proMessages.getMessages(conversationId!),
    enabled: !!accessToken && !!conversationId,
    staleTime: 30_000,
  });
}

export function useSendCockpitProMessage(conversationId: string | null) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      apiWithToken(accessToken!).proMessages.sendMessage(
        conversationId!,
        content,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagesKey(conversationId) });
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

export function useMarkProConversationRead() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      apiWithToken(accessToken!).proMessages.markAsRead(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

export function useToggleProReaction() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      emoji,
      conversationId,
    }: {
      messageId: string;
      emoji: string;
      conversationId: string | null;
    }) =>
      apiWithToken(accessToken!).proMessages.toggleReaction(messageId, emoji)
        .then((res) => ({ ...res, conversationId })),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: messagesKey(data.conversationId) });
    },
  });
}

/**
 * Branche les invalidations socket.io pour le silo Pro.
 * Rejoint/quitte la room de la conversation active, écoute new_message et
 * conversation_updated. Remplace le polling — cohérent avec /collaboration.
 */
export function useProConversationsSocket(activeConvId: string | null) {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;
    const socket = getProMessagesSocket(accessToken);

    const onNewMessage = () => {
      qc.invalidateQueries({ queryKey: messagesKey(activeConvId) });
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    };
    const onConvUpdated = () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    };

    socket.on("new_message", onNewMessage);
    socket.on("conversation_updated", onConvUpdated);

    return () => {
      socket.off("new_message", onNewMessage);
      socket.off("conversation_updated", onConvUpdated);
    };
  }, [accessToken, activeConvId, qc]);

  useEffect(() => {
    if (!accessToken || !activeConvId) return;
    const socket = getProMessagesSocket(accessToken);
    socket.emit("join_conversation", activeConvId);
    return () => {
      socket.emit("leave_conversation", activeConvId);
    };
  }, [accessToken, activeConvId]);

  useEffect(() => {
    return () => {
      disconnectProMessagesSocket();
    };
  }, []);
}

export type { ProConversation, ProMessage };
