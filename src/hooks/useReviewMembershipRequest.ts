"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { membershipRequestsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

// V1 console d'animation : seuls ACCEPTED / REJECTED sont déclenchés depuis
// l'UI. TO_CONTACT et IN_REVIEW sont des transitions futures côté workflow
// interne (pas encore d'écran dédié).
type ReviewStatus = "ACCEPTED" | "REJECTED";

interface ReviewInput {
  id: string;
  status: ReviewStatus;
}

export function useReviewMembershipRequest(orgId: string) {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: ReviewInput) => {
      if (!token) throw new Error("Not authenticated");
      return membershipRequestsApi.update(token, id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["org-membership-requests", orgId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizations", "mine"],
      });
    },
  });
}
