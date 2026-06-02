"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import type { BroadcastStatus } from "./useOrgBroadcasts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface BroadcastRecipient {
  id: string;
  personId: string;
  emailSent: boolean;
  notifSent: boolean;
  optedOut: boolean;
  openedAt: string | null;
  createdAt: string;
  person: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface BroadcastDetail {
  id: string;
  organizationId: string;
  senderPersonId: string;
  subject: string;
  body: string;
  status: BroadcastStatus;
  recipientCount: number;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
  sender: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  recipients: BroadcastRecipient[];
}

export function broadcastQueryKey(orgId: string, broadcastId: string) {
  return ["org-broadcast", orgId, broadcastId] as const;
}

export function useBroadcast(orgId: string, broadcastId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: broadcastQueryKey(orgId, broadcastId),
    queryFn: async (): Promise<BroadcastDetail | null> => {
      if (!accessToken || !orgId || !broadcastId) return null;
      const r = await fetch(
        `${API}/organizations/${orgId}/broadcasts/${broadcastId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`Broadcast fetch failed: ${r.status}`);
      return (await r.json()) as BroadcastDetail;
    },
    enabled: !!accessToken && !!orgId && !!broadcastId,
    staleTime: 15 * 1000,
  });

  return {
    broadcast: data ?? null,
    isLoading,
    isError,
  };
}
