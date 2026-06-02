"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type BroadcastStatus = "DRAFT" | "SENT" | "FAILED";

export interface BroadcastListItem {
  id: string;
  subject: string;
  status: BroadcastStatus;
  recipientCount: number;
  sentAt: string | null;
  createdAt: string;
  senderPersonId: string;
  sender: { firstName: string; lastName: string } | null;
}

export interface CreateDraftInput {
  subject: string;
  body: string;
}

export interface SendBroadcastResult {
  broadcastId: string;
  organizationId: string;
  status: "SENT" | "FAILED";
  totalMembers: number;
  emailsSent: number;
  emailsSkipped: number;
  emailsFailed: number;
}

export function broadcastsQueryKey(orgId: string) {
  return ["org-broadcasts", orgId] as const;
}

export function useOrgBroadcasts(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: broadcastsQueryKey(orgId),
    queryFn: async (): Promise<BroadcastListItem[]> => {
      if (!accessToken || !orgId) return [];
      const r = await fetch(`${API}/organizations/${orgId}/broadcasts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Broadcasts fetch failed: ${r.status}`);
      const { broadcasts } = (await r.json()) as {
        broadcasts: BroadcastListItem[];
      };
      return broadcasts;
    },
    enabled: !!accessToken && !!orgId,
    staleTime: 30 * 1000,
  });

  const createDraft = useMutation({
    mutationFn: async (
      input: CreateDraftInput,
    ): Promise<{ id: string; subject: string; status: "DRAFT" }> => {
      const r = await fetch(`${API}/organizations/${orgId}/broadcasts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      if (!r.ok) {
        const detail = await r.text().catch(() => "");
        throw new Error(`Create draft failed: ${r.status} ${detail}`);
      }
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: broadcastsQueryKey(orgId) });
    },
  });

  const send = useMutation({
    mutationFn: async (broadcastId: string): Promise<SendBroadcastResult> => {
      const r = await fetch(
        `${API}/organizations/${orgId}/broadcasts/${broadcastId}/send`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!r.ok) {
        const detail = await r.text().catch(() => "");
        throw new Error(`Send broadcast failed: ${r.status} ${detail}`);
      }
      return r.json();
    },
    onSuccess: (_data, broadcastId) => {
      queryClient.invalidateQueries({ queryKey: broadcastsQueryKey(orgId) });
      queryClient.invalidateQueries({
        queryKey: ["org-broadcast", orgId, broadcastId],
      });
    },
  });

  return {
    broadcasts: list.data ?? [],
    isLoading: list.isLoading,
    isError: list.isError,
    createDraft,
    send,
  };
}
