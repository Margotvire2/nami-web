"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ReceivedBroadcastItem {
  /** OrgBroadcastRecipient.id — clef pour PATCH /me/broadcasts/:id/open */
  recipientId: string;
  /** null = non lu, Date ISO = lu */
  openedAt: string | null;
  /** Flag opt-out canal email (RGPD Art.21) — UI affiche badge si true */
  optedOut: boolean;
  /** Email réellement envoyé (false si opted-out ou erreur Resend) */
  emailSent: boolean;
  broadcast: {
    id: string;
    subject: string;
    body: string;
    sentAt: string | null;
    sender: { firstName: string; lastName: string } | null;
    organization: { id: string; name: string; type: string };
  };
}

export function myReceivedBroadcastsQueryKey() {
  return ["me-received-broadcasts"] as const;
}

export function useMyReceivedBroadcasts() {
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: myReceivedBroadcastsQueryKey(),
    queryFn: async (): Promise<ReceivedBroadcastItem[]> => {
      if (!accessToken) return [];
      const r = await fetch(`${API}/me/broadcasts`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Broadcasts fetch failed: ${r.status}`);
      const { broadcasts } = (await r.json()) as {
        broadcasts: ReceivedBroadcastItem[];
      };
      return broadcasts;
    },
    enabled: !!accessToken,
    staleTime: 30 * 1000,
  });

  return {
    broadcasts: data ?? [],
    isLoading,
    isError,
    refetch,
  };
}
