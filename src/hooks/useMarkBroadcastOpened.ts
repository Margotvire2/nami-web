"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  myReceivedBroadcastsQueryKey,
  type ReceivedBroadcastItem,
} from "./useMyReceivedBroadcasts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useMarkBroadcastOpened() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipientId: string): Promise<ReceivedBroadcastItem> => {
      const r = await fetch(`${API}/me/broadcasts/${recipientId}/open`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!r.ok) throw new Error(`Mark opened failed: ${r.status}`);
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: myReceivedBroadcastsQueryKey(),
      });
    },
  });
}
