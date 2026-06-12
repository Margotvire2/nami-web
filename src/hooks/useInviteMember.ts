"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useInviteMember(orgId: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      email: string;
      rpps?: string;
      message?: string;
      memberRole?: "PROVIDER" | "COORDINATOR" | "VIEWER";
    }) => {
      const r = await fetch(`${API}/organizations/${orgId}/members/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `${r.status}`);
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-members", orgId] });
      qc.invalidateQueries({ queryKey: ["org-colleagues", orgId] });
    },
  });
}
